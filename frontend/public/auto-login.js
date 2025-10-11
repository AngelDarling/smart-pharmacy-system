// Auto login script for development
async function autoLogin() {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@pharmacy.com',
        password: 'admin123'
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('✅ Auto login successful!');
      console.log('Token:', data.token);
      console.log('User:', data.user);
      return true;
    } else {
      const error = await response.json();
      console.error('❌ Login failed:', error.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    return false;
  }
}

// Run auto login
autoLogin();
