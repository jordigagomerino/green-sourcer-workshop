import { chromium } from "playwright";
import wait from "./src/lib/server/utils/wait.js";
import Clearer from "./helpers/clearer.js";
import Usage, {createUsage, usageToMoney} from "./src/lib/server/utils/usage.js";
import Coffees from "./helpers/Coffees.js";
import Paginator from "./helpers/Paginator.js";
let usage = createUsage();
const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();
// Goto "https://mareterracoffee.com/es/cafe-verde"
await page.goto("https://www.fruttoforastero.com/great-frutto/");

await wait(2000);

const clear = await Clearer.run(page);
usage = await Usage(usage, clear.usage);
console.log(usageToMoney(usage));
async function search() {
  console.log("Running coffee")
  const coffee = await Coffees.run(page);
  usage = await Usage(usage, coffee.usage);
  console.log(usageToMoney(usage));
  console.log("Running paginator")
  const pagination = await Paginator.run(page)
  usage = await Usage(usage, pagination.usage);
  console.log(usageToMoney(usage));
  if (pagination.end) {
    return;
  }
  await search();
}
await search();
console.log("Total USAGE", usage);
console.log(usageToMoney(usage));
await browser.close()
