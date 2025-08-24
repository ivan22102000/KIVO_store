import { useParams } from "wouter";
import { useProduct } from "@/hooks/use-products";
import { usePromotions } from "@/hooks/use-promotions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ShoppingCart, Heart, Share2, Package, Star, Shield, Truck, RotateCcw } from "lucide-react";
import { Link } from "wouter";

export default function ProductDetail() {
  const params = useParams();
  const productId = params.id as string;

  const { data: productData, isLoading: productLoading } = useProduct(productId);
  const { data: promotionsData } = usePromotions(productId);

  const product = productData?.data;
  const promotions = promotionsData?.data || [];
  const bestPromotion = promotions[0];

  if (productLoading) {
    return (
      <div className="container mx-auto px-4 py-8" data-testid="product-loading">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="h-96 w-full rounded-3xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center" data-testid="product-not-found">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Producto no encontrado</h1>
        <p className="text-gray-600 mb-8">El producto que buscas no existe o ha sido eliminado.</p>
        <Link href="/products">
          <Button>Volver a productos</Button>
        </Link>
      </div>
    );
  }

  const discountedPrice = bestPromotion 
    ? parseFloat(product.price) * (1 - bestPromotion.discount_percent / 100)
    : null;

  const handleAddToCart = () => {
    // TODO: Implement add to cart functionality
    console.log("Adding to cart:", product.id);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        // Could show a toast notification here
      } catch (error) {
        console.error("Error copying to clipboard:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white" data-testid="product-detail-page">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-8" data-testid="breadcrumb">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Inicio</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/products">Productos</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4" data-testid="product-image-section">
            <div className="relative overflow-hidden rounded-3xl shadow-2xl">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-96 lg:h-[500px] object-cover hover:scale-105 transition-transform duration-500"
                  data-testid="product-main-image"
                />
              ) : (
                <div className="w-full h-96 lg:h-[500px] bg-gray-200 flex items-center justify-center" data-testid="product-image-placeholder">
                  <Package className="h-24 w-24 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6" data-testid="product-details-section">
            {/* Title */}
            <h1 className="font-orbitron font-bold text-4xl lg:text-5xl text-kivo-dark" data-testid="product-title">
              {product.name}
            </h1>

            {/* Price and Promotions */}
            <div className="space-y-4" data-testid="price-section">
              {bestPromotion ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl line-through text-gray-400" data-testid="original-price">
                      ${parseFloat(product.price).toLocaleString()}
                    </span>
                    <span className="text-4xl font-black text-red-500" data-testid="discounted-price">
                      ${discountedPrice!.toLocaleString()}
                    </span>
                    <Badge className="bg-red-500 text-white text-lg px-3 py-1" data-testid="discount-badge">
                      -{bestPromotion.discount_percent}%
                    </Badge>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4" data-testid="promotion-alert">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">🔥</span>
                      <div>
                        <p className="font-bold text-green-800">{bestPromotion.title}</p>
                        <p className="text-sm text-green-600">
                          Válida hasta {new Date(bestPromotion.ends_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <span className="text-4xl font-black text-kivo-purple" data-testid="regular-price">
                  ${parseFloat(product.price).toLocaleString()}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2" data-testid="stock-section">
              <Package className="h-5 w-5 text-gray-500" />
              <span className="text-gray-600">Stock:</span>
              {product.stock > 10 ? (
                <Badge className="bg-kivo-green text-white" data-testid="stock-high">
                  En Stock ({product.stock} disponibles)
                </Badge>
              ) : product.stock > 0 ? (
                <Badge variant="outline" className="border-yellow-500 text-yellow-600" data-testid="stock-low">
                  Últimas unidades ({product.stock} disponibles)
                </Badge>
              ) : (
                <Badge variant="destructive" data-testid="stock-out">
                  Agotado
                </Badge>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2" data-testid="rating-section">
              <div className="flex text-kivo-gold">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <span className="text-gray-600">(4.8)</span>
              <span className="text-gray-500">·</span>
              <span className="text-gray-500">124 reseñas</span>
            </div>

            {/* Description */}
            <div className="space-y-2" data-testid="description-section">
              <h3 className="text-xl font-semibold text-gray-900">Descripción</h3>
              <p className="text-gray-600 leading-relaxed" data-testid="product-description">
                {product.description}
              </p>
            </div>

            {/* Specifications */}
            <div className="space-y-4" data-testid="specifications-section">
              <h3 className="text-xl font-semibold text-gray-900">Especificaciones</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  {product.category && (
                    <div className="flex justify-between">
                      <span className="font-medium">Categoría:</span>
                      <span className="text-gray-600 capitalize" data-testid="product-category">
                        {product.category}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-medium">SKU:</span>
                    <span className="text-gray-600" data-testid="product-sku">
                      KIVO-{product.id.slice(-8)}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Agregado:</span>
                    <span className="text-gray-600" data-testid="product-created">
                      {new Date(product.created_at).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                  {product.updated_at && product.updated_at !== product.created_at && (
                    <div className="flex justify-between">
                      <span className="font-medium">Actualizado:</span>
                      <span className="text-gray-600" data-testid="product-updated">
                        {new Date(product.updated_at).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4" data-testid="action-buttons">
              <div className="flex flex-col sm:flex-row gap-4">
                {product.stock > 0 ? (
                  <>
                    <Button
                      size="lg"
                      className="flex-1 bg-gradient-to-r from-kivo-purple to-kivo-gold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                      onClick={handleAddToCart}
                      data-testid="add-to-cart-button"
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Agregar al Carrito
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="flex-1 border-kivo-purple text-kivo-purple hover:bg-kivo-purple hover:text-white transition-all duration-300"
                      data-testid="buy-now-button"
                    >
                      ⚡ Comprar Ahora
                    </Button>
                  </>
                ) : (
                  <Button
                    size="lg"
                    variant="secondary"
                    disabled
                    className="flex-1"
                    data-testid="out-of-stock-button"
                  >
                    <Package className="h-5 w-5 mr-2" />
                    Producto Agotado
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="hover:bg-kivo-purple hover:text-white transition-colors duration-300"
                  data-testid="add-to-wishlist-button"
                >
                  <Heart className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleShare}
                  className="hover:bg-kivo-purple hover:text-white transition-colors duration-300"
                  data-testid="share-button"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Additional Information */}
            <div className="border-t pt-6" data-testid="additional-info">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="space-y-2">
                  <Truck className="h-8 w-8 text-kivo-purple mx-auto" />
                  <div className="text-sm">
                    <p className="font-semibold">Envío Gratis</p>
                    <p className="text-gray-600">En compras mayores a $500</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <RotateCcw className="h-8 w-8 text-kivo-purple mx-auto" />
                  <div className="text-sm">
                    <p className="font-semibold">30 Días</p>
                    <p className="text-gray-600">Garantía de devolución</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Shield className="h-8 w-8 text-kivo-purple mx-auto" />
                  <div className="text-sm">
                    <p className="font-semibold">Compra Segura</p>
                    <p className="text-gray-600">Pagos protegidos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
