import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client.js";
import useCart from "../hooks/useCart.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import Swal from "sweetalert2";

// Import product detail components
import Breadcrumb from "../components/product-detail/Breadcrumb.jsx";
import ProductImageGallery from "../components/product-detail/ProductImageGallery.jsx";
import ProductInfo from "../components/product-detail/ProductInfo.jsx";
import PriceDisplay from "../components/product-detail/PriceDisplay.jsx";
import ProductSpecs from "../components/product-detail/ProductSpecs.jsx";
import CouponBanner from "../components/product-detail/CouponBanner.jsx";
import QuantitySelector from "../components/product-detail/QuantitySelector.jsx";
import ProductTabs from "../components/product-detail/ProductTabs.jsx";
import FAQSection from "../components/product-detail/FAQSection.jsx";
import ReviewsSection from "../components/product-detail/ReviewsSection.jsx";
import RelatedProducts from "../components/product-detail/RelatedProducts.jsx";
import ReviewModal from "../components/product-detail/ReviewModal.jsx";

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [categoryBreadcrumb, setCategoryBreadcrumb] = useState([]);
  const [activeTab, setActiveTab] = useState('description');
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: "",
    guestName: "",
    guestEmail: "",
    guestPhone: ""
  });
  const [directCoupon, setDirectCoupon] = useState(null);
  const { add } = useCart();
  const { user } = useAuth();

  // Load reviews and rating
  const loadReviews = async (productId) => {
    try {
      const [reviewsRes, ratingRes] = await Promise.all([
        api.get(`/reviews/product/${productId}?limit=50`),
        api.get(`/reviews/product/${productId}/rating`)
      ]);
      setReviews(reviewsRes.data.items || []);
      setAverageRating(ratingRes.data.averageRating || 0);
      setTotalReviews(ratingRes.data.totalReviews || 0);
      setRatingDistribution(ratingRes.data.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
    } catch (error) {
      console.error('Error loading reviews:', error);
      setReviews([]);
      setAverageRating(0);
      setTotalReviews(0);
    }
  };

  useEffect(() => {
    // Scroll to top when product changes
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Fetch product details
    api.get(`/products/slug/${slug}`).then((res) => {
      setProduct(res.data);
      setSelectedImage(0);
      setQuantity(1);

      // Load reviews and rating
      if (res.data._id) {
        loadReviews(res.data._id);
      }

      // Load direct apply coupon
      api.get(`/coupons/direct-apply/${slug}`).then((couponRes) => {
        if (couponRes.data.success && couponRes.data.coupon) {
          setDirectCoupon(couponRes.data.coupon);
        } else {
          setDirectCoupon(null);
        }
      }).catch(() => {
        setDirectCoupon(null);
      });

      // Build category breadcrumb
      if (res.data.categoryId) {
        buildCategoryBreadcrumb(res.data.categoryId);

        // Fetch related products (same category)
        const categorySlug = res.data.categoryId.slug || res.data.categorySlug;
        if (categorySlug) {
          api.get(`/products?category=${categorySlug}&limit=8`).then((relRes) => {
            const related = (relRes.data.items || []).filter(p => p._id !== res.data._id).slice(0, 6);
            setRelatedProducts(related);
          });
        }
      } else {
        setCategoryBreadcrumb([]);
      }
    });
  }, [slug]);

  const buildCategoryBreadcrumb = async (category) => {
    try {
      const res = await api.get('/categories/tree');
      const categories = res.data || [];

      const breadcrumb = [];
      const findCategoryPath = (cats, targetId, path = []) => {
        for (const cat of cats) {
          if (cat._id === targetId) {
            breadcrumb.push(...path, cat);
            return true;
          }
          if (cat.children && cat.children.length > 0) {
            if (findCategoryPath(cat.children, targetId, [...path, cat])) {
              return true;
            }
          }
        }
        return false;
      };

      findCategoryPath(categories, category._id);
      setCategoryBreadcrumb(breadcrumb);
    } catch (error) {
      console.error('Error building breadcrumb:', error);
      setCategoryBreadcrumb([category]);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const formatDiscountAmount = (amount) => {
    if (amount >= 1000) {
      const thousands = amount / 1000;
      if (thousands % 1 === 0) {
        return `${thousands}K`;
      } else {
        return `${thousands.toFixed(1)}K`;
      }
    }
    return amount.toString();
  };

  const handleAddToCart = () => {
    add(product, quantity);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.showCartDropdown) {
      window.showCartDropdown();
    }
  };

  const formatReviewDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 30) return `${diffDays} ngày trước`;
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} tháng trước`;
    }
    const years = Math.floor(diffDays / 365);
    return `${years} năm trước`;
  };

  const getReviewerName = (review) => {
    if (review.userId) {
      return review.userId.fullName || review.userId.name || 'Người dùng';
    }
    return review.guestName || 'Khách';
  };

  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleReviewFormChange = (field, value) => {
    setReviewForm(prev => ({ ...prev, [field]: value }));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
        ...(user ? {} : {
          guestName: reviewForm.guestName.trim(),
          guestEmail: reviewForm.guestEmail.trim() || null,
          guestPhone: reviewForm.guestPhone.trim()
        })
      };

      await api.post(`/reviews/product/${product._id}`, payload);

      Swal.fire({
        icon: "success",
        title: "Thành công",
        text: "Đánh giá của bạn đã được gửi!",
        confirmButtonColor: "#10b981",
        timer: 2000,
        showConfirmButton: false
      });

      // Reset form
      setReviewForm({
        rating: 0,
        comment: "",
        guestName: "",
        guestEmail: "",
        guestPhone: ""
      });

      // Reload reviews
      await loadReviews(product._id);

      setShowReviewModal(false);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: error.response?.data?.message || "Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.",
        confirmButtonColor: "#ef4444"
      });
    }
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setReviewForm({
      rating: 0,
      comment: "",
      guestName: "",
      guestEmail: "",
      guestPhone: ""
    });
  };

  if (!product) {
    return (
      <div style={{
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        color: '#6b7280'
      }}>
        Đang tải...
      </div>
    );
  }

  const images = product.imageUrls && product.imageUrls.length > 0
    ? product.imageUrls
    : ['/default-product.svg'];

  // Mock FAQs
  const faqs = [
    {
      question: `${product.name} phù hợp với loại da nào?`,
      answer: product.attributes?.skinType || 'Sản phẩm này được thiết kế đặc biệt cho làn da bị mụn. Tuy nhiên, với các thành phần nhẹ nhàng và tự nhiên, nó có thể thích hợp cho mọi loại da.'
    },
    {
      question: `Thành phần chính có từ gạo và diếp cá trong ${product.name} có gì đặc biệt?`,
      answer: 'Gạo và diếp cá là hai thành phần tự nhiên mà đã được sử dụng từ lâu trong việc cải thiện độ mịn màng và sáng của da. Gạo, thông qua quá trình chiết xuất, cung cấp nhiều vitamin và khoáng chất giúp làm mềm và nuôi dưỡng làn da. Diếp cá tiên phong trong việc giảm viêm và ngăn ngừa mụn.'
    },
    {
      question: `${product.name} có gây khô da không?`,
      answer: `${product.name} có khả năng làm sạch sâu nhưng không gây khô da. Điều này là nhờ vào chiết xuất từ gạo, giúp cung cấp độ ẩm và làm mềm da.`
    },
    {
      question: `${product.name} có thể sử dụng với các sản phẩm chăm sóc da khác không?`,
      answer: `${product.name} có thể sử dụng với các sản phẩm chăm sóc da khác. Bạn chỉ cần đảm bảo rửa sạch mặt sau khi sử dụng, sau đó có thể áp dụng các sản phẩm khác như toner, serum, hoặc kem dưỡng.`
    },
    {
      question: `Có nên sử dụng ${product.name} mỗi ngày không?`,
      answer: 'Có, bạn có thể sử dụng sản phẩm này mỗi ngày, cả buổi sáng và buổi tối để đạt hiệu quả tốt nhất trong việc làm sạch và cải thiện làn da của bạn.'
    }
  ];

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', paddingBottom: 40, marginTop: 'auto' }}>
      <Breadcrumb categoryBreadcrumb={categoryBreadcrumb} productName={product.name} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
        {/* Main Product Section */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 30,
          marginBottom: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', gap: 40 }}>
            <ProductImageGallery
              images={images}
              productName={product.name}
              selectedImage={selectedImage}
              onImageSelect={setSelectedImage}
            />

            <div style={{ flex: 1 }}>
              <ProductInfo
                product={product}
                averageRating={averageRating}
                totalReviews={totalReviews}
              />

              <PriceDisplay
                product={product}
                directCoupon={directCoupon}
                formatPrice={formatPrice}
                formatDiscountAmount={formatDiscountAmount}
              />

              <ProductSpecs product={product} />

              <CouponBanner coupon={directCoupon} formatPrice={formatPrice} />

              <QuantitySelector
                quantity={quantity}
                maxStock={product.totalStock || 0}
                onQuantityChange={setQuantity}
                onAddToCart={handleAddToCart}
                disabled={!product.totalStock || product.totalStock <= 0}
              />
            </div>
          </div>
        </div>

        <ProductTabs
          product={product}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <FAQSection
          faqs={faqs}
          expandedFAQ={expandedFAQ}
          onToggleFAQ={setExpandedFAQ}
        />

        <ReviewsSection
          reviews={reviews}
          averageRating={averageRating}
          totalReviews={totalReviews}
          ratingDistribution={ratingDistribution}
          onOpenReviewModal={() => setShowReviewModal(true)}
          formatReviewDate={formatReviewDate}
          getReviewerName={getReviewerName}
          getInitials={getInitials}
        />

        <RelatedProducts
          products={relatedProducts}
          formatPrice={formatPrice}
          formatDiscountAmount={formatDiscountAmount}
        />
      </div>

      <ReviewModal
        show={showReviewModal}
        product={product}
        user={user}
        reviewForm={reviewForm}
        onClose={handleCloseReviewModal}
        onFormChange={handleReviewFormChange}
        onSubmit={handleReviewSubmit}
        formatPrice={formatPrice}
        loadReviews={loadReviews}
      />
    </div>
  );
}
