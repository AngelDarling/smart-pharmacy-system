import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import locationsBefore from "../locations_before.json";
// *** THAY ĐỔI: IMPORT FILE ÁNH XẠ ***
import mappingData from "../admin_mapping.json";

// Icons
const MapPinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
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

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20,6 9,17 4,12"/>
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

export default function AddressLookup() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    oldCity: "",
    oldDistrict: "",
    oldWard: ""
  });

  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [searchResult, setSearchResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Search states for dropdowns
  const [citySearch, setCitySearch] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");
  const [wardSearch, setWardSearch] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [showWardDropdown, setShowWardDropdown] = useState(false);

  // Load cities from before data
  useEffect(() => {
    const cityCodes = Object.keys(locationsBefore);
    setCities(cityCodes.map(code => ({ 
      name: locationsBefore[code].name_with_type, 
      code: code 
    })));
  }, []);

  // Sync search states with formData
  useEffect(() => {
    if (formData.oldCity) {
      const city = cities.find(c => c.code === formData.oldCity);
      if (city) setCitySearch(city.name);
    }
  }, [formData.oldCity, cities]);

  useEffect(() => {
    if (formData.oldDistrict) {
      const district = districts.find(d => d.code === formData.oldDistrict);
      if (district) setDistrictSearch(district.name);
    }
  }, [formData.oldDistrict, districts]);

  useEffect(() => {
    if (formData.oldWard) {
      const ward = wards.find(w => w.code === formData.oldWard);
      if (ward) setWardSearch(ward.name);
    }
  }, [formData.oldWard, wards]);

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

  // Handle city change
  useEffect(() => {
    if (formData.oldCity) {
      const cityData = locationsBefore[formData.oldCity];
      if (cityData && cityData['quan-huyen']) {
        const districtCodes = Object.keys(cityData['quan-huyen']);
        setDistricts(districtCodes.map(code => ({ 
          name: cityData['quan-huyen'][code].name_with_type, 
          code: code 
        })));
      } else {
        setDistricts([]);
      }
    } else {
      setDistricts([]);
    }
    setFormData(prev => ({ ...prev, oldDistrict: "", oldWard: "" }));
  }, [formData.oldCity]);

  // Handle district change
  useEffect(() => {
    if (formData.oldDistrict && formData.oldCity) {
      const districtData = locationsBefore[formData.oldCity]?.['quan-huyen']?.[formData.oldDistrict];
      if (districtData && districtData['xa-phuong']) {
        const wardCodes = Object.keys(districtData['xa-phuong']);
        setWards(wardCodes.map(code => ({ 
          name: districtData['xa-phuong'][code].name_with_type, 
          code: code 
        })));
      } else {
        setWards([]);
      }
    } else {
      setWards([]);
    }
    setFormData(prev => ({ ...prev, oldWard: "" }));
  }, [formData.oldDistrict, formData.oldCity]);


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
    setFormData(prev => ({ ...prev, oldCity: city.code, oldDistrict: "", oldWard: "" }));
    setCitySearch(city.name);
    setShowCityDropdown(false);
    setDistrictSearch("");
    setWardSearch("");
  }

  // Handle district selection
  function handleDistrictSelect(district) {
    setFormData(prev => ({ ...prev, oldDistrict: district.code, oldWard: "" }));
    setDistrictSearch(district.name);
    setShowDistrictDropdown(false);
    setWardSearch("");
  }

  // Handle ward selection
  function handleWardSelect(ward) {
    setFormData(prev => ({ ...prev, oldWard: ward.code }));
    setWardSearch(ward.name);
    setShowWardDropdown(false);
  }

  // *** THAY ĐỔI: LOGIC TRA CỨU SỬ DỤNG FILE ÁNH XẠ ***
  async function handleSearch() {
    if (!formData.oldCity || !formData.oldDistrict || !formData.oldWard) {
      alert("Vui lòng chọn đầy đủ thông tin địa chỉ cũ");
      return;
    }

    setIsLoading(true);
    setSearchResult(null);

    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      // Get the full names corresponding to the selected codes
      const cityName = locationsBefore[formData.oldCity]?.name_with_type;
      const districtName = locationsBefore[formData.oldCity]?.['quan-huyen']?.[formData.oldDistrict]?.name_with_type;
      const wardName = locationsBefore[formData.oldCity]?.['quan-huyen']?.[formData.oldDistrict]?.['xa-phuong']?.[formData.oldWard]?.name_with_type;

      // Debug log
      console.log("Searching for:", { cityName, districtName, wardName });

      // Find the mapping in the imported JSON data
      // Use case-insensitive comparison to handle differences in capitalization
      const mappingResult = mappingData.find(item => 
        item.city_name_old?.toLowerCase() === cityName?.toLowerCase() &&
        item.district_name_old?.toLowerCase() === districtName?.toLowerCase() &&
        item.ward_name_old?.toLowerCase() === wardName?.toLowerCase()
      );

      // Debug log
      console.log("Mapping result:", mappingResult);

      let result = {
        oldAddress: { city: cityName, district: districtName, ward: wardName },
        newAddress: null, // Initialize newAddress as null
        status: "Không thay đổi",
        effectiveDate: "N/A"
      };

      if (mappingResult) {
        // If a mapping is found, populate the newAddress
        // Note: New address only has city and ward, no district
        result.newAddress = {
          city: mappingResult.city_name_new,
          district: "", // No district in new address
          ward: mappingResult.ward_new_name
        };
        result.status = "Đã sáp nhập";
        result.effectiveDate = "01/07/2025"; // Assume this date, adjust if needed
      } else {
        // If no mapping is found, the new address is the same as the old one
        result.newAddress = { ...result.oldAddress }; 
      }

      setSearchResult(result);

    } catch (error) {
      console.error("Error processing mapping data:", error);
      alert("Có lỗi xảy ra khi xử lý dữ liệu tra cứu.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <style>
        {`
          .search-button:hover:not(:disabled) {
            background-color: #1d4ed8 !important;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(29, 78, 216, 0.3) !important;
          }
          
          .search-button:disabled {
            background-color: #9ca3af !important;
            cursor: not-allowed !important;
            transform: none !important;
            box-shadow: none !important;
          }
          
          .back-button:hover {
            color: #1d4ed8 !important;
          }
          
          input:focus, select:focus {
            border-color: #2563eb !important;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1) !important;
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
        {/* Main Content */}
        <div style={styles.content}>
          {/* Header */}
          <div style={styles.header}>
            <button onClick={() => navigate(-1)} style={styles.backButton} className="back-button">
              <ArrowLeftIcon />
              <span>Quay lại</span>
            </button>
            <h1 style={styles.title}>Tra cứu địa chỉ hành chính mới</h1>
          </div>
          {/* Title Section */}
          <div style={styles.titleSection}>
            <h2 style={styles.mainTitle}>
              Tra cứu địa chỉ hành chính mới theo Nghị quyết 202/2025/QH15
            </h2>
            <h3 style={styles.subTitle}>Tra cứu địa chỉ mới</h3>
            <p style={styles.description}>
              Nhập địa chỉ cũ sau đó nhấn 'Tra cứu ngay' để tra cứu tên đơn vị hành chính mới theo Nghị quyết sắp xếp, sáp nhập có hiệu lực từ ngày 01/07/2025.
            </p>
          </div>

          {/* Search Form */}
          <div style={styles.searchForm}>
            <div style={styles.formHeader}>
              <MapPinIcon />
              <span style={styles.formTitle}>Địa chỉ cũ</span>
            </div>
            
            <div style={styles.formGrid}>
              {/* City Dropdown */}
              <div style={styles.inputGroup}>
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
                              ...(formData.oldCity === city.code ? styles.optionSelected : {})
                            }}
                            onClick={() => handleCitySelect(city)}
                          >
                            <span style={styles.optionText}>{city.name}</span>
                            {formData.oldCity === city.code && (
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
              
              {/* District Dropdown */}
              <div style={styles.inputGroup}>
                <div style={styles.dropdownContainer} className="dropdown-container">
                  <div 
                    style={{
                      ...styles.dropdownInput,
                      ...(formData.oldCity ? {} : styles.dropdownDisabled)
                    }}
                    onClick={() => formData.oldCity && setShowDistrictDropdown(!showDistrictDropdown)}
                  >
                    <span style={styles.dropdownText}>
                      {districtSearch || (formData.oldCity ? "Chọn Quận/Huyện" : "Chọn Tỉnh/TP trước")}
                    </span>
                    <ChevronDownIcon />
                  </div>
                  
                  {showDistrictDropdown && formData.oldCity && (
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
                              ...(formData.oldDistrict === district.code ? styles.optionSelected : {})
                            }}
                            onClick={() => handleDistrictSelect(district)}
                          >
                            <span style={styles.optionText}>{district.name}</span>
                            {formData.oldDistrict === district.code && (
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
              
              {/* Ward Dropdown */}
              <div style={styles.inputGroup}>
                <div style={styles.dropdownContainer} className="dropdown-container">
                  <div 
                    style={{
                      ...styles.dropdownInput,
                      ...(formData.oldDistrict ? {} : styles.dropdownDisabled)
                    }}
                    onClick={() => formData.oldDistrict && setShowWardDropdown(!showWardDropdown)}
                  >
                    <span style={styles.dropdownText}>
                      {wardSearch || (formData.oldDistrict ? "Chọn Phường/Xã" : "Chọn Quận/Huyện trước")}
                    </span>
                    <ChevronDownIcon />
                  </div>
                  
                  {showWardDropdown && formData.oldDistrict && (
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
                              ...(formData.oldWard === ward.code ? styles.optionSelected : {})
                            }}
                            onClick={() => handleWardSelect(ward)}
                          >
                            <span style={styles.optionText}>{ward.name}</span>
                            {formData.oldWard === ward.code && (
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
            
            <button 
              onClick={handleSearch} 
              style={styles.searchButton} 
              className="search-button"
              disabled={isLoading}
            >
              <SearchIcon />
              {isLoading ? "Đang tra cứu..." : "Tra cứu ngay"}
            </button>
          </div>

          {/* Search Result */}
          {searchResult && (
            <div style={styles.resultCard}>
              <h3 style={styles.resultTitle}>Kết quả tra cứu</h3>
              <div style={styles.resultContent}>
                <div style={styles.addressComparison}>
                  <div style={styles.oldAddress}>
                    <h4 style={styles.addressTitle}>Địa chỉ cũ</h4>
                    <p style={styles.addressText}>
                      {searchResult.oldAddress.ward}, {searchResult.oldAddress.district}, {searchResult.oldAddress.city}
                    </p>
                  </div>
                  <div style={styles.arrow}>→</div>
                   <div style={styles.newAddress}>
                     <h4 style={styles.addressTitle}>Địa chỉ mới</h4>
                     <p style={styles.addressText}>
                       {searchResult.newAddress.ward}{searchResult.newAddress.district ? `, ${searchResult.newAddress.district}` : ''}, {searchResult.newAddress.city}
                     </p>
                   </div>
                </div>
                                <div style={styles.statusInfo}>
                                  <span style={styles.statusLabel}>Trạng thái:</span>
                                  <span style={{...styles.statusValue, color: searchResult.status === "Đã sáp nhập" ? "#10b981" : "#6b7280"}}>
                                    {searchResult.status}
                                  </span>
                                </div>
                <div style={styles.effectiveDate}>
                  <span style={styles.dateLabel}>Có hiệu lực từ:</span>
                  <span style={styles.dateValue}>{searchResult.effectiveDate}</span>
                </div>
              </div>
            </div>
          )}

          {/* Information Sections */}
          <div style={styles.infoSection}>
            <h3 style={styles.sectionTitle}>Tính năng tra cứu địa chỉ hành chính mới sau sáp nhập</h3>
            <p style={styles.sectionText}>
              Nhằm hỗ trợ người dân thuận tiện cập nhật thông tin địa chỉ và đơn vị hành chính mới sau khi Nghị quyết sáp nhập tỉnh/thành phố năm 2025 có hiệu lực, hệ thống tra cứu đơn vị hành chính mới trên website Nhà thuốc Long Châu đã được triển khai.
            </p>
            <ul style={styles.featureList}>
              <li>Tìm kiếm nhanh chóng địa chỉ theo đơn vị hành chính mới bằng cách nhập tên địa phương, quận/huyện hoặc tỉnh/thành cũ.</li>
              <li>Xác định chính xác vị trí các Nhà thuốc Long Châu tại các khu vực đã có thay đổi hành chính, giúp khách hàng dễ dàng tìm đến đúng địa chỉ.</li>
            </ul>
          </div>

          <div style={styles.infoSection}>
            <h3 style={styles.sectionTitle}>Mục tiêu và bối cảnh ban hành Nghị quyết</h3>
            <p style={styles.sectionText}>
              Ngày 12/06/2025, Quốc hội khóa XV đã chính thức thông qua Nghị quyết số 202/2025/QH15, với 461/465 đại biểu biểu quyết tán thành. Theo nội dung Nghị quyết, số lượng tỉnh/thành phố trực thuộc Trung ương sẽ được điều chỉnh từ 63 xuống còn 34 đơn vị. Đây là một bước đi có tính chiến lược, đánh dấu giai đoạn cải cách hành chính toàn diện, góp phần định hình một nền quản trị nhà nước tỉnh gọn, hiện đại và hiệu quả hơn.
            </p>
          </div>

          <div style={styles.infoSection}>
            <h3 style={styles.sectionTitle}>Các nội dung chính của Nghị quyết</h3>
            <ul style={styles.featureList}>
              <li>Giảm số lượng đơn vị hành chính cấp tỉnh từ 63 xuống 34 đơn vị</li>
              <li>Bảo tồn bản sắc văn hóa và lịch sử của các địa phương</li>
              <li>Thực hiện theo từng giai đoạn để đảm bảo ổn định</li>
              <li>Tái cơ cấu bộ máy quản lý nhà nước</li>
            </ul>
          </div>

          <div style={styles.infoSection}>
            <h3 style={styles.sectionTitle}>Ý nghĩa và tác động dự kiến</h3>
            <p style={styles.sectionText}>
              Nghị quyết này được coi là một cuộc cải cách hành chính lớn, nhằm tạo ra một bộ máy quản lý nhà nước gọn nhẹ, hiệu quả hơn. Việc sáp nhập các tỉnh/thành phố sẽ giúp tiết kiệm ngân sách, tăng cường hiệu quả quản lý và tạo điều kiện phát triển cân bằng giữa các vùng miền.
            </p>
          </div>
        </div>

      </div>
    </>
  );
}

// Styles
const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc"
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "0 0 24px 0",
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
    fontSize: "24px",
    fontWeight: "700",
    color: "#1f2937",
    margin: 0
  },
  content: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "32px 16px"
  },
  titleSection: {
    textAlign: "center",
    marginBottom: "40px"
  },
  mainTitle: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#2563eb",
    marginBottom: "16px",
    lineHeight: "1.2"
  },
  subTitle: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#2563eb",
    marginBottom: "16px"
  },
  description: {
    fontSize: "16px",
    color: "#6b7280",
    lineHeight: "1.6",
    maxWidth: "800px",
    margin: "0 auto"
  },
  searchForm: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "32px",
    marginBottom: "32px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e5e7eb"
  },
  formHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "24px"
  },
  formTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1f2937"
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "20px",
    marginBottom: "24px"
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column"
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
  searchButton: {
    width: "100%",
    padding: "16px 24px",
    fontSize: "16px",
    fontWeight: "600",
    color: "white",
    backgroundColor: "#2563eb",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px"
  },
  resultCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "32px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e5e7eb"
  },
  resultTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "20px"
  },
  resultContent: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  addressComparison: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    padding: "20px",
    backgroundColor: "#f8fafc",
    borderRadius: "8px"
  },
  oldAddress: {
    flex: 1
  },
  newAddress: {
    flex: 1
  },
  addressTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: "8px"
  },
  addressText: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#1f2937"
  },
  arrow: {
    fontSize: "24px",
    color: "#2563eb",
    fontWeight: "bold"
  },
  statusInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  statusLabel: {
    fontSize: "14px",
    color: "#6b7280"
  },
  statusValue: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#10b981"
  },
  effectiveDate: {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  dateLabel: {
    fontSize: "14px",
    color: "#6b7280"
  },
  dateValue: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1f2937"
  },
  infoSection: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "24px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e5e7eb"
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "16px"
  },
  sectionText: {
    fontSize: "14px",
    color: "#6b7280",
    lineHeight: "1.6",
    marginBottom: "16px"
  },
  featureList: {
    fontSize: "14px",
    color: "#6b7280",
    lineHeight: "1.6",
    paddingLeft: "20px"
  },
};
