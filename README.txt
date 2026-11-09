MEDIA CONVERT — STARTER PROJECT
================================

This is a starter website for converting media files that visitors own or have permission to use.
It does NOT download from YouTube or other streaming services.

WHAT IS INCLUDED
- index.html: website structure
- style.css: professional responsive design
- main.js: browser-based FFmpeg conversion logic
- package.json: dependencies and build command

IPHONE LAUNCH ROUTE (NO COMPUTER REQUIRED)
------------------------------------------

Recommended: use GitHub + Cloudflare Pages build integration.

1. On your iPhone, open Safari and sign up at https://github.com/signup
2. Create a new repository named media-convert. Set it to Private or Public.
3. Unzip this starter ZIP in the iPhone Files app:
   - Open Files > Downloads.
   - Tap media-converter-starter.zip once to extract it.
4. Open your GitHub repository in Safari.
5. Use Add file > Upload files.
6. Upload the FIVE files from the extracted folder:
   index.html, style.css, main.js, package.json, README.txt
   Keep all five files in the repository root (not inside another folder).
7. Commit the upload.
8. Create/sign in to a Cloudflare account: https://dash.cloudflare.com/sign-up
9. In Cloudflare, open Workers & Pages > Create application > Pages > Connect to Git.
10. Connect GitHub and select the media-convert repository.
11. Set:
    - Framework preset: None
    - Build command: npm run build
    - Build output directory: dist
12. Deploy. Cloudflare will install the packages and build the site.
13. Open the *.pages.dev address Cloudflare gives you.

IMPORTANT
- Cloudflare Pages Git integration is chosen so Cloudflare can run the Vite build.
- Do NOT use the Pages drag-and-drop ZIP method for this source ZIP; it is source code, not prebuilt output.
- On iPhone, GitHub's upload interface may be easier in Safari with Request Desktop Website.
- If GitHub's multi-file upload is awkward on iPhone, tell ChatGPT what screen you see; do not paste secrets or passwords into chat.

TESTING
- Start with a small MP3 or MP4 file (under 10 MB).
- First conversion downloads the FFmpeg WebAssembly engine (roughly 30 MB) from jsDelivr.
- Keep Safari open during conversion.
- For iPhone, files under 50 MB are recommended. Large video conversion may run out of browser memory.
- The app is a starter and needs real-device testing before public promotion.

PRIVACY / LEGAL
- The selected file is processed in the browser's memory and is not uploaded to this website's server.
- The browser downloads the FFmpeg engine from jsDelivr on first use.
- Users should only convert media they own or are authorized to use.
- No ad network is installed. Add advertising only after reviewing the ad provider's policies and the site's legal requirements.

COST
- GitHub Free and Cloudflare Pages Free can be used to start.
- A custom domain is optional and normally costs money; use the free pages.dev address initially.
