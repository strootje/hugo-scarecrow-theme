declare module 'puppeteer-firefox' {
	import { Browser, LaunchOptions } from 'puppeteer';
	export { Browser, Page } from 'puppeteer';
	export function launch(options: LaunchOptions): Promise<Browser>;
}
