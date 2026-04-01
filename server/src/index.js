const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server', error: err.message });
});

// Port
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
