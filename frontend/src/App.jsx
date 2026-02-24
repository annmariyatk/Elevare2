import { Routes, Route, Navigate } from "react-router-dom";

/* 🌐 Public Pages */
import Login from "./pages/Login";
import LandingPage from "./pages/LandingPage";
import About from "./pages/About";
import Signup from "./pages/Signup";
import AdminSignup from "./pages/AdminSignup";
import ForgotPassword from "./pages/ForgotPassword";
import TeacherReportIssue from "./pages/TeacherReportIssue";

/* 🧭 Dashboard Layout */
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Users from "./pages/Users";
import StudentDetails from "./pages/StudentDetails";
import Teachers from "./pages/Teachers";
import AddTeacher from "./pages/AddTeacher";
import AdminPostOpportunity from "./pages/AdminPostOpportunity"; // NEW
import HelpCenter from "./pages/HelpCenter";
import Testimonials from "./pages/Testimonials";
import DashboardOverview from "./components/DashboardOverview";

/* 🔹 Social */
import ShareSkill from "./pages/ShareSkill";
import ConnectFriend from "./pages/ConnectFriend";
import Connect from "./pages/Connect";

/* 🔹 Study Flow */
import Form from "./pages/Form";

/* 🔹 Mentor */
import SearchTeacher from "./pages/SearchTeacher";

/* 🔹 Modules */
import Resource from "./pages/Resource";
import Chat from "./pages/Chat";
import StudyDetails from "./pages/StudyDetails";
import Assessment from "./pages/Assessment";
import Certificate from "./pages/Certificate";
import Account from "./pages/Account";

/* 🔹 Account */
import Profile from "./accounts/Profile";
import FAQ from "./accounts/FAQ";
import PrivacySettings from "./accounts/PrivacySettings";
import StudentHelp from "./pages/StudentHelp";
import StudentReview from "./pages/StudentReview";
import StudentOpportunities from "./pages/StudentOpportunities"; // NEW

/* ======================
   🔐 Protected Route
====================== */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Routes>
      {/* 🌐 Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/admin-signup" element={<AdminSignup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/teacher/report-issue" element={<TeacherReportIssue />} />

      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* 🔐 Admin Nested Routes requiring distinct layout control OR standalone pages
          Note: Since AdminDashboard in this setup includes the sidebar, 
          we can treat sub-pages as siblings if they also include Sidebar, 
          OR structure them as nested routes.
          Here, Users and Details pages render their own Sidebar, so we route them as top-level protected or keep as siblings. 
      */}
      <Route path="/admin-dashboard/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
      <Route path="/admin-dashboard/student-details" element={<ProtectedRoute><StudentDetails /></ProtectedRoute>} />
      <Route path="/admin-dashboard/teachers" element={<ProtectedRoute><Teachers /></ProtectedRoute>} />
      <Route path="/admin-dashboard/add-teacher" element={<ProtectedRoute><AddTeacher /></ProtectedRoute>} />
      <Route path="/admin-dashboard/post-opportunity" element={<ProtectedRoute><AdminPostOpportunity /></ProtectedRoute>} /> {/* New Route */}
      <Route path="/admin-dashboard/help" element={<ProtectedRoute><HelpCenter /></ProtectedRoute>} />
      <Route path="/admin-dashboard/testimonials" element={<ProtectedRoute><Testimonials /></ProtectedRoute>} />

      {/* 🧭 Dashboard (Protected) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      >
        {/* 🏠 Dashboard Home */}
        <Route index element={<DashboardOverview />} />

        {/* 🔥 Social */}
        <Route path="share-skill" element={<ShareSkill />} />

        <Route path="connect" element={<ConnectFriend />} />
        <Route path="connect-student" element={<Connect />} />
        <Route path="opportunities" element={<StudentOpportunities />} /> {/* New Route */}

        {/* ▶️ Study Flow */}

        <Route path="form" element={<Form />} />

        {/* 👨‍🏫 Mentor */}
        <Route path="search-teacher" element={<SearchTeacher />} />

        {/* 📦 Resources */}
        <Route path="resources" element={<Resource />} />

        {/* 💬 Chat */}
        <Route path="chat/:study_id" element={<Chat />} />

        {/* 📘 Study */}
        <Route path="study-details" element={<StudyDetails />} />

        {/* 📝 Assessment */}
        <Route path="assessment" element={<Assessment />} />

        {/* 🎓 Certificates */}
        <Route path="certificates" element={<Certificate />} />

        {/* 👤 Account */}
        <Route path="account" element={<Account />}>
          <Route path="profile" element={<Profile />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="privacy" element={<PrivacySettings />} />
          <Route path="help" element={<StudentHelp />} />
          <Route path="review" element={<StudentReview />} />
        </Route>
      </Route>

      {/* ❌ Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
