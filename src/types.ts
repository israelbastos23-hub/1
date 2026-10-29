export interface VehicleSelection {
  make: string;
  model: string;
  year: string;
  customMake?: string;
  customModel?: string;
}

export type SetOption = 'interior' | 'full';

export interface CartItem {
  id: string;
  name: string;
  set: SetOption;
  setTitle: string;
  vehicle: VehicleSelection;
  price: number;
  originalPrice: number;
  quantity: number;
  image: string;
}

export interface Review {
  id: string;
  author: string;
  location: string;
  rating: number;
  date: string;
  vehicle: string;
  title: string;
  comment: string;
  verified: boolean;
}
