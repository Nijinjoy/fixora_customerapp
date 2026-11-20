import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MapView, { type Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Search, X } from 'lucide-react-native';
import type { RootScreenProps } from '../navigation/types';
import {
  DEFAULT_CENTER,
  getPlace,
  newSessionToken,
  type PickedLocation,
  type PlaceSuggestion,
  reverseGeocode,
  searchPlaces,
} from '../services/places';
import { colors, gradients, shadow } from '../theme/colors';
import { fonts } from '../theme/fonts';

const GUTTER = 16;
const ZOOM = { latitudeDelta: 0.008, longitudeDelta: 0.008 };

export function LocationPickerScreen({
  navigation,
  route,
}: RootScreenProps<'LocationPicker'>) {
  const { providerId, initial } = route.params;
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [sessionToken, setSessionToken] = useState(newSessionToken);

  const [picked, setPicked] = useState<PickedLocation | undefined>(initial);
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState('');
  const [dragging, setDragging] = useState(false);

  const center = useRef(initial ?? DEFAULT_CENTER);
  // Set when the map moves to a place we already have details for, so the
  // move doesn't trigger a reverse geocode that would replace them.
  const skipGeocode = useRef(Boolean(initial));
  const geocodeId = useRef(0);

  // Debounced autocomplete.
  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setSuggestions([]);
      setSearchError('');
      return;
    }
    let active = true;
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchPlaces(term, sessionToken, center.current);
        if (active) {
          setSuggestions(results);
          setSearchError('');
        }
      } catch {
        if (active) {
          setSearchError("Couldn't load places. Check your connection.");
        }
      } finally {
        if (active) {
          setSearching(false);
        }
      }
    }, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, sessionToken]);

  const resolveCenter = async () => {
    const id = ++geocodeId.current;
    setResolving(true);
    setResolveError('');
    try {
      const location = await reverseGeocode(center.current);
      if (id === geocodeId.current) {
        setPicked(location);
      }
    } catch {
      if (id === geocodeId.current) {
        setPicked(undefined);
        setResolveError("Couldn't find an address here. Move the pin a bit.");
      }
    } finally {
      if (id === geocodeId.current) {
        setResolving(false);
      }
    }
  };

  const onRegionChangeComplete = (region: Region) => {
    setDragging(false);
    center.current = {
      latitude: region.latitude,
      longitude: region.longitude,
    };
    if (skipGeocode.current) {
      skipGeocode.current = false;
      return;
    }
    resolveCenter();
  };

  const choose = async (suggestion: PlaceSuggestion) => {
    Keyboard.dismiss();
    setQuery('');
    setSuggestions([]);
    setResolving(true);
    setResolveError('');
    const id = ++geocodeId.current;
    try {
      const place = await getPlace(suggestion.placeId, sessionToken);
      if (id !== geocodeId.current) {
        return;
      }
      setPicked({
        ...place,
        formattedAddress:
          place.formattedAddress ||
          [suggestion.mainText, suggestion.secondaryText].join(', '),
      });
      skipGeocode.current = true;
      mapRef.current?.animateToRegion(
        { latitude: place.latitude, longitude: place.longitude, ...ZOOM },
        500,
      );
    } catch {
      if (id === geocodeId.current) {
        setResolveError("Couldn't open that place. Try another result.");
      }
    } finally {
      if (id === geocodeId.current) {
        setResolving(false);
      }
      // A session ends with the details request.
      setSessionToken(newSessionToken());
    }
  };

  const confirm = () => {
    if (!picked) {
      return;
    }
    if (providerId) {
      navigation.popTo('BookService', { providerId, location: picked });
    } else {
      navigation.popTo('Tabs', {
        screen: 'Home',
        params: { location: picked },
      });
    }
  };

  const showList = query.trim().length >= 2;

  return (
    <View style={styles.screen}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={{ ...(initial ?? DEFAULT_CENTER), ...ZOOM }}
        onRegionChange={() => !dragging && setDragging(true)}
        onRegionChangeComplete={onRegionChangeComplete}
        onMapReady={() => {
          if (!initial) {
            resolveCenter();
          }
        }}
        showsCompass={false}
        toolbarEnabled={false}
        moveOnMarkerPress={false}
        onPress={Keyboard.dismiss}
      />

      {/* Fixed pin: the map moves underneath it. */}
      <View style={styles.pinWrap} pointerEvents="none">
        <View style={[styles.pin, dragging && styles.pinLifted]}>
          <MapPin
            size={40}
            color="#FFFFFF"
            fill={colors.primary}
            strokeWidth={1.5}
          />
        </View>
        <View style={styles.pinShadow} />
      </View>

      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <View style={styles.searchRow}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.back}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
          >
            <ArrowLeft size={22} color={colors.text} strokeWidth={2} />
          </Pressable>
          <View style={styles.search}>
            <Search size={18} color={colors.textMuted} strokeWidth={1.8} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search area, street, landmark..."
              placeholderTextColor={colors.textMuted}
              style={styles.searchText}
              autoFocus={!initial}
              autoCorrect={false}
              returnKeyType="search"
              accessibilityLabel="Search location"
            />
            {searching ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : query ? (
              <Pressable
                onPress={() => setQuery('')}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
              >
                <X size={18} color={colors.textMuted} strokeWidth={2} />
              </Pressable>
            ) : null}
          </View>
        </View>

        {showList && (
          <View style={styles.results}>
            <FlatList
              data={suggestions}
              keyExtractor={item => item.placeId}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item, index }) => (
                <Pressable
                  onPress={() => choose(item)}
                  style={[styles.result, index > 0 && styles.resultBorder]}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.mainText}, ${item.secondaryText}`}
                >
                  <View style={styles.resultIcon}>
                    <MapPin
                      size={16}
                      color={colors.primary}
                      strokeWidth={1.8}
                    />
                  </View>
                  <View style={styles.resultBody}>
                    <Text style={styles.resultMain} numberOfLines={1}>
                      {item.mainText}
                    </Text>
                    {item.secondaryText ? (
                      <Text style={styles.resultSecondary} numberOfLines={1}>
                        {item.secondaryText}
                      </Text>
                    ) : null}
                  </View>
                </Pressable>
              )}
              ListEmptyComponent={
                searching ? undefined : (
                  <Text style={styles.resultEmpty}>
                    {searchError || 'No places found.'}
                  </Text>
                )
              }
            />
          </View>
        )}
      </View>

      <View
        style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}
      >
        <Text style={styles.sheetLabel}>
          {providerId ? 'Service location' : 'Your location'}
        </Text>
        <View style={styles.addressRow}>
          <View style={styles.addressIcon}>
            <MapPin size={18} color={colors.primary} strokeWidth={1.8} />
          </View>
          <View style={styles.addressBody}>
            {resolving ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.addressMuted}>Finding address...</Text>
              </View>
            ) : picked ? (
              <>
                <Text style={styles.addressMain} numberOfLines={1}>
                  {picked.area ?? picked.city ?? 'Selected location'}
                </Text>
                <Text style={styles.addressMuted} numberOfLines={2}>
                  {picked.formattedAddress}
                </Text>
              </>
            ) : (
              <Text style={styles.addressMuted}>
                {resolveError || 'Search or move the map to place the pin.'}
              </Text>
            )}
          </View>
        </View>
        <Text style={styles.hint}>Drag the map to place the pin exactly.</Text>
        <Pressable
          onPress={confirm}
          disabled={!picked || resolving}
          style={[
            styles.confirm,
            (!picked || resolving) && styles.confirmDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Confirm location"
          accessibilityState={{ disabled: !picked || resolving }}
        >
          <Text style={styles.confirmText}>Confirm Location</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  pinWrap: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    // Pin tip sits on the map centre.
    marginTop: -40,
    alignItems: 'center',
  },
  pin: {
    width: 40,
    height: 40,
  },
  pinLifted: {
    transform: [{ translateY: -10 }],
  },
  pinShadow: {
    width: 10,
    height: 4,
    borderRadius: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  top: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: GUTTER,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  back: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.surface,
    boxShadow: shadow.nav,
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.surface,
    boxShadow: shadow.nav,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
  },
  searchText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.text,
    paddingVertical: 0,
  },
  results: {
    marginTop: 8,
    maxHeight: 320,
    borderRadius: 16,
    backgroundColor: colors.surface,
    boxShadow: shadow.nav,
    overflow: 'hidden',
  },
  result: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  resultBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  resultIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultBody: {
    flex: 1,
  },
  resultMain: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  resultSecondary: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  resultEmpty: {
    padding: 16,
    textAlign: 'center',
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 18,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: colors.surface,
    boxShadow: '0px -6px 20px rgba(31, 52, 102, 0.12)',
  },
  sheetLabel: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addressRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 12,
    minHeight: 48,
  },
  addressIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressBody: {
    flex: 1,
    justifyContent: 'center',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addressMain: {
    fontSize: 16,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  addressMuted: {
    marginTop: 2,
    fontSize: 13,
    fontFamily: fonts.regular,
    lineHeight: 18,
    color: colors.textMuted,
  },
  hint: {
    marginTop: 12,
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  confirm: {
    marginTop: 14,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    experimental_backgroundImage: gradients.primaryButton,
  },
  confirmDisabled: {
    opacity: 0.55,
  },
  confirmText: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: '#FFFFFF',
  },
});
