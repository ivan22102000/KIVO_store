import { useState } from "react";
import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/product-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, X, Package } from "lucide-react";

export default function Products() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const { data: productsData, isLoading } = useProducts({ search, category });
  const products = productsData?.data || [];

  const handleClearFilters = () => {
    setSearch("");
    setCategory("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white" data-testid="products-page">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-kivo-purple to-kivo-dark text-white py-16" data-testid="products-hero">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="font-orbitron font-bold text-5xl md:text-6xl mb-6 kivo-glow" data-testid="products-title">
              Nuestros Productos
            </h1>
            <p className="text-xl text-kivo-gold font-semibold" data-testid="products-subtitle">
              Descubre nuestra selección de productos de alta calidad
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter Section */}
        <div className="mb-8">
          <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100" data-testid="filters-section">
            <div className="flex flex-col lg:flex-row gap-4 items-end">
              {/* Search Input */}
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Buscar productos
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Buscar productos..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 py-3 text-lg"
                    data-testid="search-input"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="lg:w-64">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Categoría
                </label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="py-3 text-lg" data-testid="category-select">
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas las categorías</SelectItem>
                    <SelectItem value="electronics">Electrónicos</SelectItem>
                    <SelectItem value="home">Hogar</SelectItem>
                    <SelectItem value="clothing">Ropa</SelectItem>
                    <SelectItem value="books">Libros</SelectItem>
                    <SelectItem value="sports">Deportes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  className="bg-gradient-to-r from-kivo-purple to-kivo-gold hover:scale-105 transition-all duration-300"
                  data-testid="search-button"
                >
                  <Search className="h-4 w-4" />
                </Button>
                
                {(search || category) && (
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    className="hover:scale-105 transition-all duration-300"
                    data-testid="clear-filters-button"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-right">
              <span className="text-sm text-gray-600 flex items-center justify-end" data-testid="results-count">
                <Package className="h-4 w-4 mr-1" />
                {products.length} producto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" data-testid="products-loading">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4" data-testid={`product-skeleton-${i}`}>
                <Skeleton className="h-64 w-full rounded-3xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" data-testid="products-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={(productId) => {
                  // TODO: Implement add to cart functionality
                  console.log("Adding to cart:", productId);
                }}
                onAddToWishlist={(productId) => {
                  // TODO: Implement add to wishlist functionality
                  console.log("Adding to wishlist:", productId);
                }}
              />
            ))}
          </div>
        ) : (
          /* No Products Found */
          <div className="text-center py-16" data-testid="no-products">
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="h-16 w-16 text-gray-400" />
              </div>
            </div>
            
            <h3 className="font-orbitron font-semibold text-3xl mb-4 text-kivo-dark" data-testid="no-products-title">
              No se encontraron productos
            </h3>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto" data-testid="no-products-message">
              {search || category ? (
                <>
                  No hay productos que coincidan con tu búsqueda. 
                  <br />
                  Intenta con otros términos o revisa todas las categorías.
                </>
              ) : (
                "Aún no hay productos disponibles en la tienda."
              )}
            </p>
            
            {(search || category) && (
              <Button
                onClick={handleClearFilters}
                className="bg-gradient-to-r from-kivo-purple to-kivo-gold hover:scale-105 transition-all duration-300"
                data-testid="button-show-all"
              >
                <Package className="h-4 w-4 mr-2" />
                Ver todos los productos
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
