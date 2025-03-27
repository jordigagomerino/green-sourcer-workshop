import screenshot from "../utils/screenshot.js";
import wait from "../utils/wait.js";
import Base from "./Base.js";
/**
 * @typedef {import('playwright').Page} Page
 * @typedef {import('openai').OpenAI.CompletionUsage} CompletionUsage
 * 
 */

import Usage, { createUsage } from "../utils/usage.js";
// Usage type with completion tokens prompt otkens and total tokens

export default class Clearer {
  static prompt = {
      role: "system",
      content: `
        DO YOUR PROMPT HERE

        Expected output
        {
          x: 100,
          y: 200
        }
      `,
    };
  
  static usage = createUsage();

  /**
   * Playwright page instance

   * @param {Page} page - The page instance
   * @returns {Promise<{ success: boolean, usage: CompletionUsage }>} - The success and usage
   */
  static async run(page) {
    const completion = await Base.run([
        this.prompt,
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: await screenshot(page),
              },
            },
          ],
        },
    ]);
    completion?.usage && (this.usage = await Usage(this.usage, completion?.usage));
    if (completion.choices[0].message.content === "null") {
      return { success: true, usage: this.usage };
    }
    const { x, y } = JSON.parse(completion.choices[0].message.content ?? '');
    if (!x || !y) {
      return { success: false, usage: this.usage };
    }
    console.log("Clicking at", x, y);
    await page.mouse.click(x, y);
    await wait(2000);
    return await this.run(page);
  }
}
