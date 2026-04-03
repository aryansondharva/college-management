# College Management System

A comprehensive college management system with attendance tracking, student management, and reporting features.

## Features

- 🎓 **Student Management**: Add, edit, and manage student records
- 📊 **Attendance Tracking**: Daily attendance with comprehensive reporting
- 📚 **Course Management**: Manage courses and subjects
- 👥 **Class & Section Management**: Organize students by classes and sections
- 📅 **Session Management**: Handle academic sessions
- 📈 **Dashboard**: Overview with statistics and analytics
- 🔐 **Authentication**: Secure login system with role-based access

## Tech Stack

### Frontend
- **React 19** with modern hooks
- **Bootstrap 5** for responsive UI
- **Vite** for fast development and building
- **Axios** for API communication
- **React Router** for navigation
- **Recharts** for data visualization

### Backend
- **Node.js** with Express.js
- **PostgreSQL** for database
- **JWT** for authentication
- **Socket.io** for real-time features
- **Multer** for file uploads
- **bcrypt** for password hashing

## Project Structure

```
college-management/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api.js
│   │   └── ...
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── config/
│   │   └── ...
│   ├── package.json
│   └── ...
├── DEPLOYMENT.md          # Deployment guide
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 16+
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/college-management.git
cd college-management
```

2. **Install dependencies**
```bash
# Frontend
cd client
npm install

# Backend
cd server
npm install
```

3. **Set up environment variables**
```bash
# Frontend (.env)
VITE_API_URL=http://localhost:5000/api

# Backend (.env)
NODE_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/college_db
JWT_SECRET=your-secret-key
PORT=5000
```

4. **Run the application**
```bash
# Backend (Terminal 1)
cd server
npm run dev

# Frontend (Terminal 2)
cd client
npm run dev
```

## Features in Detail

### Attendance System
- ✅ Daily attendance marking
- ✅ Monthly/Weekly reports
- ✅ Subject-wise attendance tracking
- ✅ Export functionality
- ✅ Real-time status updates
- ✅ Enrollment number sorting

### Student Management
- ✅ CRUD operations for students
- ✅ Enrollment number management
- ✅ Class and section assignment
- ✅ Search and filtering

### Reporting
- ✅ Comprehensive attendance reports
- ✅ Statistical analysis
- ✅ Export to various formats
- ✅ Visual charts and graphs

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Students
- `GET /api/users/students` - Get students list (sorted by enrollment number)
- `POST /api/users/student` - Add new student
- `PUT /api/users/student/:id` - Update student
- `DELETE /api/users/student/:id` - Delete student

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Mark attendance
- `GET /api/attendance/report` - Monthly reports
- `GET /api/attendance/daily-report` - Daily reports

### Academics
- `GET /api/sessions` - Get academic sessions
- `GET /api/classes` - Get classes
- `GET /api/sections` - Get sections
- `GET /api/courses` - Get courses

## Database Schema

Key tables:
- `users` - User accounts and student info
- `attendances` - Attendance records
- `student_academic_infos` - Student-class assignments
- `school_sessions` - Academic sessions
- `school_classes` - Class information
- `sections` - Section details
- `courses` - Course/subject details

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Development URLs
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

### Production URLs
- Frontend: https://your-app.vercel.app
- Backend: https://your-backend-url.onrender.com

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.


