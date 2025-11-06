import axios from 'axios';

import type {
  Category,
  FeatureCard,
  HeroSection,
  NavigationLink,
  Order,
  Product,
  ProductFilters,
  SiteSettings,
  StrapiEntity,
  StrapiResponse,
  StripeCheckoutSession,
  ThemeSettings,
} from '../../../shared/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token if needed
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Products API
export const productsApi = {
  getAll: async (filters?: ProductFilters) => {
    const params = new URLSearchParams();

    if (filters?.page) params.append('pagination[page]', filters.page.toString());
    if (filters?.pageSize) params.append('pagination[pageSize]', filters.pageSize.toString());
    if (filters?.sort) params.append('sort', filters.sort);
    if (filters?.search) params.append('filters[name][$containsi]', filters.search);
    if (filters?.category) params.append('filters[category][slug][$eq]', filters.category);
    if (filters?.minPrice) params.append('filters[price][$gte]', filters.minPrice.toString());
    if (filters?.maxPrice) params.append('filters[price][$lte]', filters.maxPrice.toString());
    if (filters?.featured !== undefined)
      params.append('filters[featured][$eq]', filters.featured.toString());

    const { data } = await api.get<StrapiResponse<StrapiEntity<Product>[]>>(
      `/products?${params.toString()}`
    );
    return data;
  },

  getBySlug: async (slug: string) => {
    const { data } = await api.get<StrapiResponse<StrapiEntity<Product>[]>>(
      `/products?filters[slug][$eq]=${slug}`
    );
    return data.data[0] || null;
  },

  getById: async (id: string) => {
    const { data } = await api.get<StrapiResponse<StrapiEntity<Product>>>(`/products/${id}`);
    return data.data;
  },

  getFeatured: async (limit: number = 8) => {
    const { data } = await api.get<{ data: Product[] }>(`/products/featured?limit=${limit}`);
    return data.data;
  },

  search: async (query: string, limit: number = 20) => {
    const { data } = await api.get<{ data: Product[] }>(
      `/products/search?query=${encodeURIComponent(query)}&limit=${limit}`
    );
    return data.data;
  },
};

// Categories API
export const categoriesApi = {
  getAll: async () => {
    const { data } = await api.get<StrapiResponse<StrapiEntity<Category>[]>>('/categories');
    return data;
  },

  getBySlug: async (slug: string) => {
    const { data } = await api.get<StrapiResponse<StrapiEntity<Category>[]>>(
      `/categories?filters[slug][$eq]=${slug}`
    );
    return data.data[0] || null;
  },

  getById: async (id: string) => {
    const { data } = await api.get<StrapiResponse<StrapiEntity<Category>>>(`/categories/${id}`);
    return data.data;
  },
};

// Orders API
export const ordersApi = {
  getAll: async () => {
    const { data } = await api.get<StrapiResponse<StrapiEntity<Order>[]>>('/orders');
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<StrapiResponse<StrapiEntity<Order>>>(`/orders/${id}`);
    return data.data;
  },

  createFromStripe: async (sessionId: string) => {
    const { data } = await api.post<{ data: Order }>('/orders/create-from-stripe', { sessionId });
    return data.data;
  },
};

// Stripe API
export const stripeApi = {
  createCheckoutSession: async (
    items: Array<{ productId: number; quantity: number; variantId?: number }>,
    shippingAddress: {
      name: string;
      email: string;
      address: string;
      city: string;
      postalCode: string;
      country: string;
    }
  ) => {
    const { data } = await api.post<StripeCheckoutSession>('/stripe/create-checkout-session', {
      items,
      shippingAddress,
    });
    return data;
  },
};

// CMS Content API
export const cmsApi = {
  getSiteSettings: async () => {
    try {
      const { data } = await api.get<{ data: SiteSettings }>('/site-setting');
      if (!data.data) {
        throw new Error('No data returned');
      }
      return data.data;
    } catch (_error) {
      // Return defaults if not configured yet
      return {
        id: 0,
        documentId: '',
        siteName: 'EcommerceStore',
        siteLogo: '🛍️',
        searchPlaceholder: 'Search products...',
        createdAt: '',
        updatedAt: '',
      } as SiteSettings;
    }
  },

  getHeroSection: async () => {
    try {
      const { data } = await api.get<{ data: HeroSection }>(
        '/hero-section?populate=backgroundImage'
      );
      if (!data.data) {
        throw new Error('No data returned');
      }
      return data.data;
    } catch (_error) {
      // Return defaults if not configured yet
      return {
        id: 0,
        documentId: '',
        headline: 'Welcome to EcommerceStore',
        subtitle:
          'Discover amazing products at unbeatable prices. Shop the latest trends and must-have items.',
        primaryButtonText: 'Shop Now',
        primaryButtonLink: '/products',
        secondaryButtonText: 'Browse Categories',
        secondaryButtonLink: '/categories',
        enabled: true,
        createdAt: '',
        updatedAt: '',
        publishedAt: '',
      } as HeroSection;
    }
  },

  getFeatureCards: async () => {
    try {
      const { data } = await api.get<{ data: FeatureCard[] }>(
        '/feature-cards?sort=order:asc&filters[enabled][$eq]=true'
      );
      return data.data;
    } catch (_error) {
      // Return defaults if not configured yet
      return [
        {
          id: 1,
          documentId: '',
          icon: '🚚',
          title: 'Free Shipping',
          description: 'Free shipping on orders over $50',
          order: 1,
          enabled: true,
          createdAt: '',
          updatedAt: '',
          publishedAt: '',
        },
        {
          id: 2,
          documentId: '',
          icon: '🔒',
          title: 'Secure Payment',
          description: '100% secure payment processing',
          order: 2,
          enabled: true,
          createdAt: '',
          updatedAt: '',
          publishedAt: '',
        },
        {
          id: 3,
          documentId: '',
          icon: '🔄',
          title: 'Easy Returns',
          description: '30-day return policy on all items',
          order: 3,
          enabled: true,
          createdAt: '',
          updatedAt: '',
          publishedAt: '',
        },
      ] as FeatureCard[];
    }
  },

  getNavigationLinks: async (position: 'header' | 'footer') => {
    try {
      const { data } = await api.get<{ data: NavigationLink[] }>(
        `/navigation-links?filters[position][$eq]=${position}&filters[enabled][$eq]=true&sort=order:asc`
      );
      return data.data;
    } catch (_error) {
      return [] as NavigationLink[];
    }
  },

  getThemeSettings: async () => {
    try {
      const { data } = await api.get<{ data: ThemeSettings }>('/theme-setting');
      if (!data.data) {
        throw new Error('No data returned');
      }
      return data.data;
    } catch (_error) {
      // Return defaults if not configured yet
      return {
        id: 0,
        documentId: '',
        themeName: 'Default Theme',
        primaryColor: '#171717',
        primaryForeground: '#fafafa',
        secondaryColor: '#f5f5f5',
        secondaryForeground: '#171717',
        accentColor: '#f5f5f5',
        accentForeground: '#171717',
        backgroundColor: '#ffffff',
        foregroundColor: '#171717',
        mutedColor: '#f5f5f5',
        mutedForeground: '#737373',
        cardColor: '#ffffff',
        cardForeground: '#171717',
        borderColor: '#e5e5e5',
        inputColor: '#e5e5e5',
        ringColor: '#171717',
        destructiveColor: '#ef4444',
        destructiveForeground: '#fafafa',
        createdAt: '',
        updatedAt: '',
      } as ThemeSettings;
    }
  },
};

// Helper function to get full image URL
export const getImageUrl = (url: string | undefined): string => {
  if (!url) return '/placeholder.png';
  if (url.startsWith('http')) return url;
  return `${STRAPI_URL}${url}`;
};

export default api;
