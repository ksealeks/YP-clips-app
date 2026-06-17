const clips = window.YANGO_CLIPS || [];
const feed = document.querySelector("#feed");
const template = document.querySelector("#clipTemplate");
const soundHint = document.querySelector("#soundHint");
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const storeUrl = isIOS
  ? "https://apps.apple.com/us/app/yango-play/id6468647440"
  : "https://play.google.com/store/apps/details?id=com.yango.saft";

let activeClip = null;
let soundEnabled = false;
let rendered = 0;
const BATCH_SIZE = 8;

function track(event, data = {}) {
  window.dispatchEvent(new CustomEvent("yp:analytics", { detail: { event, ...data } }));
}

function createClip(clip, index) {
  const node = template.content.firstElementChild.cloneNode(true);
  const video = node.querySelector("video");
  node.dataset.index = index;
  node.dataset.clipId = clip.id;
  node.style.setProperty("--glow", clip.color);
  node.querySelector(".clip-title").textContent = clip.title;
  node.querySelector(".clip-meta").textContent = clip.meta;
  const cta = node.querySelector(".cta");
  cta.href = storeUrl;
  cta.addEventListener("click", () => track("cta_click", { clipId: clip.id, index }));
  video.dataset.src = clip.src;

  const togglePlayback = () => {
    if (video.paused) {
      video.play().catch(() => node.classList.add("paused"));
    } else {
      video.pause();
    }
  };
  video.addEventListener("click", () => {
    if (!soundEnabled) {
      soundEnabled = true;
      video.muted = false;
      soundHint.classList.add("hidden");
      track("sound_enabled", { clipId: clip.id });
      return;
    }
    togglePlayback();
  });
  node.querySelector(".play-toggle").addEventListener("click", togglePlayback);
  video.addEventListener("play", () => node.classList.remove("paused"));
  video.addEventListener("pause", () => activeClip === node && node.classList.add("paused"));
  let completionTracked = false;
  video.addEventListener("timeupdate", () => {
    const ratio = video.duration ? (video.currentTime / video.duration) * 100 : 0;
    node.querySelector(".progress span").style.width = `${ratio}%`;
    if (ratio >= 95 && !completionTracked) {
      completionTracked = true;
      track("video_complete", { clipId: clip.id, index });
    } else if (ratio < 5) {
      completionTracked = false;
    }
  });
  return node;
}

function appendBatch() {
  const fragment = document.createDocumentFragment();
  const end = rendered + BATCH_SIZE;
  for (; rendered < end; rendered += 1) {
    fragment.append(createClip(clips[rendered % clips.length], rendered));
  }
  feed.append(fragment);
}

function loadVideo(node, priority = "metadata") {
  const video = node?.querySelector("video");
  if (!video || video.src) return;
  video.preload = priority;
  video.src = video.dataset.src;
  video.load();
}

const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    const node = entry.target;
    const video = node.querySelector("video");
    if (entry.isIntersecting && entry.intersectionRatio >= .7) {
      if (activeClip && activeClip !== node) activeClip.querySelector("video").pause();
      activeClip = node;
      loadVideo(node, "auto");
      video.muted = !soundEnabled;
      video.play().catch(() => node.classList.add("paused"));
      const index = Number(node.dataset.index);
      loadVideo(feed.children[index + 1], "auto");
      loadVideo(feed.children[index - 1], "metadata");
      track("video_view", { clipId: node.dataset.clipId, index });
      if (index >= rendered - 3) {
        const before = rendered;
        appendBatch();
        [...feed.children].slice(before).forEach((child) => observer.observe(child));
      }
    } else if (activeClip !== node) {
      video.pause();
    }
  }
}, { root: feed, threshold: [0, .7, 1] });

appendBatch();
[...feed.children].forEach((child) => observer.observe(child));
track("session_start", { clipCount: clips.length });

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}
