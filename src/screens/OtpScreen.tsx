import { useEffect, useRef, useState } from 'react';
import type { ComponentRef } from 'react';
import {
  KeyboardAvoidingView,
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
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react-native';
import type { RootScreenProps } from '../navigation/types';
import { colors, gradients } from '../theme/colors';
import { fonts } from '../theme/fonts';

// Same blue as the splash, welcome and register screens.
const BRAND_BLUE = '#1F7BF2';
const CODE_LENGTH = 6;
const RESEND_SECONDS = 30;

const formatPhone = (phone: string) =>
  `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;

export function OtpScreen({ navigation, route }: RootScreenProps<'Otp'>) {
  const { phone } = route.params;
  const insets = useSafeAreaInsets();
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const [code, setCode] = useState('');
  const [focused, setFocused] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  const complete = code.length === CODE_LENGTH;

  useEffect(() => {
    if (secondsLeft === 0) {
      return;
    }
    const timer = setTimeout(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const onChange = (text: string) => {
    setCode(text.replace(/\D/g, '').slice(0, CODE_LENGTH));
  };

  const onResend = () => {
    setCode('');
    setSecondsLeft(RESEND_SECONDS);
    inputRef.current?.focus();
  };

  const onVerify = () => {
    if (complete) {
      // No backend yet: any 6-digit code is accepted.
      // Account is created; now collect the user's details.
      navigation.reset({
        index: 0,
        routes: [{ name: 'CompleteProfile', params: { phone } }],
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior="padding"
    >
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, { paddingTop: insets.top + 12 }]}>
          <Pressable
            style={styles.back}
            onPress={() => navigation.goBack()}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <ArrowLeft size={22} color="#FFFFFF" strokeWidth={2} />
          </Pressable>
          <View style={styles.heroBody}>
            <View style={styles.heroIcon}>
              <ShieldCheck size={40} color="#FFFFFF" strokeWidth={1.8} />
            </View>
            <Text style={styles.heroTitle}>OTP Verification</Text>
            <Text style={styles.heroText}>
              A quick check to keep your account safe
            </Text>
          </View>
        </View>

        <View style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}>
          <Text style={styles.title}>Verify your number</Text>
          <Text style={styles.subtitle}>
            Enter the {CODE_LENGTH}-digit code sent to{'\n'}
            <Text style={styles.phone}>{formatPhone(phone)}</Text>
            {'  '}
            <Text
              style={styles.link}
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
            >
              Edit
            </Text>
          </Text>

          {/* One hidden input drives all boxes, so paste and SMS autofill work. */}
          <Pressable
            style={styles.boxes}
            onPress={() => inputRef.current?.focus()}
            accessibilityLabel="Verification code"
          >
            {Array.from({ length: CODE_LENGTH }, (_, i) => {
              const digit = code[i];
              const active =
                focused &&
                (i === code.length || (complete && i === CODE_LENGTH - 1));
              return (
                <View
                  key={i}
                  style={[
                    styles.box,
                    digit !== undefined && styles.boxFilled,
                    active && styles.boxActive,
                  ]}
                >
                  <Text style={styles.digit}>{digit ?? ''}</Text>
                </View>
              );
            })}
          </Pressable>
          <TextInput
            ref={inputRef}
            value={code}
            onChangeText={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onSubmitEditing={onVerify}
            autoFocus
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete={
              Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'
            }
            maxLength={CODE_LENGTH}
            caretHidden
            style={styles.hiddenInput}
          />

          <View style={styles.resendRow}>
            <Text style={styles.resendText}>Didn't get the code? </Text>
            {secondsLeft > 0 ? (
              <Text style={styles.timer}>
                Resend in 0:{String(secondsLeft).padStart(2, '0')}
              </Text>
            ) : (
              <Text
                style={styles.link}
                onPress={onResend}
                accessibilityRole="button"
              >
                Resend code
              </Text>
            )}
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              !complete && styles.buttonDisabled,
              pressed && complete && styles.pressed,
            ]}
            onPress={onVerify}
            accessibilityRole="button"
            accessibilityLabel="Verify"
            accessibilityState={{ disabled: !complete }}
          >
            <Text style={styles.buttonText}>Verify</Text>
            <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.2} />
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    minHeight: 220,
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    marginTop: 16,
    fontSize: 26,
    fontFamily: fonts.extrabold,
    letterSpacing: 0.5,
    color: '#FFFFFF',
  },
  heroText: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
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
    marginTop: 6,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  phone: {
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  link: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.primary,
  },
  boxes: {
    marginTop: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  box: {
    flex: 1,
    maxWidth: 52,
    aspectRatio: 0.9,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFilled: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primarySoft,
  },
  boxActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  digit: {
    fontSize: 22,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  resendRow: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  timer: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  button: {
    marginTop: 28,
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
});
