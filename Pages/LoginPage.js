class LoginPage {
  constructor(page) {
    this.page = page;
    this.url = 'https://practicetestautomation.com/practice-test-login/';

    // Selectors for the practice-test-login page
    this.usernameInput = 'input#username';
    this.passwordInput = 'input#password';
    this.submitButton = 'button#submit';
    this.errorMessage = '#error'; // error message container
    this.logoutButton = `//a[text()='Log out']`;
    this.successMessage = '.post-title';
  }

  async goto() {
    await this.page.goto(this.url);
  }

  async login(username, password, { waitForResponse = true, timeout = 5000 } = {}) {
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.submit({ waitForResponse, timeout });
  }

  async fillUsername(username) {
    await this.page.waitForSelector(this.usernameInput, { timeout: 5000 });
    await this.page.fill(this.usernameInput, username);
  }

  async fillPassword(password) {
    await this.page.waitForSelector(this.passwordInput, { timeout: 5000 });
    await this.page.fill(this.passwordInput, password);
  }

  async submit({ waitForResponse = true, timeout = 5000 } = {}) {
    await this.page.waitForSelector(this.submitButton, { timeout: 3000 });
    await Promise.all([
      this.page.click(this.submitButton),
      this.page.waitForTimeout(250)
    ]);

    if (waitForResponse) {
      await Promise.race([
        this.page.waitForSelector(this.logoutButton, { timeout }).catch(() => {}),
        this.page.waitForSelector(this.errorMessage, { timeout }).catch(() => {}),
        this.page.waitForURL(/logged-in-successfully/, { timeout }).catch(() => {})
      ]);
    }
  }

  async pressEnterOnPassword({ waitForResponse = true, timeout = 5000 } = {}) {
    await this.page.waitForSelector(this.passwordInput, { timeout: 3000 });
    await this.page.press(this.passwordInput, 'Enter');
    if (waitForResponse) {
      await Promise.race([
        this.page.waitForSelector(this.logoutButton, { timeout }).catch(() => {}),
        this.page.waitForSelector(this.errorMessage, { timeout }).catch(() => {}),
        this.page.waitForURL(/logged-in-successfully/, { timeout }).catch(() => {})
      ]);
    }
  }

  async clickLogout() {
    await this.page.waitForSelector(this.logoutButton, { timeout: 5000 });
    await Promise.all([
      this.page.click(this.logoutButton),
      this.page.waitForNavigation({ waitUntil: 'load', timeout: 5000 }).catch(() => {})
    ]);
  }

  async refresh() {
    await this.page.reload();
  }

  async getPageContent() {
    return await this.page.content();
  }

  async getErrorMessageText() {
    if (await this.page.isVisible(this.errorMessage)) {
      return (await this.page.textContent(this.errorMessage)).trim();
    }
    return null;
  }

  async waitForLoginForm(timeout = 5000) {
    await this.page.waitForSelector(this.usernameInput, { timeout });
  }

  async waitForResponse(timeout = 5000) {
    await Promise.race([
      this.page.waitForSelector(this.logoutButton, { timeout }).catch(() => {}),
      this.page.waitForSelector(this.errorMessage, { timeout }).catch(() => {}),
      this.page.waitForURL(/logged-in-successfully/, { timeout }).catch(() => {})
    ]);
  }

  async verifySuccessMessage(expectedMessage) {
    const actMessage = await this.page.locator(this.successMessage).first().textContent().catch(() => null);
    if (actMessage === expectedMessage) return true;

    return false;
  }


  /* Assertion helpers (support soft assertions via provided "world") */
  async assertLoggedIn(world) {
    const ok = await this.isLoggedIn();
    if (world && typeof world.softAssert === 'function') {
      world.softAssert(ok, 'Expected to be logged in successfully');
    } else {
      const assert = require('assert');
      assert.ok(ok, 'Expected to be logged in successfully');
    }
  }

  async assertErrorContains(expected, world) {
    const text = await this.getErrorMessageText();
    const ok = !!(text && text.includes(expected));
    if (world && typeof world.softAssert === 'function') {
      world.softAssert(ok, `Expected error to include "${expected}", got: "${text}"`);
    } else {
      const assert = require('assert');
      assert.ok(ok, `Expected error to include "${expected}", got: "${text}"`);
    }
  }

  async assertValidationError(world) {
    const text = await this.getErrorMessageText();
    const ok = !!(text && text.length > 0);
    if (world && typeof world.softAssert === 'function') {
      world.softAssert(ok, `Expected a validation error, got: ${text}`);
    } else {
      const assert = require('assert');
      assert.ok(ok, `Expected a validation error, got: ${text}`);
    }
  }

  async assertInputRejected(world) {
    const text = await this.getErrorMessageText();
    const content = await this.getPageContent();
    const ok = !!(text && text.length > 0) && !content.includes('<script>alert(1)</script>');
    if (world && typeof world.softAssert === 'function') {
      world.softAssert(ok, 'Expected input to be rejected and no XSS in page content');
    } else {
      const assert = require('assert');
      assert.ok(ok, 'Expected input to be rejected and no XSS in page content');
    }
  }
}

module.exports = LoginPage;
