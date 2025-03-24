import { expect } from "@playwright/test";
import "dotenv/config";
import * as fs from "node:fs";
import { Page } from "playwright";
import { TaskDynamo } from "../packages/functions/src/types/task";
import { getCredsAndLockFile, releaseCreds } from "./credManager";

export async function helloWorld(page: Page, context, events) {
	// Create event listeners for custom metrics
	page.on("response", (response) => {
		if (response.url().includes("api.educatr.uk")) {
			const time = Date.now() - response.request().timing().startTime;
			events.emit("histogram", `api_response_time`, time);
			events.emit("histogram", `api_response_time_${response.url()}`, time);
			console.log(`Request to ${response.url()} took ${time}ms`);
		}
	});

	// Reset browser instance (not sure if this is even required)
	await page.goto("https://educatr.uk/");
	await page.evaluate(() => {
		localStorage.clear();
		sessionStorage.clear();
	});

	// Log in and navigate to competition
	let username = await getCredsAndLockFile();
	if (!username) return;

	await page.goto("https://educatr.uk/");

	await expect(page.locator("#username")).toBeEditable({ timeout: 200000 });
	await expect(page.locator("#password")).toBeEditable({ timeout: 200000 });

	await page.fill("#username", username);
	await page.fill("#password", process.env.PERF_TEST_PASSWORD);

	await page.click("text=Login");

	await page.waitForTimeout(2000);

	await page.waitForURL("https://educatr.uk/", { timeout: 200000 });

	await page.goto("https://educatr.uk/play/ejn9p6bwx5ajl7oeldatdzoa");

	await page.waitForTimeout(2000);

	await expect(page.getByText("Logic Gates")).toBeVisible({ timeout: 200000 });

	// Question login
	const sampleQuestions: TaskDynamo[] = JSON.parse(fs.readFileSync("test/sample.json", "utf8"));

	const randomisedSampleQuestions = sampleQuestions.sort(() => Math.random() - 0.5);
	for (const i in randomisedSampleQuestions) {
		try {
			const question = randomisedSampleQuestions[i];

			if (!["TEXT", "PYTHON"].includes(question.answerType.S)) continue; // only allow text answers
			if (!["COMPARE"].includes(question.verificationType.S)) continue; // only allow automatic compare verification

			const button = await page.locator(`#${question.SK.S.split("#")[1]}`);
			if (!(await button.evaluate((element) => element.classList.contains("Mui-disabled")))) {
				await button.click();
				await page.waitForTimeout(2000);

				if (question.answerType.S != "PYTHON") {
					// get it wrong once
					await page.locator("input:visible").fill(question.answer.S + "fdsfasfadsfdsa");
					await page.waitForTimeout(1000);
					await page.locator('button:text("Submit"):visible').click();
					await page.waitForResponse((response) => response.url().includes("/check"), { timeout: 20000 });
					await page.waitForTimeout(2000);

					// get it wrong twice
					await page.locator("input:visible").fill(question.answer.S + "rrerererwrew");
					await page.waitForTimeout(1000);
					await page.locator('button:text("Submit"):visible').click();
					await page.waitForResponse((response) => response.url().includes("/check"), { timeout: 20000 });
					await page.waitForTimeout(2000);
				} else {
					await page.evaluate(
						([answer]) => {
							let editor = document.querySelector(".cm-content");
							editor.textContent = `print(${answer}eeeeee);`;
							editor.dispatchEvent(new Event("input", { bubbles: true }));
						},
						[question.answer.S]
					);
					await page.waitForTimeout(1000);
					await page.locator('button:text("Submit"):visible').click();
					await page.waitForResponse((response) => response.url().includes("/check"), { timeout: 20000 });
					await page.waitForTimeout(2000);

					await page.evaluate(
						([answer]) => {
							let editor = document.querySelector(".cm-content");
							editor.textContent = `print(${answer}ssssss);`;
							editor.dispatchEvent(new Event("input", { bubbles: true }));
						},
						[question.answer.S]
					);
					await page.waitForTimeout(1000);
					await page.locator('button:text("Submit"):visible').click();
					await page.waitForResponse((response) => response.url().includes("/check"), { timeout: 20000 });
					await page.waitForTimeout(2000);
				}

				// get it right (80% of the time)
				if (Math.random() < 0.8) {
					console.log(question.answerType.S == "PYTHON");
					if (question.answerType.S == "PYTHON") {
						page.evaluate(
							([answer]) => {
								let editor = document.querySelector(".cm-content");
								editor.textContent = `print('${answer}');`;
								editor.dispatchEvent(new Event("input", { bubbles: true }));
							},
							[question.answer.S]
						);
					} else {
						await page.locator("input:visible").fill(question.answer.S);
					}
  // check this
// 					await page.locator("input:visible").fill(
// 						question.answerType.S == "CSHARP"
// 							? `using System;

// 	namespace IglooCode {
// 		class Program {
// 			static void Main(string[] args) {
// 				// Write your code below this line
// 				Console.WriteLine("${question.answer.S}");
// 			}
// 		}
// 	}`
// 							: question.answer.S
// 					);
					await page.waitForTimeout(1000);
					await page.locator('button:text("Submit"):visible').click();
					await page.waitForResponse((response) => response.url().includes("/check"), { timeout: 20000 });
				} else {
					await page.keyboard.press("Escape");
				}

				await page.waitForTimeout(3000);
			} else console.log("Task already complete");
		} catch (e) {
			await page.keyboard.press("Escape");
		}
	}

	await releaseCreds(username);
}
