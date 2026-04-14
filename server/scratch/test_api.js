require('dotenv').config();
const jwt = require('jsonwebtoken');
const token = jwt.sign({ userId: 6 }, process.env.JWT_SECRET || 'secret');
const axios = require('axios');

axios.get('http://localhost:5000/api/messages/inbox', {
    headers: { Authorization: `Bearer ${token}` }
}).then(res => {
    console.log(res.data);
}).catch(err => {
    console.error(err.response?.data || err.message);
});

axios.get('http://localhost:5000/api/messages/search-contacts?q=ary', {
    headers: { Authorization: `Bearer ${token}` }
}).then(res => {
    console.log(res.data);
}).catch(err => {
    console.error(err.response?.data || err.message);
});
