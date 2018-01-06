function saveOptions() {
	let h1 = document.querySelector("#highlight-enabled").checked;
	let h3 = document.querySelector("#highlight-accounts").checked;

	chrome.storage.local.set({
		options: {
			highlightEnabled: h1,
			highlightAccounts: h3,
			commentsBySubredditEnabled: c
		}
	}, function() {
		// Update status to let user know options were saved.
		let status = document.querySelector("#status");
		if (chrome.runtime.lastError) {
			status.style.color = "red";
			status.textContent = "Error saving options: " + runtime.lastError;
		} else {
			status.style.color = "#080";
			status.textContent = "Options saved.";
			setTimeout(function() {
				status.textContent = "";
			}, 1500);
		}
	});
}

function defaultOptions() {
	return {
		highlightEnabled: true,
		highlightAccounts: true,
	};
}

function restoreOptions() {
	chrome.storage.local.get({ options: defaultOptions() }, function(o) {
		document.querySelector("#highlight-enabled").checked = o.options.highlightEnabled;
		document.querySelector("#highlight-accounts").checked = o.options.highlightAccounts;
	});
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("#save").addEventListener("click", saveOptions);
