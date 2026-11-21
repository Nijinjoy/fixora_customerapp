import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate(...args: Parameters<typeof navigationRef.navigate>) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(...args);
  }
}
