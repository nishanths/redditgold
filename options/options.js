function saveOptions() {
	let h = document.querySelector("#highlight-enabled").checked;

	chrome.storage.local.set({
		options: {
			highlightEnabled: h,
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

function restoreOptions() {
	chrome.storage.local.get({ options: defaultOptions() }, function(o) {
		document.querySelector("#highlight-enabled").checked = o.options.highlightEnabled;
	});
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("#save").addEventListener("click", saveOptions);
