# CAP

Clean fullscreen links for Gamma docs: `https://gunnitynes.github.io/CAP/<Name>/`.

Names live in `links.json`; only names listed there open anything. Manage them with:

    cap add Studio-handbook https://gamma.app/docs/...
    cap ls
    cap rm Studio-handbook

GitHub Actions runs `build.mjs` on every push: it inlines `links.json` into the page and writes
`<Name>/index.html` for each link (plus `404.html` for other spellings), so Gamma starts loading
immediately. The site is served from that build, not straight from the repo.

Or manage them in the browser at https://gunnitynes.github.io/CAP/admin/ (needs a fine-grained
GitHub token with Contents: Read and write on this repo only; it is kept in that browser).
