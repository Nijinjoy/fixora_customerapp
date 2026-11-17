import type { ImageSourcePropType } from 'react-native';

export type Service = {
  id: string;
  label: string;
  image: ImageSourcePropType;
};

export type Provider = {
  id: string;
  serviceId: string;
  name: string;
  location: string;
  about: string;
  gallery: ImageSourcePropType[];
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
  phone: '+91 98765 43210',
  location: 'Kochi, Kerala',
  unreadNotifications: 2,
  stats: { bookings: 12, saved: 5, reviews: 8 },
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

function serviceImage(serviceId: string): ImageSourcePropType {
  const service = services.find(item => item.id === serviceId);
  if (!service) {
    throw new Error(`Unknown service: ${serviceId}`);
  }
  return service.image;
}

export const providers: Provider[] = [
  {
    id: '1',
    serviceId: 'plumber',
    name: 'Rajesh Kumar',
    location: 'Kochi, Kerala',
    about:
      "Hi! I'm a certified plumbing technician. I focus on delivering fast, clean, and dependable solutions for all types of plumbing issues. Your comfort and satisfaction come first.",
    gallery: [
      serviceImage('plumber'),
      require('../../assets/gallery/plumber-1.jpg'),
      require('../../assets/gallery/plumber-2.jpg'),
    ],
    title: 'Expert Plumbing',
    price: '₹500',
    category: 'Plumber',
    rating: 4.5,
    reviews: 120,
    avatar: '👨🏻‍🔧',
    avatarBg: '#DCE8F7',
  },
  {
    id: '2',
    serviceId: 'electrician',
    name: 'Anil Varghese',
    location: 'Kottayam, Kerala',
    about:
      'Licensed electrician with 10+ years of experience in house wiring, panel upgrades and fault finding. Safe, tidy work with a warranty on every job.',
    gallery: [
      serviceImage('electrician'),
      require('../../assets/gallery/electrician-1.jpg'),
      require('../../assets/gallery/electrician-2.jpg'),
    ],
    title: 'Electrical Services',
    price: '₹900',
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
    name: 'Suresh Nair',
    location: 'Thrissur, Kerala',
    about:
      'Interior and exterior painting with smooth, even finishes. I help you pick colours, protect your furniture and leave the place spotless.',
    gallery: [
      serviceImage('painter'),
      require('../../assets/gallery/painter-1.jpg'),
      require('../../assets/gallery/painter-2.jpg'),
    ],
    title: 'Home Painting',
    price: '₹850',
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
    name: 'Joseph Mathew',
    location: 'Pala, Kerala',
    about:
      'Experienced rubber tapper. Careful, clean cuts that keep your trees healthy and productive, with daily latex collection and sheet making on request.',
    gallery: [
      serviceImage('rubber-tapper'),
      require('../../assets/gallery/rubber-tapper-1.jpg'),
      require('../../assets/gallery/rubber-tapper-2.jpg'),
    ],
    title: 'Rubber Tapping',
    price: '₹700',
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
    name: 'Biju Thomas',
    location: 'Alappuzha, Kerala',
    about:
      'Skilled coconut climber using a safety climbing device. Harvesting, crown cleaning and pest checks for every tree, on schedule.',
    gallery: [
      serviceImage('coconut-climber'),
      require('../../assets/gallery/coconut-climber-1.jpg'),
      require('../../assets/gallery/coconut-climber-2.jpg'),
    ],
    title: 'Coconut Harvesting',
    price: '₹50',
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
    name: 'Manoj Pillai',
    location: 'Kozhikode, Kerala',
    about:
      'Roof repairs, sheet roofing and leak fixing before the monsoon. Quick inspections and honest quotes with quality materials.',
    gallery: [
      serviceImage('roofer'),
      require('../../assets/gallery/roofer-1.jpg'),
      require('../../assets/gallery/roofer-2.jpg'),
    ],
    title: 'Roof Repair & Sheeting',
    price: '₹1,500',
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
    name: 'Shaji Abraham',
    location: 'Kollam, Kerala',
    about:
      'Gates, grills, trusses and repairs. Strong, neat welds and a finish coat so your metalwork lasts for years.',
    gallery: [
      serviceImage('welder'),
      require('../../assets/gallery/welder-1.jpg'),
      require('../../assets/gallery/welder-2.jpg'),
    ],
    title: 'Gate & Grill Welding',
    price: '₹1,000',
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
    name: 'Thomas Kurian',
    location: 'Thiruvananthapuram, Kerala',
    about:
      'Custom furniture, doors, windows and repairs. I work with quality wood and deliver neat, durable craftsmanship on time.',
    gallery: [
      serviceImage('carpenter'),
      require('../../assets/gallery/carpenter-1.jpg'),
      require('../../assets/gallery/carpenter-2.jpg'),
    ],
    title: 'Furniture Carpentry',
    price: '₹1,000',
    unit: '/day',
    category: 'Carpenter',
    rating: 4.8,
    reviews: 130,
    avatar: '🧔🏽',
    avatarBg: '#F4E4D7',
  },
];

export const popularProviders = providers.slice(0, 3);

export function findProvider(id: string): Provider | undefined {
  return providers.find(provider => provider.id === id);
}
