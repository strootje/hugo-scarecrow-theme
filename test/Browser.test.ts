import { expect } from 'chai';
import { ChildProcess, spawn } from 'child_process';
import { join } from 'path';
import { launch as LaunchChrome, Page as ChromePage } from 'puppeteer';
import { launch as LaunchFirefox, Page as FirefoxPage } from 'puppeteer-firefox';
import * as ResembleJS from 'resemblejs';

interface ScreenResolution {
	width: number;
	height: number;
}

type Resolutions = 'fullhd' | 'desktop' | 'tablet' | 'mobile';
const res: { [_ in Resolutions]: ScreenResolution } = {
	fullhd: { width: 1920, height: 1080 },
	desktop: { width: 768, height: 1024 },
	tablet: { width: 640, height: 690 },
	mobile: { width: 320, height: 480 }
};

async function captureFirefox(url: string, dims: Resolutions, moveTo?: (page: FirefoxPage) => Promise<void>): Promise<string> {
	const path = join(__dirname, `firefox-${url.replace(/\//g, '_')}-${dims}.jpg`);

	const browser = await LaunchFirefox({ defaultViewport: res[dims] });
	const page = await browser.newPage();
	await page.goto(`http://localhost:1313${url}`);

	if (moveTo) {
		await moveTo(page);
	}

	await page.screenshot({ fullPage: true, path: path });
	await browser.close();

	return path;
}

async function captureChrome(url: string, dims: Resolutions, moveTo?: (page: ChromePage) => Promise<void>): Promise<string> {
	const path = join(__dirname, `chrome-${url.replace(/\//g, '_')}-${dims}.jpg`);

	const browser = await LaunchChrome({ defaultViewport: res[dims], args: [ '--no-sandbox', '--disable-setuid-sandbox' ] });
	const page = await browser.newPage();
	await page.goto(`http://localhost:1313${url}`);

	if (moveTo) {
		await moveTo(page);
	}

	await page.screenshot({ fullPage: true, path: path });
	await browser.close();

	return path;
}

function runTest(threshold: number, url: string, dims: Resolutions, moveTo?: (page: ChromePage) => Promise<void>): Mocha.AsyncFunc {
	return async (): Promise<void> => {
		// Arrange
		const ffPath = await captureFirefox(url, dims, moveTo);
		const chPath = await captureChrome(url, dims, moveTo);

		// Act
		const compare = ResembleJS(ffPath)
			.compareTo(chPath)
			.ignoreAntialiasing();

		// Assert
		compare.onComplete(r => {
			const ratio = parseFloat(`${r.misMatchPercentage}`);

			console.log(`expect ${ratio} < ${threshold}`);

			expect(ratio).to.be.below(threshold);
		});
	};
}

describe('Compare <firefox> and <chrome> browser:', () => {
	let server: ChildProcess;

	before(() => {
		server = spawn('npm', ['run', 'serve'], { detached: true });
	});

	after(() => {
		if (server && !server.killed) {
			process.kill(-server.pid);
		}
	});

	describe('The Homepage', () => {
		it('should look the same on `fullhd` resolution', runTest(0.2, '/', 'fullhd')).timeout(0);
		it('should look the same on `desktop` resolution', runTest(0.7, '/', 'desktop')).timeout(0);
		it('should look the same on `tablet` resolution', runTest(1.1, '/', 'tablet')).timeout(0);
		it('should look the same on `mobile` resolution', runTest(1.4, '/', 'mobile')).timeout(0);
	});

	describe('The Homepage with Searchbox', () => {
		const searchSelector = '.widget-search input[type=\'search\']';
		const selectSearchBox = async (page: ChromePage) => {
			await page.type(searchSelector, 'test');
			await page.waitFor(1000);
		};

		it('should look the same on `fullhd` resolution', runTest(0.2, '/#search', 'fullhd', selectSearchBox)).timeout(0);
		it('should look the same on `desktop` resolution', runTest(0.7, '/#search', 'desktop', selectSearchBox)).timeout(0);
		it('should look the same on `tablet` resolution', runTest(1.1, '/#search', 'tablet', selectSearchBox)).timeout(0);
		it('should look the same on `mobile` resolution', runTest(1.9, '/#search', 'mobile', async (page: ChromePage) => {
			await page.click('.navbar-burger');
			await page.waitForSelector(searchSelector);
			await selectSearchBox(page);
		})).timeout(0);

	});

	describe('The Singlepage', () => {
		it('should look the same on `fullhd` resolution', runTest(0.2, '/posts/hello-world', 'fullhd')).timeout(0);
		it('should look the same on `desktop` resolution', runTest(0.7, '/posts/hello-world', 'desktop')).timeout(0);
		it('should look the same on `tablet` resolution', runTest(1.2, '/posts/hello-world', 'tablet')).timeout(0);
		it('should look the same on `mobile` resolution', runTest(1.8, '/posts/hello-world', 'mobile')).timeout(0);
	});

});
