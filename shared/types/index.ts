// Shared TypeScript types for frontend and backend

export interface StrapiImage {
  id: number;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: {
    thumbnail?: ImageFormat;
    small?: ImageFormat;
    medium?: ImageFormat;
    large?: ImageFormat;
  };
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImageFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  width: number;
  height: number;
  size: number;
  path: string | null;
  url: string;
}

export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiEntity<T> {
  id: number;
  documentId: string;
  attributes: T;
}

// Product Types
export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  attributes: Record<string, string>; // e.g., { color: "red", size: "M" }
}

export interface Product {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  sku: string;
  stock: number;
  featured: boolean;
  images: StrapiImage[];
  category: Category;
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// Category Types
export interface Category {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description: string;
  image?: StrapiImage;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// Cart Types
export interface CartItem {
  productId: number;
  documentId: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: {
    id: string;
    name: string;
    attributes: Record<string, string>;
  };
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

// Order Types
export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  productId: number;
  productName: string;
  productSlug: string;
  price: number;
  quantity: number;
  total: number;
  variant?: {
    id: string;
    name: string;
    attributes: Record<string, string>;
  };
}

export interface Order {
  id: number;
  documentId: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: ShippingAddress;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  user?: number; // User ID if authenticated
  customerEmail: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// User/Customer Types
export interface Customer {
  id: number;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  firstName?: string;
  lastName?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

// Stripe Types
export interface StripeCheckoutSession {
  sessionId: string;
  url: string;
}

export interface StripeWebhookEvent {
  type: string;
  data: {
    object: any;
  };
}

// API Response Types
export interface ApiError {
  error: {
    status: number;
    name: string;
    message: string;
    details?: any;
  };
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sort?: string;
}

export interface FilterParams {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  featured?: boolean;
}

export interface ProductFilters extends PaginationParams, FilterParams {}

// Form Types
export interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Query Types (for React Query)
export type QueryKey = string | readonly unknown[];

export interface UseQueryOptions<T> {
  enabled?: boolean;
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

// CMS Content Types
export interface SiteSettings {
  id: number;
  documentId: string;
  siteName: string;
  siteLogo: string;
  searchPlaceholder: string;
  createdAt: string;
  updatedAt: string;
}

export interface HeroSection {
  id: number;
  documentId: string;
  headline: string;
  subtitle: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  enabled: boolean;
  backgroundImage?: StrapiImage;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface FeatureCard {
  id: number;
  documentId: string;
  icon: string;
  title: string;
  description: string;
  order: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface NavigationLink {
  id: number;
  documentId: string;
  label: string;
  url: string;
  position: 'header' | 'footer';
  order: number;
  external: boolean;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface ThemeSettings {
  id: number;
  documentId: string;
  themeName: string;
  primaryColor: string;
  primaryForeground: string;
  secondaryColor: string;
  secondaryForeground: string;
  accentColor: string;
  accentForeground: string;
  backgroundColor: string;
  foregroundColor: string;
  mutedColor: string;
  mutedForeground: string;
  cardColor: string;
  cardForeground: string;
  borderColor: string;
  inputColor: string;
  ringColor: string;
  destructiveColor: string;
  destructiveForeground: string;
  createdAt: string;
  updatedAt: string;
}
