/**
 * Image registry.
 *
 * Metro resolves `require` for images at build time, so paths cannot be built
 * from variables — every local image needs a literal `require`. Collecting them
 * here means screens import a name instead of walking `../../../assets`, and a
 * renamed or deleted file breaks in one place rather than across the app.
 *
 * Adding an image:
 *   1. Drop the file in `assets/images/` (see `assets/README.md` for sizes).
 *   2. Add a `require` line below.
 *   3. Use it: `<Image source={images.brand.monogram} />`
 *
 * Remote images (once a backend serves them) do not belong here — pass those
 * as `{ uri }` straight from the model, the way `Avatar` and `Doctor.avatarUrl`
 * already do.
 */

export const images = {
  brand: {
    /**
     * Gold V monogram on transparency, cut out of `assets/brand/
     * velora_text_full.png`. The supplied render sits on black, which would
     * show as a dark box over the ivory marble.
     */
    monogram: require('../../assets/images/velora-monogram.png'),
    /** 1024×1024 marble ground + monogram. Also referenced by app.json. */
    icon: require('../../assets/images/icon.png'),
    /** 1024×1024 transparent monogram for the Android adaptive foreground. */
    adaptiveIcon: require('../../assets/images/adaptive-icon.png'),
    /** 1024×1024 transparent monogram shown on the native splash. */
    splashIcon: require('../../assets/images/splash-icon.png'),
  },

  backgrounds: {
    /**
     * Full-bleed auth background: ivory marble above a gold curve, emerald
     * marble below. Authored at 853×1844 (≈0.463), which matches a modern
     * handset closely enough that `cover` barely crops.
     */
    login: require('../../assets/images/login_background.png'),
  },

  /**
     * Photographic marble grounds. `components/brand/Marble.tsx` still draws
     * its stone procedurally; these are the supplied textures for surfaces
     * that want the real thing.
     */
  marble: {
    emerald: require('../../assets/images/emerald_marble.png'),
    ivory: require('../../assets/images/ivory_marble.png'),
    champagne: require('../../assets/images/champagne_marble.png'),
  },
} as const;

/**
 * Typed handle for a bundled image. Components should accept this rather than
 * `any` when they take a local image.
 */
export type LocalImageSource = number;
