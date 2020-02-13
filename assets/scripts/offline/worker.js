{{- $assets := partialCached "_params/site/assets" . -}}
{{- $pages := where .Site.Pages ".Params.offline" true -}}

// based on https://gohugohq.com/howto/go-offline-with-service-worker/

const CACHE_VERSION = 1;
const CACHE_VERSIONS = {
	Assets: `assets-v${CACHE_VERSION}`,
	Content: `content-v${CACHE_VERSION}`,
	Offline: `offline-v${CACHE_VERSION}`,
	NotFound: `not-found-v${CACHE_VERSION}`
};

const CACHE_FILES = {
	Assets: [
		// '/favicon.png',
		'/manifest.json'
		{{- range $assets.Styles -}},'{{- .RelPermalink | default .Permalink -}}'{{- end -}}
		{{- range $assets.Scripts -}},'{{- .RelPermalink | default .Permalink -}}'{{- end -}}
		{{- range .Site.Params.Offline.Assets -}},'{{- . -}}'{{- end -}}
	],

	Content: [
		'{{- .Site.Home.RelPermalink -}}index.html'
		{{- range $pages -}},'{{- .RelPermalink -}}index.html'{{- end -}}
	],

	Offline: [
	],

	NotFound: [
	]
};

self.addEventListener('install', e => {
	e.waitUntil(Promise.all([
		caches.open(CACHE_VERSIONS.Assets).then(cache => cache.addAll(CACHE_FILES.Assets)),
		caches.open(CACHE_VERSIONS.Content).then(cache => cache.addAll(CACHE_FILES.Content))
	]).catch(() => e.skipWaiting()));
});

self.addEventListener('activate', e => {
	e.waitUntil(Promise.all([
		caches.keys()
			.then(keys => keys.filter(key => !~Object.values(CACHE_VERSIONS).indexOf(key)))
			.then(keys => Promise.all(keys.map(key => caches.delete(key))))
	]).catch(() => e.skipWaiting()));
});

self.addEventListener('fetch', e => {
	e.respondWith(caches.match(e.request).then(resp => {
		if (!resp) {
			console.log(`fetching\t:: '${e.request.url}'`);
			return fetch(e.request);
		}

		console.log(`found\t\t:: '${e.request.url}'`);
		return resp;// || fetch(e.request);
	}));

	// e.respondWith(caches.open(CACHE_VERSIONS.Content).then(cache => {
	// 	return cache.match(e.request).then(resp => resp || fetch(e.request));
	// }));
});
