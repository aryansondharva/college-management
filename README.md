<p align="center">
  <img src="./mobile/assets/logo.png" width="150" />
</p>

# Modern College Management System

**Drop** is a high-fidelity, minimalist educational management platform designed for the modern era. It streamlines academic workflows by connecting students, teachers, and administrators in a unified, real-time ecosystem.

🚀 **Live Web:** [https://transformers-nu.vercel.app/](https://transformers-nu.vercel.app/)  
📱 **Mobile App:** Expo/React Native (Connected to Live Production)

---

## ✨ Key Features

### 🎓 For Students
- **Real-time Attendance**: Track cumulative presence and target percentages (75%).
- **Academic Portal**: Access curriculum, schedules, and digital assignments.
- **Mobile Companion**: Receive instant notifications when attendance is marked using Socket.io.

### 👩‍🏫 For Teachers
- **Efficient Grading**: Manage marks and academic performance reports.
- **Roll-Call System**: Sorted enrollment-based attendance marking.
- **Task Management**: Create assignments and track student submissions.

### 🛡️ For Admins
- **Global Operations**: Full control over student/teacher enrollment and permissions.
- **Detailed Analytics**: Real-time summary charts for attendance and activity.
- **Management Suite**: Configure sessions, classes, sections, and courses.

---

## 🛠️ Tech Stack

### Frontend & UI
- **React 19** + **Vite** (Web)
- **React Native** + **Expo** (Mobile)
- **Bootstrap 5** & **Lucide icons** (Clean, minimalist aesthetic)
- **Recharts** (Visual analytics)

### Backend & Real-time
- **Node.js** & **Express**
- **Socket.io** (Production-ready real-time updates)
- **JWT** (Payload-based authentication)

### Infrastructure
- **Supabase** (PostgreSQL with SSL & Supavisor pooling)
- **Render** (API Backend)
- **Vercel** (Frontend Deployment)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase Account (for PostgreSQL)
- Expo Go (to run mobile on physical devices)

### Setup Instructions

1. **Clone & Install**
```bash
git clone https://github.com/aryansondharva/College-Sys.git
cd College-Sys
npm install # Install in /client, /server, and /mobile
```

2. **Environment Configuration**
Update `.env` files in `/server` and `/client`:
```bash
# /server/.env
DATABASE_URL=postgresql://postgres.yourproject:pass@pooler.supabase.com:5432/postgres
JWT_SECRET=your_secret
NODE_ENV=production

# /client/.env
VITE_API_URL=https://your-render-url.onrender.com/api
```

3. **Database Migration**
Sync your local database to Supabase production:
```bash
cd server
npm run sync:supabase
```

---

## 🔄 Synchronization Scripts
In the `/server` directory, we have included special tools for production management:
- `npm run sync:supabase`: Automatically migrates local schema and data to Supabase.
- `npm run sync:auth`: Migrates `public.users` table into the Supabase Auth Dashboard.
- `node reset_supabase_passwords.js`: Synchronizes all production passwords to defaults (`student123`, `teacher123`, `admin123`).

## 📡 API Endpoints
- `GET /api/debug-db`: Health check for database connectivity.
- `POST /api/auth/login`: Secure cross-identity login (Email or ID).
- `GET /api/attendance/student-summary`: Real-time data for the mobile app.

---

## 📄 License
This project is licensed under the MIT License. 
