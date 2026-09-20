# Video Link Redirect — Chrome/Edge extension

This extension adds a small external-link button to a video player.

- On YouTube, it appears in the player’s bottom-right control row beside the settings-control group.
- On other HTTPS pages with an HTML5 video, it appears at the video’s bottom-right corner.

Clicking the button copies the current video-page address to the clipboard and then redirects the current tab to `https://v38.www-y2mate.com/`.

## Install

1. In Chrome or Edge, open the extensions page.
2. Enable **Developer mode**.
3. Select **Load unpacked**.
4. Choose this `segment-clipper-extension` folder.
5. Reload any already-open video page.

The extension requests clipboard-write permission only. It has no local helper, background service, upload logic, or download implementation.
