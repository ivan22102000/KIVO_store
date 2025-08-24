import { CountdownTimer } from "./countdown-timer";
import type { PromotionWithProduct } from "@shared/schema";

interface PromotionBannerProps {
  promotion: PromotionWithProduct;
}

export function PromotionBanner({ promotion }: PromotionBannerProps) {
  if (!promotion.products) return null;

  const product = promotion.products;
  const discountedPrice = parseFloat(product.price) * (1 - promotion.discount_percent / 100);

  return (
    <section className="py-20 bg-gradient-to-r from-kivo-dark to-purple-900 text-white relative overflow-hidden" data-testid="promotion-banner">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-orbitron font-bold text-5xl md:text-6xl mb-6 kivo-glow" data-testid="promotion-title">
            🔥 OFERTAS ESPECIALES 🔥
          </h2>
          <p className="text-2xl text-kivo-gold font-semibold animate-bounce-slow" data-testid="promotion-subtitle">
            ¡Tiempo limitado! No dejes pasar estas increíbles promociones
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="bg-black/30 rounded-3xl p-8 mb-12 glass-effect">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-4" data-testid="countdown-title">⏰ La oferta termina en:</h3>
            <CountdownTimer endDate={promotion.ends_at} />
          </div>

          {/* Featured Product */}
          <div className="promotion-banner rounded-2xl p-8 text-center">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="md:w-1/2 mb-6 md:mb-0">
                <h4 className="text-4xl font-bold mb-4" data-testid="featured-product-name">
                  {product.name} 🚀
                </h4>
                <p className="text-xl mb-4" data-testid="featured-product-description">
                  {product.description}
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <span className="text-2xl line-through opacity-60" data-testid="original-price">
                    ${parseFloat(product.price).toLocaleString()}
                  </span>
                  <span className="text-5xl font-black" data-testid="discounted-price">
                    ${discountedPrice.toLocaleString()}
                  </span>
                  <span className="bg-kivo-gold text-kivo-dark px-4 py-2 rounded-full font-bold text-xl animate-pulse" data-testid="discount-badge">
                    {promotion.discount_percent}% OFF
                  </span>
                </div>
              </div>
              <div className="md:w-1/2">
                {product.image_url && (
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="rounded-xl shadow-2xl hover:scale-105 transition-transform duration-300 w-full h-auto"
                    data-testid="featured-product-image"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
