import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './utils/ProtectedRoute';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import StudentApproval from './components/admin/StudentApproval';
import CreateMentor from './components/admin/CreateMentor';
import ManageCourses from './components/admin/ManageCourses';
import ManageBatches from './components/admin/ManageBatches';
import CreateTask from './components/admin/CreateTask';
import ManageUsers from './components/admin/ManageUsers';
import ManageTasks from './components/admin/ManageTasks';

// Mentor Components
import MentorDashboard from './components/mentor/MentorDashboard';
import BatchList from './components/mentor/BatchList';
import GradeSubmissions from './components/mentor/GradeSubmissions';
import StudentDetail from './components/mentor/StudentDetail';
import MentorCreateTask from './components/mentor/CreateTask';
import MentorTasks from './components/mentor/MentorTasks';
import MentorReview from './components/mentor/MentorReview'; 
import WeeklyProgressReview from './components/mentor/WeeklyProgressReview'; 
import StudentProgressHistory from './components/mentor/StudentProgressHistory';
import MentorReviewsView from './components/mentor/MentorReviewsView';

// Student Components
import StudentDashboard from './components/student/StudentDashboard';
import StudentTasks from './components/student/StudentTasks';
import TaskSubmission from './components/student/TaskSubmission';
import StudentSubmissions from './components/student/StudentSubmissions';
import StudentProgressFeedback from './components/student/StudentProgressFeedback';

// Common Components
import Navbar from './components/common/Navbar';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <AppContent />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="app">
      {user && <Navbar />}
      
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={user ? <Navigate to={`/${user.role}/dashboard`} /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={user ? <Navigate to={`/${user.role}/dashboard`} /> : <Register />} 
        />
        
        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/student-approval"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <StudentApproval />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/create-mentor"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <CreateMentor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-courses"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-batches"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageBatches />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/create-task"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <CreateTask />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-tasks"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageTasks />
            </ProtectedRoute>
          }
        />

        {/* Mentor Routes */}
        <Route
          path="/mentor/dashboard"
          element={
            <ProtectedRoute allowedRoles={['mentor']}>
              <MentorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mentor/batches"
          element={
            <ProtectedRoute allowedRoles={['mentor']}>
              <BatchList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mentor/grade-submissions/:batchId"
          element={
            <ProtectedRoute allowedRoles={['mentor']}>
              <GradeSubmissions />
            </ProtectedRoute>
          }
        />
        
        {/* ✅ Task Submission Review Route */}
        <Route
          path="/mentor/review/:submissionId"
          element={
            <ProtectedRoute allowedRoles={['mentor']}>
              <MentorReview />
            </ProtectedRoute>
          }
        />
        
        {/* ✅ Weekly Progress Review Route */}
        <Route
          path="/mentor/weekly-review"
          element={
            <ProtectedRoute allowedRoles={['mentor']}>
              <WeeklyProgressReview />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/mentor/student/:studentId"
          element={
            <ProtectedRoute allowedRoles={['mentor']}>
              <StudentDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mentor/create-task"
          element={
            <ProtectedRoute allowedRoles={['mentor']}>
              <MentorCreateTask />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mentor/tasks"
          element={
            <ProtectedRoute allowedRoles={['mentor']}>
              <MentorTasks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mentor/student-progress/:batchId/:studentId"
          element={
            <ProtectedRoute allowedRoles={['mentor']}>
              <StudentProgressHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mentor/reviews"
          element={
            <ProtectedRoute allowedRoles={['mentor']}>
              <MentorReviewsView />
            </ProtectedRoute>
          }
        />


        {/* Student Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/tasks"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentTasks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/tasks/:taskId"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <TaskSubmission />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/submissions"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentSubmissions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/progress-feedback"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentProgressFeedback />
            </ProtectedRoute>
          }
        />

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;
