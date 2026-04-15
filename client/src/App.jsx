import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthRoute from './components/AuthRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import AddStudent from './pages/AddStudent';
import EditStudent from './pages/EditStudent';
import Teachers from './pages/Teachers';
import AddTeacher from './pages/AddTeacher';
import StudentProfile from './pages/StudentProfile';
import TeacherProfile from './pages/TeacherProfile';
import Attendance from './pages/Attendance';
import ManageClasses from './pages/ManageClasses';
import ManageCourses from './pages/ManageCourses';
import ManageMarks from './pages/ManageMarks';
import ManageNotices from './pages/ManageNotices';
import ManageAssignments from './pages/ManageAssignments';
import Profile from './pages/Profile';
import ManageRoutines from './pages/ManageRoutines';
import ManageSyllabus from './pages/ManageSyllabus';
import PromoteStudents from './pages/PromoteStudents';
import ManageExams from './pages/ManageExams';
import ManageGrades from './pages/ManageGrades';
import ManageCalendar from './pages/ManageCalendar';
import AttendanceReport from './pages/AttendanceReport';
import AcademicSettings from './pages/AcademicSettings';
import ManageAdmitCards from './pages/ManageAdmitCards';
import ManagePayslips from './pages/ManagePayslips';
import Employees from './pages/Employees';
import AddEmployee from './pages/AddEmployee';
import Overview from './pages/Overview';
import Pricing from './pages/Pricing';
import Documentation from './pages/Documentation';
import Contact from './pages/Contact';
import ForgotPassword from './pages/ForgotPassword';
import ActivityLogs from './pages/ActivityLogs';
import Aura from './pages/Aura';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/docs" element={<Documentation />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login/:role" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/forgot-password/:role" element={<ForgotPassword />} />

          {/* Protected Routes */}
          <Route element={<AuthRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/students/add" element={<AddStudent />} />
            <Route path="/students/edit/:id" element={<EditStudent />} />
            <Route path="/students/profile/:id" element={<StudentProfile />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/teachers/add" element={<AddTeacher />} />
            <Route path="/teachers/profile/:id" element={<TeacherProfile />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/classes" element={<ManageClasses />} />
            <Route path="/courses" element={<ManageCourses />} />
            <Route path="/marks" element={<ManageMarks />} />
            <Route path="/notices" element={<ManageNotices />} />
            <Route path="/assignments" element={<ManageAssignments />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/routines" element={<ManageRoutines />} />
            <Route path="/syllabus" element={<ManageSyllabus />} />
            <Route path="/promotions" element={<PromoteStudents />} />
            <Route path="/exams" element={<ManageExams />} />
            <Route path="/grades" element={<ManageGrades />} />
            <Route path="/calendar" element={<ManageCalendar />} />
            <Route path="/attendance/report" element={<AttendanceReport />} />
            <Route path="/admit-cards" element={<ManageAdmitCards />} />
            <Route path="/payslips" element={<ManagePayslips />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/employees/add" element={<AddEmployee />} />
            <Route path="/settings" element={<AcademicSettings />} />
            <Route path="/activity-logs" element={<ActivityLogs />} />
            <Route path="/aura" element={<Aura />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
