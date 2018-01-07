(function() {
  let insertAfter = (newNode, referenceNode) => {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  };

  let visitsKey = (loc) => {
    return loc.pathname;
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
      e.title = "redditgold extension"; // to be able to tell the difference

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

    onChange(cb) {
      this.sel().addEventListener("change", cb);
    }
  }

  // see reddit's initNewCommentHighlighting function
  let run = (visits) => {
    let target = document.querySelector("div.content > .commentarea > form.usertext") || // signed in
      document.querySelector("section.commentsignupbar"); // signed out
    if (!target) {
      console.log("failed to find comment box to add highlight selector");
      return;
    }

    if (!visits[visitsKey(window.location)] ||
      visits[visitsKey(window.location)].length == 0 /* this shouldn't be possible the way the code is written */) {
      // no previous visit
      return;
    }

    let e = new Elem(visits[visitsKey(window.location)]);
    insertAfter(e.elem(), target);

    e.onChange(() => {
      handleHighlight();
    });

    handleHighlight(); // initial
  };

  let updateVisits = () => {
    let now = Date.now();

    chrome.storage.local.get({
      visits: {},
      options: defaultOptions()
    }, function(o) {
      if (chrome.runtime.lastError) {
        console.log("failed to get visits: " + chrome.runtime.lastError);
        return;
      }

      let v = o.visits;
      if (v[visitsKey(window.location)]) {
        v[visitsKey(window.location)].push(now);
      } else {
        v[visitsKey(window.location)] = [now];
      }

      chrome.storage.local.set({
        visits: v,
        options: o.options
      }, function() {
        if (chrome.runtime.lastError) {
          console.log("failed to set visits: " + chrome.runtime.lastError);
        }
      });
    });
  };

  let maybeAddStyles = (h) => {
    if (h.customBackgroundColor != "") {
      let s = document.createElement("style");
      s.textContent = `.new-comment .usertext-body { background-color: ${h.customBackgroundColor} !important; }`;
      document.head.appendChild(s);
    }
    if (h.customBorder != "") {
      let s = document.createElement("style");
      s.textContent = `.new-comment .usertext-body { border: ${h.customBorder} !important; }`;
      document.head.appendChild(s);
    }
  };

  // https://gist.github.com/nok/a98c7c5ce0d0803b42da50c4b901ef84
  let injectScript = (path, tag) => {
    let node = document.getElementsByTagName(tag)[0];
    let script = document.createElement("script");
    script.setAttribute("type", "text/javascript");
    script.setAttribute("src", path);
    node.appendChild(script);
  };

  let main = () => {
    if (document.querySelector("body.gold")) {
      // account has reddit gold.
      // don't add the element. also, we don't save visit history either
      // because we don't know at this point if comment highlight is enabled
      // in the user's options.
      return;
    }

    injectScript(chrome.extension.getURL("shared/highlight.js"), "body");
    injectScript(chrome.extension.getURL("scripts/top.js"), "body");

    chrome.storage.local.get({
      visits: {}, // {[url: string]: number[]}
      options: defaultOptions()
    }, function(o) {
      if (!o.options.highlight.enabled) {
        return;
      }
      updateVisits(); // update after getting to ensure that the current visit isn't included
      maybeAddStyles(o.options.highlight);
      if (chrome.runtime.lastError) {
        console.log("failed to get visits: " + chrome.runtime.lastError);
        return;
      }
      run(o.visits);
    });
  };

  main();
})();

