const https = require('https');

const data = JSON.stringify({ ingredients: ['chicken'] });

const options = {
  hostname: 'meal-planner-ai-app-five.vercel.app',
  port: 443,
  path: '/api/generate-meal',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  let body = '';
  res.on('data', d => {
    body += d;
  });
  res.on('end', () => {
    console.log('Response body:', body);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
