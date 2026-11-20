import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { TextInputProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowRight,
  BadgeCheck,
  Mail,
  Phone,
  UserRound,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { GoogleIcon } from '../components/GoogleIcon';
import { ProfilePhotoPicker } from '../components/ProfilePhotoPicker';
import type { RootScreenProps } from '../navigation/types';
import { getGoogleProfile } from '../services/googleProfile';
import { askStartupPermissions } from '../services/permissions';
import { colors, gradients } from '../theme/colors';
import { fonts } from '../theme/fonts';

// Same blue as the splash, welcome, register and OTP screens.
const BRAND_BLUE = '#1F7BF2';
const ERROR = '#E5484D';

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

const formatPhone = (phone: string) =>
  `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;

type FieldProps = TextInputProps & {
  label: string;
  icon: LucideIcon;
  error?: string;
};

function Field({ label, icon: Icon, error, ...input }: FieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.input,
          focused && styles.inputFocused,
          !!error && styles.inputError,
        ]}
      >
        <Icon size={18} color={colors.textMuted} strokeWidth={1.8} />
        <TextInput
          {...input}
          onFocus={e => {
            setFocused(true);
            input.onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            input.onBlur?.(e);
          }}
          placeholderTextColor={colors.textMuted}
          style={styles.inputText}
          accessibilityLabel={label}
        />
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

export function CompleteProfileScreen({
  navigation,
  route,
}: RootScreenProps<'CompleteProfile'>) {
  const { phone } = route.params;
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [photo, setPhoto] = useState<string>();
  const [fromGoogle, setFromGoogle] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const nameValid = name.trim().length >= 2;
  const emailValid = email.length === 0 || isValidEmail(email.trim());
  const canContinue = nameValid && emailValid;

  const onGoogle = async () => {
    setLoadingGoogle(true);
    try {
      const profile = await getGoogleProfile();
      setName(profile.name);
      setEmail(profile.email);
      // Keep a photo the user picked themselves.
      setPhoto(current => current ?? profile.photo);
      setFromGoogle(true);
    } catch (e) {
      Alert.alert(
        'Google unavailable',
        e instanceof Error ? e.message : 'Please enter your details manually.',
      );
    } finally {
      setLoadingGoogle(false);
    }
  };

  const onContinue = () => {
    setEmailTouched(true);
    if (canContinue) {
      // TODO: save { phone, name, email, photo } to the account once there's a backend.
      navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
      // Ask once the dashboard is on screen, so the prompt has context.
      setTimeout(askStartupPermissions, 600);
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
        <View style={[styles.hero, { paddingTop: insets.top + 16 }]}>
          <ProfilePhotoPicker uri={photo} onChange={setPhoto} />
          <Text style={styles.heroTitle}>Almost there</Text>
          <Text style={styles.heroText}>
            Add a photo and tell us a little about yourself
          </Text>
        </View>

        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <Text style={styles.title}>Your details</Text>

          <Pressable
            style={({ pressed }) => [
              styles.googleButton,
              pressed && styles.googlePressed,
              loadingGoogle && styles.buttonDisabled,
            ]}
            onPress={onGoogle}
            disabled={loadingGoogle}
            accessibilityRole="button"
            accessibilityLabel="Fill details with Google"
          >
            <GoogleIcon size={20} />
            <Text style={styles.googleText}>
              {fromGoogle ? 'Filled from Google' : 'Fill details with Google'}
            </Text>
          </Pressable>

          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>or enter manually</Text>
            <View style={styles.orLine} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Mobile number</Text>
            <View style={[styles.input, styles.inputLocked]}>
              <Phone size={18} color={colors.textMuted} strokeWidth={1.8} />
              <Text style={styles.lockedText}>{formatPhone(phone)}</Text>
              <BadgeCheck size={18} color={colors.success} strokeWidth={2} />
              <Text style={styles.verified}>Verified</Text>
            </View>
          </View>

          <Field
            label="Full name"
            icon={UserRound}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            returnKeyType="next"
          />

          <Field
            label="Email (optional)"
            icon={Mail}
            value={email}
            onChangeText={setEmail}
            onBlur={() => setEmailTouched(true)}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="done"
            onSubmitEditing={onContinue}
            error={
              emailTouched && !emailValid
                ? 'Enter a valid email address'
                : undefined
            }
          />

          <Pressable
            style={({ pressed }) => [
              styles.button,
              !canContinue && styles.buttonDisabled,
              pressed && canContinue && styles.pressed,
            ]}
            onPress={onContinue}
            accessibilityRole="button"
            accessibilityLabel="Continue"
            accessibilityState={{ disabled: !canContinue }}
          >
            <Text style={styles.buttonText}>Continue</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  heroTitle: {
    marginTop: 10,
    fontSize: 24,
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
    paddingTop: 24,
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  googleButton: {
    marginTop: 16,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  googlePressed: {
    backgroundColor: colors.background,
  },
  googleText: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  orRow: {
    marginTop: 16,
    marginBottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  orText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  field: {
    marginTop: 12,
  },
  label: {
    marginBottom: 6,
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.text,
  },
  input: {
    height: 50,
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
    borderColor: ERROR,
  },
  inputLocked: {
    gap: 8,
  },
  inputText: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.medium,
    color: colors.text,
    paddingVertical: 0,
  },
  lockedText: {
    flex: 1,
    marginLeft: 2,
    fontSize: 15,
    fontFamily: fonts.medium,
    color: colors.text,
  },
  verified: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.success,
  },
  error: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: fonts.regular,
    color: ERROR,
  },
  button: {
    marginTop: 22,
    height: 52,
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
