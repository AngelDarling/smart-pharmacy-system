import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/client.js";

export default function HealthCheckPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [healthCheck, setHealthCheck] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Scroll to top when component mounts or slug changes
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    const fetchHealthCheck = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/health-checks/${slug}`);
        setHealthCheck(res.data.healthCheck);
        setQuestions(res.data.questions || []);
      } catch (error) {
        console.error("Error fetching health check:", error);
        alert("Không thể tải bài kiểm tra. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchHealthCheck();
  }, [slug]);

  // Scroll to top when question index changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentQuestionIndex]);

  const handleAnswerChange = (questionId, optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleNext = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!answers[currentQuestion._id] && currentQuestion.isRequired) {
      alert("Vui lòng chọn một câu trả lời trước khi tiếp tục.");
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      // Scroll to top when moving to next question
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      // Scroll to top when moving to previous question
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const answerArray = Object.keys(answers).map((questionId) => ({
        questionId,
        optionId: answers[questionId]
      }));

      const res = await api.post(`/health-checks/${slug}/submit`, {
        answers: answerArray
      });

      // Scroll to top before navigating
      window.scrollTo({ top: 0, behavior: 'instant' });
      
      navigate(`/health-check/${slug}/result`, {
        state: {
          result: res.data.result,
          totalScore: res.data.totalScore,
          healthCheckName: healthCheck.name
        }
      });
    } catch (error) {
      console.error("Error submitting health check:", error);
      alert("Không thể gửi bài kiểm tra. Vui lòng thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "60vh" 
      }}>
        <div style={{ fontSize: 18, color: "#666" }}>Đang tải bài kiểm tra...</div>
      </div>
    );
  }

  if (!healthCheck || questions.length === 0) {
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column",
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "60vh",
        gap: 20
      }}>
        <div style={{ fontSize: 18, color: "#666" }}>Không tìm thấy bài kiểm tra hoặc chưa có câu hỏi.</div>
        <Link to="/" style={{ color: "#2563eb", textDecoration: "underline" }}>
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

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
        <div style={{ marginBottom: 30 }}>
          <h1 style={{ 
            fontSize: 28, 
            fontWeight: 700, 
            color: "#1f2937",
            marginBottom: 10
          }}>
            {healthCheck.name}
          </h1>
          {healthCheck.shortDescription && (
            <p style={{ fontSize: 16, color: "#6b7280", lineHeight: 1.6 }}>
              {healthCheck.shortDescription}
            </p>
          )}
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 30 }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between",
            marginBottom: 8
          }}>
            <span style={{ fontSize: 14, color: "#6b7280" }}>
              Câu {currentQuestionIndex + 1}/{questions.length}
            </span>
            <span style={{ fontSize: 14, color: "#6b7280" }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div style={{
            width: "100%",
            height: 8,
            background: "#e5e7eb",
            borderRadius: 4,
            overflow: "hidden"
          }}>
            <div style={{
              width: `${progress}%`,
              height: "100%",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              transition: "width 0.3s ease"
            }} />
          </div>
        </div>

        {/* Question */}
        <div style={{ marginBottom: 30 }}>
          <h2 style={{ 
            fontSize: 20, 
            fontWeight: 600, 
            color: "#1f2937",
            marginBottom: 20,
            lineHeight: 1.5
          }}>
            {currentQuestion.questionText}
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {currentQuestion.options?.map((option) => (
              <label
                key={option._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "16px 20px",
                  background: answers[currentQuestion._id] === option._id 
                    ? "#e0f2fe" 
                    : "#f9fafb",
                  border: answers[currentQuestion._id] === option._id
                    ? "2px solid #0ea5e9"
                    : "2px solid #e5e7eb",
                  borderRadius: 8,
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  if (answers[currentQuestion._id] !== option._id) {
                    e.currentTarget.style.background = "#f3f4f6";
                    e.currentTarget.style.borderColor = "#d1d5db";
                  }
                }}
                onMouseLeave={(e) => {
                  if (answers[currentQuestion._id] !== option._id) {
                    e.currentTarget.style.background = "#f9fafb";
                    e.currentTarget.style.borderColor = "#e5e7eb";
                  }
                }}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion._id}`}
                  checked={answers[currentQuestion._id] === option._id}
                  onChange={() => handleAnswerChange(currentQuestion._id, option._id)}
                  style={{
                    marginRight: 12,
                    width: 20,
                    height: 20,
                    cursor: "pointer"
                  }}
                />
                <span style={{ 
                  fontSize: 16, 
                  color: "#374151",
                  flex: 1
                }}>
                  {option.optionText}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Navigation buttons */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between",
          gap: 12
        }}>
          <button
            onClick={handlePrev}
            disabled={currentQuestionIndex === 0}
            style={{
              padding: "12px 24px",
              background: currentQuestionIndex === 0 ? "#e5e7eb" : "#667eea",
              color: currentQuestionIndex === 0 ? "#9ca3af" : "white",
              border: "none",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              cursor: currentQuestionIndex === 0 ? "not-allowed" : "pointer",
              transition: "all 0.2s ease"
            }}
          >
            ← Quay lại
          </button>
          <button
            onClick={handleNext}
            disabled={submitting}
            style={{
              padding: "12px 24px",
              background: submitting 
                ? "#9ca3af" 
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              cursor: submitting ? "not-allowed" : "pointer",
              transition: "all 0.2s ease"
            }}
          >
            {currentQuestionIndex === questions.length - 1 
              ? (submitting ? "Đang xử lý..." : "Hoàn thành") 
              : "Tiếp theo →"}
          </button>
        </div>
      </div>
    </div>
  );
}

