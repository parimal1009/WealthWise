import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useLocation } from "react-router";
import Navbar from "../components/Navbar";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import ProtectedRoute from "../components/ProtectedRoute";
import OAuthCallback from "../pages/OAuthCallback";
import ZerodhaCallback from "../pages/ZerodhaCallback";
import ProfilePage from "../pages/ProfilePage";
import ParentComponent from "../components/main/ParentComponent";
import LearnPage from "../pages/LearnPage.jsx"; // Import LearnPage

function AppRoutes() {
  const [userData, setUserData] = useState({
    // Basic Information
    name: "Full Name",
    email: "abc@gmail.com",
    avatar: "/profile-default.png",
    age: "",
    dateOfBirth: "",
    gender: "",
    location: "",
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

  return (
    <div className="min-h-screen bg-gray-50">
      {location.pathname !== "/home" && <Navbar />}
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
          path="/home"
          element={
            <ProtectedRoute>
              <ParentComponent
                userData={userData}
                setUserData={setUserData}
                scenarios={scenarios}
                setScenarios={setScenarios}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learn"
          element={
            <ProtectedRoute>
              <ParentComponent
                userData={userData}
                setUserData={setUserData}
                scenarios={scenarios}
                setScenarios={setScenarios}
              />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default AppRoutes;
