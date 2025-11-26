import { Product, Session, ProductCategory, StrainType, UserProfile } from '../types';

const PRODUCTS_KEY = 'my_stash_products';
const SESSIONS_KEY = 'my_stash_sessions';
const USER_KEY = 'my_stash_user';

// Seed data to show initial state
const SEED_PRODUCTS: Product[] = [
  {
    id: '1',
    category: ProductCategory.FLOWER,
    brand_name: 'Blue River',
    product_name: 'Blue Dream',
    form_factor: 'Flower',
    strain_type: StrainType.SATIVA,
    thc_mg_per_unit: 18, // 18% roughly
    tags: ['Creative', 'Social', 'Daytime'],
    terpenes: [
      { name: 'Myrcene', percentage: 0.8, description: 'Relaxing' },
      { name: 'Pinene', percentage: 0.3, description: 'Alertness' }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    category: ProductCategory.EDIBLE,
    brand_name: 'Wyld',
    product_name: 'Elderberry Gummies',
    flavor_or_variant: 'Elderberry',
    form_factor: 'Gummy',
    thc_mg_per_unit: 10,
    cbd_mg_per_unit: 5,
    strain_type: StrainType.INDICA,
    tags: ['Sleep', 'Relax', 'Body-High'],
    terpenes: [{ name: 'Linalool', description: 'Calming' }],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const storageService = {
  getProducts: (): Product[] => {
    const data = localStorage.getItem(PRODUCTS_KEY);
    if (!data) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(SEED_PRODUCTS));
      return SEED_PRODUCTS;
    }
    return JSON.parse(data);
  },

  getProduct: (id: string): Product | undefined => {
    const products = storageService.getProducts();
    return products.find(p => p.id === id);
  },

  saveProduct: (product: Product): void => {
    const products = storageService.getProducts();
    const existingIndex = products.findIndex(p => p.id === product.id);
    if (existingIndex >= 0) {
      products[existingIndex] = product;
    } else {
      products.push(product);
    }
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  },

  deleteProduct: (id: string): void => {
    const products = storageService.getProducts();
    const newProducts = products.filter(p => p.id !== id);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(newProducts));
  },

  getSessions: (productId?: string): Session[] => {
    const data = localStorage.getItem(SESSIONS_KEY);
    const sessions: Session[] = data ? JSON.parse(data) : [];
    if (productId) {
      return sessions.filter(s => s.product_id === productId).sort((a, b) => new Date(b.date_time_used).getTime() - new Date(a.date_time_used).getTime());
    }
    return sessions.sort((a, b) => new Date(b.date_time_used).getTime() - new Date(a.date_time_used).getTime());
  },

  saveSession: (session: Session): void => {
    const sessions = storageService.getSessions();
    sessions.push(session);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  },

  getUserProfile: (): UserProfile => {
    const data = localStorage.getItem(USER_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return {
      name: 'Guest User',
      email: '',
      preferences: {
        dosageUnit: 'mg',
        dateFormat: 'MM/DD/YYYY',
        privateProfile: true
      }
    };
  },

  saveUserProfile: (profile: UserProfile): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(profile));
  }
};
