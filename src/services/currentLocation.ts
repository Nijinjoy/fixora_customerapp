import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {
  check,
  openSettings,
  PERMISSIONS,
  request,
  RESULTS,
} from 'react-native-permissions';
import { reverseGeocode } from './places';
import type { Coordinates, PickedLocation } from './places';

const LOCATION = Platform.select({
  ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
  default: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
});

function getPosition(): Promise<Coordinates> {
  return new Promise((resolve, reject) =>
    Geolocation.getCurrentPosition(
      ({ coords }) =>
        resolve({ latitude: coords.latitude, longitude: coords.longitude }),
      error => reject(new Error(error.message)),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 },
    ),
  );
}

export type CurrentLocationState =
  | { status: 'loading' }
  | { status: 'ready'; location: PickedLocation }
  | { status: 'denied' }
  | { status: 'blocked' }
  | { status: 'error'; message: string };

export function shortLabel(location: PickedLocation): string {
  const parts = [location.area, location.city].filter(
    (p, i, all): p is string => !!p && all.indexOf(p) === i,
  );
  return parts.length ? parts.join(', ') : location.formattedAddress;
}

export function locationLabel(state: CurrentLocationState): string {
  switch (state.status) {
    case 'loading':
      return 'Fetching location…';
    case 'ready':
      return shortLabel(state.location);
    case 'denied':
      return 'Turn on location';
    case 'blocked':
      return 'Location off · Open Settings';
    case 'error':
      return 'Couldn’t get location · Retry';
  }
}

export function locationNeedsAction(state: CurrentLocationState): boolean {
  return (
    state.status === 'denied' ||
    state.status === 'blocked' ||
    state.status === 'error'
  );
}

export function useCurrentLocation({ askOnMount = false } = {}) {
  const [state, setState] = useState<CurrentLocationState>({
    status: 'loading',
  });

  const load = useCallback(async (ask: 'none' | 'prompt' | 'settings') => {
    setState({ status: 'loading' });
    try {
      let permission = await check(LOCATION);
      if (permission === RESULTS.BLOCKED && ask === 'settings') {
        await openSettings();
      }
      if (permission === RESULTS.DENIED && ask !== 'none') {
        permission = await request(LOCATION);
      }
      if (permission === RESULTS.DENIED || permission === RESULTS.UNAVAILABLE) {
        setState({ status: 'denied' });
        return;
      }
      if (permission === RESULTS.BLOCKED) {
        setState({ status: 'blocked' });
        return;
      }
      const position = await getPosition();
      setState({ status: 'ready', location: await reverseGeocode(position) });
    } catch (e) {
      setState({
        status: 'error',
        message: e instanceof Error ? e.message : 'Could not get location',
      });
    }
  }, []);

  useEffect(() => {
    load(askOnMount ? 'prompt' : 'none');
  }, [load, askOnMount]);

  return {
    state,
    retry: () => load('settings'),
    refresh: () => load('none'),
  };
}
