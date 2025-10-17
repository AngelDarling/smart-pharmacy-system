import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useCart from "../hooks/useCart.js";
import useAuth from "../hooks/useAuth.js";
import locationsBefore from "../locations_before.json"; // Dữ liệu "Trước sáp nhập"
// *** THÊM IMPORT MỚI CHO DỮ LIỆU "SAU SÁP NHẬP" ***
import locationsAfter from "../locations_after.json";

// Icons
const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const PhoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const MapPinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const CreditCardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
    <line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20,6 9,17 4,12"/>
  </svg>
);

const ToggleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="5" width="22" height="14" rx="7" ry="7"/>
    <circle cx="8" cy="12" r="3"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 9l6 6 6-6"/>
  </svg>
);

// *** XÓA API HOST - KHÔNG CẦN DÙNG NỮA ***
// const API_HOST = "https://provinces.open-api.vn/api/v2/";

export default function Checkout() {
  const { items, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    email: user?.email || "",
    address: "",
    city: "",
    district: "",
    ward: "",
    note: "",
    paymentMethod: "cod",
    requestInvoice: false,
    addressType: 'after' // Mặc định là địa chỉ mới nhất
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Dùng để lưu trữ danh sách dropdown
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  
  // Search states for dropdowns
  const [citySearch, setCitySearch] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");
  const [wardSearch, setWardSearch] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [showWardDropdown, setShowWardDropdown] = useState(false);

  // Invoice form data
  const [invoiceData, setInvoiceData] = useState({
    recipientType: "individual", // "individual" or "company"
    fullName: "",
    phone: "",
    address: "",
    email: "",
    taxCode: "",
    companyName: ""
  });


  // *** CẬP NHẬT LOGIC ĐỂ ĐỌC TỪ FILE JSON ***
  // 1. Lấy Tỉnh/Thành phố
  useEffect(() => {
    setCities([]); setDistricts([]); setWards([]);
    setFormData(p => ({ ...p, city: "", district: "", ward: "" }));

    if (formData.addressType === 'after') {
      setCities(locationsAfter.map(city => ({ name: city.FullName, code: city.Code })));
    } else { // before
      const cityCodes = Object.keys(locationsBefore);
      setCities(cityCodes.map(code => ({ 
        name: locationsBefore[code].name_with_type, 
        code: code 
      })));
    }
  }, [formData.addressType]);

  // 2. Lấy Quận/Huyện (cho 'before') HOẶC Phường/Xã (cho 'after')
  useEffect(() => {
    if (!formData.city) return;
    
    setDistricts([]); setWards([]);
    setFormData(p => ({ ...p, district: "", ward: "" }));

    if (formData.addressType === 'after') {
      const selectedCity = locationsAfter.find(city => city.Code === formData.city);
      if (selectedCity && selectedCity.Wards) {
        setWards(selectedCity.Wards.map(ward => ({ name: ward.FullName, code: ward.Code })));
      } else {
        setWards([]);
      }
    } else { // before
      const cityData = locationsBefore[formData.city];
      if (cityData && cityData['quan-huyen']) {
        const districtCodes = Object.keys(cityData['quan-huyen']);
        setDistricts(districtCodes.map(code => ({ 
          name: cityData['quan-huyen'][code].name_with_type, 
          code: code 
        })));
      }
    }
  }, [formData.city, formData.addressType]);

  // 3. Lấy Phường/Xã (chỉ cho 'trước sáp nhập')
  useEffect(() => {
    if (formData.addressType === 'before' && formData.district) {
      setWards([]);
      setFormData(p => ({ ...p, ward: "" }));
      const districtData = locationsBefore[formData.city]?.['quan-huyen']?.[formData.district];
      if (districtData && districtData['xa-phuong']) {
        const wardCodes = Object.keys(districtData['xa-phuong']);
        setWards(wardCodes.map(code => ({ 
          name: districtData['xa-phuong'][code].name_with_type, 
          code: code 
        })));
      }
    }
  }, [formData.district, formData.addressType, formData.city]);

  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart");
    }
  }, [items, navigate]);

  // Sync search states with formData
  useEffect(() => {
    if (formData.city) {
      const city = cities.find(c => c.code === formData.city);
      if (city) setCitySearch(city.name);
    }
  }, [formData.city, cities]);

  useEffect(() => {
    if (formData.district) {
      const district = districts.find(d => d.code === formData.district);
      if (district) setDistrictSearch(district.name);
    }
  }, [formData.district, districts]);

  useEffect(() => {
    if (formData.ward) {
      const ward = wards.find(w => w.code === formData.ward);
      if (ward) setWardSearch(ward.name);
    }
  }, [formData.ward, wards]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (!event.target.closest('.dropdown-container')) {
        setShowCityDropdown(false);
        setShowDistrictDropdown(false);
        setShowWardDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // Filter functions for search
  const filteredCities = cities.filter(city => 
    city.name.toLowerCase().includes(citySearch.toLowerCase())
  );
  
  const filteredDistricts = districts.filter(district => 
    district.name.toLowerCase().includes(districtSearch.toLowerCase())
  );
  
  const filteredWards = wards.filter(ward => 
    ward.name.toLowerCase().includes(wardSearch.toLowerCase())
  );

  // Handle city selection
  function handleCitySelect(city) {
    setFormData(prev => ({ ...prev, city: city.code, district: "", ward: "" }));
    setCitySearch(city.name);
    setShowCityDropdown(false);
    setDistrictSearch("");
    setWardSearch("");
  }

  // Handle district selection
  function handleDistrictSelect(district) {
    setFormData(prev => ({ ...prev, district: district.code, ward: "" }));
    setDistrictSearch(district.name);
    setShowDistrictDropdown(false);
    setWardSearch("");
  }

  // Handle ward selection
  function handleWardSelect(ward) {
    setFormData(prev => ({ ...prev, ward: ward.code }));
    setWardSearch(ward.name);
    setShowWardDropdown(false);
  }

  function handleInvoiceInputChange(e) {
    const { name, value } = e.target;
    setInvoiceData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  function handleInvoiceRecipientChange(type) {
    setInvoiceData(prev => ({
      ...prev,
      recipientType: type,
      // Reset form data when switching
      fullName: "",
      phone: "",
      address: "",
      email: "",
      taxCode: "",
      companyName: ""
    }));
  }

  function openInvoiceModal() {
    // If already has invoice data, toggle off
    if (formData.requestInvoice && formData.invoiceData) {
      setFormData(prev => ({
        ...prev,
        requestInvoice: false,
        invoiceData: null
      }));
      return;
    }

    // Load existing data if available
    if (formData.invoiceData) {
      setInvoiceData(formData.invoiceData);
    } else {
      // Reset to default
      setInvoiceData({
        recipientType: "individual",
        fullName: "",
        phone: "",
        address: "",
        email: "",
        taxCode: "",
        companyName: ""
      });
    }
    setShowInvoiceModal(true);
  }

  function handleInvoiceSubmit() {
    // Validate required fields
    if (invoiceData.recipientType === "individual") {
      if (!invoiceData.fullName || !invoiceData.phone || !invoiceData.address) {
        alert("Vui lòng điền đầy đủ thông tin bắt buộc");
        return;
      }
    } else {
      if (!invoiceData.taxCode || !invoiceData.companyName || !invoiceData.address) {
        alert("Vui lòng điền đầy đủ thông tin bắt buộc");
        return;
      }
    }

    // Save invoice data to formData and enable toggle
    setFormData(prev => ({
      ...prev,
      requestInvoice: true,
      invoiceData: invoiceData
    }));

    // Close modal
    setShowInvoiceModal(false);
  }

  function handleInvoiceCancel() {
    // Close modal without saving
    setShowInvoiceModal(false);
  }

  function toggleInvoiceStatus() {
    // If already has invoice data, open modal to edit
    if (formData.requestInvoice && formData.invoiceData) {
      // Load existing data for editing
      setInvoiceData(formData.invoiceData);
      setShowInvoiceModal(true);
    } else {
      // Open modal to fill new form
      openInvoiceModal();
    }
  }


  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Tìm tên từ code
    const cityName = cities.find(c => c.code === formData.city)?.name || formData.city;
    const districtName = districts.find(d => d.code === formData.district)?.name || formData.district;
    const wardName = wards.find(w => w.code === formData.ward)?.name || formData.ward;

    const finalAddress = [formData.address, wardName, districtName, cityName].filter(Boolean).join(", ");
    
    console.log("Final Address:", finalAddress);
    alert(`Đơn hàng sẽ được giao tới: ${finalAddress}`);
    
    setIsSubmitting(false);
  }

  if (items.length === 0) {
    return null;
  }

  const shippingFee = total >= 300000 ? 0 : 30000;
  const grandTotal = total + shippingFee;

  return (
    <>
      <style>
        {`
          input:focus, select:focus, textarea:focus {
            border-color: #2563eb !important;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1) !important;
          }
          
          .payment-option:hover {
            border-color: #2563eb !important;
            background-color: #f8fafc !important;
          }
          
          .payment-option.selected {
            border-color: #2563eb !important;
            background-color: #eff6ff !important;
          }
          
          .checkout-button:hover:not(:disabled) {
            background-color: #b91c1c !important;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3) !important;
          }
          
          .checkout-button:disabled {
            background-color: #9ca3af !important;
            cursor: not-allowed !important;
          }
          
          .back-button:hover {
            color: #1d4ed8 !important;
          }
          
          .toggle-input:checked + .toggle-slider {
            background-color: #2563eb !important;
          }
          
          .toggle-input:checked + .toggle-slider:before {
            transform: translateX(26px) !important;
          }
          
          .toggle-slider:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: 0.4s;
            border-radius: 50%;
          }
          
          select:disabled {
            background-color: #f3f4f6 !important;
            color: #9ca3af !important;
            cursor: not-allowed !important;
          }
          
          .toggle-input:checked + .toggle-slider {
            background-color: #2563eb !important;
          }
          
          .toggle-input:checked + .toggle-slider:before {
            transform: translateX(26px) !important;
          }
          
          .toggle-slider:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: 0.4s;
            border-radius: 50%;
          }
          
          .recipient-option:hover {
            border-color: #2563eb !important;
            background-color: #f8fafc !important;
          }
          
          .modal-input:focus {
            border-color: #2563eb !important;
            box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15) !important;
            transform: translateY(-1px) !important;
          }
          
          .confirm-button:hover {
            background-color: #1d4ed8 !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3) !important;
          }
          
          .cancel-button:hover {
            background-color: #f9fafb !important;
            border-color: #9ca3af !important;
            transform: translateY(-1px) !important;
          }
          
          /* Modal scroll styling */
          .modal-content {
            scrollbar-width: thin;
            scrollbar-color: #cbd5e1 #f1f5f9;
          }
          
          .modal-content::-webkit-scrollbar {
            width: 6px;
          }
          
          .modal-content::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 3px;
          }
          
          .modal-content::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 3px;
          }
          
          .modal-content::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
          
          .dropdown-container {
            position: relative;
          }
          
          .dropdown-input {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            cursor: pointer;
            background-color: white;
            transition: all 0.2s;
          }
          
          .dropdown-input:hover {
            border-color: #2563eb;
          }
          
          .dropdown-disabled {
            background-color: #f3f4f6;
            color: #9ca3af;
            cursor: not-allowed;
          }
          
          .dropdown-menu {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            margin-top: 4px;
          }
          
          .search-container {
            display: flex;
            align-items: center;
            padding: 12px 16px;
            border-bottom: 1px solid #e5e7eb;
            gap: 8px;
          }
          
          .search-input {
            flex: 1;
            border: none;
            outline: none;
            font-size: 14px;
            color: #374151;
          }
          
          .search-input::placeholder {
            color: #9ca3af;
          }
          
          .options-list {
            max-height: 200px;
            overflow-y: auto;
          }
          
          .option-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          
          .option-item:hover {
            background-color: #f8fafc;
          }
          
          .option-selected {
            background-color: #eff6ff;
            color: #2563eb;
            font-weight: 600;
          }
          
          .option-text {
            flex: 1;
            font-size: 14px;
          }
          
          .check-icon {
            width: 20px;
            height: 20px;
            background-color: #2563eb;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
          }
          
        `}
      </style>
      <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate("/cart")} style={styles.backButton} className="back-button">
          <ArrowLeftIcon />
          <span>Quay lại giỏ hàng</span>
        </button>
        <h1 style={styles.title}>Thanh toán</h1>
      </div>

      <div style={styles.layout}>
        {/* Left Column - Forms */}
        <div style={styles.leftColumn}>
          <form id="checkout-form" onSubmit={handleSubmit}>
            {/* Shipping Information */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <MapPinIcon />
                <h3 style={styles.cardTitle}>Thông tin giao hàng</h3>
              </div>
              
              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <UserIcon />
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    style={styles.input}
                    placeholder="Nhập họ và tên"
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <PhoneIcon />
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    style={styles.input}
                    placeholder="Nhập số điện thoại"
                  />
                </div>
              </div>

              <div style={{...styles.inputGroup, marginTop: '-10px'}}>
                <label style={styles.label}>
                  <MailIcon />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Nhập email (tùy chọn)"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Loại địa chỉ</label>
                <div style={styles.radioGroup}>
                  <label style={styles.radioOption}>
                    <input type="radio" name="addressType" value="after" checked={formData.addressType === "after"} onChange={handleInputChange} style={styles.radio} />
                    <span>Sau sáp nhập (Địa chỉ hiện tại)</span>
                  </label>
                  <label style={styles.radioOption}>
                    <input type="radio" name="addressType" value="before" checked={formData.addressType === "before"} onChange={handleInputChange} style={styles.radio} />
                    <span>Trước sáp nhập</span>
                  </label>
                </div>
                <div style={styles.infoBanner}>
                  <span>Đơn vị hành chính đã thay đổi theo quy định. </span>
                  <a href="/tra-cuu/dia-chinh-moi" style={styles.infoLink}>Tra cứu địa chỉ trước và sau sáp nhập</a>
                </div>
              </div>

              <div style={formData.addressType === 'before' ? styles.formGrid3 : styles.formGrid2}>
                {/* City Dropdown */}
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Tỉnh/Thành phố *</label>
                  <div style={styles.dropdownContainer} className="dropdown-container">
                    <div 
                      style={styles.dropdownInput}
                      onClick={() => setShowCityDropdown(!showCityDropdown)}
                    >
                      <span style={styles.dropdownText}>
                        {citySearch || "Chọn Tỉnh/Thành phố"}
                      </span>
                      <ChevronDownIcon />
                    </div>
                    
                    {showCityDropdown && (
                      <div style={styles.dropdownMenu}>
                        <div style={styles.searchContainer}>
                          <SearchIcon />
                          <input
                            type="text"
                            placeholder="Nhập tìm Tỉnh/Thành phố"
                            value={citySearch}
                            onChange={(e) => setCitySearch(e.target.value)}
                            style={styles.searchInput}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div style={styles.optionsList}>
                          {filteredCities.map(city => (
                            <div
                              key={city.code}
                              style={{
                                ...styles.optionItem,
                                ...(formData.city === city.code ? styles.optionSelected : {})
                              }}
                              onClick={() => handleCitySelect(city)}
                            >
                              <span style={styles.optionText}>{city.name}</span>
                              {formData.city === city.code && (
                                <div style={styles.checkIcon}>
                                  <CheckIcon />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* District Dropdown (only for 'before' address type) */}
                {formData.addressType === 'before' && (
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Quận/Huyện *</label>
                    <div style={styles.dropdownContainer} className="dropdown-container">
                      <div 
                        style={{
                          ...styles.dropdownInput,
                          ...(formData.city ? {} : styles.dropdownDisabled)
                        }}
                        onClick={() => formData.city && setShowDistrictDropdown(!showDistrictDropdown)}
                      >
                        <span style={styles.dropdownText}>
                          {districtSearch || (formData.city ? "Chọn Quận/Huyện" : "Chọn Tỉnh/TP trước")}
                        </span>
                        <ChevronDownIcon />
                      </div>
                      
                      {showDistrictDropdown && formData.city && (
                        <div style={styles.dropdownMenu}>
                          <div style={styles.searchContainer}>
                            <SearchIcon />
                            <input
                              type="text"
                              placeholder="Nhập tìm Quận/Huyện"
                              value={districtSearch}
                              onChange={(e) => setDistrictSearch(e.target.value)}
                              style={styles.searchInput}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div style={styles.optionsList}>
                            {filteredDistricts.map(district => (
                              <div
                                key={district.code}
                                style={{
                                  ...styles.optionItem,
                                  ...(formData.district === district.code ? styles.optionSelected : {})
                                }}
                                onClick={() => handleDistrictSelect(district)}
                              >
                                <span style={styles.optionText}>{district.name}</span>
                                {formData.district === district.code && (
                                  <div style={styles.checkIcon}>
                                    <CheckIcon />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Ward Dropdown */}
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Phường/Xã *</label>
                  <div style={styles.dropdownContainer} className="dropdown-container">
                    <div 
                      style={{
                        ...styles.dropdownInput,
                        ...((formData.addressType === 'before' && !formData.district) || (formData.addressType === 'after' && !formData.city) ? styles.dropdownDisabled : {})
                      }}
                      onClick={() => {
                        const canOpen = (formData.addressType === 'before' && formData.district) || (formData.addressType === 'after' && formData.city);
                        canOpen && setShowWardDropdown(!showWardDropdown);
                      }}
                    >
                      <span style={styles.dropdownText}>
                        {wardSearch || "Chọn Phường/Xã"}
                      </span>
                      <ChevronDownIcon />
                    </div>
                    
                    {showWardDropdown && ((formData.addressType === 'before' && formData.district) || (formData.addressType === 'after' && formData.city)) && (
                      <div style={styles.dropdownMenu}>
                        <div style={styles.searchContainer}>
                          <SearchIcon />
                          <input
                            type="text"
                            placeholder="Nhập tìm Phường/Xã"
                            value={wardSearch}
                            onChange={(e) => setWardSearch(e.target.value)}
                            style={styles.searchInput}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div style={styles.optionsList}>
                          {filteredWards.map(ward => (
                            <div
                              key={ward.code}
                              style={{
                                ...styles.optionItem,
                                ...(formData.ward === ward.code ? styles.optionSelected : {})
                              }}
                              onClick={() => handleWardSelect(ward)}
                            >
                              <span style={styles.optionText}>{ward.name}</span>
                              {formData.ward === ward.code && (
                                <div style={styles.checkIcon}>
                                  <CheckIcon />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Nhập địa chỉ cụ thể *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  placeholder="Số nhà, tên đường, tên khu phố..."
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Ghi chú (không bắt buộc)</label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Ví dụ: Hãy gọi cho tôi 15 phút trước khi giao"
                  style={styles.textarea}
                />
              </div>

              {/* Electronic Invoice Request */}
              <div style={styles.inputGroup}>
                <div style={styles.toggleContainer}>
                  <label style={styles.toggleLabel}>
                    <ToggleIcon />
                    Yêu cầu xuất hóa đơn điện tử
                  </label>
                  <label style={styles.toggleSwitch}>
                    <input
                      type="checkbox"
                      name="requestInvoice"
                      checked={formData.requestInvoice}
                      onChange={openInvoiceModal}
                      style={styles.toggleInput}
                      className="toggle-input"
                    />
                    <span style={styles.toggleSlider} className="toggle-slider"></span>
                  </label>
                </div>
                {formData.requestInvoice && formData.invoiceData && (
                  <div style={styles.invoiceStatus}>
                    Đã yêu cầu xuất hóa đơn điện tử cho{" "}
                    <span 
                      style={styles.recipientType}
                      onClick={toggleInvoiceStatus}
                    >
                      {formData.invoiceData.recipientType === "company" ? "Công ty" : "Cá nhân"}
                    </span>
                  </div>
                )}
              </div>

            </div>

            {/* Payment Methods */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <CreditCardIcon />
                <h3 style={styles.cardTitle}>Phương thức thanh toán</h3>
              </div>
              
              <div style={styles.paymentOptions}>
                <label style={styles.paymentOption} className={`payment-option ${formData.paymentMethod === "cod" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === "cod"}
                    onChange={handleInputChange}
                    style={styles.radio}
                  />
                  <div style={styles.paymentContent}>
                    <div style={styles.paymentTitle}>Thanh toán khi nhận hàng (COD)</div>
                    <div style={styles.paymentDesc}>Thanh toán bằng tiền mặt khi nhận hàng</div>
                  </div>
                  {formData.paymentMethod === "cod" && <CheckIcon />}
                </label>

                <label style={styles.paymentOption} className={`payment-option ${formData.paymentMethod === "momo" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="momo"
                    checked={formData.paymentMethod === "momo"}
                    onChange={handleInputChange}
                    style={styles.radio}
                  />
                  <div style={styles.paymentContent}>
                    <div style={styles.paymentTitle}>Ví điện tử MoMo</div>
                    <div style={styles.paymentDesc}>Thanh toán qua ứng dụng MoMo</div>
                  </div>
                  {formData.paymentMethod === "momo" && <CheckIcon />}
                </label>

                <label style={styles.paymentOption} className={`payment-option ${formData.paymentMethod === "vnpay" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="vnpay"
                    checked={formData.paymentMethod === "vnpay"}
                    onChange={handleInputChange}
                    style={styles.radio}
                  />
                  <div style={styles.paymentContent}>
                    <div style={styles.paymentTitle}>VNPay</div>
                    <div style={styles.paymentDesc}>Thanh toán qua VNPay</div>
                  </div>
                  {formData.paymentMethod === "vnpay" && <CheckIcon />}
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column - Order Summary */}
        <div style={styles.rightColumn}>
          <div style={styles.summaryCard}>
            <h3 style={styles.summaryTitle}>Tóm tắt đơn hàng</h3>
            
            <div style={styles.itemsList}>
              {items.map((item) => (
                <div key={item.id} style={styles.itemRow}>
                  <div style={styles.itemInfo}>
                    <img src={item.image || "/default-product.png"} alt={item.name} style={styles.itemImage} />
                    <div>
                      <div style={styles.itemName}>{item.name}</div>
                      <div style={styles.itemQty}>Số lượng: {item.qty}</div>
                    </div>
                  </div>
                  <div style={styles.itemPrice}>{(item.price * item.qty).toLocaleString()}₫</div>
                </div>
              ))}
            </div>

            <div style={styles.summaryBreakdown}>
              <div style={styles.summaryRow}>
                <span>Tạm tính:</span>
                <span>{total.toLocaleString()}₫</span>
              </div>
              <div style={styles.summaryRow}>
                <span>Phí vận chuyển:</span>
                <span style={{ color: shippingFee === 0 ? "#10b981" : "#6b7280" }}>
                  {shippingFee === 0 ? "Miễn phí" : `${shippingFee.toLocaleString()}₫`}
                </span>
              </div>
              <div style={styles.summaryRow}>
                <span>Giảm giá:</span>
                <span>0₫</span>
              </div>
            </div>

            <div style={styles.totalRow}>
              <span>Tổng cộng:</span>
              <span style={styles.totalAmount}>{grandTotal.toLocaleString()}₫</span>
            </div>

            <button
              type="submit"
              form="checkout-form"
              style={styles.checkoutButton}
              className="checkout-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang xử lý..." : "Đặt hàng"}
            </button>

            <div style={styles.disclaimer}>
              Bằng việc đặt hàng, bạn đồng ý với{" "}
              <a href="#" style={styles.disclaimerLink}>Điều khoản dịch vụ</a>{" "}
              và{" "}
              <a href="#" style={styles.disclaimerLink}>Chính sách xử lý dữ liệu cá nhân</a>{" "}
              của Smart Pharmacy.
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent} className="modal-content">
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Yêu cầu xuất hóa đơn điện tử</h3>
              <button
                onClick={handleInvoiceCancel}
                style={styles.closeButton}
              >
                ×
              </button>
            </div>

            <div style={styles.modalBody}>
              {/* Recipient Type Selection */}
              <div style={styles.recipientSection}>
                <label style={styles.recipientLabel}>Xuất hóa đơn cho</label>
                <div style={styles.recipientOptions}>
                  <button
                    type="button"
                    onClick={() => handleInvoiceRecipientChange("company")}
                    style={{
                      ...styles.recipientOption,
                      ...(invoiceData.recipientType === "company" ? styles.recipientOptionSelected : {})
                    }}
                    className="recipient-option"
                  >
                    <div style={styles.recipientIcon}>🏢</div>
                    <span style={styles.recipientText}>Công ty</span>
                    {invoiceData.recipientType === "company" && (
                      <div style={styles.checkIcon}>✓</div>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInvoiceRecipientChange("individual")}
                    style={{
                      ...styles.recipientOption,
                      ...(invoiceData.recipientType === "individual" ? styles.recipientOptionSelected : {})
                    }}
                    className="recipient-option"
                  >
                    <div style={styles.recipientIcon}>👤</div>
                    <span style={styles.recipientText}>Cá nhân</span>
                    {invoiceData.recipientType === "individual" && (
                      <div style={styles.checkIcon}>✓</div>
                    )}
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div style={styles.formFields}>
                {invoiceData.recipientType === "company" ? (
                  <>
                    <input
                      type="text"
                      name="taxCode"
                      value={invoiceData.taxCode}
                      onChange={handleInvoiceInputChange}
                      placeholder="Mã số thuế"
                      style={styles.modalInput}
                      className="modal-input"
                      required
                    />
                    <input
                      type="text"
                      name="companyName"
                      value={invoiceData.companyName}
                      onChange={handleInvoiceInputChange}
                      placeholder="Tên công ty"
                      style={styles.modalInput}
                      className="modal-input"
                      required
                    />
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      name="fullName"
                      value={invoiceData.fullName}
                      onChange={handleInvoiceInputChange}
                      placeholder="Họ và tên"
                      style={styles.modalInput}
                      className="modal-input"
                      required
                    />
                    <input
                      type="tel"
                      name="phone"
                      value={invoiceData.phone}
                      onChange={handleInvoiceInputChange}
                      placeholder="Số điện thoại"
                      style={styles.modalInput}
                      className="modal-input"
                      required
                    />
                  </>
                )}

                <input
                  type="text"
                  name="address"
                  value={invoiceData.address}
                  onChange={handleInvoiceInputChange}
                  placeholder="Địa chỉ"
                  style={styles.modalInput}
                  className="modal-input"
                  required
                />

                <input
                  type="email"
                  name="email"
                  value={invoiceData.email}
                  onChange={handleInvoiceInputChange}
                  placeholder="Email (không bắt buộc)"
                  style={styles.modalInput}
                  className="modal-input"
                />
              </div>

              <div style={styles.noteSection}>
                <p style={styles.noteText}>
                  Lưu ý: Nhà thuốc Smart Pharmacy chỉ xuất hóa đơn điện tử.
                </p>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button
                type="button"
                onClick={handleInvoiceCancel}
                style={styles.cancelButton}
                className="cancel-button"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleInvoiceSubmit}
                style={styles.confirmButton}
                className="confirm-button"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

// Styles
const styles = {
  container: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "24px 16px",
    backgroundColor: "#f8fafc",
    minHeight: "100vh"
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "32px"
  },
  backButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "none",
    border: "none",
    color: "#2563eb",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    padding: "8px 0",
    transition: "color 0.2s"
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1f2937",
    margin: 0
  },
  layout: {
    display: "flex",
    gap: "32px",
    alignItems: "flex-start"
  },
  leftColumn: {
    flex: 1,
    maxWidth: "800px"
  },
  rightColumn: {
    width: "400px",
    position: "sticky",
    top: "24px"
  },
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "24px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e5e7eb"
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "24px",
    paddingBottom: "16px",
    borderBottom: "1px solid #f3f4f6"
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1f2937",
    margin: 0
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginBottom: "20px"
  },
  formGrid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginBottom: "20px"
  },
  formGrid3: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "20px",
    marginBottom: "20px"
  },
  radioGroup: {
    display: "flex",
    gap: "24px",
    marginBottom: "12px"
  },
  radioOption: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500"
  },
  inputGroup: {
    marginBottom: "20px"
  },
  label: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151"
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    transition: "all 0.2s",
    backgroundColor: "white",
    boxSizing: "border-box",
    outline: "none"
  },
  select: {
    width: "100%",
    padding: "12px 16px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    backgroundColor: "white",
    cursor: "pointer",
    boxSizing: "border-box"
  },
  // Dropdown styles
  dropdownContainer: {
    position: "relative",
    width: "100%"
  },
  dropdownInput: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    cursor: "pointer",
    backgroundColor: "white",
    transition: "all 0.2s",
    boxSizing: "border-box"
  },
  dropdownText: {
    fontSize: "14px",
    color: "#374151",
    flex: 1
  },
  dropdownDisabled: {
    backgroundColor: "#f3f4f6",
    color: "#9ca3af",
    cursor: "not-allowed"
  },
  dropdownMenu: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    background: "white",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    zIndex: 1000,
    marginTop: "4px"
  },
  searchContainer: {
    display: "flex",
    alignItems: "center",
    padding: "12px 16px",
    borderBottom: "1px solid #e5e7eb",
    gap: "8px"
  },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: "14px",
    color: "#374151"
  },
  optionsList: {
    maxHeight: "200px",
    overflowY: "auto"
  },
  optionItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    cursor: "pointer",
    transition: "background-color 0.2s"
  },
  optionSelected: {
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    fontWeight: "600"
  },
  optionText: {
    flex: 1,
    fontSize: "14px"
  },
  checkIcon: {
    width: "20px",
    height: "20px",
    backgroundColor: "#2563eb",
    color: "white",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px"
  },
  textarea: {
    width: "100%",
    padding: "12px 16px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    resize: "vertical",
    minHeight: "80px",
    fontFamily: "inherit",
    boxSizing: "border-box"
  },
  paymentOptions: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  paymentOption: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
    backgroundColor: "white"
  },
  radio: {
    width: "20px",
    height: "20px",
    accentColor: "#2563eb"
  },
  paymentContent: {
    flex: 1
  },
  paymentTitle: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#1f2937",
    marginBottom: "4px"
  },
  paymentDesc: {
    fontSize: "12px",
    color: "#6b7280"
  },
  summaryCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e5e7eb"
  },
  summaryTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "20px",
    paddingBottom: "16px",
    borderBottom: "1px solid #f3f4f6"
  },
  itemsList: {
    marginBottom: "20px"
  },
  itemRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: "1px solid #f3f4f6"
  },
  itemInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flex: 1
  },
  itemImage: {
    width: "48px",
    height: "48px",
    objectFit: "cover",
    borderRadius: "6px",
    border: "1px solid #e5e7eb"
  },
  itemName: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#1f2937",
    lineHeight: "1.4",
    marginBottom: "4px"
  },
  itemQty: {
    fontSize: "12px",
    color: "#6b7280"
  },
  itemPrice: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1f2937"
  },
  summaryBreakdown: {
    marginBottom: "20px"
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    fontSize: "14px",
    color: "#6b7280"
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 0",
    borderTop: "2px solid #f3f4f6",
    marginBottom: "24px"
  },
  totalAmount: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#dc2626"
  },
  checkoutButton: {
    width: "100%",
    padding: "16px 24px",
    fontSize: "16px",
    fontWeight: "600",
    color: "white",
    backgroundColor: "#dc2626",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
    marginBottom: "16px"
  },
  disclaimer: {
    fontSize: "12px",
    color: "#6b7280",
    lineHeight: "1.5",
    textAlign: "center"
  },
  disclaimerLink: {
    color: "#2563eb",
    textDecoration: "underline"
  },
  // Info banner
  infoBanner: {
    backgroundColor: "#e0f2fe",
    color: "#0c4a6e",
    padding: "12px 16px",
    borderRadius: "8px",
    fontSize: "13px",
    lineHeight: "1.4",
    marginTop: "12px"
  },
  infoLink: {
    color: "#2563eb",
    textDecoration: "underline",
    fontWeight: "500"
  },
  // Toggle container
  toggleContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    border: "1px solid #e5e7eb"
  },
  toggleLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    cursor: "pointer"
  },
  toggleSwitch: {
    position: "relative",
    display: "inline-block",
    width: "50px",
    height: "24px",
    cursor: "pointer"
  },
  toggleInput: {
    opacity: 0,
    width: 0,
    height: 0
  },
  toggleSlider: {
    position: "absolute",
    cursor: "pointer",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#ccc",
    transition: "0.4s",
    borderRadius: "24px"
  },
  // Invoice status
  invoiceStatus: {
    marginTop: "12px",
    padding: "12px 16px",
    backgroundColor: "#f0f9ff",
    border: "1px solid #0ea5e9",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#0c4a6e"
  },
  recipientType: {
    color: "#2563eb",
    fontWeight: "600",
    textDecoration: "underline",
    cursor: "pointer"
  },
  // Modal styles
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: "12px",
    width: "95%",
    maxWidth: "600px",
    maxHeight: "85vh",
    overflow: "auto",
    boxShadow: "0 20px 25px rgba(0, 0, 0, 0.1)",
    display: "flex",
    flexDirection: "column"
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    borderBottom: "1px solid #e5e7eb",
    flexShrink: 0
  },
  modalTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1f2937",
    margin: 0
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "24px",
    color: "#6b7280",
    cursor: "pointer",
    padding: "4px",
    lineHeight: 1
  },
  modalBody: {
    padding: "20px",
    flex: 1,
    overflow: "auto"
  },
  recipientSection: {
    marginBottom: "20px"
  },
  recipientLabel: {
    display: "block",
    fontSize: "16px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "12px"
  },
  recipientOptions: {
    display: "flex",
    gap: "12px"
  },
  recipientOption: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "16px 12px",
    border: "2px solid #e5e7eb",
    borderRadius: "12px",
    backgroundColor: "white",
    cursor: "pointer",
    transition: "all 0.2s",
    position: "relative",
    minHeight: "70px"
  },
  recipientOptionSelected: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff"
  },
  recipientIcon: {
    fontSize: "24px",
    marginBottom: "8px"
  },
  recipientText: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "center"
  },
  formFields: {
    marginBottom: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  modalInput: {
    width: "100%",
    padding: "12px 16px",
    border: "2px solid #e5e7eb",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "500",
    transition: "all 0.2s",
    backgroundColor: "white",
    boxSizing: "border-box",
    outline: "none",
    minHeight: "48px"
  },
  noteSection: {
    backgroundColor: "#f8fafc",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    marginBottom: "16px"
  },
  noteText: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#6b7280",
    margin: 0,
    lineHeight: "1.5"
  },
  modalFooter: {
    padding: "16px 20px",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "12px",
    flexShrink: 0
  },
  cancelButton: {
    padding: "12px 24px",
    backgroundColor: "white",
    color: "#6b7280",
    border: "2px solid #d1d5db",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    minWidth: "90px"
  },
  confirmButton: {
    padding: "12px 24px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "background-color 0.2s",
    minWidth: "110px"
  }
};
