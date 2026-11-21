import { Platform } from 'react-native';
import {
  checkNotifications,
  PERMISSIONS,
  request,
  requestNotifications,
  RESULTS,
  check,
} from 'react-native-permissions';

export async function askNotificationPermission(): Promise<void> {
  try {
    const { status } = await checkNotifications();
    if (status === RESULTS.DENIED) {
      await requestNotifications(['alert', 'sound', 'badge']);
    }
  } catch {}
}

const LOCATION = Platform.select({
  ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
  default: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
});

export async function askLocationPermission(): Promise<void> {
  try {
    if ((await check(LOCATION)) === RESULTS.DENIED) {
      await request(LOCATION);
    }
  } catch {}
}

export async function askStartupPermissions(): Promise<void> {
  await askLocationPermission();
  await askNotificationPermission();
}
