# LOLLA Dreamworld — handmade boutique storefront

An English-only, mobile-responsive single-page website for LOLLA Handmade by Kholod Mokhtar. Inspired by the moods and interaction patterns of Framer's Daydream Shop, Matchioo, Clothsify and Kisscut, but implemented as original standalone HTML/CSS/JavaScript, not a Framer marketplace template.

## Getting started

Open `index.html` directly in a browser, or run a local static server from this directory:

```bash
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## Main features

- Pastel sky hero, original WebGL 3D cloudscape (`clouds-3d.js`), layered illustrated clouds (`assets/soft-cloud.svg`), motion-on-scroll, and tactile cards.
- Filterable product collection using real product photos supplied by LOLLA.
- Draggable, shuffleable sticker photo board (desktop and touch).
- Three-pattern matching set builder.
- Product detail pop-up and local browser shopping bag.
- WhatsApp order enquiries with a prefilled selection; no payments or order backend yet.
- Mobile navigation, animation accessibility, and SEO/social metadata.

## Typography and 3D animation (November 2026 update)

- Headlines: **Fraunces**; navigation and body: **Plus Jakarta Sans**; handwritten labels: **Caveat**. These are Google web fonts also selectable within Framer; they load from Google Fonts at runtime, not from copied Framer template assets. The site has system fallback fonts if offline.
- `clouds-3d.js` is a self-contained WebGL animation of animated, softly shaded cloud meshes and floating pastel pearls. No Three.js/CDN dependency is required for the 3D scene. It responds gently to cursor movement on desktop and pauses when not visible, when the tab is hidden, or when reduced motion is requested.
- On devices without WebGL, CSS clouds and the illustrated SVGs remain visible so the store is still complete. The 3D clouds are purely decorative and do not block interaction.
- The hero photo tilt is preserved; the previous cursor parallax effect that overrode photo rotations is disabled.
- Test 3D on a WebGL-enabled Chrome, Edge, Safari or Firefox browser. Headless browser rendering without GPU support will show the illustrated fallback rather than the WebGL animation.

## Updating the store

- Edit `products` in `app.js` to add or remove products or change names, category, descriptions and pictures.
- Edit `WHATSAPP_NUMBER` in `app.js` and the explicit WhatsApp/social links in `index.html` if contact details change.
- Replace images in `assets` with final original photography; keep names or update references.
- Customize branding through CSS variables at the top of `styles.css`.

This is a **working front-end prototype**, not a hosted website or a real paid checkout. Product prices, stock, real order tracking, customer login and dashboard require an agreed backend/CMS.

## Design references

- https://www.framer.com/marketplace/templates/daydream-shop/ — floating clouds and playful editorial.
- https://www.framer.com/marketplace/templates/matchioo/ — long-form visual storytelling and motion.
- https://www.framer.com/marketplace/templates/clothsify/ — pillowy pastel surfaces and rounded cart UX.
- https://www.framer.com/marketplace/templates/kisscut/ — draggable sticker-board interactions.

All photos come from user-provided LOLLA images. No licensed Framer marketplace template code is copied.

## GitHub Pages deployment

1. Open **Settings > Pages** in the repository.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Set **Branch: main**, **Folder: /(root)** and click **Save**.

Every subsequent commit to main automatically publishes on GitHub Pages.
Website address: https://altaqawy.github.io/lolla-handmade-website/

The complete site is committed at the repository root, including HTML, CSS, JavaScript, and product photos.
