import type React from 'react';
import { useState } from 'react';
import type { ComponentType, ReactNode, Ref } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { StyleProp, TextInputProps, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

const ERROR = colors.danger;

type IconProps = { size?: number; color?: string; strokeWidth?: number };

export type TextFieldProps = TextInputProps & {
  label?: string;
  icon?: ComponentType<IconProps>;
  prefix?: string;
  right?: ReactNode;
  error?: string | false | null;
  hint?: string;
  containerStyle?: StyleProp<ViewStyle>;
  ref?: Ref<React.ComponentRef<typeof TextInput>>;
};

export function TextField({
  label,
  icon: Icon,
  prefix,
  right,
  error,
  hint,
  containerStyle,
  editable = true,
  style,
  onFocus,
  onBlur,
  ref,
  ...input
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const hasError = !!error;

  return (
    <View style={containerStyle}>
      {!!label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.field,
          focused && styles.fieldFocused,
          hasError && styles.fieldError,
          !editable && styles.fieldDisabled,
        ]}
      >
        {Icon && <Icon size={18} color={colors.textMuted} strokeWidth={1.8} />}
        {!!prefix && (
          <>
            <Text style={styles.prefix}>{prefix}</Text>
            <View style={styles.divider} />
          </>
        )}

        <TextInput
          ref={ref}
          placeholderTextColor={colors.textMuted}
          accessibilityLabel={label}
          {...input}
          editable={editable}
          onFocus={e => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[styles.input, style]}
        />

        {right}
      </View>

      {hasError ? (
        <Text style={[styles.message, styles.error]}>{error}</Text>
      ) : (
        !!hint && <Text style={styles.message}>{hint}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: 8,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.medium,
    color: colors.text,
  },
  field: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  fieldFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  fieldError: {
    borderColor: ERROR,
  },
  fieldDisabled: {
    opacity: 0.6,
  },
  prefix: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  divider: {
    width: 1,
    height: 22,
    backgroundColor: colors.border,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    fontFamily: fonts.medium,
    color: colors.text,
    paddingVertical: 0,
    includeFontPadding: false,
  },
  message: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  error: {
    color: ERROR,
  },
});
