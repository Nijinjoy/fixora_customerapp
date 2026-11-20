import { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import type {
  ImagePickerResponse,
  OptionsCommon,
} from 'react-native-image-picker';
import { Camera, ImageIcon, Trash2, UserRound } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

const SIZE = 92;

const PICKER_OPTIONS: OptionsCommon = {
  mediaType: 'photo',
  maxWidth: 800,
  maxHeight: 800,
  quality: 0.8,
};

type Props = {
  uri?: string;
  onChange: (uri: string | undefined) => void;
};

/** Round profile photo with a camera badge; tap to take, pick or remove a photo. */
export function ProfilePhotoPicker({ uri, onChange }: Props) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  const handle = (res: ImagePickerResponse) => {
    if (res.didCancel) {
      return;
    }
    if (res.errorCode) {
      Alert.alert(
        'Couldn’t get photo',
        res.errorCode === 'camera_unavailable'
          ? 'No camera is available on this device.'
          : res.errorCode === 'permission'
          ? 'Allow access in Settings to choose a profile photo.'
          : res.errorMessage ?? 'Please try again.',
      );
      return;
    }
    const picked = res.assets?.[0]?.uri;
    if (picked) {
      onChange(picked);
    }
  };

  // Close the sheet first; opening a picker over a Modal is unreliable on iOS.
  const run = (action: () => unknown) => {
    setOpen(false);
    setTimeout(async () => {
      try {
        await action();
      } catch (e) {
        // e.g. native module missing because the app wasn't rebuilt.
        Alert.alert(
          'Couldn’t open photos',
          e instanceof Error ? e.message : 'Please try again.',
        );
      }
    }, 350);
  };

  const options: {
    label: string;
    icon: LucideIcon;
    onPress: () => void;
    danger?: boolean;
  }[] = [
    {
      label: 'Take photo',
      icon: Camera,
      onPress: () =>
        run(() =>
          launchCamera(
            { ...PICKER_OPTIONS, cameraType: 'front', saveToPhotos: false },
            handle,
          ),
        ),
    },
    {
      label: 'Choose from gallery',
      icon: ImageIcon,
      onPress: () =>
        run(() =>
          launchImageLibrary({ ...PICKER_OPTIONS, selectionLimit: 1 }, handle),
        ),
    },
  ];
  if (uri) {
    options.push({
      label: 'Remove photo',
      icon: Trash2,
      danger: true,
      onPress: () => run(() => onChange(undefined)),
    });
  }

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={uri ? 'Change profile photo' : 'Add profile photo'}
        style={styles.wrap}
      >
        <View style={styles.circle}>
          {uri ? (
            <Image source={{ uri }} style={styles.image} />
          ) : (
            <UserRound size={46} color="#FFFFFF" strokeWidth={1.6} />
          )}
        </View>
        <View style={styles.badge}>
          <Camera size={16} color={colors.primary} strokeWidth={2.2} />
        </View>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setOpen(false)}
          accessibilityLabel="Close"
        />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>Profile photo</Text>
          {options.map(({ label, icon: Icon, onPress, danger }) => (
            <Pressable
              key={label}
              onPress={onPress}
              style={({ pressed }) => [
                styles.option,
                pressed && styles.optionPressed,
              ]}
              accessibilityRole="button"
            >
              <View
                style={[styles.optionIcon, danger && styles.optionIconDanger]}
              >
                <Icon
                  size={20}
                  color={danger ? '#E5484D' : colors.primary}
                  strokeWidth={2}
                />
              </View>
              <Text style={[styles.optionText, danger && styles.danger]}>
                {label}
              </Text>
            </Pressable>
          ))}
          <Pressable
            onPress={() => setOpen(false)}
            style={styles.cancel}
            accessibilityRole="button"
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: SIZE,
    height: SIZE,
  },
  circle: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    right: 0,
    bottom: 2,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 3px 8px rgba(10, 40, 100, 0.25)',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 20, 35, 0.45)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.text,
    marginBottom: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  optionPressed: {
    backgroundColor: colors.background,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconDanger: {
    backgroundColor: '#FDECEC',
  },
  optionText: {
    fontSize: 15,
    fontFamily: fonts.medium,
    color: colors.text,
  },
  danger: {
    color: '#E5484D',
  },
  cancel: {
    marginTop: 8,
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
});
