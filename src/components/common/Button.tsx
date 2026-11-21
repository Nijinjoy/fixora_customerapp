import type { ComponentType, ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import type {
  PressableProps,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { colors, gradients, shadow } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

type IconProps = { size?: number; color?: string; strokeWidth?: number };

export type ButtonVariant = 'primary' | 'accent' | 'outline' | 'light';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ComponentType<IconProps>;
  iconRight?: ComponentType<IconProps>;
  left?: ReactNode;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

const textColor: Record<ButtonVariant, string> = {
  primary: colors.onPrimary,
  accent: colors.onPrimary,
  outline: colors.text,
  light: colors.primary,
};

const iconSize: Record<ButtonSize, number> = { sm: 16, md: 18, lg: 18 };

export function Button({
  title,
  variant = 'primary',
  size = 'lg',
  icon: Icon,
  iconRight: IconRight,
  left,
  loading = false,
  disabled,
  style,
  textStyle,
  ...rest
}: ButtonProps) {
  const inactive = !!disabled || loading;
  const color = textColor[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: inactive, busy: loading }}
      {...rest}
      disabled={inactive}
      style={({ pressed }) => [
        styles.base,
        styles[size],
        styles[variant],
        pressed && !inactive && pressedStyles[variant],
        !!disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <>
          {left}
          {Icon && <Icon size={iconSize[size]} color={color} strokeWidth={2} />}
          <Text style={[styles.text, textSizes[size], { color }, textStyle]}>
            {title}
          </Text>
          {IconRight && (
            <IconRight size={iconSize[size]} color={color} strokeWidth={2.2} />
          )}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
  },
  sm: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 6,
  },
  md: {
    height: 50,
    paddingHorizontal: 18,
  },
  lg: {
    height: 54,
    paddingHorizontal: 20,
  },
  primary: {
    experimental_backgroundImage: gradients.primaryButton,
    backgroundColor: colors.primary,
  },
  accent: {
    experimental_backgroundImage: gradients.accentButton,
    backgroundColor: colors.accent,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  light: {
    backgroundColor: colors.surface,
    boxShadow: shadow.raised,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontFamily: fonts.semibold,
  },
});

const textSizes = StyleSheet.create({
  sm: { fontSize: 13 },
  md: { fontSize: 15 },
  lg: { fontSize: 16 },
});

const pressedStyles = StyleSheet.create({
  primary: { opacity: 0.85 },
  accent: { opacity: 0.85 },
  outline: { backgroundColor: colors.background },
  light: { opacity: 0.85 },
});
