import { BookServiceScreen } from '../../screens/BookServiceScreen';
import { ChatScreen } from '../../screens/ChatScreen';
import { ComparePricesScreen } from '../../screens/ComparePricesScreen';
import { LocationPickerScreen } from '../../screens/LocationPickerScreen';
import { ProfileScreen } from '../../screens/ProfileScreen';
import { ReviewsScreen } from '../../screens/ReviewsScreen';
import { ServicesScreen } from '../../screens/ServicesScreen';
import { MainTabs } from '../navigators/MainTabs';
import type { AppStackParamList, StackRoutes } from '../types';

export const appRoutes: StackRoutes<AppStackParamList> = {
  Tabs: { component: MainTabs },
  Services: { component: ServicesScreen },
  ComparePrices: { component: ComparePricesScreen },
  Profile: { component: ProfileScreen },
  Reviews: { component: ReviewsScreen },
  Chat: { component: ChatScreen },
  BookService: { component: BookServiceScreen },
  LocationPicker: { component: LocationPickerScreen },
};
