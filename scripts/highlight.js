(function() {
	let insertAfter = (newNode, referenceNode) => {
		referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
	};

	// Elem is this element: https://imgur.com/a/P6M10.
	class Elem {
		constructor(visitTimestamps) {
			// make the main element
			let e = document.createElement("div");
			e.classList.add("rounded", "gold-accent", "comment-visits-box");
			e.innerHTML = `
			<div class="title">
				Highlight comments posted since previous visit:
				<select id="comment-visits">
				</select>
			</div>`;

			// add options
			let s = e.querySelector("#comment-visits");
			let timeago = window.timeago();
			for (let i = visitTimestamps.length - 1; i >= 0; i--) {
			  let ts = visitTimestamps[i];
				let opt = document.createElement("option");
				opt.value = ts;
				opt.textContent = timeago.format(ts);
				s.appendChild(opt);
			}

			// add the no highlight option
			let no = document.createElement("option");
			no.value = "";
			no.textContent = "no highlighting";
			s.appendChild(no);

			// select the first option
			s.firstChild.selected = "selected";

			this.e = e;
			this.s = s;
		}

		elem() {
			return this.e;
		}

		sel() {
			return this.s;
		}

		value() {
			return this.sel().value;
		}

		onChange(cb) {
			this.sel().addEventListener("change", cb);
		}
	}

	let forEachComment = (cb) => {
		let comments = document.querySelectorAll(".comment");
		for (let i = 0; i < comments.length; i++) {
			cb(comments[i]);
		}
	};

	let clear = () => {
		forEachComment(c => {
			c.classList.remove("new-comment");
		});
	};

	// Highlights comments after the given timestamp.
	let highlight = (timestamp) => {
		forEachComment(c => {
			let t = c.querySelector(".entry .tagline time:first-of-type");
			if (!t) {
				return;
			}
			let commentTimestamp = new Date(t.getAttribute("datetime")).getTime();
			c.classList.toggle("new-comment", commentTimestamp > timestamp);
		});
	};

	let run = (visits) => {
		let target = document.querySelector("div.content > .commentarea > form.usertext");
		if (!target) {
			console.log("failed to find comment box to add highlight selector");
			return;
		}

		if (!visits[window.location] ||
			visits[window.location].length == 0 /* this shouldn't be possible the way the code is written */) {
			// no previous visit
			return;
		}

		let e = new Elem(visits[window.location]);
		insertAfter(e.elem(), target);

		e.onChange(() => {
			if (e.value() == "") {
				// no highlight.
				clear();
				return;
			}

			let ts;
			try {
				ts = parseInt(e.value(), 10);
			} catch(ex) {
				console.log("failed to parse value '%s' as int: %s", e.value(), ex);
				return;
			}

			highlight(ts);
		});
	};

	let set = () => {
		let now = Date.now();

		chrome.storage.local.get({
			visits: {},
		}, function(o) {
			if (chrome.runtime.lastError) {
				console.log("failed to get visits: " + chrome.runtime.lastError);
				return;
			}

			let v = o.visits;
			if (v[window.location]) {
				v[window.location].push(now);
			} else {
				v[window.location] = [now];
			}

			chrome.storage.local.set({
				visits: v
			}, function() {
				if (chrome.runtime.lastError) {
					console.log("failed to set visits: " + chrome.runtime.lastError);
				}
			});
		});
	};

	let main = () => {
		// already exists? maybe the account has reddit gold.
		if (document.querySelector("#comment-visits")) {
			// set();
			// return;
		}

		chrome.storage.local.get({
			visits: {} // {[url: string]: number[]}
		}, function(o) {
			set();
			if (chrome.runtime.lastError) {
				console.log("failed to get visits: " + chrome.runtime.lastError);
				return;
			}
			run(o.visits);
		});
	};

	main();
})();

