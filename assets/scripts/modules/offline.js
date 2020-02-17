((offline) => {
	if (!offline) {
		$('.offline', p => p.hide());
		return;
	}

	const showHide = (node, inverse) => offline.isCachedAsync(location.href).then(result => {
		if ((!inverse && result) || (inverse && !result)) {
			node.hide();
		} else {
			node.show();
		}
	});

	$('.is-hidden-if-cached', p => showHide(p, false));
	$('.is-shown-if-cached', p => showHide(p, true));

	$('#offline-data', p => {
		offline.getAllStoredPermalinksAsync().then(permalinks => permalinks.forEach(permalink => {
			p.createChild('li', li => {
				li.createChild('a', a => {
					a.text(permalink);
					a.on('click', () => {
						offline.deleteAsync(permalink).then(() => {
							location.reload();
						})
					});
				})
			});
		}));
	});

	$('[data-offline="add"]', p => p.on('click', () => {
		offline.registerAsync().then(() => {
			return offline.addAsync(location.href).then(() => {
				location.reload();
			});
		});
	}));

	$('[data-offline="revoke"]', p => p.on('click', () => {
		offline.deleteAllAsync().then(() => {
			return offline.unregisterAsync().then(() => {
				location.reload();
			})
		});
	}));
})(window.offline);
