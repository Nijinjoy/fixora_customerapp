import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Bell } from 'lucide-react-native';
import {
  locationLabel,
  shortLabel,
  useCurrentLocation,
} from '../services/currentLocation';
import type { PickedLocation } from '../services/places';
import { colors, shadow } from '../theme/colors';
import { fonts } from '../theme/fonts';

/** Longest location text shown in the header before it is cut with "…". */
const MAX_LABEL_LENGTH = 24;

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

type Props = {
  unread: number;
  /** A place picked on the map; shown instead of the device location. */
  selected?: PickedLocation;
  /** Open the map picker, centred on `initial` if known. */
  onPickLocation: (initial?: PickedLocation) => void;
};

export function HomeHeader({ unread, selected, onPickLocation }: Props) {
  const { state } = useCurrentLocation({ askOnMount: true });
  const gps = state.status === 'ready' ? state.location : undefined;
  const noGps =
    state.status === 'denied' ||
    state.status === 'blocked' ||
    state.status === 'error';
  // Without GPS the map is the way forward, so say that instead of the error.
  const label = selected
    ? shortLabel(selected)
    : noGps
    ? 'Select your location'
    : locationLabel(state);
  const needsAction = !selected && noGps;

  return (
    <View style={styles.row}>
      <View style={styles.user}>
        <Pressable
          style={styles.location}
          onPress={() => onPickLocation(selected ?? gps)}
          accessibilityRole="button"
          accessibilityLabel={`Location: ${label}. Change on map`}
        >
          <Text style={styles.caption}>
            {selected ? 'Selected location' : 'Current location'}
          </Text>
          <Text
            style={[styles.placeText, needsAction && styles.placeAction]}
            numberOfLines={1}
          >
            {truncate(label, MAX_LABEL_LENGTH)}
          </Text>
        </Pressable>
      </View>
      <Pressable style={styles.bell} accessibilityLabel="Notifications">
        <Bell size={20} color={colors.text} strokeWidth={1.8} />
        {unread > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unread}</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  user: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 12,
  },
  location: {
    flex: 1,
  },
  caption: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  placeText: {
    marginTop: 2,
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.text,
  },
  placeAction: {
    color: colors.primary,
  },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadow.card,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 9,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
  },
});
