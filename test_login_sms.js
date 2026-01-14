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

async function testLoginSMS() {
  const username = 'test_login_user_mock';

  console.log('1. Requesting SMS Code for login...');
  try {
    // Frontend sends username as 'phone'
    const res = await postRequest('/api/auth/send-sms', { phone: username });
    console.log('Send SMS Response:', res.status, res.data);
  } catch (err) {
    console.error('Send SMS Error:', err.message);
    return;
  }

  console.log('2. Trying Login with Invalid Code...');
  try {
    const loginData = {
      username: username,
      password: 'any_password',
      idLast4: '1234',
      smsCode: '000000' // Invalid
    };
    const res = await postRequest('/api/auth/login', loginData);
    console.log('Login (Invalid Code) Response:', res.status, res.data);
    if (res.status === 401 && res.data.message === 'Invalid SMS code') {
        console.log('-> PASS: Invalid code rejected.');
    } else {
        console.log('-> FAIL: Invalid code not rejected properly.');
    }
  } catch (err) {
    console.error('Login Error:', err.message);
  }

  console.log('3. Trying Login with Backdoor Code (123456)...');
  try {
    const loginData = {
      username: username,
      password: 'any_password',
      idLast4: '1234',
      smsCode: '123456' // Backdoor
    };
    const res = await postRequest('/api/auth/login', loginData);
    console.log('Login (Backdoor) Response:', res.status, res.data);
    
    // It should pass SMS check, but might fail User check (401 Invalid credentials)
    if (res.status === 401 && res.data.message === 'Invalid credentials') {
         console.log('-> PASS: SMS accepted (proceeded to user check).');
    } else if (res.status === 200) {
         console.log('-> PASS: Login successful.');
    } else {
         console.log('-> FAIL: Unexpected response.');
    }
  } catch (err) {
    console.error('Login Error:', err.message);
  }
}

testLoginSMS();
