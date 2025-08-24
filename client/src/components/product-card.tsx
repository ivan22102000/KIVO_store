import { useState } from "react";
import { Star, ShoppingCart, Heart, Share2, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
  onAddToWishlist?: (productId: string) => void;
  className?: string;
}

export function ProductCard({ 
  product, 
  onAddToCart, 
  onAddToWishlist, 
  className = "" 
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [justAddedToCart, setJustAddedToCart] = useState(false);
  const handleAddToCart = () => {
    setJustAddedToCart(true);
    setTimeout(() => setJustAddedToCart(false), 2000);
    onAddToCart?.(product.id);
  };

  const handleAddToWishlist = () => {
    setIsWishlisted(!isWishlisted);
    onAddToWishlist?.(product.id);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: `/product/${product.id}`,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(`${window.location.origin}/product/${product.id}`);
        // Could show a toast notification here
      } catch (error) {
        console.error("Error copying to clipboard:", error);
      }
    }
  };

  const getStockBadge = () => {
    if (product.stock_quantity && product.stock_quantity > 10) {
      return <Badge className="bg-kivo-green text-white animate-pulse" data-testid={`badge-stock-high-${product.id}`}>En Stock</Badge>;
    } else if (product.stock_quantity && product.stock_quantity > 0) {
      return <Badge variant="outline" className="border-yellow-500 text-yellow-600 animate-bounce" data-testid={`badge-stock-low-${product.id}`}>Últimas {product.stock_quantity}</Badge>;
    } else {
      return <Badge variant="destructive" className="animate-pulse" data-testid={`badge-stock-out-${product.id}`}>Agotado</Badge>;
    }
  };

  return (
    <div 
      className={`product-card bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:border-kivo-purple/20 transition-all duration-500 hover:scale-105 kivo-sparkle ${className} ${
        isHovered ? 'kivo-pulse-border' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`card-product-${product.id}`}
    >
      <div className="relative overflow-hidden">
        {product.image_url ? (
          <div className="relative overflow-hidden">
            <img 
              src={product.image_url} 
              alt={product.name}
              className={`w-full h-64 object-cover transition-all duration-700 ${
                isHovered ? 'scale-110 brightness-110' : 'scale-100'
              }`}
              data-testid={`img-product-${product.id}`}
            />
            {/* Sparkle overlay on hover */}
            {isHovered && (
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-pulse"></div>
            )}
          </div>
        ) : (
          <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center" data-testid={`placeholder-product-${product.id}`}>
            <Sparkles className="text-gray-400 w-12 h-12 animate-pulse" />
          </div>
        )}
        <div className="absolute top-4 right-4">
          {getStockBadge()}
        </div>
        <div className="absolute top-4 left-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <Button
            size="sm"
            variant="ghost"
            className={`bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-300 hover:scale-110 ${
              isWishlisted ? 'text-red-500 bg-red-50' : ''
            }`}
            onClick={handleAddToWishlist}
            data-testid={`button-wishlist-${product.id}`}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current animate-pulse' : ''}`} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-300 hover:scale-110 hover:rotate-12"
            onClick={handleShare}
            data-testid={`button-share-${product.id}`}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="p-6 group">
        <h3 className={`font-bold text-2xl text-kivo-dark mb-3 transition-all duration-300 ${
          isHovered ? 'text-kivo-purple transform -translate-y-1' : ''
        }`} data-testid={`text-product-name-${product.id}`}>
          {product.name}
        </h3>
        
        <p className="text-gray-600 mb-4 line-clamp-2" data-testid={`text-product-description-${product.id}`}>
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-3xl font-black text-kivo-purple" data-testid={`text-product-price-${product.id}`}>
            ${parseFloat(product.price).toLocaleString()}
          </span>
          <div className="flex items-center space-x-1">
            <div className="flex text-kivo-gold">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <span className="text-gray-500 text-sm">(4.8)</span>
          </div>
        </div>
        
        {product.category && (
          <div className="mb-4">
            <Badge variant="secondary" data-testid={`badge-category-${product.id}`}>
              {product.category}
            </Badge>
          </div>
        )}
        
        <Button 
          className={`w-full bg-gradient-to-r from-kivo-purple to-kivo-gold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden ${
            justAddedToCart ? 'animate-bounce bg-kivo-green' : ''
          }`}
          onClick={handleAddToCart}
          disabled={!product.in_stock || product.stock_quantity === 0}
          data-testid={`button-add-to-cart-${product.id}`}
        >
          {justAddedToCart ? (
            <>
              <Zap className="h-4 w-4 mr-2 animate-bounce" />
              ¡Agregado!
            </>
          ) : (
            <>
              <ShoppingCart className={`h-4 w-4 mr-2 ${isHovered ? 'animate-bounce' : ''}`} />
              {!product.in_stock || product.stock_quantity === 0 ? "Agotado" : "Agregar al Carrito"}
            </>
          )}
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000"></div>
        </Button>
      </div>
    </div>
  );
}
