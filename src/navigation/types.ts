import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BookingStatus } from '../data/bookings';
import type { PickedLocation } from '../services/places';

export type TabParamList = {
  Home: { location?: PickedLocation } | undefined;
  Messages: undefined;
  Bookings: { tab?: BookingStatus } | undefined;
  Account: undefined;
};

export type RootStackParamList = {
  Welcome: undefined;
  Register: undefined;
  Otp: { phone: string };
  CompleteProfile: { phone: string };
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  Services: { serviceId?: string } | undefined;
  ComparePrices: { serviceId: string };
  Profile: { providerId: string };
  Reviews: { providerId: string };
  Chat: { providerId: string };
  BookService: { providerId: string; location?: PickedLocation };
  /** With `providerId` the pick goes back to BookService; without, to Home. */
  LocationPicker: { providerId?: string; initial?: PickedLocation };
};

export type RootScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;
