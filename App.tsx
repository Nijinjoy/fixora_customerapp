import { NavigationContainer } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { StatusBar } from 'react-native';
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { navigationRef, RootNavigator } from './src/navigation';
import { AppProviders } from './src/providers/AppProviders';
import { SplashScreen } from './src/screens/SplashScreen';
import { useSessionStore } from './src/store/sessionStore';

function App() {
  const hydrated = useSessionStore(s => s.hydrated);
  const [splashDone, setSplashDone] = useState(false);
  const onSplashFinish = useCallback(() => setSplashDone(true), []);

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <AppProviders>
        <StatusBar barStyle="dark-content" />
        {hydrated && (
          <NavigationContainer ref={navigationRef}>
            <RootNavigator />
          </NavigationContainer>
        )}
        {!(splashDone && hydrated) && (
          <SplashScreen onFinish={onSplashFinish} />
        )}
      </AppProviders>
    </SafeAreaProvider>
  );
}

export default App;
