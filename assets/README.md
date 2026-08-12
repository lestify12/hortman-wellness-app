# Assets

Drop images, brand files and fonts here.

```
assets/
  images/    App icons, splash, backgrounds, photography — anything the app bundles
  brand/     Source-of-truth brand files: logo renders, SVG sources, palette sheets
  fonts/     Local .ttf/.otf files, only if a face is not available via @expo-google-fonts
```

Everything the app renders lives in `assets/images/` and is reached through
`src/constants/images.ts`. `assets/brand/` is a reference shelf — full-resolution
sources and originals. Nothing there is bundled; derived, display-sized versions
are exported into `assets/images/`.

**Only register an image in `src/constants/images.ts` once something draws it.**
A `require` there runs as soon as any screen imports the module, so Metro ships
the file whether or not it is rendered. Registering the marble textures and the
app icons "for later" once put ~7 MB of dead weight in the bundle and was what
made the login screen slow to appear.

## What is already here

`assets/images/` holds the app icons plus the display-sized artwork the
onboarding and auth screens draw.

| File | Size | Used by |
| --- | --- | --- |
| `icon.png` | 1024×1024 | iOS/base app icon — emerald marble ground, gold monogram |
| `adaptive-icon.png` | 1024×1024 | Android adaptive foreground — transparent, mark inside the safe zone |
| `splash-icon.png` | 1024×1024 | Native splash — transparent, over `#0D3B34` |
| `favicon.png` | 96×96 | Web tab icon — rings dropped, they disappear at this size |
| `login-background.jpg` | 853×1844, 139 KB | Auth and onboarding backdrop: ivory marble, gold curve, emerald marble |
| `velora-monogram.png` | 340×320, 82 KB | Gold V on transparency, used in the auth and onboarding lockups |
| `onboarding-personal.png` | 240×160, 37 KB | "Personalized for You" icon |
| `onboarding-expert.png` | 240×160, 45 KB | "Expert Care You Can Trust" icon |
| `onboarding-premium.png` | 240×160, 34 KB | "A Premium Experience" icon |
| `onboarding-path.png` | 413×620, 211 KB | Glowing three-node path, onboarding slide 2 |
| `onboarding-careplan.png` | 373×560, 269 KB | "Your Care Plan" render, onboarding slide 3 |

The full-resolution originals — `login_background.png`, the three marble
textures and the five onboarding renders — sit in `assets/brand/`. They are
sources, not assets: the background alone is 1.9 MB against 139 KB as a JPEG,
for no visible difference at display size.

The four icons are wired up in `app.json` by path, which does not go through
Metro — that is why they are not in the registry. Replace any file in place,
keeping the same name and roughly the same dimensions, and the app picks it up
on next start.

### The monogram cut-out

`velora-monogram.png` is cut out of `assets/brand/velora_text_full.png`. The
supplied render sits on black, so pasting it straight onto the ivory marble
would show a dark box.

Four things that pass unnoticed against black but do not survive the move to a
light ground, in case the mark is ever re-cut:

- The matte comes from luminance — the artwork is lit gold on near-black — with
  a soft ramp that clips the render's warm halo. Left in, that glow reads as a
  smudge on ivory.
- **Colour is regenerated, not kept.** The output is a gold ramp indexed by the
  source's luminance, so the mark keeps its modelling but none of the render's
  chroma. Preserving the original colour — even with hue clamped into the gold
  band — leaves saturated yellow speckles along the bevel that are invisible on
  black and obvious on ivory.
- The matte is blurred and then re-tightened on its own, separately from the
  colour. Without that the silhouette follows every bump in the render's bevel
  and the edges read as scalloped.
- It is exported near the size it renders at (~70 pt), not at source
  resolution. Handing the platform a 600 px image to scale down to 210 px
  aliases the edges, particularly on Android.

The wordmark is *not* sliced from the same render. It is typeset (see
`VeloraLogoLockup.tsx`) so it stays crisp at any size and recolours per surface;
the supplied render has it in a near-black emerald that cannot sit on ivory.

### The onboarding cut-outs

All five were supplied as artwork on black. Which treatment each needs depends
on what the black is hiding, and getting this wrong is visible immediately:

- **Solid gold glyphs** (the three feature icons) take the same treatment as the
  monogram: luminance matte, colour regenerated from the gold ramp.
- **Glowing artwork** (the winding path) takes its alpha straight from
  luminance, with no threshold and no re-tighten. Thresholding a glow turns it
  into an opaque blob with a hard, fringed edge instead of light. Its dark node
  interiors fall away to transparent, which is correct — the marble shows
  through them.
- **Subjects whose own darks matter** (the Care Plan render, with its dark
  phone body and vase) cannot be keyed at all: luminance would eat the subject
  along with the background. That one keeps its pixels and gets a soft
  elliptical edge fade instead, so the frame dissolves into the dark emerald
  marble rather than ending on a rectangle.

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
- **Weight.** Export at the size actually rendered rather than shipping
  full-resolution stock. The supplied marble originals are 1.5–2.3 MB each; the
  background they became is 139 KB and looks identical on a handset.

## Fonts

The Velora pairing (Cormorant Garamond + Jost) is loaded from
`@expo-google-fonts/*` in `src/hooks/useVeloraFonts.ts` — nothing needs to go in
`assets/fonts/`. Only add files here for a licensed face with no Google Fonts
package, and register it in that same hook so the theme's font family names keep
resolving.
