import { Product } from './store'

export const PRODUCTS: Product[] = [
  {
    id: 'pb-mini-10k',
    name: 'PB Mini 10K',
    capacity: '10K mAh',
    capacity_mah: 10000,
    charging_speed: 'Standard Charging',
    features: ['10,000mAh Capacity', 'Compact & Light', 'USB-C + USB-A'],
    price: 12000,
    badge: '10K',
    image: '/products/pb-mini-10k.jpg',
  },
  {
    id: 'pb-pro-20k',
    name: 'PB Pro 20K',
    capacity: '20K mAh',
    capacity_mah: 20000,
    charging_speed: 'Fast Charging',
    features: ['20,000mAh Capacity', 'Fast Charging', 'Dual USB Output'],
    price: 25000,
    badge: '20K',
    image: '/products/pb-pro-20k.jpg',
  },
  {
    id: 'pb-ultra-30k',
    name: 'PB Ultra 30K',
    capacity: '30K mAh',
    capacity_mah: 30000,
    charging_speed: '3 Outputs',
    features: ['30,000mAh Capacity', 'Triple Outputs', 'LED Torch'],
    price: 35000,
    badge: '30K',
    image: '/products/pb-ultra-30k.jpg',
  },
  {
    id: 'pb-laptop-65w',
    name: 'PB Laptop 65W',
    capacity: '65W Fast',
    capacity_mah: 25000,
    charging_speed: '65W Fast Charging',
    features: ['65W Fast Charging', 'For Laptops & Phones', 'Large Capacity'],
    price: 65000,
    badge: '65W',
    image: '/products/pb-laptop-65w.jpg',
  },
]

export const RECOMMENDED_PRODUCTS = PRODUCTS.slice(0, 3)

export const DELIVERY_FEE = 2000

export const REGIONS = [
  'Centre Region',
  'Littoral Region',
  'North Region',
  'East Region',
  'South Region',
]

export const CITIES: Record<string, string[]> = {
  'Centre Region': ['Yaoundé', 'Soa', 'Mbalmayo'],
  'Littoral Region': ['Douala', 'Edéa', 'Tiko'],
  'North Region': ['Garoua', 'Ngaoundéré', 'Maroua'],
  'East Region': ['Bertoua', 'Batouri', 'Abong-Mbang'],
  'South Region': ['Ebolowa', 'Kribi', 'Djoum'],
}

export const QUARTERS: Record<string, string[]> = {
  'Yaoundé': ['Bastos', 'Ngousso', 'Mfandena', 'Elig-Essono', 'Omnisports'],
  'Douala': ['Bonanjo', 'Akwa', 'Deido', 'New Bell', 'Bepanda'],
  'Garoua': ['Marché Central', 'Stadium', 'Yengo', 'Mayo-Darlee'],
  'Bertoua': ['Centre Ville', 'Soa', 'Lolodorf'],
  'Ebolowa': ['Centre', 'Mvog-Ebanda'],
}
