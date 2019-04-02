import { expect } from 'chai';
import { join } from 'path';
import { Browser as ChromeBrowser, launch as LaunchChrome, Page as ChromePage, Viewport } from 'puppeteer';
import { Browser as FirefoxBrowser, launch as LaunchFirefox, Page as FirefoxPage } from 'puppeteer-firefox';
import * as ResembleJS from 'resemblejs';
import TestServer from './util/TestServer';

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
	let server: TestServer;
	const browsers: Browser[] = [];

	before(async function() {
		this.timeout(0);
		server = new TestServer();
		await server.listen();

		browsers.push(await LaunchFirefox({ headless: true }));
		browsers.push(await LaunchChrome({ headless: true, args:[ '--no-sandbox', '--disable-setuid-sandbox' ]}));
	});

	after(async () => {
		for(let i = 0; i < browsers.length; i++) {
			await browsers[i].close();
		}

		if(server) {
			await server.close();
		}
	});

	describe('the `HomePage` should look the same', () => {
		it('with a `fullhd` resolution', async () => await run('/', 'fullhd', 0.2, browsers)).timeout(0);
		it('with a `desktop` resolution', async () => await run('/', 'desktop', 0.7, browsers)).timeout(0);
		it('with a `tablet` resolution', async () => await run('/', 'tablet', 1.1, browsers)).timeout(0);
		it('with a `mobile` resolution', async () => await run('/', 'mobile', 1.5, browsers)).timeout(0);
	});

	describe('the `HomePage` with `SearchBox` should look the same', () => {
		const searchSelector = '.widget-search input[type=\'search\']';
		const resultSelector = '.widget-search #search-results';
		const selectSearchBox = async (page: ChromePage) => {
			await page.type(searchSelector, 'test');
			await page.waitForSelector(resultSelector, { visible: true });
		};

		it('with a `fullhd` resolution', async () => await run('/#search', 'fullhd', 0.3, browsers, selectSearchBox)).timeout(0);
		it('with a `desktop` resolution', async () => await run('/#search', 'desktop', 0.8, browsers, selectSearchBox)).timeout(0);
		it('with a `tablet` resolution', async () => await run('/#search', 'tablet', 1.3, browsers, selectSearchBox)).timeout(0);
		it('with a `mobile` resolution', async () => await run('/#search', 'mobile', 1.6, browsers, async (page: Page) => {
			await page.click('.navbar-burger');
			await page.waitForSelector(searchSelector, { visible: true });
			await selectSearchBox(page);
		})).timeout(0);
	});

	describe('the `SinglePostPage` should look the same', () => {
		it('with a `fullhd` resolution', async () => await run('/posts/hello-world', 'fullhd', 0.3, browsers)).timeout(0);
		it('with a `desktop` resolution', async () => await run('/posts/hello-world', 'desktop', 0.7, browsers)).timeout(0);
		it('with a `tablet` resolution', async () => await run('/posts/hello-world', 'tablet', 1.2, browsers)).timeout(0);
		it('with a `mobile` resolution', async () => await run('/posts/hello-world', 'mobile', 2.0, browsers)).timeout(0);
	});
});

async function run(url: string, res: Resolution, threshold: number, browsers: Browser[], actions?: Actions): Promise<void> {
	const safeUrl = url.replace(/\//g, '_');

	const firstBrowser = browsers[0];
	const firstPath = join(__dirname, 'results', `browser[0]-[${safeUrl}]-${res}.jpg`);
	await capture(firstBrowser, resolutions[res], url, firstPath, actions);

	for(let i = 1; i < browsers.length; i++) {
		const browser = browsers[i];
		const path = join(__dirname, 'results', `browser[${i}]-[${safeUrl}]-${res}.jpg`);

		await capture(browser, resolutions[res], url, path, actions);

		const results = ResembleJS(firstPath)
			.compareTo(path)
			.ignoreAntialiasing();

		results.onComplete(res => {
			const ratio = parseFloat(`${res.misMatchPercentage}`);

			console.log(`expecting <${ratio}> <= <${threshold}>`);
			expect(ratio).to.be.lessThan(threshold + 0.1)
		});
	}
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
