const http = require('http');

function postRequest(path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const options = {
      hostname: '127.0.0.1',
      port: 3000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(postData);
    req.end();
  });
}

async function testSMS() {
  const phone = '13800138000';
  let smsCode = '123456';

  console.log('1. Requesting SMS Code...');
  try {
    const res = await postRequest('/api/auth/send-sms', { phone });
    console.log('Send SMS Response:', res.status, res.data);
  } catch (err) {
    console.error('Send SMS Error:', err.message);
    return;
  }

  console.log('2. Registering with SMS Code...');
  try {
    const registerData = {
      username: 'test_sms_user_' + Date.now(),
      password: 'password123',
      realName: 'Test User',
      idType: '1',
      idNumber: '11010119900101' + Math.floor(1000 + Math.random() * 9000),
      phone: phone,
      passengerType: '1',
      smsCode: smsCode
    };
    const res = await postRequest('/api/auth/register', registerData);
    console.log('Register Response:', res.status, res.data);
  } catch (err) {
    console.error('Register Error:', err.message);
  }
}

testSMS();
