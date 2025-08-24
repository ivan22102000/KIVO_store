import { useProducts } from "@/hooks/use-products";
import { useActivePromotions } from "@/hooks/use-promotions";
import { ProductCard } from "@/components/product-card";
import { PromotionBanner } from "@/components/promotion-banner";
import { KivoLogo } from "@/components/kivo-logo";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export default function Home() {
  const { data: productsData, isLoading: productsLoading } = useProducts({ limit: 6 });
  const { data: promotionsData, isLoading: promotionsLoading } = useActivePromotions();

  const products = productsData?.data || [];
  const promotions = promotionsData?.data || [];

  return (
    <div className="min-h-screen" data-testid="home-page">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0 kivo-gradient opacity-10"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30" 
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')"
          }}
        ></div>
        
        <div className="relative z-10 text-center px-4">
          <div className="mb-8">
            <KivoLogo 
              size="xl" 
              animated={true} 
              showSlogan={true}
              className="mb-8 kivo-bounce-in"
            />
          </div>
          
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed" data-testid="hero-description">
            Descubre la tecnología más avanzada y productos únicos que transformarán tu vida. 
            En KIVO, cada compra es una experiencia excepcional.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/products">
              <Button 
                size="lg"
                className="px-12 py-4 bg-gradient-to-r from-kivo-purple to-kivo-gold text-white font-bold text-xl rounded-full hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-kivo-purple/50 kivo-sparkle relative overflow-hidden group"
                data-testid="button-explore-products"
              >
                <span className="relative z-10">🚀 Explorar Productos</span>
                <div className="absolute inset-0 bg-gradient-to-r from-kivo-gold to-kivo-purple opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              </Button>
            </Link>
            <Link href="/offers">
              <Button 
                size="lg"
                variant="outline"
                className="px-12 py-4 border-2 border-kivo-purple text-kivo-purple font-bold text-xl rounded-full hover:bg-kivo-purple hover:text-white transition-all duration-300 hover:scale-110 kivo-wobble group relative overflow-hidden"
                data-testid="button-view-offers"
              >
                <span className="relative z-10">🔥 Ver Ofertas Especiales</span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 opacity-0 group-hover:opacity-20 transition-all duration-500"></div>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Active Promotions */}
      {!promotionsLoading && promotions.length > 0 && (
        <div data-testid="promotions-section">
          {promotions.map((promotion) => (
            <PromotionBanner key={promotion.id} promotion={promotion} />
          ))}
        </div>
      )}

      {/* Featured Products */}
      <section className="py-20 bg-white" data-testid="featured-products-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-orbitron font-bold text-5xl text-kivo-dark mb-6" data-testid="featured-products-title">
              Productos Destacados
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto" data-testid="featured-products-description">
              Descubre nuestra selección premium de tecnología y productos únicos, 
              cada uno diseñado para superar tus expectativas.
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="products-grid">
            {productsLoading ? (
              // Loading skeletons
              [...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4" data-testid={`product-skeleton-${i}`}>
                  <Skeleton className="h-64 w-full rounded-3xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))
            ) : (
              products.map((product) => (
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
              ))
            )}
          </div>

          <div className="text-center mt-16">
            <Link href="/products">
              <Button 
                size="lg"
                className="px-12 py-4 bg-gradient-to-r from-kivo-purple to-kivo-gold text-white font-bold text-xl rounded-full hover:scale-110 transition-all duration-300 shadow-2xl"
                data-testid="button-view-all-products"
              >
                Ver Todos los Productos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Category Banners */}
      <section className="py-20 bg-gray-50" data-testid="categories-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-orbitron font-bold text-5xl text-kivo-dark mb-6" data-testid="categories-title">
              Explora por Categorías
            </h2>
            <p className="text-xl text-gray-600" data-testid="categories-description">
              Encuentra exactamente lo que buscas en nuestras categorías especializadas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="categories-grid">
            {/* Electronics Category */}
            <div className="category-card group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500" data-testid="category-electronics">
              <div 
                className="category-image h-64 bg-cover bg-center"
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600')"
                }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-kivo-dark via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="font-bold text-3xl mb-2">Electrónicos</h3>
                <p className="text-lg opacity-90 mb-4">Tecnología de vanguardia</p>
                <Link href="/products?category=electronics">
                  <Button className="px-6 py-2 bg-kivo-purple rounded-full font-semibold hover:bg-kivo-gold transition-colors duration-300" data-testid="button-explore-electronics">
                    Explorar
                  </Button>
                </Link>
              </div>
            </div>

            {/* Home Category */}
            <div className="category-card group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500" data-testid="category-home">
              <div 
                className="category-image h-64 bg-cover bg-center"
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600')"
                }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-kivo-dark via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="font-bold text-3xl mb-2">Hogar</h3>
                <p className="text-lg opacity-90 mb-4">Diseño y funcionalidad</p>
                <Link href="/products?category=home">
                  <Button className="px-6 py-2 bg-kivo-purple rounded-full font-semibold hover:bg-kivo-gold transition-colors duration-300" data-testid="button-explore-home">
                    Explorar
                  </Button>
                </Link>
              </div>
            </div>

            {/* Accessories Category */}
            <div className="category-card group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500" data-testid="category-accessories">
              <div 
                className="category-image h-64 bg-cover bg-center"
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600')"
                }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-kivo-dark via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="font-bold text-3xl mb-2">Accesorios</h3>
                <p className="text-lg opacity-90 mb-4">Complementos perfectos</p>
                <Link href="/products?category=accessories">
                  <Button className="px-6 py-2 bg-kivo-purple rounded-full font-semibold hover:bg-kivo-gold transition-colors duration-300" data-testid="button-explore-accessories">
                    Explorar
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50" data-testid="floating-cart">
        <Button 
          size="icon"
          className="w-16 h-16 bg-gradient-to-r from-kivo-purple to-kivo-gold text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300 animate-bounce-slow"
          data-testid="floating-cart-button"
        >
          <span className="text-xl">🛒</span>
        </Button>
      </div>
    </div>
  );
}
