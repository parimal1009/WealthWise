import { useState, useEffect } from "react";
import { Save, AlertCircle, TrendingUp, Shield, DollarSign, BarChart3, User, ChevronLeft, Info } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../../redux/slices/userDataSlice";
import { zerodhaService } from "../../services/zerodhaService";

const RiskToleranceFormComponent = ({ onSubmit }) => {
  const { userData } = useSelector((state) => state.userData);
  const dispatch = useDispatch();
  
  const [mode, setMode] = useState("zerodha"); // "zerodha" or "manual"
  const [formData, setFormData] = useState({
    // Zerodha connection
    zerodhaConnected: false,
    zerodhaProfile: null,
    fdValue: userData.fdValue || "500000", // Default FD value for Zerodha mode
    
    // Manual Investment Details (only for manual mode)
    fixedDepositAmount: userData.fixedDepositAmount || "",
    mutualFundAmount: userData.mutualFundAmount || "",
    stockInvestmentAmount: userData.stockInvestmentAmount || "",
  });

  const [errors, setErrors] = useState({});
  const [zerodhaStatus, setZerodhaStatus] = useState({
    loading: false,
    error: null
  });

  // Check Zerodha connection status on component mount
  useEffect(() => {
    if (mode === "zerodha") {
      checkZerodhaConnection();
    }
  }, [mode]);

  const checkZerodhaConnection = async () => {
    try {
      setZerodhaStatus({ loading: true, error: null });
      const status = await zerodhaService.checkConnectionStatus();
      
      setFormData(prev => ({
        ...prev,
        zerodhaConnected: status.connected,
        zerodhaProfile: status.profile
      }));
      
      setZerodhaStatus({ loading: false, error: status.error || null });
    } catch (error) {
      setZerodhaStatus({ 
        loading: false, 
        error: error.message 
      });
    }
  };

  const handleZerodhaConnect = async () => {
    try {
      setZerodhaStatus({ loading: true, error: null });
      const currentUrl = window.location.pathname + window.location.search;
      const loginUrl = await zerodhaService.getLoginUrl(currentUrl);
      
      // Redirect to Zerodha login
      window.location.href = loginUrl;
      
    } catch (error) {
      setZerodhaStatus({ 
        loading: false, 
        error: error.message 
      });
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (mode === "zerodha") {
      // For Zerodha mode, check if connected and FD value is valid
      if (!formData.zerodhaConnected) {
        newErrors.zerodha = "Please connect your Zerodha account to proceed";
      }
      
      if (!formData.fdValue || isNaN(formData.fdValue) || parseFloat(formData.fdValue) < 0) {
        newErrors.fdValue = "Please enter a valid FD amount";
      }
    } else {
      // For manual mode, validate investment amounts
      const totalInvestments = 
        (parseInt(formData.fixedDepositAmount) || 0) +
        (parseInt(formData.mutualFundAmount) || 0) +
        (parseInt(formData.stockInvestmentAmount) || 0);

      if (totalInvestments === 0) {
        newErrors.investments = "Please enter at least one investment amount";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      dispatch(setUserData(formData));
      
      if (mode === "zerodha") {
        // For Zerodha mode, we'll calculate risk tolerance from portfolio analysis
        onSubmit("Risk analysis completed via Zerodha - portfolio data automatically analyzed", { 
          ...formData, 
          mode: "zerodha",
          riskTolerance: "auto-calculated" // Will be calculated from Zerodha data
        });
      } else {
        // For manual mode, we'll calculate risk based on the investment amounts
        onSubmit("Risk analysis completed manually", { 
          ...formData, 
          mode: "manual"
        });
      }
    }
  };

  const calculateTotalInvestments = () => {
    return (
      (parseInt(formData.fixedDepositAmount) || 0) +
      (parseInt(formData.mutualFundAmount) || 0) +
      (parseInt(formData.stockInvestmentAmount) || 0)
    ).toLocaleString('en-IN');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-3xl">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Risk Tolerance Analysis
        </h3>
        <p className="text-sm text-gray-600">
          {mode === "zerodha" 
            ? "Connect your Zerodha account to automatically analyze your portfolio"
            : "Enter your investment details manually"
          }
        </p>
        
        {/* Accuracy message placed prominently at the top */}
        {mode === "zerodha" && (
          <div className="mt-4 flex items-start text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
            <Info className="h-4 w-4 mr-2 mt-0.5 text-blue-500 flex-shrink-0" />
            <span>
              Connecting Zerodha provides more accurate risk tolerance calculations by analyzing your actual portfolio composition.
            </span>
          </div>
        )}
      </div>

      {/* Back button for manual mode */}
      {mode === "manual" && (
        <button
          onClick={() => setMode("zerodha")}
          className="flex items-center text-primary hover:text-primary-600 mb-4 text-sm font-medium"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Zerodha connection
        </button>
      )}

      <div className="space-y-6">
        {/* Zerodha Mode (Default) */}
        {mode === "zerodha" && (
          <div className="space-y-6">
            <div className="bg-primary-50 border border-gray-300 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <BarChart3 className="h-5 w-5 text-primary mr-2" />
                <h4 className="font-medium text-gray-900">Connect Your Zerodha Account</h4>
              </div>
              
              {formData.zerodhaConnected && formData.zerodhaProfile ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center text-green-800 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="font-medium">
                      Connected to {formData.zerodhaProfile.user_name} ({formData.zerodhaProfile.user_id})
                    </span>
                  </div>
                  <p className="text-sm text-green-700 mb-2">
                    ✅ Account connected successfully
                  </p>
                  <p className="text-xs text-green-600">
                    We'll automatically analyze your portfolio data to calculate your risk tolerance and provide personalized retirement recommendations.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white border border-gray-300 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">What we'll do with your Zerodha data:</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Analyze your current investment portfolio</li>
                      <li>• Calculate your risk tolerance automatically</li>
                      <li>• Generate personalized retirement scenarios</li>
                      <li>• Provide data-driven recommendations</li>
                    </ul>
                  </div>
                  
                  <button
                    onClick={handleZerodhaConnect}
                    disabled={zerodhaStatus.loading}
                    className="w-full btn-primary disabled:opacity-50"
                  >
                    {zerodhaStatus.loading ? 'Connecting to Zerodha...' : 'Login with Zerodha'}
                  </button>
                  
                  {zerodhaStatus.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        {zerodhaStatus.error}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {errors.zerodha && (
                <p className="mt-2 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.zerodha}
                </p>
              )}
            </div>

            {/* FD Value Input for Zerodha Mode */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-primary" />
                Fixed Deposit Details
              </h4>
              
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fixed Deposit Amount (₹) *
                </label>
                <input
                  type="number"
                  className="input-field"
                  value={formData.fdValue}
                  onChange={(e) => handleChange("fdValue", e.target.value)}
                  placeholder="e.g., 500000"
                />
                {errors.fdValue && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.fdValue}
                  </p>
                )}
              </div>
            </div>

            {/* Manual entry option */}
            <div className="pt-4 border-t border-gray-300">
              <p className="text-sm text-gray-600 mb-3">
                Don't want to connect your Zerodha account?
              </p>
              <button
                onClick={() => setMode("manual")}
                className="text-primary hover:text-primary-600 text-sm font-medium flex items-center"
              >
                <User className="h-4 w-4 mr-1" />
                Enter details manually instead
              </button>
            </div>
          </div>
        )}

        {/* Manual Mode */}
        {mode === "manual" && (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center text-yellow-800 mb-1">
                <User className="h-4 w-4 mr-2" />
                <span className="font-medium">Manual Entry Mode</span>
              </div>
              <p className="text-sm text-yellow-700">
                You're providing your investment portfolio details manually. For more accurate risk assessment, consider connecting your Zerodha account.
              </p>
            </div>

            {/* Current Investment Portfolio */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-primary" />
                Current Investment Portfolio
              </h4>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fixed Deposits (₹)
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    value={formData.fixedDepositAmount}
                    onChange={(e) => handleChange("fixedDepositAmount", e.target.value)}
                    placeholder="e.g., 500000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mutual Funds (₹)
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    value={formData.mutualFundAmount}
                    onChange={(e) => handleChange("mutualFundAmount", e.target.value)}
                    placeholder="e.g., 300000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Investments (₹)
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    value={formData.stockInvestmentAmount}
                    onChange={(e) => handleChange("stockInvestmentAmount", e.target.value)}
                    placeholder="e.g., 200000"
                  />
                </div>
              </div>

              {errors.investments && (
                <p className="mt-2 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.investments}
                </p>
              )}

              {parseInt(calculateTotalInvestments().replace(/,/g, '')) > 0 && (
                <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-sm text-gray-600">Total Current Investments: </span>
                  <span className="font-semibold text-gray-900">₹{calculateTotalInvestments()}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={handleSubmit}
            disabled={(mode === "zerodha" && zerodhaStatus.loading)}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>
              {mode === "zerodha" 
                ? (formData.zerodhaConnected ? "Complete Analysis" : "Connect & Analyze")
                : "Complete Risk Analysis"
              }
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiskToleranceFormComponent;