/**
 * @format
 */

import { useCallback, useState } from 'react';
import { StatusBar } from 'react-native';
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { SplashScreen } from './src/components/SplashScreen';
import { RootNavigator } from './src/navigation/RootNavigator';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const hideSplash = useCallback(() => setShowSplash(false), []);

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <StatusBar barStyle="dark-content" />
      <RootNavigator />
      {showSplash && <SplashScreen onFinish={hideSplash} />}
    </SafeAreaProvider>
  );
}

export default App;
