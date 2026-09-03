# Lever AI production site

This folder contains the approved Lever AI landing page as a lightweight static website. It uses semantic HTML, modern CSS, and a small amount of vanilla JavaScript. There is no framework, package manager, build process, or server runtime.

## Local review

From this folder, run:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

The local preview simulates a successful inquiry so the confirmation state can be reviewed. Real inquiry storage begins after the folder is deployed on Netlify.

## Netlify deployment

Deploy the contents of this folder as the site root. No build command is needed, and the publish directory is the repository root.

For Git-based deployment, connect the repository in Netlify and leave the build command blank. The checked-in `netlify.toml` sets the publish directory to `.` and supplies production security and cache headers, so no package installation, framework build, server, function, or database is required.

The form is named `lever-ai-inquiry` and includes Netlify form detection, required fields, accessible labels, a honeypot field, asynchronous submission, error handling, and a success state.

After the first Netlify deployment:

1. Submit one test inquiry and confirm it appears under **Forms** in Netlify.
2. In the Netlify dashboard, add a form submission email notification for the appropriate business contact.
3. Test the notification and reply workflow.
4. Connect `leversmb.com` only after the production preview is approved.

After the custom domain is connected, confirm the primary domain is `https://leversmb.com`, verify HTTPS is active, and re-run the form, social-card, `robots.txt`, and `sitemap.xml` checks against the deployed URL.

## Files

- `index.html` — page content, SEO metadata, and Netlify form markup
- `styles.css` — responsive visual system
- `script.js` — dropdown interaction, validation, and form success/error states
- `assets/` — optimized hero, social preview, and favicon assets
- `robots.txt` and `sitemap.xml` — search-engine discovery files
- `netlify.toml` — direct static deployment, security headers, and cache policy
