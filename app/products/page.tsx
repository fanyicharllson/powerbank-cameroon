"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { motion } from "framer-motion";
import { Search, Filter, ShoppingCart, ChevronRight } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { PRODUCTS } from "@/lib/products";
import { toast } from "sonner";

// Skeleton Loader Component
function ProductSkeleton() {
  return (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 animate-pulse">
      <div className="h-6 w-20 bg-gray-300 rounded-full mb-4"></div>
      <div className="h-48 bg-gray-300 rounded-lg mb-4"></div>
      <div className="h-6 w-32 bg-gray-300 rounded mb-3"></div>
      <div className="space-y-2 mb-4">
        <div className="h-4 w-full bg-gray-300 rounded"></div>
        <div className="h-4 w-5/6 bg-gray-300 rounded"></div>
        <div className="h-4 w-4/6 bg-gray-300 rounded"></div>
      </div>
      <div className="h-8 w-24 bg-gray-300 rounded mb-4"></div>
      <div className="h-10 w-full bg-gray-300 rounded"></div>
    </div>
  );
}

export default function ProductsPage() {
  const router = useRouter();
  const { addToCart } = useCartStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCapacity, setSelectedCapacity] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate loading delay for skeleton loaders
  const handleFilterChange = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 800);
  };

  // Filter products based on search and capacity
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCapacity =
        !selectedCapacity || product.capacity === selectedCapacity;
      return matchesSearch && matchesCapacity;
    });
  }, [searchQuery, selectedCapacity]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    handleFilterChange();
  };

  const handleCapacityFilter = (capacity: string | null) => {
    setSelectedCapacity(capacity);
    handleFilterChange();
  };

  const handleBuyNow = (product: any) => {
    addToCart(product, 1);
    toast.success(`${product.name} added — heading to checkout`);
    router.push("/checkout");
  };

  const capacities = ["10K", "20K", "30K", "65W"];

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />

      {/* Page Header */}
      <section className="bg-green-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold mb-2">Our Powerbanks</h1>
            <p className="text-green-100">
              Explore our premium collection of reliable powerbanks for every
              need
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search and Filter Bar */}
          <div className="mb-8 space-y-4">
            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search powerbanks by name..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleCapacityFilter(null)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  selectedCapacity === null
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                All Capacities
              </button>
              {capacities.map((capacity) => (
                <button
                  key={capacity}
                  onClick={() => handleCapacityFilter(capacity)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    selectedCapacity === capacity
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {capacity}
                </button>
              ))}
            </div>

            {/* Results Count */}
            <p className="text-sm text-gray-600">
              Showing {isLoading ? 0 : filteredProducts.length} of{" "}
              {PRODUCTS.length} products
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              // Show skeleton loaders while loading
              Array.from({ length: 4 }).map((_, idx) => (
                <ProductSkeleton key={idx} />
              ))
            ) : filteredProducts.length > 0 ? (
              // Show filtered products
              filteredProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow border border-gray-200"
                >
                  {/* Badge */}
                  <div className="inline-block px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full mb-4">
                    {product.capacity}
                  </div>

                  {/* Product Image Placeholder */}
                  <div className="h-48 bg-gradient-to-b from-gray-300 to-gray-400 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center">
                      <div className="text-4xl text-gray-700">■</div>
                      <div className="text-xs text-gray-600 mt-2 font-semibold">
                        {product.name}
                      </div>
                    </div>
                  </div>

                  {/* Product Details */}
                  <h3 className="font-bold text-gray-900 mb-3 text-sm">
                    {product.name}
                  </h3>
                  <ul className="text-xs text-gray-600 space-y-2 mb-4">
                    {product.features.slice(0, 3).map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Price */}
                  <div className="text-xl font-bold text-green-600 mb-4">
                    {(product.price / 1000).toFixed(0)}K FCFA
                  </div>

                  {/* Button */}
                  <button
                    onClick={() => handleBuyNow(product)}
                    className="w-full py-2 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-300 transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    BUY NOW
                  </button>
                </motion.div>
              ))
            ) : (
              // Show no results message
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600 text-lg">
                  No powerbanks found matching your criteria
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
