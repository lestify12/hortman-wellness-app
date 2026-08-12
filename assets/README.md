# Assets

Drop images, brand files and fonts here.

```
assets/
  images/    App icons, splash, photography, illustrations — anything the app bundles
  brand/     Source-of-truth brand files: logo exports, the brand reference, palette sheets
  fonts/     Local .ttf/.otf files, only if a face is not available via @expo-google-fonts
```

## What is already here

`assets/images/` holds the generated app icons, drawn from the same V monogram
geometry as `src/components/brand/VeloraMonogram.tsx` so the launcher icon and
the in-app mark are the same logo.

| File | Size | Used by |
| --- | --- | --- |
| `icon.png` | 1024×1024 | iOS/base app icon — emerald marble ground, gold monogram |
| `adaptive-icon.png` | 1024×1024 | Android adaptive foreground — transparent, mark inside the safe zone |
| `splash-icon.png` | 1024×1024 | Native splash — transparent, over `#0D3B34` |
| `favicon.png` | 96×96 | Web tab icon — rings dropped, they disappear at this size |

All four are wired up in `app.json`. Replace any of them in place, keeping the
same filename and dimensions, and the app picks the new one up on next start —
no config change needed.

### Regenerating them

They were rendered from SVG rather than drawn by hand. If the monogram changes,
re-render rather than editing the PNGs, so the icon never drifts from the
component. The geometry lives in `VeloraMonogram.tsx`.

## Adding an image to a screen

Metro resolves `require` at build time, so the path has to be a literal — you
cannot build one from a variable. Register the file once in
`src/constants/images.ts`:

```ts
export const images = {
  treatments: {
    luminance: require('../../assets/images/treatments/luminance.jpg'),
  },
} as const;
```

then use it:

```tsx
import { Image } from 'react-native';
import { images } from '@/constants/images';

<Image source={images.treatments.luminance} style={{ width: '100%', height: 200 }} />;
```

Images that come from a backend do not belong in the registry — pass those as
`{ uri }` straight from the model, the way `Avatar` already handles
`Doctor.avatarUrl`.

## Guidance

- **Sizes.** Ship photography at roughly 2× its largest on-screen size. A
  full-bleed hero on a 390pt-wide handset wants about 1080px; anything larger is
  bundle weight the member pays for on first load.
- **Format.** `.jpg` for photography, `.png` only when transparency is needed.
  Avoid `.svg` files as assets — `react-native-svg` renders SVG *components*,
  not `.svg` files, unless you add a transformer. The brand marks and marble are
  drawn as components for exactly this reason.
- **Naming.** Lowercase and hyphenated (`luminance-ritual.jpg`), grouped in
  subfolders by domain (`images/treatments/`, `images/doctors/`).
- **Density variants.** Metro picks these up automatically if you supply
  `name@2x.png` and `name@3x.png` next to `name.png`; reference only `name.png`.
- **Do not put secrets here.** Everything in `assets/` is bundled into the app
  and readable by anyone who downloads it.

## Fonts

The Velora pairing (Cormorant Garamond + Jost) is loaded from
`@expo-google-fonts/*` in `src/hooks/useVeloraFonts.ts` — nothing needs to go in
`assets/fonts/`. Only add files here for a licensed face with no Google Fonts
package, and register it in that same hook so the theme's font family names keep
resolving.
