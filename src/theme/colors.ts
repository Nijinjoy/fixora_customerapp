/**
 * Fixora colour theme — derived from the app icon
 * (ios/.../AppIcon.appiconset/icon-1024.png, assets/brand/emblem.png).
 *
 *   Icon background   #01B5A8 → #00706F   teal gradient        → primary
 *   House interior    #01504E             deep teal            → brandDeep / shadows
 *   Hard hat, windows #FEBA12             amber                → amber / star
 *   Swoosh            #FEBF06 → #FE6C1A   amber → orange       → accent
 *
 * Rule of thumb: teal for primary actions, navigation and selection;
 * orange for highlights and secondary CTAs (offers, "Book now", pending);
 * amber only for ratings and small highlights. Never hardcode hex values in
 * screens — add a token here instead.
 */

const palette = {
  teal50: '#EDF8F7',
  teal100: '#D8F2EF',
  teal200: '#B2E5E0',
  teal400: '#2CC4B8',
  teal500: '#01B5A8', // icon gradient start
  teal600: '#018880', // icon mid — main brand teal
  teal700: '#017A76',
  teal800: '#00706F', // icon gradient end
  teal900: '#005A5A',
  deep: '#01504E', // icon house interior
  orange50: '#FFF1E7',
  orange400: '#FF8A2A',
  orange500: '#FE6C1A', // icon swoosh
  amber400: '#FEBA12', // icon hard hat
  amber500: '#FEA906',
  ink: '#10292B',
  slate500: '#667A7C',
  slate300: '#C2CDCC',
  slate200: '#DDE8E7',
  white: '#FFFFFF',
};

export const colors = {
  // Surfaces
  background: '#EEF6F5',
  surface: palette.white,
  border: palette.slate200,
  overlay: 'rgba(1, 80, 78, 0.45)',

  // Text
  text: palette.ink,
  textMuted: palette.slate500,
  textDisabled: palette.slate300,
  onPrimary: palette.white, // text/icons on teal or orange fills
  onPrimaryMuted: 'rgba(255, 255, 255, 0.85)',

  // Brand — teal
  primary: palette.teal600,
  primaryLight: palette.teal500,
  primaryDark: palette.teal800,
  primarySoft: palette.teal100,
  brandDeep: palette.deep,

  // Brand — orange / amber
  accent: palette.orange500,
  accentLight: palette.orange400,
  accentSoft: palette.orange50,
  amber: palette.amber400,
  star: palette.amber400,

  // Solid midpoint of gradients.splash, used where gradients aren't possible
  // (iOS LaunchScreen.storyboard, Android 12+ system splash). Keep in sync.
  splash: palette.teal700,

  // Status
  success: '#16A34A',
  successText: '#15803D',
  successSoft: '#DCFCE7',
  warningText: '#B7791F',
  warningSoft: '#FFF4D6',
  danger: '#E5484D',
  dangerText: '#B91C1C',
  dangerSoft: '#FDECEC',
};

// Full-bleed brand screens: splash, welcome, OTP, register. Top to bottom so the
// native launch screens (android launch_screen.xml, iOS storyboard) can match it.
const hero = `linear-gradient(180deg, ${palette.teal500} 0%, ${palette.teal700} 55%, ${palette.teal900} 100%)`;

export const gradients = {
  // Same direction/stops as the icon background.
  primaryButton: `linear-gradient(135deg, ${palette.teal500} 0%, ${palette.teal800} 100%)`,
  // Same as the icon swoosh.
  accentButton: `linear-gradient(90deg, ${palette.orange500} 0%, ${palette.orange400} 100%)`,
  hero,
  // Same as hero so splash → welcome is seamless.
  // Also mirrored in android/app/src/main/res/drawable/launch_screen.xml.
  splash: hero,
  screen: `linear-gradient(180deg, #E4F3F1 0%, #F3F9F8 100%)`,
  banner: `linear-gradient(110deg, ${palette.teal100} 0%, ${palette.teal200} 100%)`,
  softHero: `linear-gradient(180deg, ${palette.teal200} 0%, ${palette.teal100} 60%, ${palette.teal50} 100%)`,
};

export const shadow = {
  card: '0px 4px 16px rgba(1, 80, 78, 0.06)',
  nav: '0px 8px 24px rgba(1, 80, 78, 0.18)',
  fab: '0px 6px 14px rgba(1, 136, 128, 0.45)',
  raised: '0px 6px 16px rgba(1, 80, 78, 0.25)',
  bottomBar: '0px -6px 20px rgba(1, 80, 78, 0.08)',
};
