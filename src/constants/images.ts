/**
 * Image registry.
 *
 * Metro resolves `require` for images at build time, so paths cannot be built
 * from variables — every local image needs a literal `require`. Collecting them
 * here means screens import a name instead of walking `../../../assets`, and a
 * renamed or deleted file breaks in one place rather than across the app.
 *
 * IMPORTANT: only register images the app actually draws. A `require` here runs
 * as soon as any screen imports this module, so Metro bundles and ships the
 * file whether or not anything renders it. Registering the unused marble
 * textures and the app icons once put ~7 MB of dead weight into the bundle,
 * which is what made the login screen slow to appear.
 *
 * The app icons are NOT registered: `app.json` references them by path, which
 * does not go through Metro.
 *
 * Adding an image:
 *   1. Drop the file in `assets/images/` (see `assets/README.md` for sizes).
 *   2. Add a `require` line below — only if something renders it.
 *   3. Use it: `<Image source={images.brand.monogram} />`
 *
 * Remote images (once a backend serves them) do not belong here — pass those
 * as `{ uri }` straight from the model, the way `Avatar` and `Doctor.avatarUrl`
 * already do.
 */

export const images = {
  brand: {
    /**
     * Gold V monogram on transparency, cut out of
     * `assets/brand/velora_text_full.png` and pre-scaled to roughly the size it
     * renders at. See `assets/README.md` for how it was cut.
     */
    monogram: require('../../assets/images/velora-monogram.png'),
  },

  backgrounds: {
    /**
     * Full-bleed auth background: ivory marble above a gold curve, emerald
     * marble below. JPEG, because it is photographic and full-bleed — the PNG
     * source in `assets/brand/` is 1.9 MB against 139 KB here, for no visible
     * difference at display size.
     */
    login: require('../../assets/images/login-background.jpg'),
  },

  /**
   * Onboarding artwork, all cut out of gold-on-black renders in
   * `assets/brand/` and pre-scaled to the size each is drawn at.
   */
  onboarding: {
    personal: require('../../assets/images/onboarding-personal.png'),
    expert: require('../../assets/images/onboarding-expert.png'),
    premium: require('../../assets/images/onboarding-premium.png'),
    /** "Your Care Plan" render, edge-faded so it dissolves into the marble. */
    carePlan: require('../../assets/images/onboarding-careplan.png'),
  },
} as const;

/**
 * Typed handle for a bundled image. Components should accept this rather than
 * `any` when they take a local image.
 */
export type LocalImageSource = number;
