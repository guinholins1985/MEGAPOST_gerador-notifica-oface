// data/phoneModels.ts
import { PhoneModel } from '../types';

export const PHONE_MODELS: PhoneModel[] = [
  {
    id: 'titanium-pro',
    name: 'Titanium Pro',
    styles: {
      frame: { height: '610px', width: '300px', borderRadius: '3.5rem' },
      screen: { borderRadius: '3rem' },
      notch: { width: '120px', height: '25px' },
    },
  },
  {
    id: 'galaxy-ultra',
    name: 'Galaxy Ultra',
    styles: {
      frame: { height: '620px', width: '290px', borderRadius: '1.5rem', borderWidth: '8px' },
      screen: { borderRadius: '1.2rem' },
    },
  },
  {
    id: 'pixel-pro',
    name: 'Pixel Pro',
    styles: {
      frame: { height: '600px', width: '285px', borderRadius: '2.5rem' },
      screen: { borderRadius: '2.2rem' },
    },
  },
];