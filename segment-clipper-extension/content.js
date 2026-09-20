(() => {
  "use strict";

  const YOUTUBE_BUTTON_ID = "segment-clipper-youtube-button";
  const GENERIC_BUTTON_ID = "segment-clipper-generic-trigger";
  const REDIRECT_URL = "https://v38.www-y2mate.com/";
  const isYouTube = /(^|\.)youtube\.com$/i.test(location.hostname);
  const redirectIcon = `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M14 4h6v6"></path>
      <path d="m20 4-9 9"></path>
      <path d="M20 14v5.5H4.5V4H10"></path>
    </svg>`;
  let activeVideo = null;
  let scanQueued = false;

  function videoCandidates() {
    return [...document.querySelectorAll("video")]
      .filter((video) => video.readyState > 0 || video.currentSrc || video.src)
      .sort((a, b) => (b.clientWidth * b.clientHeight) - (a.clientWidth * a.clientHeight));
  }

  function findVideo() {
    if (isYouTube) {
      const youtubeVideo = document.querySelector("#movie_player video.html5-main-video");
      if (youtubeVideo) return youtubeVideo;
    }
    return videoCandidates()[0] || null;
  }

  function copyPageUrl() {
    const link = location.href;
    const copyTarget = document.createElement("textarea");
    copyTarget.value = link;
    copyTarget.setAttribute("readonly", "");
    copyTarget.style.cssText = "position:fixed; opacity:0; pointer-events:none;";
    document.documentElement.append(copyTarget);
    copyTarget.select();

    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch {
      // The asynchronous API is a fallback for browsers that reject execCommand.
      navigator.clipboard?.writeText(link).catch(() => {});
    }
    copyTarget.remove();
    if (!copied) navigator.clipboard?.writeText(link).catch(() => {});
  }

  function copyAndRedirect(event) {
    event?.preventDefault();
    event?.stopPropagation();
    copyPageUrl();
    // This is deliberately a fixed destination; no video data is sent in the URL.
    window.setTimeout(() => window.location.assign(REDIRECT_URL), 80);
  }

  function ensureYoutubeButton() {
    const controls = document.querySelector("#movie_player .ytp-right-controls");
    if (!controls || document.getElementById(YOUTUBE_BUTTON_ID)) return;

    const button = document.createElement("button");
    button.id = YOUTUBE_BUTTON_ID;
    button.className = "ytp-button segment-clipper-youtube-button";
    button.type = "button";
    button.title = "Copy video link and continue";
    button.setAttribute("aria-label", "Copy video link and continue");
    button.innerHTML = redirectIcon;
    button.addEventListener("click", copyAndRedirect);
    controls.insertBefore(button, controls.firstElementChild);
  }

  function ensureGenericButton() {
    let button = document.getElementById(GENERIC_BUTTON_ID);
    if (button) return button;

    button = document.createElement("button");
    button.id = GENERIC_BUTTON_ID;
    button.type = "button";
    button.title = "Copy video link and continue";
    button.setAttribute("aria-label", "Copy video link and continue");
    button.innerHTML = redirectIcon;
    button.addEventListener("click", copyAndRedirect);
    document.documentElement.append(button);
    return button;
  }

  function positionGenericButton() {
    if (isYouTube) return;
    const button = ensureGenericButton();
    const video = activeVideo || findVideo();
    if (!video) {
      button.style.display = "none";
      return;
    }

    activeVideo = video;
    const bounds = video.getBoundingClientRect();
    const visible = bounds.width >= 180 && bounds.height >= 100 && bounds.bottom > 0 && bounds.top < window.innerHeight;
    if (!visible) {
      button.style.display = "none";
      return;
    }

    button.style.left = `${Math.max(8, Math.min(window.innerWidth - 46, bounds.right - 46))}px`;
    button.style.top = `${Math.max(8, Math.min(window.innerHeight - 46, bounds.bottom - 46))}px`;
    button.style.display = "block";
  }

  function scan() {
    activeVideo = findVideo() || activeVideo;
    if (isYouTube) ensureYoutubeButton();
    else positionGenericButton();
  }

  function scheduleScan() {
    if (scanQueued) return;
    scanQueued = true;
    requestAnimationFrame(() => {
      scanQueued = false;
      scan();
    });
  }

  new MutationObserver(scheduleScan).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("resize", scheduleScan, { passive: true });
  window.addEventListener("scroll", scheduleScan, { passive: true, capture: true });
  scheduleScan();
})();
