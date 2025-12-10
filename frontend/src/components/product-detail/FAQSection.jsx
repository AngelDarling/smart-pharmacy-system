export default function FAQSection({ faqs, expandedFAQ, onToggleFAQ }) {
    return (
        <div style={{
            background: 'white',
            borderRadius: 12,
            padding: 30,
            marginBottom: 24,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
            <h2 style={{
                fontSize: 24,
                fontWeight: 700,
                color: '#1f2937',
                marginBottom: 24,
                marginTop: 0
            }}>
                Câu hỏi thường gặp
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {faqs.map((faq, index) => (
                    <div
                        key={index}
                        style={{
                            border: '1px solid #e5e7eb',
                            borderRadius: 8,
                            overflow: 'hidden',
                            transition: 'all 0.2s'
                        }}
                    >
                        <button
                            onClick={() => onToggleFAQ(expandedFAQ === index ? null : index)}
                            style={{
                                width: '100%',
                                background: expandedFAQ === index ? '#f8f9fa' : 'white',
                                border: 'none',
                                padding: '18px 20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontSize: 15,
                                fontWeight: 600,
                                color: '#1f2937',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                if (expandedFAQ !== index) {
                                    e.currentTarget.style.background = '#f8f9fa';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (expandedFAQ !== index) {
                                    e.currentTarget.style.background = 'white';
                                }
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: '50%',
                                    background: '#3b82f6',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 14,
                                    fontWeight: 700,
                                    flexShrink: 0
                                }}>
                                    ?
                                </div>
                                <span>{faq.question}</span>
                            </div>
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                style={{
                                    transform: expandedFAQ === index ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.2s',
                                    flexShrink: 0
                                }}
                            >
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                        {expandedFAQ === index && (
                            <div style={{
                                padding: '0 20px 20px 56px',
                                fontSize: 15,
                                color: '#6b7280',
                                lineHeight: 1.7,
                                background: '#f8f9fa'
                            }}>
                                {faq.answer}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
