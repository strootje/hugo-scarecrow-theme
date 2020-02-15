{{- $worker := resources.Get "scripts/offline/worker.js" | resources.ExecuteAsTemplate "worker.js" . -}}

if ('serviceWorker' in navigator) {
	var scope = '/';

	navigator.serviceWorker.getRegistration(scope).then(registration => {
		if (!registration) {
			if (confirm('install offline')) {
				return navigator.serviceWorker.register('{{- $worker.RelPermalink -}}', { scope: scope });
			} else {
				return;
			}
		}

		return registration.update();
	});
}
