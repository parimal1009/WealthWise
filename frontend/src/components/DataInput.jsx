import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, Upload, AlertCircle } from "lucide-react";

const DataInput = ({ userData, setUserData }) => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleGoalToggle = (goal) => {
    setUserData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal],
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!userData.age || userData.age < 18 || userData.age > 100) {
      newErrors.age = "Please enter a valid age between 18-100";
    }

    if (!userData.currentSavings || userData.currentSavings < 0) {
      newErrors.currentSavings = "Please enter your current savings";
    }

    if (!userData.pensionAmount || userData.pensionAmount < 0) {
      newErrors.pensionAmount = "Please enter your pension amount";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      navigate("/scenarios");
    }
  };

  const goals = [
    "Maximize monthly income",
    "Minimize tax burden",
    "Ensure spouse coverage",
    "Leave inheritance",
    "Inflation protection",
    "Liquidity access",
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tell Us About Your Situation
        </h1>
        <p className="text-gray-600">
          We'll use this information to create personalized retirement scenarios
          for you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Basic Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Age
              </label>
              <input
                type="number"
                className={`input-field ${errors.age ? "border-red-500" : ""}`}
                value={userData.age}
                onChange={(e) => handleInputChange("age", e.target.value)}
                placeholder="e.g., 58"
              />
              {errors.age && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.age}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Spouse Age (Optional)
              </label>
              <input
                type="number"
                className="input-field"
                value={userData.spouseAge}
                onChange={(e) => handleInputChange("spouseAge", e.target.value)}
                placeholder="e.g., 55"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Savings (₹)
              </label>
              <input
                type="number"
                className={`input-field ${
                  errors.currentSavings ? "border-red-500" : ""
                }`}
                value={userData.currentSavings}
                onChange={(e) =>
                  handleInputChange("currentSavings", e.target.value)
                }
                placeholder="e.g., 5000000"
              />
              {errors.currentSavings && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.currentSavings}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Income (₹)
              </label>
              <input
                type="number"
                className="input-field"
                value={userData.monthlyIncome}
                onChange={(e) =>
                  handleInputChange("monthlyIncome", e.target.value)
                }
                placeholder="e.g., 150000"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Pension/PF Amount (₹)
              </label>
              <input
                type="number"
                className={`input-field ${
                  errors.pensionAmount ? "border-red-500" : ""
                }`}
                value={userData.pensionAmount}
                onChange={(e) =>
                  handleInputChange("pensionAmount", e.target.value)
                }
                placeholder="e.g., 2000000"
              />
              {errors.pensionAmount && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.pensionAmount}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Risk Tolerance */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Risk Tolerance</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {["conservative", "moderate", "aggressive"].map((risk) => (
              <label key={risk} className="cursor-pointer">
                <input
                  type="radio"
                  name="riskTolerance"
                  value={risk}
                  checked={userData.riskTolerance === risk}
                  onChange={(e) =>
                    handleInputChange("riskTolerance", e.target.value)
                  }
                  className="sr-only"
                />
                <div
                  className={`p-4 border-2 rounded-lg text-center transition-colors ${
                    userData.riskTolerance === risk
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-medium capitalize">{risk}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {risk === "conservative" && "Prefer stability over growth"}
                    {risk === "moderate" && "Balanced approach to risk"}
                    {risk === "aggressive" && "Willing to take higher risks"}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Goals */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Your Retirement Goals</h2>
          <p className="text-gray-600 mb-4">Select all that apply to you:</p>
          <div className="grid md:grid-cols-2 gap-3">
            {goals.map((goal) => (
              <label key={goal} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={userData.goals.includes(goal)}
                  onChange={() => handleGoalToggle(goal)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-gray-700">{goal}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-between">
          <button
            type="button"
            className="btn-secondary flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Documents</span>
          </button>

          <button
            type="submit"
            className="btn-primary flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Generate Scenarios</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default DataInput;
