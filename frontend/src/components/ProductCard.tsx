'use client';

import Image from 'next/image';
import Link from 'next/link';

import { ShoppingCart } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { formatPrice, getImageUrl } from '@/lib/utils';
import { useCartStore } from '@/store/cart';

import type { Product } from '../../../shared/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const mainImage = product.images?.[0];
  const imageUrl = getImageUrl(mainImage?.url, process.env.NEXT_PUBLIC_STRAPI_URL);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      documentId: product.documentId,
      name: product.name,
      slug: product.slug,
      price: product.salePrice || product.price,
      image: imageUrl,
    });
  };

  const displayPrice = product.salePrice || product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;

  return (
    <Link href={`/products/${product.slug}`}>
      <Card
        className="group overflow-hidden hover:shadow-lg transition-shadow duration-300"
        style={{
          backgroundColor: 'rgb(var(--color-card))',
          borderColor: 'rgb(var(--color-border))',
        }}
      >
        <div
          className="relative aspect-square overflow-hidden"
          style={{ backgroundColor: 'rgb(var(--color-muted))' }}
        >
          {mainImage ? (
            <Image
              src={imageUrl}
              alt={mainImage.alternativeText || product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: 'rgb(var(--color-muted))' }}
            >
              <span style={{ color: 'rgb(var(--color-muted-foreground))' }}>No image</span>
            </div>
          )}

          {hasDiscount && (
            <Badge
              className="absolute top-2 left-2"
              style={{
                backgroundColor: 'rgb(var(--color-destructive))',
                color: 'rgb(var(--color-destructive-foreground))',
              }}
            >
              Sale
            </Badge>
          )}

          {product.featured && (
            <Badge
              className="absolute top-2 right-2"
              style={{
                backgroundColor: 'rgb(var(--color-accent))',
                color: 'rgb(var(--color-accent-foreground))',
              }}
            >
              Featured
            </Badge>
          )}

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive">Out of Stock</Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <h3
            className="font-semibold text-lg mb-1 line-clamp-1 transition-colors"
            style={{ color: 'rgb(var(--color-card-foreground))' }}
          >
            {product.name}
          </h3>

          {product.category && (
            <p className="text-sm mb-2" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
              {product.category.name}
            </p>
          )}

          <div className="flex items-center gap-2">
            <span className="text-lg font-bold" style={{ color: 'rgb(var(--color-primary))' }}>
              {formatPrice(displayPrice)}
            </span>
            {hasDiscount && (
              <span
                className="text-sm line-through"
                style={{ color: 'rgb(var(--color-muted-foreground))' }}
              >
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button className="w-full" onClick={handleAddToCart} disabled={product.stock === 0}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
