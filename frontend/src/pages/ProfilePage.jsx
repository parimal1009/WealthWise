import React, { useState } from "react";
import {
  User,
  Briefcase,
  Target,
  Edit3,
  Save,
  X,
  Calendar,
  MapPin,
  Building2,
  Heart,
  Mail,
  Users,
  Camera,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [profile, setProfile] = useState({
    fullName: user.name,
    email: user.email,
    dob: "1999-05-12",
    gender: "Male",
    location: "Pune, India",
    employmentStatus: "Software Developer",
    company: "Augrade",
    yearsOfService: 5,
    retirementAge: 60,
    spouseName: "",
    goal: "Maintain lifestyle and leave legacy",
  });

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setEditing(false);
    console.log("Saved profile:", profile);
  };

  const calculateAge = () => {
    const today = new Date();
    const birthDate = new Date(profile.dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const yearsToRetirement = profile.retirementAge - calculateAge();

  const tabs = [
    { id: "personal", label: "Personal", icon: User },
    { id: "employment", label: "Employment", icon: Briefcase },
    { id: "retirement", label: "Retirement", icon: Target },
  ];

  const Field = ({ label, name, type = "text", options, className = "" }) => (
    <div className={`space-y-3 ${className}`}>
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      {editing ? (
        options ? (
          <select
            name={name}
            value={profile[name]}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all"
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={profile[name]}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
          />
        )
      ) : (
        <div className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-800 font-medium">
          {profile[name] || (
            <span className="text-slate-400 italic">Not provided</span>
          )}
        </div>
      )}
    </div>
  );

  const StatItem = ({ label, value, color = "text-slate-700" }) => (
    <div className="text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-sm text-slate-500 font-medium">{label}</div>
    </div>
  );

  const PersonalTab = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Full Name" name="fullName" />
        <Field label="Email" name="email" type="email" />
        <Field label="Date of Birth" name="dob" type="date" />
        <Field
          label="Gender"
          name="gender"
          options={["Male", "Female", "Other", "Prefer not to say"]}
        />
        <Field label="Location" name="location" />
        <Field label="Spouse Name" name="spouseName" />
      </div>

      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <h4 className="font-semibold text-slate-800 text-lg">
            Personal Summary
          </h4>
        </div>
        <p className="text-slate-600 leading-relaxed">
          {profile.fullName} is a {calculateAge()}-year-old{" "}
          {profile.employmentStatus} based in {profile.location}.
          {profile.spouseName && ` Married to ${profile.spouseName}.`}
        </p>
      </div>
    </div>
  );

  const EmploymentTab = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Employment Status" name="employmentStatus" />
        <Field label="Company" name="company" />
        <Field
          label="Years of Service"
          name="yearsOfService"
          type="number"
          className="md:col-span-2"
        />
      </div>

      <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <h4 className="font-semibold text-slate-800 text-lg">
            Career Overview
          </h4>
        </div>
        <p className="text-slate-600 leading-relaxed">
          Currently working as a {profile.employmentStatus} at {profile.company}{" "}
          with {profile.yearsOfService} years of professional experience in the
          industry.
        </p>
      </div>
    </div>
  );

  const RetirementTab = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field
          label="Target Retirement Age"
          name="retirementAge"
          type="number"
        />
        <Field label="Retirement Goal" name="goal" />
      </div>

      <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-2xl">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <h4 className="font-semibold text-slate-800 text-lg">
            Retirement Planning
          </h4>
        </div>
        <p className="text-slate-600 leading-relaxed">
          Planning to retire at age {profile.retirementAge}, which is{" "}
          {yearsToRetirement} years from now. Primary goal: {profile.goal}.
        </p>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "personal":
        return <PersonalTab />;
      case "employment":
        return <EmploymentTab />;
      case "retirement":
        return <RetirementTab />;
      default:
        return <PersonalTab />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Cover Photo with Pattern */}
      <div className="h-64 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/profile-header-bg.jpg')] opacity-30"></div>
        {/* <div className="absolute top-4 right-4">
          <button className="p-3 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-colors">
            <Camera className="w-5 h-5" />
          </button>
        </div> */}
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        {/* Profile Header */}
        <div className="relative -mt-32 pb-8">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-end space-y-6 lg:space-y-0 lg:space-x-8">
              {/* Profile Photo */}
              <div className="relative group">
                <div className="w-36 h-36 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl overflow-hidden flex items-center justify-center text-4xl font-bold text-white shadow-2xl border-4 border-white">
                  {/* {profile.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")} */}
                  <img src="/profile-default.png" />
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  {profile.fullName}
                </h1>
                <p className="text-lg text-slate-600 mb-3">
                  {profile.employmentStatus} at {profile.company}
                </p>
                <div className="flex items-center justify-center lg:justify-start space-x-2 text-slate-500 mb-6">
                  <MapPin size={18} />
                  <span className="font-medium">{profile.location}</span>
                </div>

                {/* Stats */}
                <div className="flex justify-center lg:justify-start space-x-12">
                  <StatItem
                    label="Current Age"
                    value={`${calculateAge()}`}
                    color="text-blue-600"
                  />
                  <StatItem
                    label="Experience"
                    value={`${profile.yearsOfService} years`}
                    color="text-emerald-600"
                  />
                  <StatItem
                    label="To Retirement"
                    value={`${yearsToRetirement} years`}
                    color="text-purple-600"
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="flex-shrink-0">
                {editing ? (
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg font-semibold"
                    >
                      <Save size={18} />
                      <span>Save Changes</span>
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="flex items-center space-x-2 px-6 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-colors font-semibold"
                    >
                      <X size={18} />
                      <span>Cancel</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-600 transition-colors shadow-lg font-semibold"
                  >
                    <Edit3 size={18} />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-2">
            <nav className="flex space-x-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center space-x-3 px-6 py-4 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id
                        ? "bg-primary text-white shadow-lg"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-8">
          {renderTabContent()}
        </div>

        {/* Footer */}
        <div className="text-center pb-8">
          <p className="text-slate-500 text-sm">
            Last updated{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
