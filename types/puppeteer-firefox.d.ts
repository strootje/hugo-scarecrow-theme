declare module 'puppeteer-firefox' {
	import { Browser, LaunchOptions } from 'puppeteer';

	export function launch(options: LaunchOptions): Browser;
}
