import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowRight,
  BadgeCheck,
  Mail,
  Phone,
  UserRound,
} from 'lucide-react-native';
import { Button } from '../components/common/Button';
import { GoogleIcon } from '../components/common/GoogleIcon';
import { TextField } from '../components/common/TextField';
import { FormTextField } from '../components/form/FormTextField';
import { ProfilePhotoPicker } from '../components/profile/ProfilePhotoPicker';
import { useGoogleAutofill } from '../hooks/useGoogleAutofill';
import { useKeyboardAwareScroll } from '../hooks/useKeyboardAwareScroll';
import { profileSchema } from '../schemas/profileSchema';
import type {
  ProfileFormInput,
  ProfileFormOutput,
} from '../schemas/profileSchema';
import type { GoogleProfile } from '../services/googleProfile';
import { useSessionStore } from '../store/sessionStore';
import { colors, gradients } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { formatPhone } from '../utils/phone';

const DEFAULT_VALUES: ProfileFormInput = {
  name: '',
  email: '',
  photo: undefined,
};

export function CompleteProfileScreen() {
  const phone = useSessionStore(s => s.phone) ?? '';
  const completeProfile = useSessionStore(s => s.completeProfile);
  const insets = useSafeAreaInsets();
  const { keyboardHeight, keyboardOpen, scrollRef, onContentSizeChange } =
    useKeyboardAwareScroll();

  const {
    control,
    handleSubmit,
    setValue,
    setFocus,
    getValues,
    formState: { isValid },
  } = useForm<ProfileFormInput, unknown, ProfileFormOutput>({
    resolver: zodResolver(profileSchema),
    mode: 'onTouched',
    defaultValues: DEFAULT_VALUES,
  });
  const photo = useWatch({ control, name: 'photo' });

  const applyGoogleProfile = useCallback(
    (profile: GoogleProfile) => {
      const opts = { shouldValidate: true, shouldDirty: true } as const;
      setValue('name', profile.name, opts);
      setValue('email', profile.email, opts);
      if (!getValues('photo')) {
        setValue('photo', profile.photo);
      }
    },
    [setValue, getValues],
  );
  const google = useGoogleAutofill(applyGoogleProfile);

  const onSubmit = () => {
    handleSubmit(completeProfile)();
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        ref={scrollRef}
        onContentSizeChange={onContentSizeChange}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, { paddingTop: insets.top + 16 }]}>
          <ProfilePhotoPicker
            uri={photo}
            onChange={uri => setValue('photo', uri)}
          />
          <Text style={styles.heroTitle}>Almost there</Text>
          <Text style={styles.heroText}>
            Add a photo and tell us a little about yourself
          </Text>
        </View>

        <View
          style={[
            styles.sheet,
            {
              paddingBottom: keyboardOpen
                ? keyboardHeight + 16
                : insets.bottom + 16,
            },
          ]}
        >
          <Text style={styles.title}>Your details</Text>

          <Button
            title={
              google.filled ? 'Filled from Google' : 'Fill details with Google'
            }
            variant="outline"
            size="md"
            left={<GoogleIcon size={20} />}
            loading={google.loading}
            onPress={google.fill}
            style={styles.googleButton}
          />

          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>or enter manually</Text>
            <View style={styles.orLine} />
          </View>

          <TextField
            label="Mobile number"
            icon={Phone}
            value={formatPhone(phone)}
            readOnly
            right={<VerifiedBadge />}
            containerStyle={styles.field}
          />

          <FormTextField
            control={control}
            name="name"
            label="Full name"
            icon={UserRound}
            placeholder="Your name"
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => setFocus('email')}
            containerStyle={styles.field}
          />

          <FormTextField
            control={control}
            name="email"
            label="Email (optional)"
            icon={Mail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="done"
            onSubmitEditing={onSubmit}
            containerStyle={styles.field}
          />

          <Button
            title="Continue"
            iconRight={ArrowRight}
            onPress={onSubmit}
            accessibilityState={{ disabled: !isValid }}
            style={[styles.continueButton, !isValid && styles.dimmed]}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function VerifiedBadge() {
  return (
    <View style={styles.verified}>
      <BadgeCheck size={18} color={colors.success} strokeWidth={2} />
      <Text style={styles.verifiedText}>Verified</Text>
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
    color: colors.onPrimary,
  },
  heroText: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.onPrimaryMuted,
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
  },
  orRow: {
    marginTop: 16,
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
  verified: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verifiedText: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.success,
  },
  continueButton: {
    marginTop: 22,
  },
  dimmed: {
    opacity: 0.5,
  },
});
