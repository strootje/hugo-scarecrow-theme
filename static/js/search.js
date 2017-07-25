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

function createIndex(callback) {
	httpGetAsync("/search/index.json", function(data) {
		var json = JSON.parse(data);
		callback(lunr(function() {
			var self = this;
			self.ref("uri");
			self.field("title", { boost: 10 });
			self.field("tags", { boost: 5 });
			self.field("content");
			json.forEach(function(page) { self.add(page); });
		}));
	});
}

document.addEventListener("DOMContentLoaded", function() {
	var input = document.getElementById('search');
	var results = document.getElementsByClassName('results')[0];

	createIndex(function (index) {
		input.addEventListener("keyup", function(evt) {
			var res = index.search(evt.target.value);

			results.innerHTML = "";
			if (res.length > 0) {
				for(var i = 0; i < res.length; i++) {
					var html = document.createElement("article");
					html.innerHTML = "<h6><a href='" + res[i].ref + "'>" + res[i].ref + "</a></h6>";
					results.appendChild(html);
				}

				// show search element
				results.className += " active";
			}
		});
	});
});
