MEDIA CONVERT — REDESIGNED STARTER
==================================

Replace the files in your existing GitHub repository with these five files:
- index.html
- style.css
- main.js
- package.json
- README.txt

IPHONE REPLACEMENT STEPS
1. Download this ZIP and open the Files app > Downloads.
2. Tap media-convert-redesign.zip once to extract it.
3. Open the extracted media-convert-redesign folder.
4. Open your GitHub repository (media-convert).
5. Tap Add file > Upload files.
6. Select the five files listed above from the extracted folder. Upload the individual files, NOT the ZIP.
7. Scroll down and tap Commit changes. If GitHub asks whether to replace existing files, confirm.
8. Cloudflare Pages should automatically rebuild after the GitHub commit.
9. Wait for the deployment to succeed, then refresh https://media-convert.pages.dev.

CLOUDFLARE BUILD SETTINGS
Framework preset: None
Build command: npm run build
Build output directory: dist
Root directory: leave blank

ABOUT THIS VERSION
- Graphite-grey, mobile-first redesign.
- Browser-side FFmpeg.wasm conversion for MP3, WAV and MP4.
- Files are processed locally in the browser; they are not uploaded to our server.
- First conversion downloads the FFmpeg engine from jsDelivr and may take a while.
- Test with a small file under 20 MB first on iPhone. Larger files may be slow or exceed mobile memory.
- MP4 output is enabled only for video input.
- Codec/browser support varies; test before promoting the website.
- Only convert files you own or have permission to use. This is not a streaming-platform downloader.
