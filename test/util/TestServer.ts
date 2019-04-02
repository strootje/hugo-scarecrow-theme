import { createServer, Server } from 'http';
import * as handler from 'serve-handler';
import { join } from 'path';

export default class TestServer {
	private readonly server: Server;

	constructor() {
		this.server = createServer((req, res) => {
			const path = join(__dirname, '..', '..', 'exampleSite', 'public');

			return handler(req, res, {
				public: path,
				directoryListing: [
					"/scripts/*",
					"/styles/*"
				]
			});
		});
	}

	listen(): Promise<void> {
		return new Promise((resolve) => {
			this.server.listen(1313, resolve);
		})
	}

	close(): Promise<void> {
		return new Promise((resolve, reject) => this.server.close(err => {
			if (err) reject(err);
			resolve();
		}));
	}
}
