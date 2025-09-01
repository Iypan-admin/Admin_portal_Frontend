import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import ManagerPage from "./pages/ManagerPage";
import ManageUsersPage from "./pages/ManageUsersPage";
import FinanceAdminPage from "./pages/FinanceAdminPage";
import ApproveStudentsPage from "./pages/ApproveStudentsPage";
import AcademicCoordinatorPage from "./pages/AcademicCoordinatorPage";
import ManageBatchesPage from "./pages/ManageBatchesPage";
import ManageStudentsPage from "./pages/ManageStudentsPage";
import StateAdminPage from "./pages/StateAdminPage";
import ManageCentersPage from "./pages/ManageCentersPage";
import CenterAdminPage from "./pages/CenterAdminPage";
import TeacherPage from "./pages/TeacherPage";
import TeacherClassesPage from './pages/TeacherClassesPage';
import BatchDetailPage from './pages/BatchDetailPage';
import TakeClassPage from './pages/TakeClassPage';
import BatchChatsPage from './pages/BatchChatsPage';
import BatchNotesPage from './pages/BatchNotesPage';
import BatchCourseDetailsPage from './pages/BatchCourseDetailsPage';
import ManageCoursesPage from './pages/ManageCoursesPage';
import ManageStatesPage from './pages/ManageStatesPage';
import ViewTeachersPage from './pages/ViewTeachersPage';
import ViewStudentsPage from './pages/ViewStudentsPage';
import ViewBatchesPage from './pages/ViewBatchesPage';
import ViewCentersPage from './pages/ViewCentersPage';
import CardAdminPage from "./pages/CardAdminPage";
import GenerateCardPage from "./pages/GenerateCardPage";
import ActivateCardPage from "./pages/ActivateCardPage";
import ApprovedCardPage from './pages/ApprovedCardPage';
import ApprovedGiveawayCardPage from './pages/ApprovedGiveawayPage';
import ViewCenterEliteCard from "./pages/ViewCenterEliteCard";
import InfluencerOnboardingPage from "./pages/InfluencerOnboardingPage";
import EliteCardPaymentsPage from "./pages/EliteCardPaymentsPage";




function App() {
  const [role, setRole] = useState(() => {
    // Initialize role from token on first load
    const token = localStorage.getItem("token");
    if (token) {
      try {
        return JSON.parse(atob(token.split(".")[1])).role;
      } catch (error) {
        localStorage.removeItem("token");
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    // Function to check token validity
    const checkToken = () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Check token expiration
          const decodedToken = JSON.parse(atob(token.split(".")[1]));
          const currentTime = Date.now() / 1000;

          if (decodedToken.exp && decodedToken.exp < currentTime) {
            // Token has expired
            localStorage.removeItem("token");
            setRole(null);
            return;
          }

          setRole(decodedToken.role);
        } catch (error) {
          console.error("Token validation error:", error);
          localStorage.removeItem("token");
          setRole(null);
        }
      } else {
        setRole(null);
      }
    };

    // Check token immediately
    checkToken();

    // Set up interval to periodically check token
    const interval = setInterval(checkToken, 60000); // Check every minute

    // Add event listener for storage changes
    window.addEventListener('storage', checkToken);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkToken);
    };
  }, []);

  // Add authentication wrapper
  const ProtectedRoute = ({ children, allowedRole }) => {
    const token = localStorage.getItem("token");

    if (!token || role !== allowedRole) {
      return <Navigate to="/" replace />;
    }

    return children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage setRole={setRole} />} />
        {role === "admin" && (
          <>
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRole="admin">
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-users"
              element={
                <ProtectedRoute allowedRole="admin">
                  <ManageUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-states"
              element={
                <ProtectedRoute allowedRole="admin">
                  <ManageStatesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-centers"
              element={
                <ProtectedRoute allowedRole="admin">
                  <ManageCentersPage />
                </ProtectedRoute>
              }
            />
          </>
        )}
        {role === "manager" && (
          <>
            <Route
              path="/manage-states"
              element={
                <ProtectedRoute allowedRole="manager">
                  <ManageStatesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-centers"
              element={
                <ProtectedRoute allowedRole="manager">
                  <ManageCentersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager"
              element={
                <ProtectedRoute allowedRole="manager">
                  <ManagerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-users"
              element={
                <ProtectedRoute allowedRole="manager">
                  <ManageUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-courses"
              element={
                <ProtectedRoute allowedRole="manager">
                  <ManageCoursesPage />
                </ProtectedRoute>
              }
            />
          </>
        )}
        {role === "financial" && (
          <>
            <Route
              path="/finance-admin"
              element={
                <ProtectedRoute allowedRole="financial">
                  <FinanceAdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/approve-students"
              element={
                <ProtectedRoute allowedRole="financial">
                  <ApproveStudentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/approve-card"
              element={
                <ProtectedRoute allowedRole="financial">
                  <ApprovedCardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/approve-Giveaway"
              element={
                <ProtectedRoute allowedRole="financial">
                  <ApprovedGiveawayCardPage />
                </ProtectedRoute>
              }
            />
          </>
        )}
        {role === "academic" && (
          <>
            <Route
              path="/academic"
              element={
                <ProtectedRoute allowedRole="academic">
                  <AcademicCoordinatorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-batches"
              element={
                <ProtectedRoute allowedRole="academic">
                  <ManageBatchesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-students"
              element={
                <ProtectedRoute allowedRole="academic">
                  <ManageStudentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-teachers"
              element={
                <ProtectedRoute allowedRole="academic">
                  <ManageUsersPage />
                </ProtectedRoute>
              }
            />
          </>
        )}
        {role === "state" && (
          <>
            <Route
              path="/state-admin"
              element={
                <ProtectedRoute allowedRole="state">
                  <StateAdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/state-admin/centers"
              element={
                <ProtectedRoute allowedRole="state">
                  <ViewCentersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/state-admin/center/:centerId/students"
              element={
                <ProtectedRoute allowedRole="state">
                  <ViewStudentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/state-admin/center/:centerId/teachers"
              element={
                <ProtectedRoute allowedRole="state">
                  <ViewTeachersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/state-admin/center/:centerId/batches"
              element={
                <ProtectedRoute allowedRole="state">
                  <ViewBatchesPage />
                </ProtectedRoute>
              }
            />
          </>
        )}
        {role === "center" && (
          <>
            <Route
              path="/center-admin"
              element={
                <ProtectedRoute allowedRole="center">
                  <CenterAdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/center-admin/teachers"
              element={
                <ProtectedRoute allowedRole="center">
                  <ViewTeachersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/center-admin/students"
              element={
                <ProtectedRoute allowedRole="center">
                  <ViewStudentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/center-admin/batches"
              element={
                <ProtectedRoute allowedRole="center">
                  <ViewBatchesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/center/viewcenterelite"
              element={
                <ProtectedRoute allowedRole="center">
                  <ViewCenterEliteCard />
                </ProtectedRoute>
              }
            />
          </>
        )}
        {role === "teacher" && (
          <>
            <Route
              path="/teacher"
              element={
                <ProtectedRoute allowedRole="teacher">
                  <TeacherPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/classes"
              element={
                <ProtectedRoute allowedRole="teacher">
                  <TeacherClassesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/batch/:batchId"
              element={
                <ProtectedRoute allowedRole="teacher">
                  <BatchDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/batch/:batchId/take-class"
              element={
                <ProtectedRoute allowedRole="teacher">
                  <TakeClassPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/batch/:batchId/chats"
              element={
                <ProtectedRoute allowedRole="teacher">
                  <BatchChatsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/batch/:batchId/notes"
              element={
                <ProtectedRoute allowedRole="teacher">
                  <BatchNotesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/batch/:batchId/details"
              element={
                <ProtectedRoute allowedRole="teacher">
                  <BatchCourseDetailsPage />
                </ProtectedRoute>
              }
            />
          </>
        )}
        {role === "cardadmin" && (
          <>
            <Route
              path="/cardadmin"
              element={
                <ProtectedRoute allowedRole="cardadmin">
                  <CardAdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/generate-card"
              element={
                <ProtectedRoute allowedRole="cardadmin">
                  <GenerateCardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/activate-card"
              element={
                <ProtectedRoute allowedRole="cardadmin">
                  <ActivateCardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/influencer-onboarding"
              element={
                <ProtectedRoute allowedRole="cardadmin">
                  <InfluencerOnboardingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/elite-card-payments"
              element={
                <ProtectedRoute allowedRole="cardadmin">
                  <EliteCardPaymentsPage />
                </ProtectedRoute>
              }
            />
          </>
        )}

        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </Router>
  );
}

export default App;
