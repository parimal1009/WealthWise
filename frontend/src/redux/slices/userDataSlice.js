import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userData: {
    // Personal Details
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

    // Risk Tolerance Analysis
    mode: "", // 'zerodha' or 'manual'
    zerodhaConnected: false,
    zerodhaProfile: null,
    fdValue: "",
    fixedDepositAmount: "",
    mutualFundAmount: "",
    stockInvestmentAmount: "",
    risk_score: "",
    risk_category: "",
    stock_holdings_value: "",
    mf_holdings_value: "",
    total_portfolio_value: "",
    stock_breakdown: {},
    calculated_at: "",
  },
};

const userData = createSlice({
  name: "userData",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      state.userData = {
        ...state.userData,
        ...action.payload,
      };
    },
    resetUserData: (state) => {
      state.userData = initialState.userData;
    },
    updateRiskProfile: (state, action) => {
      state.userData = {
        ...state.userData,
        ...action.payload,
      };
    },
  },
});

export const { setUserData, resetUserData, updateRiskProfile } = userData.actions;
export default userData.reducer;