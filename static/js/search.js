'use strict';


function httpGetAsync(theUrl, callback)
{
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() {
	if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
		callback(xmlHttp.responseText);
	}
	xmlHttp.open("GET", theUrl, true); // true for asynchronous
	xmlHttp.send(null);
}

var _pages, _index;
function createIndex(callback) {
	if (_index !== undefined) {
		callback(_index);
	} else {
		httpGetAsync("/search/index.json", function(data) {
			_pages = JSON.parse(data);
			_index = lunr(function() {
				var self = this;
				self.ref("uri");
				self.field("title", { boost: 10 });
				self.field("tags", { boost: 5 });
				self.field("content");
				_pages.forEach(function(page) { self.add(page); });
			});

			callback(_index);
		});
	}
}

function createResultList(container) {
	var list = container.getElementsByClassName("results")[0];

	if (list === undefined) {
		var list = document.createElement("ul");
		list.className = "results";
		container.appendChild(list);
	}

	if (list.className.indexOf("active") < 0) {
		list.className += " active";
	}

	list.innerHTML = "";
	return list;
}

function hideResultList(container) {
	var list = container.getElementsByClassName("results")[0];

	if (list !== undefined) {
		list.className = list.className.replace(' active', '');
		list.innerHTML = "";
	}
}

function addResultItem(list, item) {
	var li = document.createElement("li");
	list.appendChild(li);

	if (item.url) {
		var a = document.createElement("a");
		a.className = "item";
		li.appendChild(a);

		a.href = item.url;
		a.text = item.text;
	} else {
		var span = document.createElement("span");
		span.className = "item";
		li.appendChild(span);

		span.innerHTML = item.text;
	}
}

function search(index, query) {
	return index.search(query).map(function(result) {
		return _pages.filter(function(page) {
			return page.uri == result.ref;
		})[0];
	});
}

document.addEventListener("DOMContentLoaded", function() {
	var container = document.getElementById("search");
	var input = container.children[0];

	input.addEventListener("keyup", function(evt) {
		createIndex(function(index) {
			var results = search(index, evt.target.value);

			var list = createResultList(container);
			if (results.length > 0) {
				for (var i = 0; i < results.length; i++) {
					addResultItem(list, { text: results[i].title, url: results[i].uri });
				}
			} else {
				addResultItem(list, { text: "no results" });
			}
		});
	});

	input.addEventListener("blur", function() {
		setTimeout(function() { hideResultList(container); }, 1500);
	});
});
