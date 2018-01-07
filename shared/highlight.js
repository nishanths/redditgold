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

let selectedTimestamp = () => {
  return document.querySelector("#comment-visits").value;
};

let handleHighlight = () => {
  let val = selectedTimestamp();
  if (val == "") {
    // no highlight.
    clear();
    return;
  }

  let ts;
  try {
    ts = parseInt(val, 10);
  } catch (ex) {
    console.log("failed to parse value '%s' as int: %s", val, ex);
    return;
  }
  highlight(ts);
}

