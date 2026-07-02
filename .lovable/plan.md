## Change app icon to uploaded Zygo logo

1. Copy `user-uploads://Zygo_Icon.png` to `public/zygo-icon.png` (overwrite existing) — this is the file already referenced by `index.html` favicon, apple-touch-icon, and `manifest.webmanifest`.
2. No code changes needed since all references already point to `/zygo-icon.png`.
3. Verify by reloading preview.