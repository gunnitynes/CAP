# CAP

Clean fullscreen links for Gamma docs: `https://gunnitynes.github.io/CAP/<Name>/`.

Names live in `links.json`; only names listed there open anything. Manage them with:

    cap add Studio-handbook https://gamma.app/docs/...
    cap ls
    cap rm Studio-handbook

`404.html` is a copy of `index.html` so GitHub Pages serves the viewer for any path.

Or manage them in the browser at https://gunnitynes.github.io/CAP/admin/ (needs a fine-grained
GitHub token with Contents: Read and write on this repo only; it is kept in that browser).
