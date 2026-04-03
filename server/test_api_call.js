const axios = require('axios');

async function testAPICall() {
  try {
    // Test the exact API call that the frontend would make
    const response = await axios.get('http://localhost:5000/api/users/students', {
      params: {
        session_id: '3',
        class_id: '2', 
        section_id: '3',
        course_id: '',
        date: '2026-04-02'
      },
      headers: {
        'Authorization': 'Bearer fake-token-for-testing'
      }
    });
    
    console.log('API Response Status:', response.status);
    console.log('Number of students returned:', response.data.students?.length || 0);
    console.log('First 5 students:');
    response.data.students?.slice(0, 5).forEach(s => {
      console.log(`  - ${s.first_name} ${s.last_name} (ID: ${s.id})`);
    });
    
  } catch (error) {
    if (error.response) {
      console.log('Error Response Status:', error.response.status);
      console.log('Error Response Data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testAPICall();
