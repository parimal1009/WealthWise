import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import OAuthCallback from "./pages/OAuthCallback";
import ZerodhaCallback from "./pages/ZerodhaCallback";
import ChatInterface from "./components/ChatInterface";
import ProfilePage from "./pages/ProfilePage";
import ParentComponent from "./components/main/ParentComponent";

function App() {
  const [userData, setUserData] = useState({
    // Basic Information
    name: "",
    email: "",
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

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
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

            <Route path="/home" element={<ProtectedRoute><ParentComponent /></ProtectedRoute>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;