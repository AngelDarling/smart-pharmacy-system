import axios from 'axios';

async function testFix() {
    console.log("🚀 Testing Fix for 'Anh Hổ mãi đỉnh'...");
    try {
        const response = await axios.post('http://localhost:5000/api/chat', { message: "Anh Hổ mãi đỉnh" });
        console.log(`🤖 AI Reply: ${response.data.reply}`);
        console.log(`📦 Products: ${response.data.products?.length || 0}`);
    } catch (error) {
        console.error("❌ Error:", error.response?.data || error.message);
    }
}

testFix();
