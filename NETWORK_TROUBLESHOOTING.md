# Network Connection Troubleshooting Guide

## Common Issues & Solutions

### Issue 1: "Network Error" / "CORS Error"
**Symptoms:**
- Frontend shows network connection errors
- CORS policy errors in browser console
- API calls failing

**Solutions:**

#### A. Check Backend CORS Configuration
In `server/src/index.js`, ensure CORS is properly configured:

```javascript
const cors = require('cors');
app.use(cors({
  origin: ['http://localhost:5173', 'https://your-app.vercel.app'], // Add your Vercel URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
```

#### B. Check Frontend API URL
In `client/src/api.js`, verify the baseURL:

```javascript
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-url.onrender.com/api'
    : 'http://localhost:5000/api',
  timeout: 10000,
});
```

#### C. Temporarily Disable CORS (Development Only)
For testing, you can temporarily allow all origins:

```javascript
app.use(cors({
  origin: '*',
  credentials: true
}));
```

### Issue 2: "Connection Refused" / "ECONNREFUSED"
**Symptoms:**
- Cannot connect to backend
- Connection refused errors

**Solutions:**

#### A. Verify Backend is Running
```bash
cd server
npm run dev
# Check for "Server running on port 5000" message
```

#### B. Check Port Conflicts
```bash
# Check what's using port 5000
netstat -an | findstr :5000
# If port is in use, change backend port:
PORT=5001 npm run dev
```

#### C. Firewall/Antivirus Issues
- Temporarily disable firewall
- Add exception for Node.js/ports 5000-5001
- Check antivirus blocking Node.js

### Issue 3: "Timeout" / "Slow Response"
**Symptoms:**
- Requests taking too long
- Timeout errors

**Solutions:**

#### A. Increase Timeout in Frontend
```javascript
// In client/src/api.js
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 30000, // Increase to 30 seconds
});
```

#### B. Check Database Performance
```sql
-- Add indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_attendance_student_course ON attendances(student_id, course_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendances(attendance_date);
```

### Issue 4: "ERR_CONNECTION_CLOSED"
**Symptoms:**
- Connection drops unexpectedly
- Intermittent connection issues

**Solutions:**

#### A. Add Connection Pool Configuration
```javascript
// In server/src/config/database.js
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Return error after 2 seconds if no response
});
```

#### B. Add Retry Logic in Frontend
```javascript
// In client/src/api.js
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.code === 'ECONNRESET') {
      // Retry the request
      return api.request(error.config);
    }
    return Promise.reject(error);
  }
);
```

## Quick Fixes to Try

### Fix 1: Restart Everything
```bash
# Kill any existing Node processes
taskkill /f /im node.exe

# Restart backend
cd server
npm run dev

# Restart frontend
cd client
npm run dev
```

### Fix 2: Clear Caches
```bash
# Clear npm cache
npm cache clean --force

# Clear browser cache
# In browser: Ctrl+Shift+R (Chrome/Cmd+Shift+R on Mac)

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Fix 3: Check Environment Variables
```bash
# Verify backend .env exists
cat .env

# Verify frontend .env exists  
cat ../client/.env

# Check for missing variables
echo $NODE_ENV
echo $DATABASE_URL
```

### Fix 4: Use Different Ports
If port 5000 has issues, try:

**Backend:**
```bash
PORT=5001 npm run dev
```

**Frontend (if needed):**
```javascript
// In client/vite.config.js
export default defineConfig({
  server: {
    port: 3001, // Different port if needed
  }
});
```

## Testing Connection

### Test Backend Directly
```bash
# Test if backend responds
curl http://localhost:5000/api/auth/me

# Test with headers
curl -H "Content-Type: application/json" http://localhost:5000/api/sessions
```

### Test Frontend Connection
```javascript
// In browser console
fetch('http://localhost:5000/api/sessions')
  .then(response => response.json())
  .then(data => console.log('Success:', data))
  .catch(error => console.error('Error:', error));
```

## Production Deployment Issues

### CORS in Production
Update backend CORS for production:

```javascript
const allowedOrigins = [
  'https://your-app.vercel.app',
  'https://your-backend-url.onrender.com'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
```

### Environment Variables
Ensure production variables are set correctly:

**Render Dashboard:**
- NODE_ENV=production
- DATABASE_URL=your-production-db-url
- JWT_SECRET=your-production-secret

**Vercel Dashboard:**
- VITE_API_URL=https://your-backend-url.onrender.com/api

## Health Check Endpoints

Add these to your backend for monitoring:

```javascript
// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Database health
app.get('/api/health/db', async (req, res) => {
  try {
    const result = await db.query('SELECT 1');
    res.json({ status: 'OK', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', database: 'disconnected' });
  }
});
```

## When to Get Help

If issues persist:
1. **Check browser console** (F12) for specific error messages
2. **Check backend terminal** for error logs
3. **Check Network tab** in browser dev tools for failed requests
4. **Test API endpoints individually** using curl or Postman
5. **Verify database connection** with a simple query
