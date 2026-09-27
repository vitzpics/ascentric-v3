# Ascentric strategy and culture preview

A local refinement of the existing Ascentric static website. This is a separate repository on branch `ascentric-strategy-culture-v1`, based on original commit `df2c243`.

## Preview

From this directory:

```sh
python3 -m http.server 8731 --bind 127.0.0.1
```

Open http://127.0.0.1:8731/ in a browser. The local server uses the `.html` links provided throughout the site. Netlify's existing clean URLs and the added `/approach`, `/work`, and `/offsites` aliases are configured in `netlify.toml` for a future approved deployment.

The contact form explicitly prevents submissions on localhost. The original Netlify form name, field names, honeypot, and POST destination remain intact. TidyCal, email, and social links retain their original destinations.

## Checks

```sh
python3 tests/verify_site.py
node --check js/main.js
node --test tests/main.test.cjs
```

The inherited site is plain HTML, CSS, and JavaScript, with no package manifest, build pipeline, TypeScript, or original test suite. These checks validate markup, local links, anchors, assets, form metadata, JavaScript syntax, contact-form success/failure behavior, manual carousel navigation, and engagement deep links.

## Review boundary

There is no publishing remote configured. Nothing has been pushed or deployed. The original Desktop `ascentricv3-source` working folder is separate and unchanged. Review the local site before deciding whether to connect a GitHub remote or release anything.

## Second surgical revision

The current preview adds the earlier founder introduction, concrete engagement options, coaching structure, manual testimonial carousel, conditions graphic, and first-person About story. Speaking is in the primary navigation.

The local draft contains the provisional “Faculty Fellow, Berkeley Institute for Human Connection” title. Confirm it before any release; both occurrences are marked `VERIFY EXACT TITLE BEFORE DEPLOY`. Exact Wayfinder and Hawaiian-studies credential names are omitted pending verification. Two approved testimonials are visible; no third approved source was located.

The Desktop package contains `Review-Second-Revision.md`, the requested screenshots, and an `Open Preview.command` launcher.
