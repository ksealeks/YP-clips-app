# Yango Play Clips

A dependency-free, mobile-first vertical video feed. Run it with:

```sh
npm run dev
```

## Content workflow

The five source clips in `assets/` have been compressed for mobile playback and written to `assets/optimized/`. The feed reads those lightweight files from `clips.js` and loops them continuously.

For production, upload the optimized files to a CDN that supports byte-range requests and long-lived caching, then replace the relative `src` paths in `clips.js` with the CDN URLs.

## Analytics hook

The app emits `yp:analytics` browser events for `session_start`, `video_view`, `video_complete`, `sound_enabled`, and `cta_click`. Connect these events to the production analytics SDK without changing feed behavior.
