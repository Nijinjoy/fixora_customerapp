import type { ImageSourcePropType } from 'react-native';

export type Service = {
  id: string;
  label: string;
  image: ImageSourcePropType;
};

export type Provider = {
  id: string;
  serviceId: string;
  title: string;
  price: string;
  unit?: string;
  category: string;
  rating: number;
  reviews: number;
  avatar: string;
  avatarBg: string;
};

export const user = {
  name: 'Alex Carter',
  avatar: '👨🏽',
  unreadNotifications: 2,
};

export const services: Service[] = [
  {
    id: 'plumber',
    label: 'Plumber',
    image: require('../../assets/services/plumber.jpg'),
  },
  {
    id: 'electrician',
    label: 'Electrician',
    image: require('../../assets/services/electrician.jpg'),
  },
  {
    id: 'painter',
    label: 'Painter',
    image: require('../../assets/services/painter.jpg'),
  },
  {
    id: 'rubber-tapper',
    label: 'Rubber Tapper',
    image: require('../../assets/services/rubber-tapper.jpg'),
  },
  {
    id: 'coconut-climber',
    label: 'Coconut Climber',
    image: require('../../assets/services/coconut-climber.jpg'),
  },
  {
    id: 'roofer',
    label: 'Roofer',
    image: require('../../assets/services/roofer.jpg'),
  },
  {
    id: 'welder',
    label: 'Welder',
    image: require('../../assets/services/welder.jpg'),
  },
  {
    id: 'carpenter',
    label: 'Carpenter',
    image: require('../../assets/services/carpenter.jpg'),
  },
];

export const providers: Provider[] = [
  {
    id: '1',
    serviceId: 'plumber',
    title: 'Expert Plumbing',
    price: '$45',
    category: 'Plumber',
    rating: 4.5,
    reviews: 120,
    avatar: '👨🏻‍🔧',
    avatarBg: '#DCE8F7',
  },
  {
    id: '2',
    serviceId: 'electrician',
    title: 'Electrical Services',
    price: '$40',
    unit: '/day',
    category: 'Electrician',
    rating: 4.9,
    reviews: 210,
    avatar: '👨🏾‍🔧',
    avatarBg: '#FBE7D3',
  },
  {
    id: '3',
    serviceId: 'painter',
    title: 'Home Painting',
    price: '$35',
    unit: '/day',
    category: 'Painter',
    rating: 4.7,
    reviews: 165,
    avatar: '🧑🏻‍🎨',
    avatarBg: '#E3F1E6',
  },
  {
    id: '4',
    serviceId: 'rubber-tapper',
    title: 'Rubber Tapping',
    price: '$25',
    unit: '/day',
    category: 'Rubber Tapper',
    rating: 4.6,
    reviews: 88,
    avatar: '👨🏽‍🌾',
    avatarBg: '#E6F0DA',
  },
  {
    id: '5',
    serviceId: 'coconut-climber',
    title: 'Coconut Harvesting',
    price: '$2',
    unit: '/tree',
    category: 'Coconut Climber',
    rating: 4.8,
    reviews: 142,
    avatar: '👨🏾',
    avatarBg: '#F7EBD3',
  },
  {
    id: '6',
    serviceId: 'roofer',
    title: 'Roof Repair & Sheeting',
    price: '$60',
    unit: '/visit',
    category: 'Roofer',
    rating: 4.4,
    reviews: 76,
    avatar: '👷🏻‍♂️',
    avatarBg: '#DCE8F7',
  },
  {
    id: '7',
    serviceId: 'welder',
    title: 'Gate & Grill Welding',
    price: '$50',
    unit: '/day',
    category: 'Welder',
    rating: 4.7,
    reviews: 95,
    avatar: '👨🏼‍🏭',
    avatarBg: '#E5E3F5',
  },
  {
    id: '8',
    serviceId: 'carpenter',
    title: 'Furniture Carpentry',
    price: '$45',
    unit: '/day',
    category: 'Carpenter',
    rating: 4.8,
    reviews: 130,
    avatar: '🧔🏽',
    avatarBg: '#F4E4D7',
  },
];

export const popularProviders = providers.slice(0, 3);
