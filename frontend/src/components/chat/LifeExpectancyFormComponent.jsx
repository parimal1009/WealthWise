import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Heart, Loader2 } from "lucide-react";
import { updateHealthProfile } from "../../redux/slices/userDataSlice";
import { API_BASE_URL } from "../../utils/constants";

const LifeExpectancyFormComponent = ({ onSubmit }) => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.userData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    height: "",
    weight: "",
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
    formName: "life-expectancy-form",
  });

  // Load existing data from Redux on component mount
  useEffect(() => {
    if (userData) {
      setFormData({
        height: userData.height || "",
        weight: userData.weight || "",
        physicalActivity: userData.physicalActivity || "",
        smokingStatus: userData.smokingStatus || "",
        alcoholConsumption: userData.alcoholConsumption || "",
        diet: userData.diet || "",
        bloodPressure: userData.bloodPressure || "",
        cholesterol: userData.cholesterol || "",
        asthma: userData.asthma || 0,
        diabetes: userData.diabetes || 0,
        heartDisease: userData.heartDisease || 0,
        hypertension: userData.hypertension || 0,
      });
    }
  }, [userData]);

  const calculateBMI = (height, weight) => {
    if (!height || !weight) return 0;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const bmi = calculateBMI(formData.height, formData.weight);

  const submitLifeExpectancyData = async (data) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const apiPayload = {
        Height: parseInt(data.height),
        Weight: parseInt(data.weight),
        Gender: data.gender === "Female" ? "Female" : "Male",
        BMI: parseFloat(data.bmi),
        Physical_Activity: data.physicalActivity,
        Smoking_Status: data.smokingStatus,
        Alcohol_Consumption: data.alcoholConsumption,
        Diet: data.diet,
        Blood_Pressure: data.bloodPressure,
        Cholesterol: parseInt(data.cholesterol),
        Asthma: data.asthma,
        Diabetes: data.diabetes,
        Heart_Disease: data.heartDisease,
        Hypertension: data.hypertension,
      };

      const response = await fetch(
        `${API_BASE_URL}/users/life-expectancy/add/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(apiPayload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const dataToSubmit = {
        ...formData,
        bmi: parseFloat(bmi),
        height: parseInt(formData.height),
        weight: parseInt(formData.weight),
        cholesterol: parseInt(formData.cholesterol),
        gender: userData.gender,
      };

      // Make API request to get life expectancy prediction
      const apiResponse = await submitLifeExpectancyData(dataToSubmit);

      // Update Redux store with form data and prediction
      const updatedData = {
        ...dataToSubmit,
        predictedLifeExpectancy: apiResponse.predicted_life_expectancy,
      };

      dispatch(updateHealthProfile(updatedData));

      // Call parent onSubmit if provided
      if (onSubmit) {
        onSubmit("Life expectancy form submitted", {
          ...updatedData,
          apiResponse,
        });
      }
    } catch (error) {
      setError(error.message || "Failed to submit life expectancy data");
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const isFormValid = () => {
    return (
      formData.height &&
      formData.weight &&
      formData.physicalActivity &&
      formData.smokingStatus &&
      formData.alcoholConsumption &&
      formData.diet &&
      formData.bloodPressure &&
      formData.cholesterol &&
      userData.gender // Make sure gender is available from userData
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
            Help us understand your health profile for better retirement
            planning
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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

        {/* Lifestyle Factors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Physical Activity Level
            </label>
            <select
              value={formData.physicalActivity}
              onChange={(e) =>
                handleInputChange("physicalActivity", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              onChange={(e) =>
                handleInputChange("smokingStatus", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
              disabled={isSubmitting}
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
              onChange={(e) =>
                handleInputChange("alcoholConsumption", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
              disabled={isSubmitting}
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
              onChange={(e) =>
                handleInputChange("bloodPressure", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
                  disabled={isSubmitting}
                />
                <span className="text-sm text-gray-700">{condition.label}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!isFormValid() || isSubmitting}
          className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Processing...
            </>
          ) : (
            "Continue to Risk Assessment"
          )}
        </button>
      </form>
    </div>
  );
};

export default LifeExpectancyFormComponent;
