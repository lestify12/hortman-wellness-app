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
 *   3. Use it: `<Image source={images.brand.icon} />`
 *
 * Remote images (once a backend serves them) do not belong here — pass those
 * as `{ uri }` straight from the model, the way `Avatar` and `Doctor.avatarUrl`
 * already do.
 */

export const images = {
  brand: {
    /** 1024×1024 marble ground + monogram. Also referenced by app.json. */
    icon: require('../../assets/images/icon.png'),
    /** 1024×1024 transparent monogram for the Android adaptive foreground. */
    adaptiveIcon: require('../../assets/images/adaptive-icon.png'),
    /** 1024×1024 transparent monogram shown on the native splash. */
    splashIcon: require('../../assets/images/splash-icon.png'),
  },
} as const;

/**
 * Typed handle for a bundled image. Components should accept this rather than
 * `any` when they take a local image.
 */
export type LocalImageSource = number;
