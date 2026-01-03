const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');
const LoginPage = require('../Pages/LoginPage');

Given('I navigate to the practicetestautomationlogin page', async function () {
  this.loginPage = new LoginPage(this.page);
  await this.loginPage.goto();
  await this.loginPage.waitForLoginForm();
});

When('I enter valid username and password', async function () {
  // Uses known good credentials from the practice site; login() now waits for response
  await this.loginPage.login('student', 'Password123');
});

When('I click on the login button', async function () {
  // Use page method to submit and wait for response
  await this.loginPage.submit();
});

When('I login with username {string} and password {string}', async function (username, password) {
  this.loginPage = new LoginPage(this.page);
  // normalize inputs and use page methods
  username = (username || '').trim();
  password = (password || '').trim();
  await this.loginPage.login(username, password);
});

When('I enter username {string} and password {string} and press Enter', async function (username, password) {
  this.loginPage = new LoginPage(this.page);
  username = (username || '').trim();
  password = (password || '').trim();
  await this.loginPage.fillUsername(username);
  await this.loginPage.fillPassword(password);
  await this.loginPage.pressEnterOnPassword();
});

When('I click the Log out button', async function () {
  await this.loginPage.clickLogout();
  await this.loginPage.waitForLoginForm();
});

When('I refresh the page', async function () {
  await this.page.reload();
  // allow a short time for reload to settle
  await this.page.waitForTimeout(500);
});

Then('I should be verify success message {string}', async function (expectedMessage) {
  await this.page.waitForSelector(this.loginPage.logoutButton, { timeout: 5000 });
  const loggedIn = await this.loginPage.verifySuccessMessage(expectedMessage);
  assert.ok(loggedIn, 'Expected to be '+ expectedMessage);
});

Then('I should still be logged in', async function () {
  // Allow some time for session checks after reload
  await this.page.waitForTimeout(300);
  const loggedIn = await this.loginPage.isLoggedIn();
  assert.ok(loggedIn, 'Expected session to persist after refresh');
});

Then('I should see {string}', async function (expectedText) {
  await this.page.waitForSelector(this.loginPage.errorMessage, { timeout: 5000 });
  const text = await this.loginPage.getErrorMessageText();
  assert.ok(text && text.includes(expectedText), `Expected message to include "${expectedText}", got: ${text}`);
});

Then('I should see an appropriate validation error', async function () {
  // validation errors use the same error container on this site
  await this.page.waitForSelector(this.loginPage.errorMessage, { timeout: 5000 });
  const text = await this.loginPage.getErrorMessageText();
  assert.ok(text && text.length > 0, `Expected a validation error, got: ${text}`);
});

Then('the input should be rejected and no script should execute', async function () {
  await this.page.waitForSelector(this.loginPage.errorMessage, { timeout: 5000 }).catch(() => {});
  const text = await this.loginPage.getErrorMessageText();
  assert.ok(text && text.length > 0, 'Expected input to be rejected');
  const content = await this.loginPage.getPageContent();
  assert.ok(!content.includes('<script>alert(1)</script>'), 'Potential XSS detected in page content');
});
