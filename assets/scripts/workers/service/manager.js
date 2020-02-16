{{- $worker := resources.Get "scripts/workers/service/worker.js" | resources.ExecuteAsTemplate "worker.js" . -}}

if ('serviceWorker' in navigator) {
	((namespace) => {

		const scope = '/';
		const GetRegistration = (scope, callback) => navigator.serviceWorker.getRegistration(scope).then(callback);

		namespace.isCachedAsync = (permalink) => GetRegistration(scope, registration => {
			if (!!registration) {
				return caches.open('content-v1').then(cache => cache.match(permalink).then(resp => resp && resp.ok));
			}

			return Promise.resolve(false);
		});

		namespace.registerAsync = () => GetRegistration(scope, registration => {
			if (!registration) {
				return navigator.serviceWorker.register('{{- $worker.RelPermalink -}}', { scope });
			}

			return registration.update();
		});

		namespace.unregisterAsync = () => GetRegistration(scope, registration => {
			if (!!registration) {
				return registration.unregister();
			}

			return Promise.resolve();
		});

		namespace.addAsync = (permalink) => GetRegistration(scope, registration => {
			if (!!registration) {
				return caches.open('content-v1').then(cache => cache.add(permalink));
			}

			return Promise.resolve();
		});

		namespace.deleteAsync = (permalink) => GetRegistration(scope, registration => {
			if (!!registration) {
				return caches.open('content-v1').then(cache => cache.delete(permalink));
			}

			return Promise.resolve();
		});

		namespace.getAllStoredPermalinksAsync = () => {
			return caches.open('content-v1').then(cache => cache.keys().then(keys => keys.map(p => p.url)));
		};

		namespace.deleteAllAsync = () => {
			return caches.keys().then(keys => keys.map(key => caches.delete(key)));
		};

		window.offline = namespace;

	})(window.offline || {});
}
