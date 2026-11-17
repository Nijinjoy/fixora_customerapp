/**
 * @format
 */

import {
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <SafeAreaView
        style={[styles.container, isDarkMode ? styles.dark : styles.light]}
      >
        <View style={styles.center}>
          <Text style={[styles.title, isDarkMode && styles.titleDark]}>
            Hello World
          </Text>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#000000',
  },
  titleDark: {
    color: '#FFFFFF',
  },
  light: {
    backgroundColor: '#FFFFFF',
  },
  dark: {
    backgroundColor: '#000000',
  },
});

export default App;
