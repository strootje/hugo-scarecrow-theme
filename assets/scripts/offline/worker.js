{{- $assets := partial "_params/site/assets" . -}}

self.addEventListener('install', e => {
	e.waitUntill(caches.open('scarecrow').then(cache => cache.addAll([
		'/',
		'/index.html',
		'test'
	])));
});
