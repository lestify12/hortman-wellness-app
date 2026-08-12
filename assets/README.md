# Assets

Drop images, brand files and fonts here.

```
assets/
  images/    App icons, splash, backgrounds, photography — anything the app bundles
  brand/     Source-of-truth brand files: logo renders, SVG sources, palette sheets
  fonts/     Local .ttf/.otf files, only if a face is not available via @expo-google-fonts
```

Everything the app renders lives in `assets/images/` and is reached through
`src/constants/images.ts`. `assets/brand/` is a reference shelf — nothing there
is bundled directly; derived cut-outs are exported into `assets/images/`.

## What is already here

`assets/images/` holds the app icons plus the supplied marble artwork and the
monogram cut-out used by the auth screens.

| File | Size | Used by |
| --- | --- | --- |
| `icon.png` | 1024×1024 | iOS/base app icon — emerald marble ground, gold monogram |
| `adaptive-icon.png` | 1024×1024 | Android adaptive foreground — transparent, mark inside the safe zone |
| `splash-icon.png` | 1024×1024 | Native splash — transparent, over `#0D3B34` |
| `favicon.png` | 96×96 | Web tab icon — rings dropped, they disappear at this size |
| `login_background.png` | 853×1844 | Auth backdrop: ivory marble, gold curve, emerald marble |
| `velora-monogram.png` | 629×592 | Gold V on transparency, used in the auth lockup |
| `emerald_marble.png` | 853×1844 | Emerald marble texture |
| `ivory_marble.png` | 853×1844 | Ivory marble texture |
| `champagne_marble.png` | 853×1844 | Champagne marble texture |

The first four are wired up in `app.json`; the rest are reached through
`src/constants/images.ts`. Replace any of them in place, keeping the same
filename and roughly the same dimensions, and the app picks the new one up on
next start — no config change needed.

### The monogram cut-out

`velora-monogram.png` is cut out of `assets/brand/velora_text_full.png`. The
supplied render sits on black, so pasting it straight onto the ivory marble
would show a dark box.

Two things that pass unnoticed against black and do not survive the move to a
light ground, in case the mark is ever re-cut:

- The matte comes from luminance — the artwork is lit gold on near-black — with
  a soft ramp that clips the render's warm halo. Left in, that glow reads as a
  smudge on ivory.
- The anti-aliased edges carry chroma bleed, yellow on one side and red on the
  other. Clamping hue into the gold band removes it without touching the body
  of the mark, which is already in range.

The wordmark is *not* sliced from the same render. It is typeset (see
`VeloraLogoLockup.tsx`) so it stays crisp at any size and recolours per surface;
the supplied render has it in a near-black emerald that cannot sit on ivory.

### The generated icons

The four app icons were rendered from `assets/brand/velora-app-icon.svg` rather
than drawn by hand. If the mark changes, re-export from the SVG instead of
editing the PNGs.

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
  not `.svg` files, unless you add a transformer. That is why the SVGs in
  `assets/brand/` are reference sources rather than things the app imports, and
  why `components/brand/Marble.tsx` draws its stone in code.
- **Naming.** Lowercase and hyphenated (`luminance-ritual.jpg`), grouped in
  subfolders by domain (`images/treatments/`, `images/doctors/`).
- **Density variants.** Metro picks these up automatically if you supply
  `name@2x.png` and `name@3x.png` next to `name.png`; reference only `name.png`.
- **Do not put secrets here.** Everything in `assets/` is bundled into the app
  and readable by anyone who downloads it.
- **Weight.** The marble textures are 1.5–2.3 MB each. That is fine for the one
  or two on screen at a time, but they are large enough that adding many more at
  this size will be felt on first load. Re-export at the size actually used
  rather than shipping full-resolution stock.

## Fonts

The Velora pairing (Cormorant Garamond + Jost) is loaded from
`@expo-google-fonts/*` in `src/hooks/useVeloraFonts.ts` — nothing needs to go in
`assets/fonts/`. Only add files here for a licensed face with no Google Fonts
package, and register it in that same hook so the theme's font family names keep
resolving.
