import Link from 'next/link';

export function Footer() {
  return (
    <footer
      className="border-t"
      style={{
        backgroundColor: 'rgb(var(--color-background))',
        borderColor: 'rgb(var(--color-border))',
      }}
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🛍️</span>
              <span className="font-bold text-lg" style={{ color: 'rgb(var(--color-foreground))' }}>
                EcommerceStore
              </span>
            </div>
            <p className="text-sm" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
              Your one-stop shop for amazing products at great prices.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold mb-3" style={{ color: 'rgb(var(--color-foreground))' }}>
              Shop
            </h3>
            <ul
              className="space-y-2 text-sm"
              style={{ color: 'rgb(var(--color-muted-foreground))' }}
            >
              <li>
                <Link
                  href="/products"
                  className="hover:opacity-80 transition-colors"
                  style={{ color: 'rgb(var(--color-muted-foreground))' }}
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="hover:opacity-80 transition-colors"
                  style={{ color: 'rgb(var(--color-muted-foreground))' }}
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/products?featured=true"
                  className="hover:opacity-80 transition-colors"
                  style={{ color: 'rgb(var(--color-muted-foreground))' }}
                >
                  Featured Items
                </Link>
              </li>
              <li>
                <Link
                  href="/products?sort=price:asc"
                  className="hover:opacity-80 transition-colors"
                  style={{ color: 'rgb(var(--color-muted-foreground))' }}
                >
                  Best Deals
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold mb-3" style={{ color: 'rgb(var(--color-foreground))' }}>
              Customer Service
            </h3>
            <ul
              className="space-y-2 text-sm"
              style={{ color: 'rgb(var(--color-muted-foreground))' }}
            >
              <li>
                <Link
                  href="/contact"
                  className="hover:opacity-80 transition-colors"
                  style={{ color: 'rgb(var(--color-muted-foreground))' }}
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="hover:opacity-80 transition-colors"
                  style={{ color: 'rgb(var(--color-muted-foreground))' }}
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="hover:opacity-80 transition-colors"
                  style={{ color: 'rgb(var(--color-muted-foreground))' }}
                >
                  Returns
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="hover:opacity-80 transition-colors"
                  style={{ color: 'rgb(var(--color-muted-foreground))' }}
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="font-semibold mb-3" style={{ color: 'rgb(var(--color-foreground))' }}>
              About
            </h3>
            <ul
              className="space-y-2 text-sm"
              style={{ color: 'rgb(var(--color-muted-foreground))' }}
            >
              <li>
                <Link
                  href="/about"
                  className="hover:opacity-80 transition-colors"
                  style={{ color: 'rgb(var(--color-muted-foreground))' }}
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:opacity-80 transition-colors"
                  style={{ color: 'rgb(var(--color-muted-foreground))' }}
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:opacity-80 transition-colors"
                  style={{ color: 'rgb(var(--color-muted-foreground))' }}
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="border-t mt-8 pt-8 text-center text-sm"
          style={{
            borderColor: 'rgb(var(--color-border))',
            color: 'rgb(var(--color-muted-foreground))',
          }}
        >
          <p>© {new Date().getFullYear()} EcommerceStore. Built with Next.js + Strapi.</p>
        </div>
      </div>
    </footer>
  );
}
