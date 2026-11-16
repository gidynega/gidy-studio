GIDY STUDIO V11 — INSTALLABLE WEB APP STARTER
===========================================

FILES
- index.html: Gidy Studio editor
- manifest.webmanifest: installable app identity and display settings
- sw.js: offline app-shell cache
- icons/: app icons

IMPORTANT: This is a Progressive Web App (PWA) package, not yet a signed Android APK.
To install it as an app, upload these files to an HTTPS website you control. Service workers and browser installation do not work from a local file:// URL.

INSTALL ON ANDROID
1. Publish the complete folder to an HTTPS host (for example, your own GitHub Pages site or another HTTPS host).
2. Open the published URL in Chrome on Android.
3. Use the Install app prompt if it appears, or Chrome menu > Install app / Add to Home screen.
4. Open Gidy Studio from the phone app launcher.

OFFLINE NOTES
The app shell and editor files are cached after the first successful online visit. Internet is still needed for external PPTX/PDF libraries and any future online AI features. Projects remain in the browser's local storage unless backed up.

NEXT ANDROID PACKAGE STEP
Once the PWA is hosted on HTTPS and verified, it can be wrapped as an Android Trusted Web Activity (TWA) with Bubblewrap/PWA tooling. That requires the website's Digital Asset Links verification and Android signing.

EXISTING V10 FEATURES
Slide editing, templates, image upload, text and shapes, object movement/resizing, grid, animations, speaker notes, presentation mode, audio/video preview, JSON backup/import and PPTX/PDF export remain. Audio/video are not embedded in PPTX/PDF. Export libraries require internet.

TESTING
Manifest, icons, service-worker files and JavaScript syntax are packaged. Full browser/device installation testing must be performed after HTTPS deployment.
