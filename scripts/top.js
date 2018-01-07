// Injected into the top page by scripts/hightlight.js.
// Needed in order access the jQuery object on the reddit.com window to
// handle the new_things_inserted event.

jQuery(document).on("new_things_inserted", () => {
  handleHighlight();
});
