function saveOptions() {
  let hEnabled = document.querySelector("#highlight .enabled").checked;
  let hCustomBackgroundColor = document.querySelector("#highlight .custom-background-color").value;
  let hCustomBorder = document.querySelector("#highlight .custom-border").value;

  chrome.storage.local.set({
    options: {
      highlight: {
        enabled: hEnabled,
        customBackgroundColor: hCustomBackgroundColor,
        customBorder: hCustomBorder,
      }
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
    document.querySelector("#highlight .enabled").checked = o.options.highlight.enabled;
    document.querySelector("#highlight .custom-background-color").value = o.options.highlight.customBackgroundColor;
    document.querySelector("#highlight .custom-border").value = o.options.highlight.customBorder;
  });
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("#save").addEventListener("click", saveOptions);
