'use client';

import Image from 'next/image';
import Link from 'next/link';

import { ArrowRight, Minus, Plus, ShoppingCart } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart';

export function CartDrawer() {
  const { items, total, itemCount, updateQuantity, removeItem } = useCartStore();

  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {itemCount}
            </Badge>
          )}
        </Button>
      </DrawerTrigger>

      <DrawerContent direction="right" className="w-full sm:max-w-md p-0">
        {/* Header */}
        <DrawerHeader className="px-4 py-6 sm:px-6">
          <DrawerTitle style={{ color: 'rgb(var(--color-foreground))' }}>Shopping cart</DrawerTitle>
        </DrawerHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: 'rgb(var(--color-muted) / 0.3)' }}
            >
              <ShoppingCart
                className="h-12 w-12"
                style={{ color: 'rgb(var(--color-muted-foreground))' }}
              />
            </div>
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: 'rgb(var(--color-foreground))' }}
            >
              Your cart is empty
            </h3>
            <p className="text-sm mb-6" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
              Add some products to get started!
            </p>
            <DrawerClose asChild>
              <Link href="/products">
                <Button variant="outline">
                  Browse Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </DrawerClose>
          </div>
        ) : (
          <>
            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6">
              <div className="flow-root">
                <ul
                  role="list"
                  className="-my-6 divide-y"
                  style={{ borderColor: 'rgb(var(--color-border))' }}
                >
                  {items.map((item) => (
                    <li
                      key={`${item.productId}-${item.variant?.id || 'default'}`}
                      className="flex py-6"
                    >
                      <div
                        className="size-24 shrink-0 overflow-hidden rounded-md border"
                        style={{ borderColor: 'rgb(var(--color-border))' }}
                      >
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={96}
                            height={96}
                            className="size-full object-cover"
                          />
                        ) : (
                          <div
                            className="size-full flex items-center justify-center"
                            style={{ backgroundColor: 'rgb(var(--color-muted))' }}
                          >
                            <span
                              className="text-xs"
                              style={{ color: 'rgb(var(--color-muted-foreground))' }}
                            >
                              No image
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium">
                            <h3>
                              <Link
                                href={`/products/${item.slug}`}
                                className="hover:opacity-80 transition-opacity"
                                style={{ color: 'rgb(var(--color-foreground))' }}
                              >
                                {item.name}
                              </Link>
                            </h3>
                            <p className="ml-4" style={{ color: 'rgb(var(--color-foreground))' }}>
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                          {item.variant && (
                            <p
                              className="mt-1 text-sm"
                              style={{ color: 'rgb(var(--color-muted-foreground))' }}
                            >
                              {Object.entries(item.variant.attributes)
                                .map(([key, value]) => `${key}: ${value}`)
                                .join(', ')}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-1 items-end justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7"
                              onClick={() =>
                                updateQuantity(item.productId, item.quantity - 1, item.variant?.id)
                              }
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span
                              className="text-sm font-medium w-8 text-center"
                              style={{ color: 'rgb(var(--color-muted-foreground))' }}
                            >
                              {item.quantity}
                            </span>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7"
                              onClick={() =>
                                updateQuantity(item.productId, item.quantity + 1, item.variant?.id)
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item.productId, item.variant?.id)}
                            className="font-medium hover:opacity-80 transition-opacity"
                            style={{ color: 'rgb(var(--color-primary))' }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div
              className="border-t px-4 py-6 sm:px-6"
              style={{ borderColor: 'rgb(var(--color-border))' }}
            >
              <div className="flex justify-between text-base font-medium">
                <p style={{ color: 'rgb(var(--color-foreground))' }}>Subtotal</p>
                <p style={{ color: 'rgb(var(--color-foreground))' }}>{formatPrice(total)}</p>
              </div>
              <p className="mt-0.5 text-sm" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                Shipping and taxes calculated at checkout.
              </p>
              <div className="mt-6">
                <DrawerClose asChild>
                  <Link href="/checkout">
                    <Button className="w-full" size="lg">
                      Checkout
                    </Button>
                  </Link>
                </DrawerClose>
              </div>
              <div className="mt-6 flex justify-center text-center text-sm">
                <p style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                  or{' '}
                  <DrawerClose asChild>
                    <button
                      type="button"
                      className="font-medium hover:opacity-80 transition-opacity"
                      style={{ color: 'rgb(var(--color-primary))' }}
                    >
                      Continue Shopping
                      <span aria-hidden="true"> →</span>
                    </button>
                  </DrawerClose>
                </p>
              </div>
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
