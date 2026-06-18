---
name: Premium Editorial Learning
colors:
  surface: '#fbf9f8'
  surface-dim: '#dbdad9'
  surface-bright: '#fbf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#e9e8e7'
  surface-container-highest: '#e4e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#3d4a3d'
  inverse-surface: '#303031'
  inverse-on-surface: '#f2f0f0'
  outline: '#6d7b6c'
  outline-variant: '#bccbb9'
  surface-tint: '#006e2d'
  primary: '#006e2d'
  on-primary: '#ffffff'
  primary-container: '#1db954'
  on-primary-container: '#004118'
  inverse-primary: '#53e076'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e5e2e1'
  on-secondary-container: '#656464'
  tertiary: '#5d5f5d'
  on-tertiary: '#ffffff'
  tertiary-container: '#a0a19f'
  on-tertiary-container: '#363837'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#72fe8f'
  primary-fixed-dim: '#53e076'
  on-primary-fixed: '#002108'
  on-primary-fixed-variant: '#005320'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474646'
  tertiary-fixed: '#e2e3e1'
  tertiary-fixed-dim: '#c6c7c5'
  on-tertiary-fixed: '#1a1c1b'
  on-tertiary-fixed-variant: '#454746'
  background: '#fbf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e2'
typography:
  display:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Sora
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1120px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
---

## Brand & Style
The design system is built for high-performance learning, blending the rhythmic, energetic feel of a modern streaming app with the clarity and authority of a premium editorial platform. It targets ambitious professionals who require a focused environment that feels both sophisticated and energetic.

The aesthetic is **Minimalist Editorial**. It prioritizes extreme legibility and generous negative space to reduce cognitive load during intense study sessions. The interface relies on a "Spotify-meets-Substack" tension: high-energy brand accents set against a structured, calm, and document-like reading experience. The emotional response is one of confidence, precision, and momentum.

## Colors
The palette is dominated by **Surface White (#F9F9F7)** to provide a warm, paper-like background that is easier on the eyes than pure white.

- **Primary Brand**: #1DB954 (Vibrant Green) is used sparingly for high-action items, progress indicators, and "success" states.
- **Deep Navy/Black**: #121212 is used for all primary headings and body text to ensure maximum contrast and an authoritative feel.
- **Surface Tiers**: Neutral grays (e.g., #EEEEEC for secondary containers and #E2E2E0 for borders) create a subtle hierarchy without breaking the minimalist aesthetic.
- **Feedback**: Functional colors (Error/Red, Warning/Amber) should be muted to maintain the editorial tone, only becoming vibrant upon direct user error.

## Typography
The typography strategy leverages the geometric strength of **Sora** for brand-heavy moments and the utilitarian clarity of **Inter** for long-form reading.

Headlines should utilize tighter letter-spacing to feel "locked-in" and professional. For the "Flashcard" experience, use **Body LG** to ensure questions are legible even at a distance. All labels and metadata should use Inter with slightly increased letter-spacing to maintain a clean, organized appearance against the bolder Sora headings.

## Layout & Spacing
The layout follows a **Fixed Grid** on desktop to mimic the centered feel of a newsletter or document, centering the focus on the learning material. On mobile, it transitions to a fluid model with narrow margins to maximize real estate for flashcard content.

- **The 8px Rule**: All spacing increments must be multiples of 8px (8, 16, 24, 32, 48, 64).
- **Vertical Rhythm**: Use 64px or 80px gaps between major sections to emphasize the "Editorial" whitespace.
- **Card Layouts**: Flashcards should be centered with a maximum width of 640px to prevent line lengths from becoming too long for comfortable reading.

## Elevation & Depth
This design system avoids heavy shadows in favor of **Tonal Layering** and **Crisp Outlines**.

- **Level 0 (Base)**: #F9F9F7 (The main canvas).
- **Level 1 (Cards/Containers)**: White (#FFFFFF) with a subtle 1px border (#E2E2E0). This creates a "lifted" effect without the blur of a shadow.
- **Level 2 (Active/Hover)**: When an element is interacted with, apply a very soft, diffused shadow (0px 4px 20px rgba(0,0,0,0.04)) to suggest tactility.
- **Overlays**: Modals use a backdrop blur (12px) with a semi-transparent dark overlay (20% opacity) to maintain focus on the modal content.

## Shapes
A consistent **8px (0.5rem)** radius is applied to all structural elements. This "Soft" approach bridges the gap between the sharpness of traditional editorial layouts and the approachability of modern mobile apps.

Buttons, Input Fields, and Flashcards all share this 8px radius. Small tags or chips may use a fully "Pill" shape (100px) to distinguish them from actionable buttons.

## Components
- **Flashcards**: The centerpiece. Use a white background, 8px radius, and a 1px subtle border. Content should be centered with Sora Medium for the question.
- **Buttons**:
    - *Primary*: Vibrant Green (#1DB954) with White text. Bold, 8px radius.
    - *Secondary*: Deep Navy (#121212) with White text for high-contrast actions.
    - *Ghost*: Transparent with a 1px border for secondary navigation.
- **Progress Bars**: Use a thick 8px track. The unfilled portion is #EEEEEC and the filled portion is the Primary Green.
- **Input Fields**: Minimalist. 1px border on all sides. On focus, the border thickens to 2px and changes to the Primary Green.
- **Lists**: Used for interview categories. Each item is separated by a light horizontal rule. Use "Chevron-right" icons in #6B6B6B to indicate drill-down.
- **Status Chips**: Small, capitalized labels with light pastel backgrounds (e.g., light green for "Mastered", light gray for "New") to provide quick visual scanning without cluttering the UI.
