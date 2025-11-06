'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Menu, Search } from 'lucide-react';
import { useState } from 'react';

import { CartDrawer } from '@/components/CartDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cmsApi } from '@/lib/api';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const { data: siteSettings } = useQuery({
    queryKey: ['cms', 'site-settings'],
    queryFn: () => cmsApi.getSiteSettings(),
  });

  const { data: headerLinks } = useQuery({
    queryKey: ['cms', 'navigation-links', 'header'],
    queryFn: () => cmsApi.getNavigationLinks('header'),
  });

  // Helper to normalize URLs (add leading slash if missing for internal links)
  const normalizeUrl = (url: string, isExternal: boolean) => {
    if (isExternal) return url;
    return url.startsWith('/') || url.startsWith('http') ? url : `/${url}`;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <header
      className="sticky top-0 z-40 w-full border-b backdrop-blur"
      style={{
        backgroundColor: 'rgb(var(--color-background) / 0.95)',
        borderColor: 'rgb(var(--color-border))',
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">{siteSettings?.siteLogo || '🛍️'}</span>
            <span
              className="font-bold text-xl hidden sm:inline-block"
              style={{ color: 'rgb(var(--color-foreground))' }}
            >
              {siteSettings?.siteName || 'EcommerceStore'}
            </span>
          </Link>

          {/* Search Bar (Desktop) */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
              <Input
                type="search"
                placeholder={siteSettings?.searchPlaceholder || 'Search products...'}
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/products"
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: 'rgb(var(--color-foreground))' }}
            >
              Products
            </Link>
            <Link
              href="/categories"
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: 'rgb(var(--color-foreground))' }}
            >
              Categories
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: 'rgb(var(--color-foreground))' }}
            >
              About
            </Link>
            {headerLinks &&
              headerLinks.length > 0 &&
              headerLinks.map((link) =>
                link && link.url ? (
                  <Link
                    key={link.id}
                    href={normalizeUrl(link.url, link.external)}
                    className="text-sm font-medium transition-colors hover:opacity-80 flex items-center gap-1"
                    style={{ color: 'rgb(var(--color-foreground))' }}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                  >
                    {link.label}
                    {link.external && <ExternalLink className="h-3 w-3" />}
                  </Link>
                ) : null
              )}
          </nav>

          {/* Cart & Mobile Menu */}
          <div className="flex items-center gap-2">
            <CartDrawer />

            {/* Mobile Menu Button */}
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="md:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
            <Input
              type="search"
              placeholder={siteSettings?.searchPlaceholder || 'Search products...'}
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav
            className="md:hidden border-t py-4 space-y-3"
            style={{ borderColor: 'rgb(var(--color-border))' }}
          >
            <Link
              href="/products"
              className="block text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: 'rgb(var(--color-foreground))' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              href="/categories"
              className="block text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: 'rgb(var(--color-foreground))' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Categories
            </Link>
            <Link
              href="/about"
              className="block text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: 'rgb(var(--color-foreground))' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            {headerLinks &&
              headerLinks.length > 0 &&
              headerLinks.map((link) =>
                link && link.url ? (
                  <Link
                    key={link.id}
                    href={normalizeUrl(link.url, link.external)}
                    className="block text-sm font-medium transition-colors hover:opacity-80 flex items-center gap-1"
                    style={{ color: 'rgb(var(--color-foreground))' }}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                    {link.external && <ExternalLink className="h-3 w-3" />}
                  </Link>
                ) : null
              )}
          </nav>
        )}
      </div>
    </header>
  );
}
