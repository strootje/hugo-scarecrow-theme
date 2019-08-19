// import { assert } from 'chai';
import { join } from 'path';
import { Browser as ChromeBrowser, launch as LaunchChrome, Page as ChromePage, Viewport } from 'puppeteer';
import { Browser as FirefoxBrowser, launch as LaunchFirefox, Page as FirefoxPage } from 'puppeteer-firefox';
import * as ResembleJS from 'resemblejs';
import TestServer from './util/TestServer';

type Browser = FirefoxBrowser | ChromeBrowser;
type Page = FirefoxPage | ChromePage;
type Actions = (page: Page) => Promise<void>;
type Resolution = 'fullhd' | 'desktop' | 'tablet' | 'mobile';
const allowed = 5.0;
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
		it('with a `fullhd` resolution', () => run('/', 'fullhd', allowed, browsers)).timeout(0);
		it('with a `desktop` resolution', () => run('/', 'desktop', allowed, browsers)).timeout(0);
		it('with a `tablet` resolution', () => run('/', 'tablet', allowed, browsers)).timeout(0);
		it('with a `mobile` resolution', () => run('/', 'mobile', allowed * 6, browsers)).timeout(0);
	});

	describe('the `ListPostPage` should look the same', () => {
		it('with a `fullhd` resolution', () => run('/posts', 'fullhd', allowed, browsers)).timeout(0);
		it('with a `desktop` resolution', () => run('/posts', 'desktop', allowed, browsers)).timeout(0);
		it('with a `tablet` resolution', () => run('/posts', 'tablet', allowed, browsers)).timeout(0);
		it('with a `mobile` resolution', () => run('/posts', 'mobile', allowed, browsers)).timeout(0);
	});

	describe('the `SearchPage` should look the same', () => {
		const searchSelector = '.search input[type=\'search\']';
		const resultSelector = '.search ul';
		const selectSearchBox = async (page: ChromePage) => {
			await page.type(searchSelector, 'hello');
			await page.waitForSelector(resultSelector, { visible: true });
		};

		it('with a `fullhd` resolution', () => run('/posts/#search', 'fullhd', allowed, browsers, selectSearchBox)).timeout(0);
		it('with a `desktop` resolution', () => run('/posts/#search', 'desktop', allowed, browsers, selectSearchBox)).timeout(0);
		it('with a `tablet` resolution', () => run('/posts/#search', 'tablet', allowed, browsers, selectSearchBox)).timeout(0);
		it('with a `mobile` resolution', () => run('/posts/#search', 'mobile', allowed * 3, browsers, selectSearchBox)).timeout(0);
	});

	describe('the `SinglePostPage` should look the same', () => {
		it('with a `fullhd` resolution', () => run('/posts/hello-world', 'fullhd', allowed, browsers)).timeout(0);
		it('with a `desktop` resolution', () => run('/posts/hello-world', 'desktop', allowed, browsers)).timeout(0);
		it('with a `tablet` resolution', () => run('/posts/hello-world', 'tablet', allowed, browsers)).timeout(0);
		it('with a `mobile` resolution', () => run('/posts/hello-world', 'mobile', allowed * 4, browsers)).timeout(0);
	});

	describe('the `AboutPage` should look the same', () => {
		it('with a `fullhd` resolution', () => run('/about', 'fullhd', allowed, browsers)).timeout(0);
		it('with a `desktop` resolution', () => run('/about', 'desktop', allowed, browsers)).timeout(0);
		it('with a `tablet` resolution', () => run('/about', 'tablet', allowed, browsers)).timeout(0);
		it('with a `mobile` resolution', () => run('/about', 'mobile', allowed * 2, browsers)).timeout(0);
	});

	describe('the `ContactPage` should look the same', () => {
		it('with a `fullhd` resolution', () => run('/contact', 'fullhd', allowed, browsers)).timeout(0);
		it('with a `desktop` resolution', () => run('/contact', 'desktop', allowed, browsers)).timeout(0);
		it('with a `tablet` resolution', () => run('/contact', 'tablet', allowed, browsers)).timeout(0);
		it('with a `mobile` resolution', () => run('/contact', 'mobile', allowed, browsers)).timeout(0);
	});
});

async function run(url: string, res: Resolution, threshold: number, browsers: Browser[], actions?: Actions): Promise<void> {
	const safeUrl = url.replace(/\//g, '_');

	const firstBrowser = browsers[0];
	const firstPath = join(__dirname, 'results', `browser[0]-[${safeUrl}]-${res}.jpg`);
	await capture(firstBrowser, resolutions[res], url, firstPath, actions);

	const promises: Array<Promise<void>> = [];
	for(let i = 1; i < browsers.length; i++) {
		const browser = browsers[i];
		const path = join(__dirname, 'results', `browser[${i}]-[${safeUrl}]-${res}.jpg`);

		await capture(browser, resolutions[res], url, path, actions);

		const results = ResembleJS(firstPath)
			.compareTo(path)
			.ignoreAntialiasing();

		promises.push(new Promise((resolve, reject) => {
			results.onComplete(res => {
				const ratio = parseFloat(`${res.misMatchPercentage}`);

				if (ratio > threshold) {
					reject(`expecting <${ratio}> <= <${threshold}>`);
				} else {
					resolve();
				}
			});
		}));
	}

	await Promise.all(promises);
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
