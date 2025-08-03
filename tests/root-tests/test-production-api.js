// Test Production API - Chạy trên browser console
// Copy & paste vào DevTools → Console trên minhonmuine.talk2go.online

console.log('🧪 Testing Production API...');

// Test 1: Health Check
fetch('https://minhonmuine.talk2go.online/api/health')
  .then(response => {
    console.log('✅ Health Status:', response.status);
    return response.text();
  })
  .then(data => console.log('Health Response:', data))
  .catch(error => console.error('❌ Health Error:', error));

// Test 2: Database Connection Test
fetch('https://minhonmuine.talk2go.online/api/request')
  .then(response => {
    console.log('✅ Database Status:', response.status);
    return response.json();
  })
  .then(data => console.log('Database Response:', data))
  .catch(error => console.error('❌ Database Error:', error));

// Test 3: Static Files
fetch('https://minhonmuine.talk2go.online/')
  .then(response => {
    console.log('✅ Frontend Status:', response.status);
    console.log('Frontend loaded successfully');
  })
  .catch(error => console.error('❌ Frontend Error:', error));

console.log('Tests initiated. Check results above in 5-10 seconds...');
