import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { getGoogleProfile } from '../services/googleProfile';
import type { GoogleProfile } from '../services/googleProfile';

export function useGoogleAutofill(onFill: (profile: GoogleProfile) => void) {
  const [loading, setLoading] = useState(false);
  const [filled, setFilled] = useState(false);

  const fill = useCallback(async () => {
    setLoading(true);
    try {
      onFill(await getGoogleProfile());
      setFilled(true);
    } catch (e) {
      Alert.alert(
        'Google unavailable',
        e instanceof Error ? e.message : 'Please enter your details manually.',
      );
    } finally {
      setLoading(false);
    }
  }, [onFill]);

  return { fill, loading, filled };
}
