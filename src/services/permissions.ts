import { Platform } from 'react-native';
import {
  checkNotifications,
  PERMISSIONS,
  request,
  requestNotifications,
  RESULTS,
  check,
} from 'react-native-permissions';

// Permission prompts never block the user: failures are swallowed.

/**
 * Shows the system "Allow notifications?" prompt if the user hasn't
 * answered it yet. The OS won't show it again once allowed or blocked.
 */
export async function askNotificationPermission(): Promise<void> {
  try {
    const { status } = await checkNotifications();
    // DENIED = not asked yet / still askable; BLOCKED = final.
    if (status === RESULTS.DENIED) {
      await requestNotifications(['alert', 'sound', 'badge']);
    }
  } catch {}
}

const LOCATION = Platform.select({
  ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
  default: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
});

/** Shows the "Allow location while using the app?" prompt if not answered yet. */
export async function askLocationPermission(): Promise<void> {
  try {
    if ((await check(LOCATION)) === RESULTS.DENIED) {
      await request(LOCATION);
    }
  } catch {}
}

/**
 * Asked once the user lands on the dashboard after sign-up: location first
 * (needed to find nearby pros), then notifications. One prompt at a time.
 */
export async function askStartupPermissions(): Promise<void> {
  await askLocationPermission();
  await askNotificationPermission();
}
