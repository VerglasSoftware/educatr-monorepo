module.exports = { helloWorld };
 
async function helloWorld(page, context) {
    const userIndex = context.vars.$processEnvironment.LOCAL_WORKER_ID;

    await page.goto('https://educatr.uk/');
    await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
    });

    await page.goto('https://educatr.uk/');

    await page.fill('#username', 'test' + userIndex);
    await page.fill('#password', 'B34gl3103!');

    await page.click('text=Login');

    await page.waitForTimeout(2000);

    await page.waitForURL('https://educatr.uk/');

    await page.goto('https://educatr.uk/play/ejn9p6bwx5ajl7oeldatdzoa');

    await page.waitForTimeout(2000);
}
