import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { colors, gradients } from '../../theme/colors';

type Props = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
};

const TRACK_WIDTH = 46;
const KNOB = 22;
const PADDING = 2;

export function Toggle({ value, onValueChange, accessibilityLabel }: Props) {
  const position = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(position, {
      toValue: value ? 1 : 0,
      duration: 160,
      useNativeDriver: true,
    }).start();
  }, [value, position]);

  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      hitSlop={8}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value }}
      style={[styles.track, value ? styles.on : styles.off]}
    >
      <Animated.View
        style={[
          styles.knob,
          {
            transform: [
              {
                translateX: position.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, TRACK_WIDTH - KNOB - PADDING * 2],
                }),
              },
            ],
          },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: KNOB + PADDING * 2,
    borderRadius: (KNOB + PADDING * 2) / 2,
    padding: PADDING,
    justifyContent: 'center',
  },
  on: {
    experimental_backgroundImage: gradients.primaryButton,
  },
  off: {
    backgroundColor: colors.border,
  },
  knob: {
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
    backgroundColor: colors.surface,
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.2)',
  },
});
