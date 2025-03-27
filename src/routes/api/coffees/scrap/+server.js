import { chromium } from 'playwright';
import wait from '$lib/server/utils/wait.js';
import Clearer from '$lib/server/helpers/Clearer.js';
import Usage, { createUsage, usageToMoney } from '$lib/server/utils/usage.js';
import Coffees from '$lib/server/helpers/Coffees.js';
import Paginator from '$lib/server/helpers/Paginator.js';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
	let usage = createUsage();
	const browser = await chromium.launch({ headless: false });
	const page = await browser.newPage();
	// Goto "https://mareterracoffee.com/es/cafe-verde"
	await page.goto('https://mareterracoffee.com/es/cafe-verde');

	await wait(2000);

	const clear = await Clearer.run(page);
	usage = await Usage(usage, clear.usage);
	console.log(usageToMoney(usage));
	async function search() {
		console.log('Running coffee');
		const coffee = await Coffees.run(page);
		usage = await Usage(usage, coffee.usage);
		console.log(usageToMoney(usage));
		console.log('Running paginator');
		const pagination = await Paginator.run(page);
		usage = await Usage(usage, pagination.usage);
		console.log(usageToMoney(usage));
		if (pagination.end) {
			return;
		}
		await search();
	}
	await search();
	console.log('Total USAGE', usage);
	console.log(usageToMoney(usage));
	await browser.close();

	return new Response(String("DONE"));
}
