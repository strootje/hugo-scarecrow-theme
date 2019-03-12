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

	it('should look the same with <firefox> and <chrome> on `desktop` resolution', async done => {
		try {
			// Arrange
			const ffPath = await captureFirefox('http://0.0.0.0:1313/', { w: 1920, h: 1080 });
			const chPath = await captureChrome('http://0.0.0.0:1313/', { w: 1920, h: 1080 });

			// Act
			const compare = ResembleJS(ffPath)
				.compareTo(chPath)
				.ignoreNothing();

			// Assert
			compare.onComplete(r => {
				console.log(r);
				expect(r.misMatchPercentage).to.eql(0);
				done();
			});
		} catch(e) {
			done(e);
		}
	}).timeout(0);

	it('should look the same on chrome', () => {
		// Arrange

		// Act

		// Assert
	});

});
