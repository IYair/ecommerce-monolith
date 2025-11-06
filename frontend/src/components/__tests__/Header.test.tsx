import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { Header } from '../Header';

// Mock the cart store
jest.mock('@/store/cart', () => ({
  useCartStore: () => ({
    items: [],
  }),
}));

// Mock the API
jest.mock('@/lib/api', () => ({
  cmsApi: {
    getSiteSettings: jest.fn(() =>
      Promise.resolve({
        siteName: 'Test Store',
        siteLogo: '🛍️',
        searchPlaceholder: 'Search...',
      })
    ),
    getNavigationLinks: jest.fn(() => Promise.resolve([])),
  },
}));

describe('Header', () => {
  it('renders the site logo', async () => {
    render(<Header />);
    // Wait for async data to load
    const logo = await screen.findByText('🛍️');
    expect(logo).toBeInTheDocument();
  });

  it('renders navigation links', async () => {
    render(<Header />);
    const homeLink = await screen.findByRole('link', { name: /home/i });
    expect(homeLink).toBeInTheDocument();
  });

  // Add more tests as needed
});
