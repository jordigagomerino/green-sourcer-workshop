import screenshot from "../utils/screenshot.js";
import wait from "../utils/wait.js";
import Base from "./Base.js";
import Usage, { createUsage } from "../utils/usage.js";

/**
 * @typedef {import("playwright").Page} Page
 * @typedef {import("openai").OpenAI.CompletionUsage} CompletionUsage
 */

export default class Paginator {
  static prompt = {
    role: "system",
    content: `
      DO YOUR PROMPT HERE

      Expected outputs
      {
        selectorText: TEXT
      }
      or in case of options
      {
        selector: "PLAYWRIGHT SELECTOR"
      }
    `,
  };

  static usage = createUsage();

  /**
   * @param {Page} page
   * @param {any[]} extra
   * @returns {Promise<{ success: boolean, end: boolean, usage: CompletionUsage, url: string  }>}
   */
  static async run(page, extra = []) {
    const url = page.url();
    console.log("URL", url);

    const completion = await Base.run([
      this.prompt,
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: await screenshot(page, { fullPage: true }),
            },
          },
          {
            type: "text",
            text: url,
          },
        ],
      },
      ...extra,
    ]);

    completion?.usage && (this.usage = await Usage(this.usage, completion.usage));

    if (completion.choices[0].message.content === "null") {
      return { success: true, end: true, usage: this.usage, url: url };
    }

    const { x, y, selectorText, selector } = JSON.parse(
      completion.choices[0].message.content ?? ""
    );

    try {
      if (selectorText || selector) {
        console.log("Clicking at", selectorText || selector);
        const locator = selectorText
          ? page.locator(`text="${selectorText}"`).filter({ visible: true })
          : page.locator(selector).filter({ visible: true });
        await locator.first().click();
      } else {
        console.log("Clicking at", x, y);
        await page.mouse.click(x, y);
      }
    } catch (/** @type {*} */ e) {
      console.log("Error", e.message);
      const message = {
        role: "user",
        content: [
          {
            type: "text",
            text: `Error ${e.message}`,
          },
        ],
      };
      return await this.run(page, [message]);
    }

    await wait(2000);

    if (page.url() !== url) {
      console.log("URL changed", page.url());
      return { success: true, end: false, url: url, usage: this.usage };
    }

    return await this.run(page);
  }
}
