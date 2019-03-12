import { expect } from 'chai';
import { ChildProcess, exec } from 'child_process';
import { join } from 'path';
import { launch as LaunchChrome } from 'puppeteer';
import { launch as LaunchFirefox } from 'puppeteer-firefox';
import * as ResembleJS from 'resemblejs';

async function captureFirefox(url: string, dims: { w: number, h: number }): Promise<string> {
	const path = join(__dirname, `capture-test-firefox-${dims.w}.jpg`);

	const browser = await LaunchFirefox({ defaultViewport: { width: dims.w, height: dims.h } });
	const page = await browser.newPage();
	await page.goto(url);
	await page.screenshot({ fullPage: true, path: path });

	await page.close();
	await browser.close();

	return path;
}

async function captureChrome(url: string, dims: { w: number, h: number }): Promise<string> {
	const path = join(__dirname, `capture-test-chrome-${dims.w}.jpg`);

	const browser = await LaunchChrome({ defaultViewport: { width: dims.w, height: dims.h } });
	const page = await browser.newPage();
	await page.goto(url);
	await page.screenshot({ fullPage: true, path: path });

	await page.close();
	await browser.close();

	return path;
}

function runTest(dims: { w: number, h: number }): Mocha.Func {
	return async (done: Mocha.Done) => {
		try {
			// Arrange
			const url = 'http://localhost:1313/';
			const ffPath = await captureFirefox(url, dims);
			const chPath = await captureChrome(url, dims);

			// Act
			const compare = ResembleJS(ffPath)
				.compareTo(chPath)
				.ignoreNothing();

			// Assert
			compare.onComplete(r => {
				expect(r.misMatchPercentage).to.eql(0);
				done();
			});
		} catch(e) {
			done(e);
		}
	};
}

describe('The homepage', () => {
	let server: ChildProcess;

	beforeEach(async () => {
		server = await exec('npm run serve');
		server.on('message', console.log);
	});

	afterEach(async () => {
		if (server) {
			await server.kill();
		}
	});

	it('should look the same with <firefox> and <chrome> on `fullhd` resolution', runTest({ w: 1920, h: 1080 })).timeout(0);
	it('should look the same with <firefox> and <chrome> on `desktop` resolution', runTest({ w: 768, h: 1024 })).timeout(0);
	it('should look the same with <firefox> and <chrome> on `tablet` resolution', runTest({ w: 640, h: 690 })).timeout(0);
	it('should look the same with <firefox> and <chrome> on `mobile` resolution', runTest({ w: 320, h: 480 })).timeout(0);

});
