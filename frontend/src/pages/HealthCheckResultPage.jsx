import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";

export default function HealthCheckResultPage() {
  const location = useLocation();
  const { result, totalScore, healthCheckName } = location.state || {};

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  if (!result) {
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column",
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "60vh",
        gap: 20
      }}>
        <div style={{ fontSize: 18, color: "#666" }}>
          Không có kết quả để hiển thị.
        </div>
        <Link to="/" style={{ color: "#2563eb", textDecoration: "underline" }}>
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "low":
        return "#10b981"; // green
      case "medium":
        return "#f59e0b"; // yellow
      case "high":
        return "#ef4444"; // red
      case "critical":
        return "#dc2626"; // dark red
      default:
        return "#6b7280"; // gray
    }
  };

  const getSeverityText = (severity) => {
    switch (severity) {
      case "low":
        return "Nguy cơ thấp";
      case "medium":
        return "Nguy cơ trung bình";
      case "high":
        return "Nguy cơ cao";
      case "critical":
        return "Nguy cơ rất cao";
      default:
        return "Không xác định";
    }
  };

  return (
    <div style={{ 
      background: "#f3f4f6", 
      minHeight: "calc(100vh - 120px)",
      padding: "40px 20px"
    }}>
      <div style={{ 
        maxWidth: 800, 
        margin: "0 auto",
        background: "white",
        borderRadius: 12,
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        padding: 40
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <h1 style={{ 
            fontSize: 32, 
            fontWeight: 700, 
            color: "#1f2937",
            marginBottom: 10
          }}>
            Kết quả kiểm tra
          </h1>
          {healthCheckName && (
            <p style={{ fontSize: 18, color: "#6b7280" }}>
              {healthCheckName}
            </p>
          )}
        </div>

        {/* Score */}
        {totalScore !== undefined && (
          <div style={{
            textAlign: "center",
            marginBottom: 30,
            padding: "20px",
            background: "#f9fafb",
            borderRadius: 8
          }}>
            <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 8 }}>
              Điểm số của bạn
            </div>
            <div style={{ 
              fontSize: 48, 
              fontWeight: 700, 
              color: "#1f2937"
            }}>
              {totalScore}
            </div>
          </div>
        )}

        {/* Result */}
        <div style={{
          background: "#f0f9ff",
          border: `2px solid ${getSeverityColor(result.severity || "low")}`,
          borderRadius: 12,
          padding: 30,
          marginBottom: 30
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 20
          }}>
            <div style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: getSeverityColor(result.severity || "low")
            }} />
            <h2 style={{ 
              fontSize: 24, 
              fontWeight: 700, 
              color: "#1f2937",
              margin: 0
            }}>
              {result.title}
            </h2>
          </div>

          <div style={{
            display: "inline-block",
            padding: "6px 12px",
            background: getSeverityColor(result.severity || "low"),
            color: "white",
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 20
          }}>
            {getSeverityText(result.severity || "low")}
          </div>

          <p style={{ 
            fontSize: 16, 
            color: "#374151",
            lineHeight: 1.8,
            marginBottom: 20
          }}>
            {result.description}
          </p>

          {result.recommendations && result.recommendations.length > 0 && (
            <div>
              <h3 style={{
                fontSize: 18,
                fontWeight: 600,
                color: "#1f2937",
                marginBottom: 12
              }}>
                Lời khuyên:
              </h3>
              <ul style={{
                listStyle: "none",
                padding: 0,
                margin: 0
              }}>
                {result.recommendations.map((rec, index) => (
                  <li key={index} style={{
                    padding: "8px 0",
                    paddingLeft: 24,
                    position: "relative",
                    fontSize: 15,
                    color: "#4b5563",
                    lineHeight: 1.6
                  }}>
                    <span style={{
                      position: "absolute",
                      left: 0,
                      color: getSeverityColor(result.severity || "low")
                    }}>
                      •
                    </span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div style={{
          padding: 16,
          background: "#fef3c7",
          border: "1px solid #fbbf24",
          borderRadius: 8,
          marginBottom: 30
        }}>
          <p style={{
            fontSize: 13,
            color: "#92400e",
            lineHeight: 1.6,
            margin: 0
          }}>
            <strong>Lưu ý:</strong> Kết quả này chỉ mang tính chất tham khảo và không thay thế cho việc thăm khám trực tiếp với bác sĩ. Nếu bạn có các triệu chứng nghiêm trọng hoặc lo ngại về sức khỏe, vui lòng đến cơ sở y tế để được tư vấn chuyên môn.
          </p>
        </div>

        {/* Actions */}
        <div style={{
          display: "flex",
          gap: 12,
          justifyContent: "center"
        }}>
          <Link
            to="/"
            style={{
              padding: "12px 24px",
              background: "#f3f4f6",
              color: "#374151",
              border: "1px solid #d1d5db",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              textDecoration: "none",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#e5e7eb";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#f3f4f6";
            }}
          >
            Quay lại trang chủ
          </Link>
          {location.pathname.includes("/health-check/") && (
            <Link
              to={`/health-check/${location.pathname.split("/")[2]}`}
              style={{
                padding: "12px 24px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                textDecoration: "none",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.9";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              Làm lại bài kiểm tra
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

