import { useState } from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight, Phone } from 'lucide-react-native';
import { Button } from '../components/common/Button';
import { TextField } from '../components/common/TextField';
import { useKeyboardAwareScroll } from '../hooks/useKeyboardAwareScroll';
import type { RootScreenProps } from '../navigation/types';
import { colors, gradients } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { getPhoneError, isValidPhone, normalizePhone } from '../utils/phone';
import { appIcon } from '../assets/images';

export function RegisterScreen({ navigation }: RootScreenProps<'Register'>) {
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [touched, setTouched] = useState(false);

  const { keyboardHeight, keyboardOpen, scrollRef, onContentSizeChange } =
    useKeyboardAwareScroll();

  const valid = isValidPhone(phone);
  const error = getPhoneError(phone, touched);

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
        onContentSizeChange={onContentSizeChange}
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
            source={appIcon}
            style={keyboardOpen ? styles.logoCompact : styles.logo}
            accessibilityIgnoresInvertColors
          />
          <Text style={[styles.brand, keyboardOpen && styles.brandCompact]}>
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
              paddingBottom: keyboardOpen
                ? keyboardHeight + 16
                : insets.bottom + 24,
            },
          ]}
        >
          <Text style={styles.title}>Login or sign up</Text>
          <Text style={styles.subtitle}>
            Enter your mobile number to continue
          </Text>

          <TextField
            label="Mobile number"
            icon={Phone}
            prefix="+91"
            value={phone}
            onChangeText={text => setPhone(normalizePhone(text))}
            onBlur={() => setTouched(true)}
            onSubmitEditing={onContinue}
            placeholder="0000000000"
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            autoComplete="tel"
            maxLength={16}
            returnKeyType="done"
            style={styles.inputText}
            containerStyle={styles.field}
            error={error}
          />

          <Button
            title="Continue"
            iconRight={ArrowRight}
            onPress={onContinue}
            accessibilityState={{ disabled: !valid }}
            style={[styles.button, !valid && styles.buttonDisabled]}
          />

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
    experimental_backgroundImage: gradients.hero,
    backgroundColor: colors.primary,
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
  brand: {
    marginTop: 14,
    fontSize: 30,
    fontFamily: fonts.extrabold,
    letterSpacing: 0.5,
    color: colors.onPrimary,
  },
  brandCompact: {
    marginTop: 8,
    fontSize: 22,
  },
  heroText: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.onPrimaryMuted,
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
  field: {
    marginTop: 28,
  },
  inputText: {
    letterSpacing: 0.5,
  },
  button: {
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.5,
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
