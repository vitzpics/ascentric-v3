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

## Final pre-launch editing pass

The current preview includes the shorter mobile hero, three homepage engagement paths, six buyer-facing inquiry options, the revised friction graphic, consistent personal/firm voice, and updated page titles and descriptions. The About photographs follow portrait → adult facilitation → Global Routes group in the field.

Carlos Flores, Fuzieh Jallow, and Olesia Gudkovskaya appear in the manual carousel. All three quotations and attributions were recovered from the original website source, with no invented or newly paraphrased testimony.

The provisional “Faculty Fellow, Berkeley Institute for Human Connection” title remains marked `VERIFY EXACT TITLE BEFORE PRODUCTION` in both visible locations. Confirm the exact wording before release. Exact Wayfinder and Hawaiian-studies credential names remain omitted pending verification.

The Desktop package contains `Review-Final-Pass.md`, updated screenshots under `screenshots/final-pass/`, and the existing `Open Preview.command` launcher. The final report supersedes earlier revision reports.
