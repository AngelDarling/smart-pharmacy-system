export default function HeroSection() {
    return (
        <div style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "60px 0", color: "white" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", textAlign: "center" }}>
                <h1 style={{ margin: "0 0 20px", fontSize: 48, fontWeight: 700 }}>Mừng Ngày Quốc Tế Người Cao Tuổi</h1>
                <h2 style={{ margin: "0 0 30px", fontSize: 32, fontWeight: 500 }}>TẶNG GÓI TẦM SOÁT MIỄN PHÍ</h2>
                <p style={{ fontSize: 18, margin: "0 0 30px", opacity: 0.9 }}>Chăm sóc sức khỏe toàn diện cho người cao tuổi</p>
                <button style={{
                    background: "#ff6b6b",
                    color: "white",
                    border: "none",
                    padding: "15px 30px",
                    borderRadius: 25,
                    fontSize: 18,
                    fontWeight: 600,
                    cursor: "pointer"
                }}>
                    Tìm hiểu ngay
                </button>
            </div>
        </div>
    );
}
