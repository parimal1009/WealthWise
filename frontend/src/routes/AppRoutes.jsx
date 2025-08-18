import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useLocation } from "react-router";
import Navbar from "../components/Navbar";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import ProtectedRoute from "./ProtectedRoute";
import OAuthCallback from "../pages/OAuthCallback";
import ZerodhaCallback from "../pages/ZerodhaCallback";
import ProfilePage from "../pages/ProfilePage";
import ParentComponent from "../components/main/ParentComponent";
import ChatPage from "../pages/ChatPage";
import Dashboard from "../pages/DashboardPage";
import LearnPage from "../pages/LearnPage";
import { useAuth } from "../context/AuthContext";

function AppRoutes() {
  const { user } = useAuth();
  const [userData, setUserData] = useState({
    // keep initial placeholders so UI doesn’t break
    name: "Full Name",
    email: "abc@gmail.com",
    avatar: "/profile-default.png",
    age: "",
    dateOfBirth: "",
    gender: "Prefer not to say",
    location: "India",
    maritalStatus: "",
    numberOfDependants: "",

    // Income Status
    currentSalary: "",
    yearsOfService: "",
    employerType: "",
    pensionScheme: "",
    pensionBalance: "",
    employerContribution: "",

    // Retirement Information
    plannedRetirementAge: "",
    retirementLifestyle: "",
    monthlyRetirementExpense: "",
    legacyGoal: "",
  });

  const [scenarios, setScenarios] = useState([]);
  const location = useLocation();

  // ✅ Update userData when user is available
  useEffect(() => {
    if (user) {
      setUserData((prev) => ({
        ...prev,
        name: user?.name ?? "Full Name",
        email: user?.email ?? "abc@gmail.com",
        avatar: user?.profile_picture ?? "/profile-default.png",
        dateOfBirth: user?.birthday ?? "",
        gender: user?.gender ?? "Prefer not to say",
      }));
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      {!location.pathname.startsWith("/home") && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route path="/zerodha/callback" element={<ZerodhaCallback />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/home/*"
          element={
            <ProtectedRoute>
              <ParentComponent userData={userData} />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <ChatPage
                userData={userData}
                setUserData={setUserData}
                scenarios={scenarios}
                setScenarios={setScenarios}
              />
            }
          />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="learn" element={<LearnPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default AppRoutes;
