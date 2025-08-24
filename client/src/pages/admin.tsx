import { useState } from "react";
import { useProducts } from "@/hooks/use-products";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Package, Users, TrendingUp, Plus, Settings, Eye } from "lucide-react";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { data: productsData, isLoading } = useProducts();
  const products = productsData?.data || [];

  const totalProducts = products.length;
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const lowStockProducts = products.filter(product => product.stock <= 5).length;
  const totalValue = products.reduce((sum, product) => sum + (parseFloat(product.price) * product.stock), 0);

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "products", label: "Productos", icon: Package },
    { id: "users", label: "Usuarios", icon: Users },
    { id: "analytics", label: "Analíticas", icon: TrendingUp },
    { id: "settings", label: "Configuración", icon: Settings },
  ];

  const renderDashboard = () => (
    <div className="space-y-6" data-testid="admin-dashboard">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-kivo-purple" data-testid="metric-total-products">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold">{totalProducts}</CardTitle>
            <CardDescription>Total Productos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Package className="h-4 w-4 text-kivo-purple mr-2" />
              <span className="text-sm text-green-600">+2.5% vs mes anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-kivo-gold" data-testid="metric-total-stock">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold">{totalStock}</CardTitle>
            <CardDescription>Unidades en Stock</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-kivo-gold mr-2" />
              <span className="text-sm text-green-600">Stock saludable</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500" data-testid="metric-low-stock">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold">{lowStockProducts}</CardTitle>
            <CardDescription>Stock Bajo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Package className="h-4 w-4 text-red-500 mr-2" />
              <span className="text-sm text-red-600">Requiere atención</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-kivo-green" data-testid="metric-total-value">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold">${totalValue.toLocaleString()}</CardTitle>
            <CardDescription>Valor Total Inventario</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BarChart3 className="h-4 w-4 text-kivo-green mr-2" />
              <span className="text-sm text-green-600">+8.2% vs mes anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Products */}
      <Card data-testid="recent-products">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Productos Recientes</CardTitle>
              <CardDescription>Últimos productos agregados al catálogo</CardDescription>
            </div>
            <Button className="bg-gradient-to-r from-kivo-purple to-kivo-gold" data-testid="add-product-button">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Producto
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4" data-testid={`product-skeleton-${i}`}>
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {products.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors" data-testid={`product-row-${product.id}`}>
                  <div className="flex items-center space-x-4">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="h-12 w-12 object-cover rounded" />
                    ) : (
                      <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold" data-testid={`product-name-${product.id}`}>{product.name}</h4>
                      <p className="text-sm text-gray-600" data-testid={`product-category-${product.id}`}>{product.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-semibold" data-testid={`product-price-${product.id}`}>
                      ${parseFloat(product.price).toLocaleString()}
                    </span>
                    <Badge 
                      variant={product.stock > 10 ? "default" : product.stock > 0 ? "secondary" : "destructive"}
                      data-testid={`product-stock-${product.id}`}
                    >
                      {product.stock} en stock
                    </Badge>
                    <Button size="sm" variant="outline" data-testid={`view-product-${product.id}`}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-6" data-testid="admin-products">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-kivo-dark">Gestión de Productos</h2>
          <p className="text-gray-600">Administra tu catálogo de productos</p>
        </div>
        <Button className="bg-gradient-to-r from-kivo-purple to-kivo-gold" data-testid="add-new-product">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors" data-testid={`admin-product-${product.id}`}>
                  <div className="flex items-center space-x-4">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="h-16 w-16 object-cover rounded" />
                    ) : (
                      <div className="h-16 w-16 bg-gray-200 rounded flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-lg">{product.name}</h4>
                      <p className="text-gray-600">{product.description.substring(0, 100)}...</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">{product.category}</Badge>
                        <span className="text-sm text-gray-500">
                          SKU: KIVO-{product.id.slice(-8)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold text-lg">${parseFloat(product.price).toLocaleString()}</p>
                      <Badge 
                        variant={product.stock > 10 ? "default" : product.stock > 0 ? "secondary" : "destructive"}
                      >
                        {product.stock} en stock
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        Editar
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderPlaceholder = (title: string) => (
    <div className="text-center py-16" data-testid={`admin-${activeTab}`}>
      <h2 className="text-3xl font-bold text-kivo-dark mb-4">{title}</h2>
      <p className="text-gray-600 mb-8">Esta sección está en desarrollo</p>
      <Button className="bg-gradient-to-r from-kivo-purple to-kivo-gold">
        Próximamente
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white" data-testid="admin-page">
      {/* Header */}
      <div className="bg-gradient-to-r from-kivo-purple to-kivo-dark text-white py-8" data-testid="admin-header">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-orbitron font-bold text-4xl mb-2 kivo-glow">
                Panel Administrativo KIVO
              </h1>
              <p className="text-kivo-gold font-semibold">
                Gestiona tu tienda con poder y elegancia
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">Bienvenido de vuelta</p>
              <p className="font-semibold">Administrador KIVO</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1" data-testid="admin-sidebar">
            <Card className="sticky top-4">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                          activeTab === tab.id
                            ? "bg-gradient-to-r from-kivo-purple to-kivo-gold text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                        data-testid={`admin-tab-${tab.id}`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-4" data-testid="admin-content">
            {activeTab === "dashboard" && renderDashboard()}
            {activeTab === "products" && renderProducts()}
            {activeTab === "users" && renderPlaceholder("Gestión de Usuarios")}
            {activeTab === "analytics" && renderPlaceholder("Analíticas y Reportes")}
            {activeTab === "settings" && renderPlaceholder("Configuración del Sistema")}
          </div>
        </div>
      </div>
    </div>
  );
}
