import csv from "csv-parser";
import { createReadStream, writeFileSync } from "node:fs";
import { lock } from "proper-lockfile";

export async function lockAndUpdateCreds(): Promise<string | null> {
	// Lock the file to prevent concurrent access
	const release = await lock("test/creds.csv", { retries: 5, retryWait: 1000 });

	try {
		// Get credentials from the CSV file
		const creds = await new Promise<{ username: string; inuse: string }[]>((resolve, reject) => {
			const creds: { username: string; inuse: string }[] = [];

			createReadStream("test/creds.csv")
				.pipe(csv())
				.on("data", (row) => creds.push(row))
				.on("end", () => resolve(creds)) // Resolving after the 'end' event
				.on("error", (err) => reject(err)); // Reject if there's an error in reading the file
		});

		// Find the first available credentials
		const availableCreds = creds.find((cred) => cred.inuse === "no");

		if (availableCreds) {
			availableCreds.inuse = "yes";

			// Write the updated credentials back to the CSV file
			const updatedData = ["username,inuse", ...creds.map((cred) => `${cred.username},${cred.inuse}`)].join("\n");
			writeFileSync("test/creds.csv", updatedData);
			console.log("Credentials updated for username:", availableCreds.username);
			return availableCreds.username;
		} else {
			console.log("No available credentials.");
			return null;
		}
	} catch (err) {
		console.error("Error during file operation:", err);
		return null;
	} finally {
		// Release the lock after processing
		release();
	}
}

export async function getCredsAndLockFile(): Promise<string | null> {
	let locked = true;

	while (locked) {
		try {
			const username = await lockAndUpdateCreds();
			if (username) {
				return username;
			} else {
				console.log("Waiting for available credentials...");
			}

			locked = false; // Exit loop
		} catch (err) {
			console.log("File is locked, retrying...");
			await new Promise((resolve) => setTimeout(resolve, 1000)); // Retry after 1 second
		}
	}

	return null; // Return null if no username is found
}

export async function releaseCreds(username: string): Promise<boolean> {
	// Lock the file to prevent concurrent access
	const release = await lock("test/creds.csv", { retries: 5, retryWait: 1000 });

	try {
		// Get credentials from the CSV file
		const creds = await new Promise<{ username: string; inuse: string }[]>((resolve, reject) => {
			const creds: { username: string; inuse: string }[] = [];

			createReadStream("test/creds.csv")
				.pipe(csv())
				.on("data", (row) => creds.push(row))
				.on("end", () => resolve(creds)) // Resolving after the 'end' event
				.on("error", (err) => reject(err)); // Reject if there's an error in reading the file
		});

		// Find the credential with the provided username
		const userCred = creds.find((cred) => cred.username === username);

		if (userCred) {
			userCred.inuse = "no";

			// Write the updated credentials back to the CSV file
			const updatedData = ["username,inuse", ...creds.map((cred) => `${cred.username},${cred.inuse}`)].join("\n");
			writeFileSync("test/creds.csv", updatedData);
			console.log(`Credentials released for username: ${username}`);
			return true;
		} else {
			console.log(`Username not found: ${username}`);
			return false;
		}
	} catch (err) {
		console.error("Error during file operation:", err);
		return false;
	} finally {
		// Release the lock after processing
		release();
	}
}
