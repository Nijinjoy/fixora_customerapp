import { useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import type { ListRenderItem } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowRight,
  MapPin,
  Navigation,
  ShieldCheck,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import type { RootScreenProps } from '../navigation/types';
import { colors, shadow } from '../theme/colors';
import { fonts } from '../theme/fonts';

type Slide = {
  key: string;
  emoji: string;
  badge: LucideIcon;
  badgeColor: string;
  title: string;
  body: string;
};

// Same blue as the splash screen, so the hand-off feels seamless.
const BRAND_BLUE = '#1F7BF2';

const SLIDES: Slide[] = [
  {
    key: 'nearby',
    emoji: '🏡',
    badge: MapPin,
    badgeColor: colors.accent,
    title: 'Find pros near you',
    body: 'Skilled professionals right in your neighbourhood, ready when you need them.',
  },
  {
    key: 'trusted',
    emoji: '👷🏻‍♂️',
    badge: ShieldCheck,
    badgeColor: colors.success,
    title: 'Pick one you trust',
    body: 'Every pro is verified. Compare ratings, reviews and distance before you choose.',
  },
  {
    key: 'track',
    emoji: '🗺️',
    badge: Navigation,
    badgeColor: colors.primary,
    title: 'Track them to your door',
    body: 'Book a time that suits you, then follow your pro live on the map as they arrive.',
  },
];

const ILLUSTRATION = 240;

export function WelcomeScreen({ navigation }: RootScreenProps<'Welcome'>) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<Slide>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [index, setIndex] = useState(0);
  const isLast = index === SLIDES.length - 1;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: { index?: number | null }[] }) => {
      const first = viewableItems[0];
      if (first?.index != null) {
        setIndex(first.index);
      }
    },
  ).current;

  const finish = () => {
    navigation.replace('Register');
  };

  const next = () => {
    if (isLast) {
      finish();
    } else {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    }
  };

  const renderSlide: ListRenderItem<Slide> = ({ item }) => {
    const Badge = item.badge;
    return (
      <View style={[styles.slide, { width }]}>
        <View style={styles.illustration}>
          <View style={styles.ring} />
          <View style={styles.circle}>
            <Text style={[styles.palm, styles.palmLeft]}>🌴</Text>
            <Text style={[styles.palm, styles.palmRight]}>🌴</Text>
            <Text style={styles.emoji}>{item.emoji}</Text>
          </View>
          <View style={styles.badge}>
            <Badge size={26} color={item.badgeColor} strokeWidth={2.2} />
          </View>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.body}>{item.body}</Text>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top, paddingBottom: insets.bottom + 16 },
      ]}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.topBar}>
        {!isLast && (
          <Pressable
            onPress={finish}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Skip introduction"
          >
            <Text style={styles.skip}>Skip</Text>
          </Pressable>
        )}
      </View>

      <Animated.FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={item => item.key}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        style={styles.list}
        getItemLayout={(_, i) => ({
          length: width,
          offset: width * i,
          index: i,
        })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((slide, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            return (
              <Animated.View
                key={slide.key}
                style={[
                  styles.dot,
                  {
                    width: scrollX.interpolate({
                      inputRange,
                      outputRange: [8, 24, 8],
                      extrapolate: 'clamp',
                    }),
                    backgroundColor: scrollX.interpolate({
                      inputRange,
                      outputRange: [
                        'rgba(255, 255, 255, 0.35)',
                        '#FFFFFF',
                        'rgba(255, 255, 255, 0.35)',
                      ],
                      extrapolate: 'clamp',
                    }),
                  },
                ]}
              />
            );
          })}
        </View>

        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          onPress={next}
          accessibilityRole="button"
          accessibilityLabel={isLast ? 'Get started' : 'Next'}
        >
          <Text style={styles.buttonText}>
            {isLast ? 'Get Started' : 'Next'}
          </Text>
          <ArrowRight size={18} color={BRAND_BLUE} strokeWidth={2.2} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BRAND_BLUE,
  },
  topBar: {
    height: 52,
    paddingHorizontal: 24,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  skip: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  list: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  illustration: {
    width: ILLUSTRATION,
    height: ILLUSTRATION,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 44,
  },
  ring: {
    ...StyleSheet.absoluteFill,
    borderRadius: ILLUSTRATION / 2,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  circle: {
    width: ILLUSTRATION - 40,
    height: ILLUSTRATION - 40,
    borderRadius: (ILLUSTRATION - 40) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  palm: {
    position: 'absolute',
    bottom: 6,
    fontSize: 54,
    lineHeight: 66,
    fontFamily: fonts.regular,
  },
  palmLeft: {
    left: 10,
  },
  palmRight: {
    right: 10,
    transform: [{ scaleX: -1 }],
  },
  emoji: {
    fontSize: 96,
    lineHeight: 120,
    fontFamily: fonts.regular,
  },
  badge: {
    position: 'absolute',
    right: 14,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadow.card,
  },
  title: {
    fontSize: 26,
    lineHeight: 34,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  body: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 23,
    fontFamily: fonts.regular,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    maxWidth: 300,
  },
  footer: {
    paddingHorizontal: 24,
    gap: 28,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  button: {
    height: 54,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    boxShadow: '0px 6px 16px rgba(10, 40, 100, 0.25)',
  },
  pressed: {
    opacity: 0.85,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: fonts.semibold,
    color: BRAND_BLUE,
  },
});
