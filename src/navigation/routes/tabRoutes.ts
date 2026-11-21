import { AccountScreen } from '../../screens/AccountScreen';
import { BookingsScreen } from '../../screens/BookingsScreen';
import { HomeScreen } from '../../screens/HomeScreen';
import { MessagesScreen } from '../../screens/MessagesScreen';
import type { TabRoutes } from '../types';

export const tabRoutes: TabRoutes = {
  Home: { component: HomeScreen },
  Messages: { component: MessagesScreen },
  Bookings: { component: BookingsScreen },
  Account: { component: AccountScreen },
};
