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
    zerodhaConnected: false,
    zerodhaProfile: null,
    fixedDepositAmount: "",
    mutualFundAmount: "",
    stockInvestmentAmount: "",
    otherInvestmentAmount: "",
    riskTolerance: "",
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