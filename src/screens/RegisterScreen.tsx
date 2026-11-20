import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  Image,
  Keyboard,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight, Phone } from 'lucide-react-native';
import type { RootScreenProps } from '../navigation/types';
import { colors, gradients } from '../theme/colors';
import { fonts } from '../theme/fonts';

// Same blue as the splash and welcome screens.
const BRAND_BLUE = '#1F7BF2';

/** Indian mobile numbers: 10 digits starting with 6–9. */
const isValidPhone = (value: string) => /^[6-9]\d{9}$/.test(value);

export function RegisterScreen({ navigation }: RootScreenProps<'Register'>) {
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const keyboardOpen = keyboardHeight > 0;

  // Edge-to-edge is on, so Android no longer resizes the window for the
  // keyboard. Add the keyboard height as space under the sheet and switch the
  // hero to a compact logo so it stays visible; animate it so nothing jumps.
  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const animate = () =>
      LayoutAnimation.configureNext(
        LayoutAnimation.create(220, 'easeInEaseOut', 'opacity'),
      );
    const show = Keyboard.addListener(showEvent, e => {
      animate();
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hide = Keyboard.addListener(hideEvent, () => {
      animate();
      setKeyboardHeight(0);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const valid = isValidPhone(phone);
  const tooLong = phone.length > 10;
  // Too many digits is wrong straight away; too few only once they leave the field.
  const showError = tooLong || (touched && phone.length > 0 && !valid);

  const onChange = (text: string) => {
    setPhone(text.replace(/\D/g, '').slice(0, 15));
  };

  const onContinue = () => {
    setTouched(true);
    if (valid) {
      navigation.navigate('Otp', { phone });
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          // Only scrolls on small screens where even the compact hero and the
          // sheet don't fit above the keyboard.
          if (keyboardOpen) {
            scrollRef.current?.scrollToEnd({ animated: true });
          }
        }}
      >
        <View
          style={[
            styles.hero,
            keyboardOpen
              ? [styles.heroCompact, { paddingTop: insets.top + 12 }]
              : { paddingTop: insets.top + 32 },
          ]}
        >
          <Image
            source={require('../../assets/brand/splash-logo.png')}
            style={keyboardOpen ? styles.logoCompact : styles.logo}
            accessibilityIgnoresInvertColors
          />
          <Text style={keyboardOpen ? styles.brandCompact : styles.brand}>
            Fixora
          </Text>
          {!keyboardOpen && (
            <Text style={styles.heroText}>
              Trusted pros in your neighbourhood
            </Text>
          )}
        </View>

        <View
          style={[
            styles.sheet,
            {
              paddingBottom:
                keyboardOpen ? keyboardHeight + 16 : insets.bottom + 24,
            },
          ]}
        >
          <Text style={styles.title}>Login or sign up</Text>
          <Text style={styles.subtitle}>
            Enter your mobile number to continue
          </Text>

          <Text style={styles.label}>Mobile number</Text>
          <View
            style={[
              styles.input,
              focused && styles.inputFocused,
              showError && styles.inputError,
            ]}
          >
            <Phone size={18} color={colors.textMuted} strokeWidth={1.8} />
            <Text style={styles.code}>+91</Text>
            <View style={styles.divider} />
            <TextInput
              value={phone}
              onChangeText={onChange}
              onFocus={() => setFocused(true)}
              onBlur={() => {
                setFocused(false);
                setTouched(true);
              }}
              onSubmitEditing={onContinue}
              placeholder="98765 43210"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              autoComplete="tel"
              maxLength={15}
              returnKeyType="done"
              style={styles.inputText}
              accessibilityLabel="Mobile number"
            />
          </View>
          {showError && (
            <Text style={styles.error}>
              {tooLong
                ? 'Mobile number must be exactly 10 digits'
                : 'Enter a valid 10-digit mobile number'}
            </Text>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.button,
              !valid && styles.buttonDisabled,
              pressed && valid && styles.pressed,
            ]}
            onPress={onContinue}
            accessibilityRole="button"
            accessibilityLabel="Continue"
            accessibilityState={{ disabled: !valid }}
          >
            <Text style={styles.buttonText}>Continue</Text>
            <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.2} />
          </Pressable>

          <Text style={styles.terms}>
            By continuing, you agree to our{' '}
            <Text style={styles.link}>Terms of Service</Text> and{' '}
            <Text style={styles.link}>Privacy Policy</Text>.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BRAND_BLUE,
  },
  scroll: {
    flexGrow: 1,
  },
  hero: {
    flex: 1,
    minHeight: 260,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  heroCompact: {
    minHeight: 0,
    paddingBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
  },
  logoCompact: {
    width: 72,
    height: 72,
  },
  brandCompact: {
    // Same transparent-padding offset as `brand`, scaled to the smaller logo.
    marginTop: -13,
    fontSize: 22,
    fontFamily: fonts.extrabold,
    letterSpacing: 0.5,
    color: '#FFFFFF',
  },
  brand: {
    // The logo PNG has ~23px of transparent padding below the mark.
    marginTop: -22,
    fontSize: 30,
    fontFamily: fonts.extrabold,
    letterSpacing: 0.5,
    color: '#FFFFFF',
  },
  heroText: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  label: {
    marginTop: 28,
    marginBottom: 8,
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.text,
  },
  input: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  inputError: {
    borderColor: '#E5484D',
  },
  code: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  divider: {
    width: 1,
    height: 22,
    backgroundColor: colors.border,
  },
  inputText: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.medium,
    color: colors.text,
    letterSpacing: 0.5,
    paddingVertical: 0,
  },
  error: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: fonts.regular,
    color: '#E5484D',
  },
  button: {
    marginTop: 24,
    height: 54,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    experimental_backgroundImage: gradients.primaryButton,
    backgroundColor: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: fonts.semibold,
    color: '#FFFFFF',
  },
  terms: {
    marginTop: 20,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    textAlign: 'center',
  },
  link: {
    fontFamily: fonts.medium,
    color: colors.primary,
  },
});
