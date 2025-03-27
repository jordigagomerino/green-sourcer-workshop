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
        You are a helper that will help me to click on the right place in the screen, you need to look into a banners or cookies consent and allow it.
        The main goal is to allow the cookies consent and close the banner.
        Your work is find the cookie consent and get the coordinates.
 
        If the cookie consent exists the expected output is:
        Please take care and do a JSON parse, because I use JSON.
        {
          x: 100,
          y: 200
        }
 
        Considerations:
        Only return the JSON parsed object not the text, only the JSON parsed object.
        if there is not a banner or cookies consent return null
        If you are not sure about the click, return null.
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
