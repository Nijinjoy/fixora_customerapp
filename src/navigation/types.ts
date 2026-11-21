import type {
  BottomTabNavigationOptions,
  BottomTabScreenProps,
} from '@react-navigation/bottom-tabs';
import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import type {
  NativeStackNavigationOptions,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import type { ComponentType } from 'react';
import type { BookingStatus } from '../data/bookings';
import type { PickedLocation } from '../services/places';

export type TabParamList = {
  Home: { location?: PickedLocation } | undefined;
  Messages: undefined;
  Bookings: { tab?: BookingStatus } | undefined;
  Account: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Register: undefined;
  Otp: { phone: string };
};

export type OnboardingStackParamList = {
  CompleteProfile: undefined;
};

export type AppStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  Services: { serviceId?: string } | undefined;
  ComparePrices: { serviceId: string };
  Profile: { providerId: string };
  Reviews: { providerId: string };
  Chat: { providerId: string };
  BookService: { providerId: string; location?: PickedLocation };
  LocationPicker: { providerId?: string; initial?: PickedLocation };
};

export type RootStackParamList = AuthStackParamList &
  OnboardingStackParamList &
  AppStackParamList;

export type RootScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

export type StackRoutes<P extends Partial<RootStackParamList>> = {
  [K in keyof P & keyof RootStackParamList]: {
    component: ComponentType<RootScreenProps<K>>;
    options?: NativeStackNavigationOptions;
  };
};

export type TabRoutes = {
  [K in keyof TabParamList]: {
    component: ComponentType<TabScreenProps<K>>;
    options?: BottomTabNavigationOptions;
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
