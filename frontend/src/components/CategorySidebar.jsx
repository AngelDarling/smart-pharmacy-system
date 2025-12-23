import { useEffect, useState } from "react";
import api from "../api/client.js";

export default function CategorySidebar({ selected, onSelect }) {
  const [cats, setCats] = useState([]);
  const [expandedCats, setExpandedCats] = useState([]);

  useEffect(() => {
    // Fetch tree structure categories
    api.get("/categories/tree").then((res) => {
      console.log("Categories data:", res.data);
      // Check iconUrl for each category
      res.data?.forEach(cat => {
        console.log(`Category: ${cat.name}, iconUrl: ${cat.iconUrl || 'NO ICON'}`);
        if (cat.children) {
          cat.children.forEach(child => {
            console.log(`  - Child: ${child.name}, iconUrl: ${child.iconUrl || 'NO ICON'}`);
          });
        }
      });
      setCats(res.data || []);
      // Auto expand all categories by default
      const allIds = (res.data || []).map(c => c._id);
      setExpandedCats(allIds);
    });
  }, []);

  const toggleExpand = (catId) => {
    setExpandedCats(prev => 
      prev.includes(catId) 
        ? prev.filter(id => id !== catId)
        : [...prev, catId]
    );
  };

  const renderCategory = (cat, level = 0) => {
    const isExpanded = expandedCats.includes(cat._id);
    const hasChildren = cat.children && cat.children.length > 0;
    const isSelected = selected === cat._id;
    
    return (
      <li key={cat._id} style={{ marginBottom: level === 0 ? '12px' : '0' }}>
        {/* Parent Category (Level 0) */}
        {level === 0 ? (
          <>
            <div 
              onClick={() => onSelect(cat._id)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                padding: '12px',
                borderRadius: '8px',
                background: isSelected ? '#f0f7ff' : '#f8f9fa',
                transition: 'all 0.2s',
                cursor: 'pointer',
                border: isSelected ? '2px solid #1976d2' : '2px solid transparent'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.background = '#e3f2fd';
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.background = '#f8f9fa';
              }}
            >
              {/* Category Icon/Image - Large for Level 0 */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                {cat.iconUrl && cat.iconUrl.trim() ? (
                  <img 
                    src={cat.iconUrl.startsWith('http') ? cat.iconUrl : `${cat.iconUrl}`} 
                    alt={cat.name}
                    style={{ 
                      width: '48px', 
                      height: '48px', 
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      display: 'block'
                    }}
                    onError={(e) => {
                      console.error('Image load error for:', cat.name, cat.iconUrl);
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '8px',
                  display: (cat.iconUrl && cat.iconUrl.trim()) ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}>
                  {cat.name.charAt(0)}
                </div>
              </div>
              
              {/* Category Name */}
              <div style={{ flex: 1 }}>
                <div style={{
                  color: isSelected ? '#1976d2' : '#333', 
                  fontWeight: 600,
                  fontSize: '15px',
                  marginBottom: hasChildren ? '4px' : 0
                }}>
                  {cat.name}
                </div>
                {hasChildren && (
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {cat.children.length} danh mục con
                  </div>
                )}
              </div>
              
              {/* Expand/Collapse Icon */}
              {hasChildren && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(cat._id);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    color: '#1976d2',
                    fontSize: '16px',
                    flexShrink: 0
                  }}
                >
                  {isExpanded ? '›' : '›'}
                </button>
              )}
            </div>
            
            {/* Children Categories (Level 1) - Show as grid below parent */}
            {hasChildren && isExpanded && (
              <div style={{ 
                marginTop: '8px',
                marginLeft: '8px',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px'
              }}>
                {cat.children.map(child => (
                  <div
                    key={child._id}
                    onClick={() => onSelect(child._id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px',
                      borderRadius: '6px',
                      background: selected === child._id ? '#e3f2fd' : 'white',
                      border: '1px solid #e0e0e0',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (selected !== child._id) e.currentTarget.style.background = '#f5f5f5';
                    }}
                    onMouseLeave={(e) => {
                      if (selected !== child._id) e.currentTarget.style.background = 'white';
                    }}
                  >
                    {/* Child Category Icon - Smaller */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      {child.iconUrl && child.iconUrl.trim() ? (
                        <img 
                          src={child.iconUrl.startsWith('http') ? child.iconUrl : `${child.iconUrl}`} 
                          alt={child.name}
                          style={{ 
                            width: '32px', 
                            height: '32px', 
                            objectFit: 'cover',
                            borderRadius: '4px',
                            display: 'block'
                          }}
                          onError={(e) => {
                            console.error('Image load error for child:', child.name, child.iconUrl);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div style={{
                        width: '32px',
                        height: '32px',
                        background: '#64b5f6',
                        borderRadius: '4px',
                        display: (child.iconUrl && child.iconUrl.trim()) ? 'none' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
                        {child.name.charAt(0)}
                      </div>
                    </div>
                    
                    {/* Child Category Name */}
                    <div style={{
                      flex: 1,
                      color: selected === child._id ? '#1976d2' : '#555',
                      fontSize: '13px',
                      fontWeight: selected === child._id ? 600 : 400,
                      lineHeight: '1.3'
                    }}>
                      {child.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : null}
      </li>
    );
  };

  return (
    <aside style={{ 
      width: 360, 
      padding: '16px',
      background: '#fff',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ 
        margin: '0 0 16px 0',
        fontSize: '18px',
        fontWeight: 700,
        color: '#1976d2'
      }}>
        Danh mục sản phẩm
      </h3>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        <li style={{ marginBottom: '8px' }}>
          <div style={{
            padding: '10px 12px',
            borderRadius: '6px',
            background: !selected ? '#e3f2fd' : 'transparent',
            border: !selected ? '1px solid #1976d2' : '1px solid transparent',
            transition: 'all 0.2s'
          }}>
            <button 
              onClick={() => onSelect(null)} 
              style={{ 
                background: "none", 
                border: "none", 
                color: !selected ? "#1976d2" : "#333", 
                cursor: "pointer",
                fontWeight: !selected ? 600 : 400,
                fontSize: '14px',
                width: '100%',
                textAlign: 'left'
              }}
            >
              📋 Tất cả sản phẩm
            </button>
          </div>
        </li>
        {cats.map((c) => renderCategory(c))}
      </ul>
    </aside>
  );
}


