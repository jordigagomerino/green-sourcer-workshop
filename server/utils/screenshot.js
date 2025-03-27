import playwright from "playwright";
/**
   * Playwright page instance
   * @param {playwright.Page} page - The page instance
   * @param {object} options - The options
   * @param {boolean} options.fullPage - Whether to take a full page screenshot
   * @returns {string} - The base64 encoded screenshot
*/
export default async function screenshot(page, options = {
  fullPage: false,
}) {
  const buffer = await page.screenshot({ fullPage: options.fullPage });
  const base64 = buffer.toString("base64");
  return `data:image/png;base64,${base64}`;
}
