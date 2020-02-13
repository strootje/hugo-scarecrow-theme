{{- $worker := resources.Get "scripts/offline/worker.js" | resources.ExecuteAsTemplate "worker.js" . -}}

if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('{{- $worker.RelPermalink -}}', { scope: '/' }).then(() => console.log('service-worker :: registered'));
	navigator.serviceWorker.ready.then(() => console.log('service-worker :: ready'));
}
