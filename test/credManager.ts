import * as fs from "node:fs";
import csv from "csv-parser";
import lockfile from "proper-lockfile";
import path from "path";

// Helper function to lock the file and read/write safely
export async function lockAndUpdateCreds(): Promise<string | null> {
	// Try acquiring a lock
	const release = await lockfile.lock("test/creds.csv", { retries: 5, retryWait: 1000 });

	try {
		// Return a Promise to handle async file reading and writing
		const creds = await new Promise<{ username: string; inuse: string }[]>((resolve, reject) => {
			const creds: { username: string; inuse: string }[] = [];

			fs.createReadStream("test/creds.csv")
				.pipe(csv())
				.on("data", (row) => creds.push(row))
				.on("end", () => resolve(creds)) // Resolving after the 'end' event
				.on("error", (err) => reject(err)); // Reject if there's an error in reading the file
		});

		// Find the first available credentials
		const availableCreds = creds.find((cred) => cred.inuse === "no");

		if (availableCreds) {
			// Set 'inuse' to 'yes'
			availableCreds.inuse = "yes";

			// Write the updated credentials back to the CSV file
			const updatedData = ["username,inuse", ...creds.map((cred) => `${cred.username},${cred.inuse}`)].join("\n");
			fs.writeFileSync("test/creds.csv", updatedData);
			console.log("Credentials updated for username:", availableCreds.username);

			return availableCreds.username; // Return the username
		} else {
			console.log("No available credentials.");
			return null; // No available credentials
		}
	} catch (err) {
		console.error("Error during file operation:", err);
		return null; // Return null in case of error
	} finally {
		// Release the lock after processing
		release();
	}
}

// Keep trying to lock the file and get credentials
export async function getCredsAndLockFile(): Promise<string | null> {
	let locked = true;

	while (locked) {
		try {
			const username = await lockAndUpdateCreds();
			if (username) {
				return username; // If username is found, return it
			} else {
				console.log("Waiting for available credentials...");
			}

			locked = false; // Exit loop if successful
		} catch (err) {
			console.log("File is locked, retrying...");
			await new Promise((resolve) => setTimeout(resolve, 1000)); // Retry after 1 second
		}
	}

	return null; // Return null if no username is found
}

// Method to release credentials by setting 'inuse' to 'no' for a given username
export async function releaseCreds(username: string): Promise<boolean> {
	// Try acquiring a lock
	const release = await lockfile.lock("test/creds.csv", { retries: 5, retryWait: 1000 });

	try {
		// Return a Promise to handle async file reading and writing
		const creds = await new Promise<{ username: string; inuse: string }[]>((resolve, reject) => {
			const creds: { username: string; inuse: string }[] = [];

			fs.createReadStream("test/creds.csv")
				.pipe(csv())
				.on("data", (row) => creds.push(row))
				.on("end", () => resolve(creds)) // Resolving after the 'end' event
				.on("error", (err) => reject(err)); // Reject if there's an error in reading the file
		});

		// Find the credential with the provided username
		const userCred = creds.find((cred) => cred.username === username);

		if (userCred) {
			// Set 'inuse' to 'no'
			userCred.inuse = "no";

			// Write the updated credentials back to the CSV file
			const updatedData = ["username,inuse", ...creds.map((cred) => `${cred.username},${cred.inuse}`)].join("\n");
			fs.writeFileSync("test/creds.csv", updatedData);
			console.log(`Credentials released for username: ${username}`);
			return true; // Successfully released credentials
		} else {
			console.log(`Username not found: ${username}`);
			return false; // Username not found in the file
		}
	} catch (err) {
		console.error("Error during file operation:", err);
		return false; // Return false in case of error
	} finally {
		// Release the lock after processing
		release();
	}
}
