import { useState } from "react";
import { Heart, Activity, Scale, User } from "lucide-react";

const LifeExpectancyFormComponent = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    height: "",
    weight: "",
    gender: "",
    physicalActivity: "",
    smokingStatus: "",
    alcoholConsumption: "",
    diet: "",
    bloodPressure: "",
    cholesterol: "",
    asthma: 0,
    diabetes: 0,
    heartDisease: 0,
    hypertension: 0,
  });

  const calculateBMI = (height, weight) => {
    if (!height || !weight) return 0;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const bmi = calculateBMI(formData.height, formData.weight);

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      bmi: parseFloat(bmi),
      height: parseInt(formData.height),
      weight: parseInt(formData.weight),
      cholesterol: parseInt(formData.cholesterol),
    };
    onSubmit("Life expectancy form submitted", dataToSubmit);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isFormValid = () => {
    return (
      formData.height &&
      formData.weight &&
      formData.gender &&
      formData.physicalActivity &&
      formData.smokingStatus &&
      formData.alcoholConsumption &&
      formData.diet &&
      formData.bloodPressure &&
      formData.cholesterol
    );
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-green-100 p-2 rounded-lg">
          <Heart className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Health & Life Expectancy Assessment
          </h3>
          <p className="text-sm text-gray-600">
            Help us understand your health profile for better retirement planning
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Physical Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Height (cm)
            </label>
            <input
              type="number"
              value={formData.height}
              onChange={(e) => handleInputChange("height", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="170"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weight (kg)
            </label>
            <input
              type="number"
              value={formData.weight}
              onChange={(e) => handleInputChange("weight", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="65"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              BMI
            </label>
            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
              {bmi || "0.0"}
            </div>
          </div>
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender
          </label>
          <div className="flex space-x-4">
            {["Male", "Female"].map((option) => (
              <label key={option} className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value={option}
                  checked={formData.gender === option}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  className="mr-2 text-primary-600"
                  required
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Lifestyle Factors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Physical Activity Level
            </label>
            <select
              value={formData.physicalActivity}
              onChange={(e) => handleInputChange("physicalActivity", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Select activity level</option>
              <option value="High">High</option>
              <option value="Moderate">Moderate</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diet Quality
            </label>
            <select
              value={formData.diet}
              onChange={(e) => handleInputChange("diet", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Select diet type</option>
              <option value="Balanced">Balanced</option>
              <option value="Healthy">Healthy</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
        </div>

        {/* Health Habits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Smoking Status
            </label>
            <select
              value={formData.smokingStatus}
              onChange={(e) => handleInputChange("smokingStatus", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Select smoking status</option>
              <option value="Never">Never</option>
              <option value="Former">Former</option>
              <option value="Current">Current</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alcohol Consumption
            </label>
            <select
              value={formData.alcoholConsumption}
              onChange={(e) => handleInputChange("alcoholConsumption", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Select consumption level</option>
              <option value="Never">Never</option>
              <option value="Occasional">Occasional</option>
              <option value="Frequent">Frequent</option>
            </select>
          </div>
        </div>

        {/* Health Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Blood Pressure
            </label>
            <select
              value={formData.bloodPressure}
              onChange={(e) => handleInputChange("bloodPressure", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Select blood pressure level</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cholesterol Level (mg/dL)
            </label>
            <input
              type="number"
              value={formData.cholesterol}
              onChange={(e) => handleInputChange("cholesterol", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="180"
              required
            />
          </div>
        </div>

        {/* Medical Conditions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Do you have any of these conditions? (Check all that apply)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { key: "asthma", label: "Asthma" },
              { key: "diabetes", label: "Diabetes" },
              { key: "heartDisease", label: "Heart Disease" },
              { key: "hypertension", label: "Hypertension" },
            ].map((condition) => (
              <label key={condition.key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData[condition.key] === 1}
                  onChange={(e) =>
                    handleInputChange(condition.key, e.target.checked ? 1 : 0)
                  }
                  className="mr-2 text-primary-600"
                />
                <span className="text-sm text-gray-700">{condition.label}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!isFormValid()}
          className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continue to Risk Assessment
        </button>
      </form>
    </div>
  );
};

export default LifeExpectancyFormComponent;