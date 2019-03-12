declare module 'puppeteer-firefox' {
	import { Browser, BrowserOptions } from 'puppeteer';

	export function launch(options: BrowserOptions): Browser;
}
