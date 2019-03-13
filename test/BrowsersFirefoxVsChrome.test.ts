import { ChildProcess, spawn } from 'child_process';
import { Browser as ChromeBrowser, Viewport, launch as LaunchChrome, Page as ChromePage } from 'puppeteer';
import { Browser as FirefoxBrowser, launch as LaunchFirefox, Page as FirefoxPage } from 'puppeteer-firefox';
import * as ResembleJS from 'resemblejs';
import { expect } from 'chai';
import { join } from 'path';

type Browser = FirefoxBrowser | ChromeBrowser;
type Page = FirefoxPage | ChromePage;
type Actions = (page: Page) => Promise<void>;
type Resolution = 'fullhd' | 'desktop' | 'tablet' | 'mobile';
const resolutions: { [_ in Resolution]: Viewport } = {
	fullhd: { width: 1920, height: 1080 },
	desktop: { width: 768, height: 1024 },
	tablet: { width: 640, height: 690 },
	mobile: { width: 320, height: 480 }
};

describe('In the browsers <Firefox> and <Chrome>', () => {
	let server: ChildProcess;
	let firefoxBrowser: FirefoxBrowser;
	let chromeBrowser: ChromeBrowser;

	before(done => {
		server = spawn('npm', ['run', 'serve'], { detached: true });
		Promise.all([
			LaunchFirefox({ headless: true }).then(browser => firefoxBrowser = browser),
			LaunchChrome({ headless: true, args:[ '--no-sandbox', '--disable-setuid-sandbox' ]}).then(browser => chromeBrowser = browser)
		]).then(() => done());
	});

	after(done => {
		Promise.all([
			firefoxBrowser.close(),
			chromeBrowser.close()
		]).then(() => {
			if (server && !server.killed) process.kill(-server.pid);
			done();
		});
	});

	describe('the `HomePage` should look the same', () => {
		it('with a `fullhd` resolution', async () => await run('/', 'fullhd', 0.2, firefoxBrowser, chromeBrowser)).timeout(0);
		it('with a `desktop` resolution', async () => await run('/', 'desktop', 0.7, firefoxBrowser, chromeBrowser)).timeout(0);
		it('with a `tablet` resolution', async () => await run('/', 'tablet', 1.1, firefoxBrowser, chromeBrowser)).timeout(0);
		it('with a `mobile` resolution', async () => await run('/', 'mobile', 1.4, firefoxBrowser, chromeBrowser)).timeout(0);
	});

	describe('the `HomePage` with `SearchBox` should look the same', () => {
		const searchSelector = '.widget-search input[type=\'search\']';
		const resultSelector = '.widget-search #search-results';
		const selectSearchBox = async (page: ChromePage) => {
			await page.type(searchSelector, 'test');
			await page.waitForSelector(resultSelector, { visible: true });
		};

		it('with a `fullhd` resolution', async () => await run('/#search', 'fullhd', 0.2, firefoxBrowser, chromeBrowser, selectSearchBox)).timeout(0);
		it('with a `desktop` resolution', async () => await run('/#search', 'desktop', 0.7, firefoxBrowser, chromeBrowser, selectSearchBox)).timeout(0);
		it('with a `tablet` resolution', async () => await run('/#search', 'tablet', 1.1, firefoxBrowser, chromeBrowser, selectSearchBox)).timeout(0);
		it('with a `mobile` resolution', async () => await run('/#search', 'mobile', 1.9, firefoxBrowser, chromeBrowser, async (page: Page) => {
			await page.click('.navbar-burger');
			await page.waitForSelector(searchSelector, { visible: true });
			await selectSearchBox(page);
		})).timeout(0);
	});

	describe('the `SinglePostPage` should look the same', () => {
		it('with a `fullhd` resolution', async () => await run('/posts/hello-world', 'fullhd', 0.2, firefoxBrowser, chromeBrowser)).timeout(0);
		it('with a `desktop` resolution', async () => await run('/posts/hello-world', 'desktop', 0.7, firefoxBrowser, chromeBrowser)).timeout(0);
		it('with a `tablet` resolution', async () => await run('/posts/hello-world', 'tablet', 1.1, firefoxBrowser, chromeBrowser)).timeout(0);
		it('with a `mobile` resolution', async () => await run('/posts/hello-world', 'mobile', 1.8, firefoxBrowser, chromeBrowser)).timeout(0);
	});
});

async function run(url: string, res: Resolution, threshold: number, firefoxBrowser: FirefoxBrowser, chromeBrowser: ChromeBrowser, actions?: Actions): Promise<void> {
	const safeUrl = url.replace(/\//g, '_');
	const firefoxPath = join(__dirname, `firefox-[${safeUrl}]-${res}.jpg`);
	const chromePath = join(__dirname, `chrome-[${safeUrl}]-${res}.jpg`);

	await capture(firefoxBrowser, resolutions[res], url, firefoxPath, actions);
	await capture(chromeBrowser, resolutions[res], url, chromePath, actions);

	const results = ResembleJS(firefoxPath)
		.compareTo(chromePath)
		.ignoreAntialiasing();

	results.onComplete(res => {
		const ratio = parseFloat(`${res.misMatchPercentage}`);

		console.log(`expecting <${ratio}> <= <${threshold}>`);
		expect(ratio).to.be.lessThan(threshold + 0.1)
	});
}

async function capture(browser: Browser, viewport: Viewport, url: string, path: string, actions?: Actions): Promise<Buffer> {
	const page = await browser.newPage();
	await page.setViewport(viewport);
	await page.goto(`http://localhost:1313${url}`);

	if (actions) {
		await actions(page);
	}

	return await page.screenshot({ fullPage: true, path: path });
}
