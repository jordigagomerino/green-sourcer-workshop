import screenshot from '../utils/screenshot.js';
import Base from './Base.js';
import Usage, { createUsage } from '../utils/usage.js';
import { supabase } from '$lib/supabase/supabaseClient.js';

/**
 * @typedef {import('playwright').Page} Page
 * @typedef {import('openai').OpenAI.CompletionUsage} CompletionUsage
 */

export default class Coffees {
	static prompt = {
		role: 'system',
		content: `
     DO YOUR PROMPT HERE

		 Expected output 
		  [
        {
            "name": "...", 
            "country": "...", // ISO 3166-1 alpha-2 country code
            "location": "...", // City, Region
            "process": "...",
            "varietal": "...",
            "lowestHeight": 0, // in meters
            "highestHeight": 0, // in meters
            "scaScore": 0,
            "link": "..."
        }
      ]
    `
	};

	static usage = createUsage();

	/**
	 * @param {Page} page
	 * @returns {Promise<{ success: boolean, usage: CompletionUsage }>}
	 */
	static async run(page) {
		const screenshotUrl = await screenshot(page, { fullPage: true });
		const linksText = await this.getLinks(page);

		const completion = await Base.run([
			this.prompt,
			{
				role: 'user',
				content: [
					{
						type: 'image_url',
						image_url: { url: screenshotUrl }
					},
					{
						type: 'text',
						text: linksText
					}
				]
			}
		]);

		completion?.usage && (this.usage = await Usage(this.usage, completion.usage));

		try {
			const coffees = JSON.parse(completion.choices[0].message.content ?? '');
      if (!Array.isArray(coffees)) {
        return { success: false, usage: this.usage };
      }
			await Promise.allSettled(
				coffees.map((coffee) =>
					this.createCoffee({
						...coffee,
						provider: page.url()
					})
				)
			);

			return { success: true, usage: this.usage };
		} catch {
			return this.run(page); // Retry if parsing fails
		}
	}

  /**
   * 
   * @param {*} coffee 
   */
	static async createCoffee(coffee) {
		const { data, error } = await supabase
			.from('coffees')
			.upsert({
				name: coffee.name,
				country: coffee.country,
				location: coffee.location,
				process: coffee.process,
				varietal: coffee.varietal,
				lowest_height: coffee.lowestHeight,
				highest_height: coffee.highestHeight,
				sca_score: coffee.scaScore,
				link: coffee.link,
				provider: coffee.provider
			})
			.select();

		console.log(data, error);
	}

  /**
   * 
   * @param {Page} page 
   * @returns 
   */
	static async getLinks(page) {
		const links = await page.$$eval('a', (as) => as.map((a) => a.href));
		const pageDomain = new URL(page.url()).hostname;
		return links.filter((link) => link.includes(pageDomain)).join('\n');
	}
}
