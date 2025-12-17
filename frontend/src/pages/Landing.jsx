import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client.js";
import SelectPurchaseModal from "../components/SelectPurchaseModal.jsx";

// Import landing page components
import HeroSection from "../components/landing/HeroSection.jsx";
import BestSellingSection from "../components/landing/BestSellingSection.jsx";
import BannerSection from "../components/landing/BannerSection.jsx";
import FeaturedCategoriesSection from "../components/landing/FeaturedCategoriesSection.jsx";
import FavoriteBrandsSection from "../components/landing/FavoriteBrandsSection.jsx";
import TodayFeaturedSection from "../components/landing/TodayFeaturedSection.jsx";
import HealthCheckSection from "../components/landing/HealthCheckSection.jsx";

import HealthNewsSection from "../components/landing/HealthNewsSection.jsx";

export default function Landing() {
  const navigate = useNavigate();
  const [bestSellers, setBestSellers] = useState([]);
  const [todayFeatured, setTodayFeatured] = useState([]);
  const [brands, setBrands] = useState([]);
  const [healthChecks, setHealthChecks] = useState([]);
  const [page, setPage] = useState(0); // 0 or 1
  const [todayPage, setTodayPage] = useState(0); // 0 or 1 for today featured
  const [brandScrollRef, setBrandScrollRef] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    api.get("/products/best-sellers?limit=12").then((res) => setBestSellers(res.data.items || [])).catch(() => setBestSellers([]));
    api.get("/products/today-featured").then((res) => {
      setTodayFeatured(res.data.items || []);
    }).catch((err) => {
      console.error('Error fetching today featured:', err);
      setTodayFeatured([]);
    });
    // Fetch brands for favorite brands section
    api.get("/brands?isActive=true&limit=20").then((res) => {
      const items = res.data.items || res.data || [];
      // Sort by productCount descending to get popular brands
      const sortedBrands = items
        .filter(b => b.productCount > 0)
        .sort((a, b) => (b.productCount || 0) - (a.productCount || 0));
      setBrands(sortedBrands);
    }).catch((err) => {
      console.error('Error fetching brands:', err);
      setBrands([]);
    });
    // Fetch health checks
    api.get("/health-checks").then((res) => {
      setHealthChecks(res.data.items || []);
    }).catch((err) => {
      console.error('Error fetching health checks:', err);
      setHealthChecks([]);
    });
  }, []);

  const handleProductClick = (product) => {
    navigate(`/p/${product.slug}`);
  };

  const handleBuyClick = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedProduct(product);
    setShowModal(true);
  };

  return (
    <div style={{ background: '#e6f3ff', marginTop: 'auto' }}>
      <HeroSection />
      <BestSellingSection
        products={bestSellers}
        page={page}
        onPrev={() => setPage((p) => Math.max(0, p - 1))}
        onNext={() => {
          const totalPages = Math.max(1, Math.ceil((bestSellers?.length || 0) / 6));
          setPage((p) => Math.min(totalPages - 1, p + 1));
        }}
        onProductClick={handleProductClick}
        onBuyClick={handleBuyClick}
      />
      <BannerSection />
      <FeaturedCategoriesSection />
      <FavoriteBrandsSection
        brands={brands}
        scrollRef={brandScrollRef}
        onScrollRef={setBrandScrollRef}
      />
      <TodayFeaturedSection
        products={todayFeatured}
        page={todayPage}
        onPrev={() => setTodayPage((p) => Math.max(0, p - 1))}
        onNext={() => {
          const totalPages = Math.max(1, Math.ceil((todayFeatured?.length || 0) / 6));
          setTodayPage((p) => Math.min(totalPages - 1, p + 1));
        }}
        onProductClick={handleProductClick}
        onBuyClick={handleBuyClick}
      />
      <HealthCheckSection healthChecks={healthChecks} />

      <HealthNewsSection />
      {selectedProduct && (
        <SelectPurchaseModal
          product={selectedProduct}
          open={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}
