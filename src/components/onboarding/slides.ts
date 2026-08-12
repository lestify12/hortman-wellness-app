import { images } from '@/constants/images';

export interface FeatureRow {
  image: number;
  title: string;
  body: string;
}

export interface JourneyStep {
  index: string;
  title: string;
  body: string;
}

export interface OnboardingSlide {
  key: string;
  /** Rendered in ivory serif. */
  titleTop: string;
  /** Rendered in gold serif beneath it. */
  titleBottom: string;
  body: string;
  kind: 'features' | 'journey' | 'plan';
  features?: FeatureRow[];
  steps?: JourneyStep[];
}

/**
 * Onboarding copy and artwork.
 *
 * Kept as data rather than JSX so the pager stays a single generic renderer and
 * slides can be added, reordered or localised without touching layout code.
 */
export const SLIDES: OnboardingSlide[] = [
  {
    key: 'crafted',
    titleTop: "Care that's",
    titleBottom: 'crafted for you',
    body: 'Advanced treatments, expert clinicians, and a luxurious experience — all in one place.',
    kind: 'features',
    features: [
      {
        image: images.onboarding.personal,
        title: 'Personalized for You',
        body: 'Care plans tailored to your unique needs, goals, and lifestyle.',
      },
      {
        image: images.onboarding.expert,
        title: 'Expert Care You Can Trust',
        body: 'Certified professionals with advanced training and a passion for excellence.',
      },
      {
        image: images.onboarding.premium,
        title: 'A Premium Experience',
        body: 'Luxurious spaces, cutting-edge technology, and thoughtful touches at every step.',
      },
    ],
  },
  {
    key: 'journey',
    titleTop: 'Your Journey,',
    titleBottom: 'Your Way',
    body: 'A personalized approach to wellness, designed around your goals, preferences, and progress.',
    kind: 'journey',
    steps: [
      {
        index: '01',
        title: 'Discover Your Goals',
        body: 'Tell us what you want to improve and what matters most.',
      },
      {
        index: '02',
        title: 'Your Personalized Plan',
        body: 'A care plan built for you, with the right treatments.',
      },
      {
        index: '03',
        title: 'Track Your Progress',
        body: 'Stay on track with appointments and real milestones.',
      },
    ],
  },
  {
    key: 'plan',
    titleTop: 'Everything,',
    titleBottom: 'in one place',
    body: 'Your consultations, treatments and wellness programme — always with you, always up to date.',
    kind: 'plan',
  },
];
