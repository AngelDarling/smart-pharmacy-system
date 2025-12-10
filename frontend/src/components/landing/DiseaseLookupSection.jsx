export default function DiseaseLookupSection() {
    const diseases = [
        { name: "Bệnh nam giới", icon: "👨", conditions: ["Rối loạn cương dương", "Viêm tuyến tiền liệt", "Ung thư tuyến tiền liệt"] },
        { name: "Bệnh phụ nữ", icon: "👩", conditions: ["Kinh nguyệt không đều", "Viêm âm đạo", "Ung thư cổ tử cung"] },
        { name: "Bệnh người già", icon: "👴", conditions: ["Cao huyết áp", "Tiểu đường", "Loãng xương"] },
        { name: "Bệnh trẻ em", icon: "👶", conditions: ["Sốt cao", "Tiêu chảy", "Ho khan"] }
    ];

    return (
        <div style={{ padding: "60px 0", background: "#e6f3ff" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
                <h2 style={{ fontSize: 32, fontWeight: 700, margin: "0 0 40px", textAlign: "center", color: "#2c3e50" }}>Tra cứu bệnh thường gặp</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 30 }}>
                    {diseases.map((disease, i) => (
                        <div key={i} style={{ background: "white", borderRadius: 12, padding: 25, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                            <div style={{ textAlign: "center", marginBottom: 20 }}>
                                <div style={{ fontSize: 48, marginBottom: 10 }}>{disease.icon}</div>
                                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: "#2c3e50" }}>{disease.name}</h3>
                            </div>
                            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                                {disease.conditions.map((condition, j) => (
                                    <li key={j} style={{ padding: "8px 0", borderBottom: "1px solid #eee", fontSize: 14, color: "#666" }}>
                                        • {condition}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
