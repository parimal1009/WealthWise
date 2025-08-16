import React, { useState } from "react";
import { Save, AlertCircle } from "lucide-react";

const ProfileFormComponent = ({ userData, onSubmit, onUpdate }) => {
  const [formData, setFormData] = useState({
    age: userData.age || "",
    currentSavings: userData.currentSavings || "",
    monthlyIncome: userData.monthlyIncome || "",
    pensionAmount: userData.pensionAmount || "",
    spouseAge: userData.spouseAge || "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.age || formData.age < 18 || formData.age > 100) {
      newErrors.age = "Please enter a valid age between 18-100";
    }

    if (!formData.currentSavings || formData.currentSavings < 0) {
      newErrors.currentSavings = "Please enter your current savings";
    }

    if (!formData.pensionAmount || formData.pensionAmount < 0) {
      newErrors.pensionAmount = "Please enter your pension amount";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onUpdate((prev) => ({ ...prev, ...formData }));
      onSubmit("I've completed my basic profile information", formData);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-2xl">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Let's Start with Your Basic Information
        </h3>
        <p className="text-sm text-gray-600">
          This helps me create personalized retirement scenarios for you
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Age *
            </label>
            <input
              type="number"
              className={`input-field ${errors.age ? "border-red-500" : ""}`}
              value={formData.age}
              onChange={(e) => handleChange("age", e.target.value)}
              placeholder="e.g., 58"
            />
            {errors.age && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.age}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Spouse Age (Optional)
            </label>
            <input
              type="number"
              className="input-field"
              value={formData.spouseAge}
              onChange={(e) => handleChange("spouseAge", e.target.value)}
              placeholder="e.g., 55"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Savings (₹) *
            </label>
            <input
              type="number"
              className={`input-field ${
                errors.currentSavings ? "border-red-500" : ""
              }`}
              value={formData.currentSavings}
              onChange={(e) => handleChange("currentSavings", e.target.value)}
              placeholder="e.g., 5000000"
            />
            {errors.currentSavings && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.currentSavings}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Income (₹)
            </label>
            <input
              type="number"
              className="input-field"
              value={formData.monthlyIncome}
              onChange={(e) => handleChange("monthlyIncome", e.target.value)}
              placeholder="e.g., 150000"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Pension/PF Amount (₹) *
            </label>
            <input
              type="number"
              className={`input-field ${
                errors.pensionAmount ? "border-red-500" : ""
              }`}
              value={formData.pensionAmount}
              onChange={(e) => handleChange("pensionAmount", e.target.value)}
              placeholder="e.g., 2000000"
            />
            {errors.pensionAmount && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.pensionAmount}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="btn-primary flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Continue</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileFormComponent;
