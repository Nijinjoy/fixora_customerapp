import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomNav } from '../components/BottomNav';
import { AccountScreen } from '../screens/AccountScreen';
import { BookServiceScreen } from '../screens/BookServiceScreen';
import { BookingsScreen } from '../screens/BookingsScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { ComparePricesScreen } from '../screens/ComparePricesScreen';
import { CompleteProfileScreen } from '../screens/CompleteProfileScreen';
import { LocationPickerScreen } from '../screens/LocationPickerScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MessagesScreen } from '../screens/MessagesScreen';
import { OtpScreen } from '../screens/OtpScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ReviewsScreen } from '../screens/ReviewsScreen';
import { ServicesScreen } from '../screens/ServicesScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { colors } from '../theme/colors';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { RootStackParamList, TabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function renderTabBar(props: BottomTabBarProps) {
  return <BottomNav {...props} />;
}

function MainTabs() {
  return (
    <Tab.Navigator tabBar={renderTabBar} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Bookings" component={BookingsScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Otp" component={OtpScreen} />
        <Stack.Screen
          name="CompleteProfile"
          component={CompleteProfileScreen}
        />
        <Stack.Screen name="Tabs" component={MainTabs} />
        <Stack.Screen name="Services" component={ServicesScreen} />
        <Stack.Screen name="ComparePrices" component={ComparePricesScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Reviews" component={ReviewsScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="BookService" component={BookServiceScreen} />
        <Stack.Screen name="LocationPicker" component={LocationPickerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
