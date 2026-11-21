import { useEffect } from 'react';
import { Image, StatusBar, StyleSheet, Text, View } from 'react-native';
import { colors, gradients } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { appIconRound } from '../assets/images';

const LOGO_SIZE = 200;
const TEXT_GAP = 16;
const NAME_LINE = 48;
const TAGLINE_GAP = 6;
const TAGLINE_LINE = 22;
const TEXT_HEIGHT = NAME_LINE + TAGLINE_GAP + TAGLINE_LINE;
// Logo + name are centred as one group, which puts the logo this far above the
// screen centre. The native launch screens use the same offset (46) so nothing
// jumps at hand-over: android launch_screen.xml (bottom inset 92dp) and
// ios LaunchScreen.storyboard (centerY constant -46).
export const SPLASH_LOGO_OFFSET = (TEXT_GAP + TEXT_HEIGHT) / 2;
// How long the splash stays up before handing over to the app.
const SPLASH_DURATION = 1500;

type Props = {
  onFinish: () => void;
};

export function SplashScreen({ onFinish }: Props) {
  useEffect(() => {
    const timer = setTimeout(onFinish, SPLASH_DURATION);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container} pointerEvents="none">
      <StatusBar barStyle="light-content" />
      <Image
        source={appIconRound}
        style={styles.logo}
        accessibilityIgnoresInvertColors
      />
      <View style={styles.textBlock}>
        <Text style={styles.name}>Fixora</Text>
        <Text style={styles.tagline}>Trusted home services, near you</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.splash,
    experimental_backgroundImage: gradients.splash,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  textBlock: {
    marginTop: TEXT_GAP,
    height: TEXT_HEIGHT,
    alignItems: 'center',
  },
  name: {
    fontSize: 34,
    lineHeight: NAME_LINE,
    fontFamily: fonts.extrabold,
    letterSpacing: 0.5,
    color: colors.onPrimary,
    textShadowColor: 'rgba(1, 80, 78, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  tagline: {
    marginTop: TAGLINE_GAP,
    fontSize: 14,
    lineHeight: TAGLINE_LINE,
    fontFamily: fonts.regular,
    color: colors.onPrimary,
    textShadowColor: 'rgba(1, 80, 78, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
