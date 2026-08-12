import type { VeloraBackend } from './contracts';
import { mockBackend } from './mock';

/**
 * Backend binding — the single seam between the UI and any real backend.
 *
 * To move onto Firebase:
 *   1. Add `src/services/firebase/index.ts` exporting a `firebaseBackend`
 *      that implements `VeloraBackend` (see `contracts.ts`).
 *   2. Flip `BACKEND` below, or drive it from
 *      `Constants.expoConfig.extra.backend` / an EXPO_PUBLIC_ env var.
 * No screen, hook or component needs to change — they all consume `api`.
 */

type BackendKind = 'mock' | 'firebase';

const BACKEND: BackendKind =
  (process.env.EXPO_PUBLIC_BACKEND as BackendKind | undefined) ?? 'mock';

function resolveBackend(kind: BackendKind): VeloraBackend {
  switch (kind) {
    case 'firebase':
      // Intentionally not implemented yet. Failing loudly here beats silently
      // shipping mock data to production.
      throw new Error(
        'Firebase backend is not wired up yet. Implement src/services/firebase and register it here.',
      );
    case 'mock':
    default:
      return mockBackend;
  }
}

export const api: VeloraBackend = resolveBackend(BACKEND);

export { ServiceError } from './mock';
export type { VeloraBackend } from './contracts';
export { STORAGE_KEYS } from './storageKeys';
