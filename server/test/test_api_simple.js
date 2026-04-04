const http = require('http');

function testAPICall() {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/users/students?session_id=3&class_id=2&section_id=3&course_id=&date=2026-04-02',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer fake-token-for-testing'
    }
  };

  const req = http.request(options, (res) => {
    console.log('Status:', res.statusCode);
    console.log('Headers:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        console.log('Number of students returned:', result.students?.length || 0);
        console.log('First 5 students:');
        result.students?.slice(0, 5).forEach(s => {
          console.log(`  - ${s.first_name} ${s.last_name} (ID: ${s.id})`);
        });
      } catch (err) {
        console.log('Response data:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.end();
}

testAPICall();
