const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Request Logger for mobile debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const sessionRoutes = require('./routes/sessions');
const classRoutes = require('./routes/classes');
const sectionRoutes = require('./routes/sections');
const courseRoutes = require('./routes/courses');
const attendanceRoutes = require('./routes/attendance');
const marksRoutes = require('./routes/marks');
const noticeRoutes = require('./routes/notices');
const assignmentRoutes = require('./routes/assignments');
const examRoutes = require('./routes/exams');
const gradeRoutes = require('./routes/grades');
const promotionRoutes = require('./routes/promotions');
const routineRoutes = require('./routes/routines');
const syllabusRoutes = require('./routes/syllabus');
const eventRoutes = require('./routes/events');
const academicSettingRoutes = require('./routes/academic_settings');
const aiRoutes = require('./routes/ai');


// Mounting Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/marks', marksRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/routines', routineRoutes);
app.use('/api/syllabus', syllabusRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/academic-settings', academicSettingRoutes);
app.use('/api/ai', aiRoutes);


// Debug route to diagnose Render -> Supabase issues
app.get('/api/debug-db', async (req, res) => {
  const db = require('./config/database');
  try {
    const result = await db.query('SELECT current_database(), now()');
    res.json({
      status: '✅ Connected!',
      database: result.rows[0].current_database,
      server_time: result.rows[0].now,
      env: process.env.NODE_ENV,
      db_url_redacted: process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@') : 'NOT SET'
    });
  } catch (err) {
    res.status(500).json({
      status: '❌ Connection Failed',
      error: err.message,
      code: err.code,
      stack: err.stack,
      hint: 'If you see ENETUNREACH, you MUST change your DATABASE_URL to use the Supavisor Pooler URL in Render settings.'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server', error: err.message });
});

const http = require('http');
const { Server } = require('socket.io');

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected'));
});

// Port
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
