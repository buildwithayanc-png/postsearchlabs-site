/*
  VIDEO SETUP
  Paste each page's video link between the quotes.
  Works with: YouTube embed links (https://www.youtube.com/embed/VIDEO_ID),
  Vimeo (https://player.vimeo.com/video/ID), Loom (https://www.loom.com/embed/ID)
  or a direct .mp4 file link.
*/
var VIDEOS = {
  home: "",
  local: "",
  startups: ""
};

(function () {
  var boxes = document.querySelectorAll("[data-video]");
  Array.prototype.forEach.call(boxes, function (box) {
    var btn = box.querySelector(".video__play");
    var note = box.querySelector(".video__note");
    var poster = box.querySelector(".video__poster");
    if (!btn || !poster) return;

    btn.addEventListener("click", function () {
      var src = (VIDEOS[box.getAttribute("data-video")] || "").trim();
      if (!src) {
        if (note) note.hidden = false;
        return;
      }
      var el;
      if (/\.(mp4|webm|mov)(\?|#|$)/i.test(src)) {
        el = document.createElement("video");
        el.src = src;
        el.controls = true;
        el.autoplay = true;
        el.playsInline = true;
      } else {
        el = document.createElement("iframe");
        el.src = src + (src.indexOf("?") > -1 ? "&" : "?") + "autoplay=1";
        el.title = "PostSearchLabs video";
        el.setAttribute("allow", "autoplay; fullscreen; picture-in-picture");
        el.setAttribute("allowfullscreen", "");
      }
      poster.replaceWith(el);
    });
  });
})();
