'use client';

import Link from 'next/link';

import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';

import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { cmsApi, getImageUrl, productsApi } from '@/lib/api';

export default function Home() {
  const { data: featuredProducts, isLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productsApi.getFeatured(8),
  });

  const { data: heroData } = useQuery({
    queryKey: ['cms', 'hero-section'],
    queryFn: () => cmsApi.getHeroSection(),
  });

  const { data: featureCards } = useQuery({
    queryKey: ['cms', 'feature-cards'],
    queryFn: () => cmsApi.getFeatureCards(),
  });

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      {heroData?.enabled && (
        <section
          className="relative"
          style={
            heroData.backgroundImage
              ? {
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${getImageUrl(heroData.backgroundImage.url)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }
              : {
                  background: `linear-gradient(to bottom, rgb(var(--color-muted) / 0.3), rgb(var(--color-background)))`,
                }
          }
        >
          <div className="container mx-auto px-4 py-20 md:py-32">
            <div className="max-w-3xl mx-auto text-center">
              <h1
                className={`text-4xl md:text-6xl font-bold mb-6 tracking-tight ${
                  heroData.backgroundImage ? 'drop-shadow-lg' : ''
                }`}
                style={{
                  color: heroData.backgroundImage ? '#ffffff' : 'rgb(var(--color-foreground))',
                }}
              >
                {heroData.headline}
              </h1>
              <p
                className={`text-xl mb-8 ${heroData.backgroundImage ? 'drop-shadow-md' : ''}`}
                style={{
                  color: heroData.backgroundImage
                    ? '#ffffff'
                    : 'rgb(var(--color-muted-foreground))',
                }}
              >
                {heroData.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={heroData.primaryButtonLink}>
                  <Button size="lg" className="w-full sm:w-auto">
                    {heroData.primaryButtonText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                {heroData.secondaryButtonText && heroData.secondaryButtonLink && (
                  <Link href={heroData.secondaryButtonLink}>
                    <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                      {heroData.secondaryButtonText}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      <section
        className="py-16 md:py-24"
        style={{ backgroundColor: 'rgb(var(--color-background))' }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2
                className="text-3xl font-bold mb-2"
                style={{ color: 'rgb(var(--color-foreground))' }}
              >
                Featured Products
              </h2>
              <p style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                Check out our handpicked selection of amazing products
              </p>
            </div>
            <Link href="/products" className="hidden md:block">
              <Button variant="ghost">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl h-96 animate-pulse"
                  style={{ backgroundColor: 'rgb(var(--color-muted))' }}
                />
              ))}
            </div>
          ) : featuredProducts && featuredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="mt-8 text-center md:hidden">
                <Link href="/products">
                  <Button variant="outline">
                    View All Products
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                No featured products available at the moment.
              </p>
              <Link href="/products" className="inline-block mt-4">
                <Button variant="outline">Browse All Products</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      {featureCards && featureCards.length > 0 && (
        <section
          className="py-16 md:py-24"
          style={{ backgroundColor: 'rgb(var(--color-muted) / 0.3)' }}
        >
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featureCards.map((feature) => (
                <div key={feature.id} className="text-center">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"
                    style={{
                      backgroundColor: 'rgb(var(--color-primary))',
                      color: 'rgb(var(--color-primary-foreground))',
                    }}
                  >
                    {feature.icon}
                  </div>
                  <h3
                    className="font-semibold text-lg mb-2"
                    style={{ color: 'rgb(var(--color-foreground))' }}
                  >
                    {feature.title}
                  </h3>
                  <p style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
