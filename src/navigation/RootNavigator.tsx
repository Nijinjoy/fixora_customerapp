import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ComponentType } from 'react';
import { useSessionStatus } from '../store/sessionStore';
import { colors } from '../theme/colors';
import { appRoutes } from './routes/appRoutes';
import { authRoutes } from './routes/authRoutes';
import { onboardingRoutes } from './routes/onboardingRoutes';
import type { RootStackParamList, StackRoutes } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function renderScreens<P extends Partial<RootStackParamList>>(
  routes: StackRoutes<P>,
) {
  return (Object.keys(routes) as (keyof StackRoutes<P>)[]).map(name => (
    <Stack.Screen
      key={name}
      name={name}
      component={routes[name].component as ComponentType<object>}
      options={routes[name].options}
    />
  ));
}

export function RootNavigator() {
  const status = useSessionStatus();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {status === 'signedOut' && (
        <Stack.Group>{renderScreens(authRoutes)}</Stack.Group>
      )}
      {status === 'needsProfile' && (
        <Stack.Group>{renderScreens(onboardingRoutes)}</Stack.Group>
      )}
      {status === 'signedIn' && (
        <Stack.Group>{renderScreens(appRoutes)}</Stack.Group>
      )}
    </Stack.Navigator>
  );
}
