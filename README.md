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
python3 tests/verify_metadata.py
node --check js/main.js
node --test tests/main.test.cjs
```

The inherited site is plain HTML, CSS, and JavaScript, with no package manifest, build pipeline, TypeScript, or original test suite. These checks validate markup, local links, anchors, assets, form metadata, JavaScript syntax, contact-form success/failure behavior, manual carousel navigation, and engagement deep links.

## Review boundary

There is no publishing remote configured. Nothing has been pushed or deployed. The original Desktop `ascentricv3-source` working folder is separate and unchanged. Review the local site before deciding whether to connect a GitHub remote or release anything.

## Final pre-launch editing pass

The current preview includes the shorter mobile hero, three homepage engagement paths, six buyer-facing inquiry options, the revised friction graphic, consistent personal/firm voice, and updated page titles and descriptions. The About photographs follow portrait → adult facilitation → Global Routes group in the field.

Carlos Flores, Fuzieh Jallow, and Olesia Gudkovskaya appear in the manual carousel. All three quotations and attributions were recovered from the original website source, with no invented or newly paraphrased testimony.

Adam confirmed the title “Faculty Fellow” on September 29, 2026. The homepage and About present “Faculty Fellow” with “Berkeley Institute for Human Connection” as a current professional affiliation, distinct from executive coaching training; the title-verification flags have been removed. Exact Wayfinder and Hawaiian-studies credential names remain omitted pending verification.

The latest Desktop review is `Review-Credibility-Pass.md`, with screenshots in `screenshots/credibility-pass/` and the existing `Open Preview.command` launcher. It supersedes the earlier reports.


## Final credibility and launch metadata

The current homepage contains twelve organizations in this order: Google, Microsoft, DHL, UC Berkeley, Peace Corps, State of Hawaiʻi, Tulane University, Boston Public Schools, AmeriCorps, New Orleans Health Department, City Year, and InstaDeep. The heading reads: “Across more than two decades, Adam’s work has spanned organizations and programs including:” with the supporting qualifier “Through coaching, facilitation, teaching, organizational leadership, training, and partnership.”

About separates the confirmed current affiliation, training, and career experience. The state identity reflects Adam’s work in Hawaiʻi’s schools; no specific transportation-agency relationship is stated. The specific New Orleans Health Department mark is included.

All nine pages have canonical and social metadata, favicons, and reserved image dimensions. The canonical origin is `https://ascentric.io`; the sitemap matches the existing clean-route configuration. A new 1200 × 630 typographic sharing card uses the approved headline and existing visual identity. `tests/verify_metadata.py` checks these assets and metadata without adding dependencies.

Production form delivery, hosting redirects, and public crawler/social-image fetches require the production host after a separately approved release. The local preview does not send contact messages. No deployment has been performed.
