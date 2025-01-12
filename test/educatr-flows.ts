import { Page } from 'playwright';
import { expect } from '@playwright/test';
import * as fs from 'node:fs';

export async function helloWorld(page: Page, context) {
	const userIndex = context.vars.$processEnvironment.LOCAL_WORKER_ID;

	// Reset browser instance (not sure if this is even required)
	await page.goto("https://educatr.uk/");
	await page.evaluate(() => {
		localStorage.clear();
		sessionStorage.clear();
	});

	// Log in and navigate to competition
	await page.goto("https://educatr.uk/");

	await page.fill("#username", "test" + userIndex);
	await page.fill("#password", process.env.PERF_TEST_PASSWORD);

	await page.click("text=Login");

	await page.waitForTimeout(2000);

	await page.waitForURL("https://educatr.uk/");

	await page.goto("https://educatr.uk/play/ejn9p6bwx5ajl7oeldatdzoa");

	await page.waitForTimeout(2000);

	await expect(page.getByText('Logic Gates')).toBeVisible({timeout: 20000});

	// Question login
	const sampleQuestions = JSON.parse(fs.readFileSync('test/sample.json', 'utf8'));

	const randomisedSampleQuestions = sampleQuestions.sort(() => Math.random() - 0.5);
	for (const i in randomisedSampleQuestions) {
		const question: any = randomisedSampleQuestions[i];

		if (!['TEXT'].includes(question.answerType.S)) continue; // only allow text answers
		if (!['COMPARE', 'ALGORITHM'].includes(question.verificationType.S)) continue; // only allow automatic compare verification
		if (!['klawxt8g1agfkv6qn3jstajy'].includes(question.PK.S)) continue; // only allow specific categories

		const button = await page.locator(`#${question.SK.S.split('#')[1]}`);
		if (!await (button.evaluate(element => element.classList.contains('Mui-disabled')))) {
			await button.click();
			await page.waitForTimeout(2000);

			// get it wrong once
			await page.locator('input:visible').fill(question.answer.S + 'fdsfasfadsfdsa');
			await page.waitForTimeout(1000);
			await page.locator('button:text("Submit"):visible').click();
			await page.waitForResponse(response => response.url().includes('/check'));
			await page.waitForTimeout(2000);

			// get it wrong twice
			await page.locator('input:visible').fill(question.answer.S + 'rrerererwrew');
			await page.waitForTimeout(1000);
			await page.locator('button:text("Submit"):visible').click();
			await page.waitForResponse(response => response.url().includes('/check'));
			await page.waitForTimeout(2000);

			// get it right (80% of the time)
			if (Math.random() < 0.8) {
				await page.locator('input:visible').fill(question.answer.S);
				await page.waitForTimeout(1000);
				await page.locator('button:text("Submit"):visible').click();
				await page.waitForResponse(response => response.url().includes('/check'));
			} else {
				await page.keyboard.press('Escape');
			}

			await page.waitForTimeout(3000);

		}
	}
}
