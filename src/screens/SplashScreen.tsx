import { useEffect, useRef } from 'react';
import { Animated, Easing, StatusBar, StyleSheet } from 'react-native';
import { fonts } from '../theme/fonts';

const BRAND_BLUE = '#1F7BF2';
const LOGO_SIZE = 200;

type Props = {
  onFinish: () => void;
};

/**
 * Picks up exactly where the native launch screen leaves off (same colour,
 * same centred logo), shows the name and tagline, then fades into the app.
 */
export function SplashScreen({ onFinish }: Props) {
  const lift = useRef(new Animated.Value(0)).current;
  const text = useRef(new Animated.Value(0)).current;
  const screen = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(lift, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(text, {
          toValue: 1,
          duration: 500,
          delay: 150,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(700),
      Animated.timing(screen, {
        toValue: 0,
        duration: 350,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]);
    animation.start(({ finished }) => finished && onFinish());
    return () => animation.stop();
  }, [lift, text, screen, onFinish]);

  return (
    <Animated.View
      style={[styles.container, { opacity: screen }]}
      pointerEvents="none"
    >
      <StatusBar barStyle="light-content" />
      <Animated.Image
        source={require('../../assets/brand/splash-logo.png')}
        style={[
          styles.logo,
          {
            transform: [
              {
                translateY: lift.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -24],
                }),
              },
            ],
          },
        ]}
        accessibilityIgnoresInvertColors
      />
      <Animated.View
        style={[
          styles.textBlock,
          {
            opacity: text,
            transform: [
              {
                translateY: text.interpolate({
                  inputRange: [0, 1],
                  outputRange: [12, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Animated.Text style={styles.name}>Fixora</Animated.Text>
        <Animated.Text style={styles.tagline}>
          Trusted home services, near you
        </Animated.Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: BRAND_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  textBlock: {
    position: 'absolute',
    top: '50%',
    marginTop: 40,
    alignItems: 'center',
  },
  name: {
    fontSize: 34,
    fontFamily: fonts.extrabold,
    letterSpacing: 0.5,
    color: '#FFFFFF',
  },
  tagline: {
    marginTop: 6,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: 'rgba(255, 255, 255, 0.85)',
  },
});
