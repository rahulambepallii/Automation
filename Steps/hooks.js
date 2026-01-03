const { Before, After, setDefaultTimeout } = require('@cucumber/cucumber');
const playwright = require('playwright');

// Increase default timeout for slow networks/pages
setDefaultTimeout(60 * 1000);

Before(async function () {
  // Launch browser and create a page for each scenario
  this.browser = await playwright.chromium.launch({ headless: false });
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();

  // Soft-assertion support: collect non-fatal failures and report at end
  this._softErrors = [];

  /**
   * Soft assert - record failure but don't throw immediately
   * @param {boolean} condition
   * @param {string} message
   */
  this.softAssert = function (condition, message) {
    if (!condition) {
      this._softErrors.push(message || 'soft assertion failed');
    }
  };

  /**
   * Soft assert equals
   */
  this.softAssertEquals = function (actual, expected, message) {
    if (actual !== expected) {
      this._softErrors.push(message || `expected [${expected}] but got [${actual}]`);
    }
  };

  /**
   * Soft assert includes (substring or array includes)
   */
  this.softAssertIncludes = function (container, value, message) {
    try {
      if (typeof container === 'string') {
        if (!container.includes(value)) this._softErrors.push(message || `expected "${container}" to include "${value}"`);
      } else if (Array.isArray(container)) {
        if (!container.includes(value)) this._softErrors.push(message || `expected array to include ${value}`);
      } else {
        this._softErrors.push(message || 'unsupported type for softAssertIncludes');
      }
    } catch (e) {
      this._softErrors.push(message || `softAssertIncludes error: ${e.message}`);
    }
  };

  /**
   * Helper to check and clear soft errors (used by steps if desired)
   */
  this.getSoftErrors = function () {
    return Array.from(this._softErrors);
  };
  this.clearSoftErrors = function () {
    this._softErrors = [];
  };
});

After(async function () {
  // Aggregate and fail the scenario if any soft-assertions recorded
  if (this._softErrors && this._softErrors.length > 0) {
    const message = ['Soft-assertion failures:'].concat(this._softErrors.map((m, i) => `${i + 1}) ${m}`)).join('\n');
    // Clean up browser first, then throw to mark scenario failed
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
    // Throwing from After will mark the scenario as failed
    throw new Error(message);
  }

  // Clean up if no soft errors
  if (this.page) await this.page.close();
  if (this.context) await this.context.close();
  if (this.browser) await this.browser.close();
});
