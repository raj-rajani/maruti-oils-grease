import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Phone, MapPin, Package, Filter, ChevronDown, Shield, Truck, Clock } from "lucide-react";
import type { Product, Category } from "@shared/schema";
import { getQueryFn } from "@/lib/queryClient";

function Logo() {
  return (
    <svg viewBox="0 0 48 48" className="w-10 h-10" aria-label="Maruti Oils & Grease Logo">
      <circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="24" cy="24" r="14" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <path d="M24 10 L24 38" stroke="currentColor" strokeWidth="2" />
      <path d="M16 16 L24 24 L32 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="24" cy="24" r="4" fill="currentColor" />
    </svg>
  );
}

function ProductImage({ product }: { product: Product }) {
  const [imgError, setImgError] = useState(false);
  const initials = (product.brand || product.name).slice(0, 2).toUpperCase();
  
  if (imgError || !product.imageUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
        <span className="text-3xl font-bold text-primary/40">{initials}</span>
      </div>
    );
  }
  
  return (
    <img
      src={product.imageUrl}
      alt={product.name}
      className="w-full h-full object-contain bg-white p-2 group-hover:scale-105 transition-transform duration-500"
      loading="lazy"
      onError={() => setImgError(true)}
    />
  );
}

function ProductCard({ product, categories }: { product: Product; categories: Category[] }) {
  const category = categories.find(c => c.id === product.categoryId);
  
  return (
    <Card className="group overflow-hidden border border-border/60 hover:border-primary/30 transition-all duration-300 hover:shadow-md" data-testid={`card-product-${product.id}`}>
      <div className="relative aspect-square bg-white overflow-hidden">
        <ProductImage product={product} />
        {!product.inStock && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <Badge variant="destructive" className="text-sm font-semibold px-3 py-1">Out of Stock</Badge>
          </div>
        )}
        {product.featured && product.inStock && (
          <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs font-medium">Featured</Badge>
        )}
      </div>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-tight text-foreground line-clamp-2" data-testid={`text-product-name-${product.id}`}>
            {product.name}
          </h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {product.brand && (
            <Badge variant="outline" className="text-xs font-normal">{product.brand}</Badge>
          )}
          {product.grade && (
            <Badge variant="secondary" className="text-xs font-normal">{product.grade}</Badge>
          )}
          {product.packSize && (
            <Badge variant="secondary" className="text-xs font-normal">{product.packSize}</Badge>
          )}
        </div>
        {category && (
          <p className="text-xs text-muted-foreground">{category.name}</p>
        )}
        <div className="flex items-center justify-between pt-1">
          <span className="text-base font-bold text-primary" data-testid={`text-price-${product.id}`}>
            {product.price || "Contact for price"}
          </span>
          {product.inStock ? (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              In Stock ({product.stockQty})
            </span>
          ) : (
            <span className="text-xs text-destructive font-medium">Unavailable</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryFilter({ categories, active, onSelect }: { categories: Category[]; active: number | null; onSelect: (id: number | null) => void }) {
  return (
    <div className="flex flex-wrap gap-2" data-testid="category-filter">
      <Button
        variant={active === null ? "default" : "outline"}
        size="sm"
        onClick={() => onSelect(null)}
        className="text-xs"
        data-testid="filter-all"
      >
        All Products
      </Button>
      {categories.map(cat => (
        <Button
          key={cat.id}
          variant={active === cat.id ? "default" : "outline"}
          size="sm"
          onClick={() => onSelect(cat.id)}
          className="text-xs"
          data-testid={`filter-category-${cat.id}`}
        >
          {cat.name}
        </Button>
      ))}
    </div>
  );
}

export default function CataloguePage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = !search || 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(search.toLowerCase())) ||
        (p.grade && p.grade.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = activeCategory === null || p.categoryId === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, activeCategory]);

  const inStockCount = products.filter(p => p.inStock).length;
  const isLoading = productsLoading || categoriesLoading;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none" data-testid="text-store-name">MARUTI OILS & GREASE</h1>
              <p className="text-xs opacity-80 mt-0.5">Authorized Dealer &middot; Lubricants & Greases</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs opacity-90">
            <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> 94272 87074</span>
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="text-xs text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10" data-testid="link-admin">
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
              Latest Stock Catalogue
            </h2>
            <p className="text-sm sm:text-base opacity-85 mt-2 leading-relaxed max-w-lg">
              Browse our complete inventory of genuine engine oils, gear oils, greases, and automotive fluids. Real-time stock availability for our vendors.
            </p>
            <div className="flex flex-wrap gap-4 mt-6 text-xs">
              <span className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
                <Package className="w-3.5 h-3.5" /> {inStockCount} Products In Stock
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
                <Shield className="w-3.5 h-3.5" /> Genuine Products Only
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
                <Truck className="w-3.5 h-3.5" /> Gujarat-wide Delivery
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="border-b bg-card/50 sticky top-[52px] z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by product, brand, or grade..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm bg-background"
                data-testid="input-search"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="text-xs gap-1.5"
              data-testid="button-toggle-filters"
            >
              <Filter className="w-3.5 h-3.5" />
              Filter
              <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>
          {showFilters && (
            <div className="mt-3 pt-3 border-t">
              <CategoryFilter categories={categories} active={activeCategory} onSelect={setActiveCategory} />
            </div>
          )}
        </div>
      </section>

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filteredProducts.length}</span> products
            {activeCategory && categories.find(c => c.id === activeCategory) && (
              <> in <span className="font-medium text-foreground">{categories.find(c => c.id === activeCategory)?.name}</span></>
            )}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            Updated live
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-square" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-5 w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground font-medium">No products found</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} categories={categories} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground/80 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid sm:grid-cols-3 gap-6 text-sm">
            <div>
              <div className="flex items-center gap-2 text-primary-foreground mb-3">
                <Logo />
                <span className="font-bold text-base">MARUTI OILS & GREASE</span>
              </div>
              <p className="text-xs leading-relaxed opacity-70">
                Your trusted partner for genuine lubricants, oils, and greases. Serving vendors and workshops across Gujarat.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-primary-foreground mb-2">Contact</h4>
              <div className="space-y-1.5 text-xs">
                <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> +91 94272 87074</p>
                <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> Gujarat, India</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-primary-foreground mb-2">Quick Links</h4>
              <div className="space-y-1.5 text-xs">
                <p className="opacity-70">Download our app on Google Play</p>
                <a href="https://play.google.com/store/apps/details?id=com.valorem.flostore" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline">
                  Digital Vyapar Store &rarr;
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-primary-foreground/10 mt-6 pt-4 text-xs text-center opacity-50">
            &copy; {new Date().getFullYear()} Maruti Oils & Grease. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Mobile admin link */}
      <div className="sm:hidden fixed bottom-4 right-4">
        <Link href="/admin">
          <Button size="sm" variant="secondary" className="shadow-lg text-xs" data-testid="link-admin-mobile">
            Admin
          </Button>
        </Link>
      </div>
    </div>
  );
}
