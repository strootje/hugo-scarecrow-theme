(() => {
	'use strict';

	const Lambda = window.Lambda = window.$ = (query, callback) => domready(() => callback(Builder([...document.querySelectorAll(query)])));
	Lambda.delay = (timeout, callback) => setTimeout(callback, timeout);
	Lambda.json = (url, callback) => fetch(url).then(resp => resp.json().then(json => callback(json)));

	const Builder = function (nodes) {
		const proto = {};
		Object.setPrototypeOf(proto, Object.getPrototypeOf(nodes));
		Object.setPrototypeOf(nodes, proto);

		const first = callback => callback(nodes[0]);
		const each = callback => nodes.map(node => callback(node) || node);
		const reduce = callback => [...nodes].reduce((prev, cur) => [...prev, ...callback(cur)], []);

		proto.find = (query) => Builder(reduce(node => node.querySelectorAll(query)));
		proto.parent = (query) => Builder(reduce(node => query ? ([...document.querySelectorAll(query)].filter(parent => parent.contains(node))) : [node.parentNode]));
		proto.createChild = (name) => Builder(reduce(node => [createChild(node, name)]));
		proto.delete = () => Builder(each(node => node.parentNode.removeChild(node)));

		proto.addClass = (name) => Builder(each(node => node.classList.add(name)));
		proto.removeClass = (name) => Builder(each(node => node.classList.remove(name)));
		proto.attr = (name) => first(node => node.attributes[name].value);
		proto.addAttr = (name, value) => Builder(each(node => node.setAttribute(name, value)));
		proto.removeAttr = (name) => Builder(each(node => node.removeAttribute(name)));
		proto.value = (value) => Builder(each(node => node.value = value));
		proto.text = (value) => Builder(each(node => node.innerHTML = value));

		proto.on = (event, callback) => Builder(each(node => node.addEventListener(event, args => callback(Builder([node]), args))));
		proto.throttle = (event, milisec, callback) => Builder(each(node => throttle(node, event, milisec, callback)));
		proto.emit = (event, args) => Builder(each(node => node.dispatchEvent(new Event(event, args))));

		const createChild = (node, name) => {
			const child = document.createElement(name);
			node.appendChild(child);
			return child;
		};

		const throttle = (node, event, milisec, callback) => {
			let timer;

			node.addEventListener(event, args => {
				if (timer) { clearTimeout(timer); }
				timer = setTimeout(() => callback(Builder([node]), args), milisec);
			});
		};

		return nodes;
	}
})();
