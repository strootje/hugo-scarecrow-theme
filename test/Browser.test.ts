import { expect } from 'chai';
import { ChildProcess, spawn } from 'child_process';
import { join } from 'path';
import { launch as LaunchChrome } from 'puppeteer';
import { launch as LaunchFirefox } from 'puppeteer-firefox';
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

async function captureFirefox(url: string, dims: Resolutions): Promise<string> {
	const path = join(__dirname, `firefox-${url.replace(/\//g, '_')}-${dims}.jpg`);

	const browser = await LaunchFirefox({ defaultViewport: res[dims] });
	const page = await browser.newPage();
	await page.goto(`http://localhost:1313${url}`);
	await page.screenshot({ fullPage: true, path: path });

	await browser.close();

	return path;
}

async function captureChrome(url: string, dims: Resolutions): Promise<string> {
	const path = join(__dirname, `chrome-${url.replace(/\//g, '_')}-${dims}.jpg`);

	const browser = await LaunchChrome({ defaultViewport: res[dims], args: [ '--no-sandbox', '--disable-setuid-sandbox' ] });
	const page = await browser.newPage();
	await page.goto(`http://localhost:1313${url}`);
	await page.screenshot({ fullPage: true, path: path });

	await browser.close();

	return path;
}

function runTest(threshold: number, url: string, dims: Resolutions): Mocha.AsyncFunc {
	return async (): Promise<void> => {
		// Arrange
		const ffPath = await captureFirefox(url, dims);
		const chPath = await captureChrome(url, dims);

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
		it('should look the same on `fullhd` resolution', runTest(0.1, '/', 'fullhd')).timeout(0);
		it('should look the same on `desktop` resolution', runTest(0.4, '/', 'desktop')).timeout(0);
		it('should look the same on `tablet` resolution', runTest(0.6, '/', 'tablet')).timeout(0);
		it('should look the same on `mobile` resolution', runTest(0.9, '/', 'mobile')).timeout(0);
	});

	describe('The Singlepage', () => {
		it('should look the same on `fullhd` resolution', runTest(0.2, '/posts/hello-world', 'fullhd')).timeout(0);
		it('should look the same on `desktop` resolution', runTest(0.4, '/posts/hello-world', 'desktop')).timeout(0);
		it('should look the same on `tablet` resolution', runTest(0.7, '/posts/hello-world', 'tablet')).timeout(0);
		it('should look the same on `mobile` resolution', runTest(1.1, '/posts/hello-world', 'mobile')).timeout(0);
	});

});
