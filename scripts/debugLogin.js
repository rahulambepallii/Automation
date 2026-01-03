const playwright = require('playwright');
(async () => {
  const browser = await playwright.chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://practicetestautomation.com/practice-test-login/');
  await page.fill('#username', 'student');
  await page.fill('#password', 'Password123');
  await page.click('#submit');
  await page.waitForTimeout(1000);
  console.log('URL after submit:', page.url());
  try {
    const logoutVisible = await page.isVisible('a[href*="/logout/"]');
    console.log('logout visible:', logoutVisible);
  } catch(e) { console.log('logout check failed', e.message); }
  const bodyText = await page.textContent('body');
  console.log('Body snippet:', bodyText.slice(0,500));
  await browser.close();
})();