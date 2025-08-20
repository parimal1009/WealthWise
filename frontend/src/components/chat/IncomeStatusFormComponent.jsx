import { useState } from "react";
import { Save, AlertCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../../redux/slices/userDataSlice";
import { numberToWords } from "../../utils/textUtils";
import { LIMITS } from "../../utils/constants";

const IncomeStatusFormComponent = ({ onSubmit }) => {
  const userData = useSelector((state) => state.userData);

  const [formData, setFormData] = useState({
    currentSalary: userData.currentSalary || "",
    yearsOfService: userData.yearsOfService || "",
    employerType: userData.employerType || "",
    pensionScheme: userData.pensionScheme || "",
    pensionBalance: userData.pensionBalance || "",
    employerContribution: userData.employerContribution || "",
  });
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();

  const handleChange = (field, value) => {
    let processedValue = value;

    // Only clamp if the value is not an empty string and is a valid number
    if (LIMITS[field] && value !== "" && !isNaN(value)) {
      const numericValue = Number(value);
      processedValue = Math.max(
        LIMITS[field].min,
        Math.min(LIMITS[field].max, numericValue)
      );
    }

    setFormData((prev) => ({
      ...prev,
      [field]: processedValue,
    }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentSalary || formData.currentSalary <= 0) {
      newErrors.currentSalary = "Please enter a valid current salary";
    }

    if (!formData.yearsOfService || formData.yearsOfService < 0) {
      newErrors.yearsOfService = "Please enter valid years of service";
    }

    if (!formData.employerType) {
      newErrors.employerType = "Please select your employer type";
    }

    if (!formData.pensionScheme) {
      newErrors.pensionScheme = "Please select your pension scheme";
    }

    if (!formData.pensionBalance || formData.pensionBalance < 0) {
      newErrors.pensionBalance = "Please enter a valid pension balance";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      dispatch(setUserData({ ...formData }));
      onSubmit("I've completed my income status information", formData);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-2xl">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Income Status
        </h3>
        <p className="text-sm text-gray-600">
          Now let's understand your current income and employment details
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Salary (₹/month) *
            </label>
            <input
              type="number"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.currentSalary ? "border-red-500" : "border-gray-300"
              }`}
              value={formData.currentSalary}
              onChange={(e) => handleChange("currentSalary", e.target.value)}
              placeholder="e.g., 150000"
            />
            {errors.currentSalary && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.currentSalary}
              </p>
            )}
            {formData.currentSalary && (
              <p className="mt-1 text-xs text-primary-600">
                <span className="font-medium">
                  {numberToWords(formData.currentSalary)}
                </span>{" "}
                Rupees
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Years of Service *
            </label>
            <input
              type="number"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.yearsOfService ? "border-red-500" : "border-gray-300"
              }`}
              value={formData.yearsOfService}
              onChange={(e) => handleChange("yearsOfService", e.target.value)}
              placeholder="e.g., 15"
              min="0"
            />
            {errors.yearsOfService && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.yearsOfService}
              </p>
            )}
            {formData.yearsOfService && (
              <p className="mt-1 text-xs text-primary-600">
                <span className="font-medium">
                  {numberToWords(formData.yearsOfService)}
                </span>{" "}
                Years
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employer Type *
            </label>
            <select
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.employerType ? "border-red-500" : "border-gray-300"
              }`}
              value={formData.employerType}
              onChange={(e) => handleChange("employerType", e.target.value)}
            >
              <option value="">Select Employer Type</option>
              <option value="government">Government</option>
              <option value="private">Private</option>
              <option value="self-employed">Self Employed</option>
            </select>
            {errors.employerType && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.employerType}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pension Scheme *
            </label>
            <select
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.pensionScheme ? "border-red-500" : "border-gray-300"
              }`}
              value={formData.pensionScheme}
              onChange={(e) => handleChange("pensionScheme", e.target.value)}
            >
              <option value="">Select Pension Scheme</option>
              <option value="ops">OPS (Old Pension Scheme)</option>
              <option value="nps">NPS (National Pension System)</option>
              <option value="epf">EPF (Employee Provident Fund)</option>
              <option value="other">Other</option>
            </select>
            {errors.pensionScheme && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.pensionScheme}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Pension Balance (₹) *
            </label>
            <input
              type="number"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.pensionBalance ? "border-red-500" : "border-gray-300"
              }`}
              value={formData.pensionBalance}
              onChange={(e) => handleChange("pensionBalance", e.target.value)}
              placeholder="e.g., 2000000"
            />
            {errors.pensionBalance && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.pensionBalance}
              </p>
            )}
            {formData.pensionBalance && (
              <p className="mt-1 text-xs text-primary-600">
                <span className="font-medium">
                  {numberToWords(formData.pensionBalance)}
                </span>{" "}
                Rupees
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Employer Contribution (₹)
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={formData.employerContribution}
              onChange={(e) =>
                handleChange("employerContribution", e.target.value)
              }
              placeholder="e.g., 15000"
            />
            {formData.employerContribution && (
              <p className="mt-1 text-xs text-primary-600">
                <span className="font-medium">
                  {numberToWords(formData.employerContribution)}
                </span>{" "}
                Rupees
              </p>
            )}
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 text-sm mb-2">
            Information Note:
          </h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>
              • OPS: Provides fixed pension after retirement based on last drawn
              salary
            </li>
            <li>
              • NPS: Market-linked returns with annuity and lump sum options
            </li>
            <li>
              • EPF: Fixed returns with tax benefits, withdrawable after 5 years
            </li>
          </ul>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSubmit}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Continue to Retirement Planning</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomeStatusFormComponent;
