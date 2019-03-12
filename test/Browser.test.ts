import { expect } from 'chai';
import { ChildProcess, exec } from 'child_process';
import { join } from 'path';
import { launch as LaunchChrome } from 'puppeteer';
import { launch as LaunchFirefox } from 'puppeteer-firefox';
import * as ResembleJS from 'resemblejs';

async function captureFirefox(url: string, dimension: { w: number, h: number }): Promise<string> {
	const path = join(`capture-test-firefox-${dimension.w}.jpg`);

	const browser = await LaunchFirefox({ headless: true, defaultViewport: { width: dimension.w, height: dimension.h } });
	const page = await browser.newPage();
	await page.goto(url);
	await page.screenshot({ fullPage: true, path: path });

	return path;
}

async function captureChrome(url: string, dimension: { w: number, h: number }): Promise<string> {
	const path = join(`capture-test-chrome-${dimension.w}.jpg`);

	const browser = await LaunchChrome({ headless: true, defaultViewport: { width: dimension.w, height: dimension.h } });
	const page = await browser.newPage();
	await page.goto(url);
	await page.screenshot({ fullPage: true, path: path });

	return path;
}

describe('The homepage', () => {
	let server: ChildProcess;

	beforeEach(async () => {
		this.timeout(0);
		server = await exec('npm run serve');
	})

	afterEach(async () => {
		await server.kill();
	})

	it('should look the same with <firefox> and <chrome> on `desktop` resolution', async done => {
		this.timeout(0);
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
	});

	it('should look the same on chrome', () => {
		// Arrange

		// Act

		// Assert
	});

});
