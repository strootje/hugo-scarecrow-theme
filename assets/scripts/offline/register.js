{{- $worker := resources.Get "scripts/offline/worker.js" | resources.ExecuteAsTemplate "scripts/offline/worker.js" . -}}

if ('serviceWorker' in navigator) {
	console.log('service-workers are supported');
} else {
	console.log('dammit..', navigator);
}
