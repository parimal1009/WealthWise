// Updated Chatbot logic for the new three-step flow
// Basic Information → Income Status → Retirement Information

export const generateBotResponse = async (
  userMessage,
  formData,
  userData,
  scenarios
) => {
  const message = userMessage?.toLowerCase() || "";

  // Step 1: Basic Information
  if (
    message.includes("basic information") ||
    message.includes("start") ||
    message.includes("profile") ||
    message.includes("get started") ||
    (!userData.name && !userData.email && !userData.age)
  ) {
    return {
      content:
        "Great! Let's start by collecting your basic information. This will help me personalize your retirement planning.",
      component: "basic-info-form",
    };
  }

  // After basic info form submission
  if (formData && (formData.name || formData.email || formData.age) && !formData.currentSalary) {
    return {
      content:
        "Perfect! Now let's understand your current income and employment details. This information is crucial for calculating your retirement scenarios.",
      component: "income-status-form",
      updateUserData: formData,
    };
  }

  // After income status form submission
  if (formData && formData.currentSalary && !formData.plannedRetirementAge) {
    return {
      content:
        "Excellent! Now let's plan your retirement goals and lifestyle preferences. This final step will help me create the perfect retirement strategy for you.",
      component: "retirement-info-form",
      updateUserData: formData,
    };
  }

  // After retirement info form submission - Generate scenarios
  if (formData && formData.plannedRetirementAge) {
    const scenarios = generateScenarios(userData, formData);
    return {
      content:
        "Fantastic! Based on all your information, I've generated personalized retirement scenarios tailored to your goals and preferences. Here's what I recommend:",
      component: "scenario-visualization",
      data: { scenarios },
      updateUserData: formData,
      updateScenarios: scenarios,
    };
  }

  // Chart requests
  if (
    message.includes("chart") ||
    message.includes("comparison") ||
    message.includes("graph") ||
    message.includes("visual")
  ) {
    if (scenarios && scenarios.length > 0) {
      return {
        content:
          "Here's a detailed comparison chart of your retirement scenarios. You can switch between different views to analyze various aspects:",
        component: "comparison-chart",
        data: { scenarios, chartType: "income" },
      };
    } else {
      return {
        content:
          "I'd be happy to show you comparison charts! First, let me collect your information to generate scenarios.",
        component: "basic-info-form",
      };
    }
  }

  // Specific scenario analysis
  if (
    message.includes("lump sum") ||
    message.includes("annuity") ||
    message.includes("phased")
  ) {
    const scenarioType = message.includes("lump sum")
      ? "lump-sum"
      : message.includes("annuity")
      ? "annuity"
      : "phased";

    return {
      content: `Let me explain the ${scenarioType.replace(
        "-",
        " "
      )} strategy in detail:`,
      component: "recommendation",
      data: getScenarioRecommendation(scenarioType, scenarios),
    };
  }

  // Tax questions
  if (message.includes("tax") || message.includes("taxation")) {
    return {
      content:
        "Tax implications are crucial in retirement planning. Here's what you need to know:",
      component: "recommendation",
      data: getTaxRecommendation(scenarios, userData),
    };
  }

  // Update profile - redirect to appropriate step
  if (
    message.includes("update") ||
    message.includes("change") ||
    message.includes("modify")
  ) {
    if (!userData.name || !userData.email) {
      return {
        content:
          "Let's update your basic information:",
        component: "basic-info-form",
      };
    } else if (!userData.currentSalary) {
      return {
        content:
          "Let's update your income and employment details:",
        component: "income-status-form",
      };
    } else if (!userData.plannedRetirementAge) {
      return {
        content:
          "Let's update your retirement planning information:",
        component: "retirement-info-form",
      };
    } else {
      return {
        content:
          "Which section would you like to update? I can help you modify your basic information, income details, or retirement goals.",
        component: "quick-actions",
      };
    }
  }

  // Sample data or demo requests
  if (
    message.includes("sample") ||
    message.includes("demo") ||
    message.includes("example")
  ) {
    const sampleScenarios = generateSampleScenarios();
    return {
      content:
        "Here's a demo with sample retirement scenarios. You can interact with the charts and see how the system works:",
      component: "scenario-visualization",
      data: { scenarios: sampleScenarios },
      updateScenarios: sampleScenarios,
    };
  }

  // Check if user has completed all steps
  const hasBasicInfo = userData.name && userData.email && userData.age;
  const hasIncomeInfo = userData.currentSalary && userData.pensionBalance;
  const hasRetirementInfo = userData.plannedRetirementAge && userData.retirementLifestyle;

  // Show demo component for first-time users
  if (!hasBasicInfo) {
    return {
      content:
        "Welcome! I'm here to help create your personalized retirement plan. Let's start by getting to know you:",
      component: "basic-info-form",
    };
  } else if (!hasIncomeInfo) {
    return {
      content:
        "I have your basic information. Now let's gather your income and employment details:",
      component: "income-status-form",
    };
  } else if (!hasRetirementInfo) {
    return {
      content:
        "Great progress! Let's finalize your retirement planning preferences:",
      component: "retirement-info-form",
    };
  }

  // Default response with quick actions for completed profiles
  return {
    content:
      "I have all your information! Here are some things I can help you with:",
    component: "quick-actions",
  };
};

const generateScenarios = (userData, formData) => {
  const pensionBalance = parseInt(
    userData.pensionBalance || formData.pensionBalance
  );
  const currentAge = parseInt(userData.age || formData.age);
  const retirementAge = parseInt(userData.plannedRetirementAge || formData.plannedRetirementAge);
  const monthlyExpense = parseInt(userData.monthlyRetirementExpense || formData.monthlyRetirementExpense);
  const retirementLifestyle = userData.retirementLifestyle || formData.retirementLifestyle;
  const legacyGoal = userData.legacyGoal || formData.legacyGoal;

  const yearsToRetirement = retirementAge - currentAge;
  const yearsInRetirement = 80 - retirementAge; // Assuming life expectancy of 80

  // Calculate scenarios based on new data structure
  const scenarios = [
    {
      id: "lump-sum",
      name: "Lump Sum Withdrawal",
      description: "Take the entire pension amount and manage investments yourself",
      totalValue: pensionBalance,
      monthlyIncome: Math.round((pensionBalance * 0.05) / 12),
      taxImplication: Math.round(pensionBalance * 0.3),
      pros: [
        "Complete control over investments",
        "Flexibility for emergencies",
        "Potential for higher returns",
        "Can leave larger inheritance"
      ],
      cons: [
        "High market risk",
        "Immediate heavy tax burden",
        "Risk of outliving savings",
        "Requires investment expertise"
      ],
      riskLevel: "High",
      suitability: calculateSuitability("lump-sum", retirementLifestyle, legacyGoal, monthlyExpense, Math.round((pensionBalance * 0.05) / 12)),
    },
    {
      id: "annuity",
      name: "Life Annuity",
      description: "Convert pension to guaranteed monthly income for life",
      totalValue: pensionBalance,
      monthlyIncome: Math.round((pensionBalance / (yearsInRetirement * 12)) * 1.1),
      taxImplication: Math.round(pensionBalance * 0.1),
      pros: [
        "Guaranteed income for life",
        "Protection against longevity risk",
        "Lower tax burden",
        "Peace of mind"
      ],
      cons: [
        "No liquidity access",
        "Fixed payments (inflation risk)",
        "No inheritance value",
        "Lower potential returns"
      ],
      riskLevel: "Low",
      suitability: calculateSuitability("annuity", retirementLifestyle, legacyGoal, monthlyExpense, Math.round((pensionBalance / (yearsInRetirement * 12)) * 1.1)),
    },
    {
      id: "phased",
      name: "Phased Withdrawal",
      description: "Systematic withdrawal with remaining amount invested",
      totalValue: pensionBalance,
      monthlyIncome: Math.round((pensionBalance * 0.04) / 12),
      taxImplication: Math.round(pensionBalance * 0.15),
      pros: [
        "Balanced risk approach",
        "Some liquidity maintained",
        "Potential for growth",
        "Moderate inheritance"
      ],
      cons: [
        "Market risk on remaining balance",
        "Complex management required",
        "Sequence of returns risk",
        "Not guaranteed for life"
      ],
      riskLevel: "Medium",
      suitability: calculateSuitability("phased", retirementLifestyle, legacyGoal, monthlyExpense, Math.round((pensionBalance * 0.04) / 12)),
    },
  ];

  // Add joint-life if married
  if (userData.maritalStatus === "married" || formData.maritalStatus === "married") {
    scenarios.push({
      id: "joint-life",
      name: "Joint Life Annuity",
      description: "Guaranteed income for both spouse and you",
      totalValue: pensionBalance,
      monthlyIncome: Math.round((pensionBalance / (yearsInRetirement * 12)) * 0.9),
      taxImplication: Math.round(pensionBalance * 0.1),
      pros: [
        "Spouse protection guaranteed",
        "Income for both lives",
        "Lower tax burden",
        "Family security"
      ],
      cons: [
        "Lower monthly payments",
        "No liquidity access",
        "Complex survivor benefits",
        "No inheritance"
      ],
      riskLevel: "Low",
      suitability: calculateSuitability("joint-life", retirementLifestyle, legacyGoal, monthlyExpense, Math.round((pensionBalance / (yearsInRetirement * 12)) * 0.9)),
    });
  }

  return scenarios;
};

const calculateSuitability = (scenarioType, lifestyle, legacyGoal, monthlyExpense, scenarioIncome) => {
  let score = 50; // Base score

  // Income adequacy check
  const incomeRatio = scenarioIncome / monthlyExpense;
  if (incomeRatio >= 1.2) score += 25;
  else if (incomeRatio >= 1.0) score += 15;
  else if (incomeRatio >= 0.8) score += 5;
  else score -= 10;

  // Lifestyle matching
  if (lifestyle === "minimalistic") {
    if (scenarioType === "annuity" || scenarioType === "joint-life") score += 20;
    if (scenarioType === "lump-sum") score -= 10;
  } else if (lifestyle === "comfortable") {
    if (scenarioType === "phased") score += 20;
    if (scenarioType === "annuity") score += 10;
  } else if (lifestyle === "lavish") {
    if (scenarioType === "lump-sum") score += 20;
    if (scenarioType === "phased") score += 10;
    if (scenarioType === "annuity") score -= 10;
  }

  // Legacy goal matching
  if (legacyGoal === "maximize-income") {
    if (scenarioType === "annuity") score += 15;
  } else if (legacyGoal === "substantial-legacy") {
    if (scenarioType === "lump-sum") score += 20;
    if (scenarioType === "annuity") score -= 15;
  } else if (legacyGoal === "moderate-legacy") {
    if (scenarioType === "phased") score += 15;
  }

  return Math.min(Math.max(score, 10), 95); // Keep between 10-95%
};

// Keep existing recommendation functions
const getScenarioRecommendation = (scenarioType, scenarios) => {
  const scenario = scenarios?.find((s) => s.id === scenarioType);

  if (!scenario) {
    return {
      title: "Scenario Analysis",
      main: {
        type: "info",
        title: "Strategy Overview",
        content:
          "Let me first generate your personalized scenarios to provide detailed analysis.",
      },
    };
  }

  return {
    title: `${scenario.name} Analysis`,
    subtitle: "Detailed breakdown of this retirement strategy",
    main: {
      type: scenario.suitability >= 80 ? "success" : "info",
      title: `${scenario.suitability}% Suitability Match`,
      content: scenario.description,
    },
    points: [
      {
        type: "success",
        title: "Monthly Income",
        content: `₹${scenario.monthlyIncome.toLocaleString("en-IN")} per month`,
      },
      {
        type: "warning",
        title: "Tax Impact",
        content: `₹${scenario.taxImplication.toLocaleString(
          "en-IN"
        )} total tax liability`,
      },
      {
        type: "info",
        title: "Risk Level",
        content: `${scenario.riskLevel} risk strategy`,
      },
    ],
    actions: [
      "Review all pros and cons carefully",
      "Consider your risk tolerance",
      "Evaluate tax implications",
      "Consult with a financial advisor",
    ],
  };
};

const getTaxRecommendation = (scenarios, userData) => {
  return {
    title: "Tax Optimization Strategy",
    subtitle: "Minimize your tax burden in retirement",
    main: {
      type: "warning",
      title: "Tax Planning is Critical",
      content:
        "Different withdrawal strategies have significantly different tax implications. Proper planning can save you thousands.",
    },
    points: [
      {
        type: "success",
        title: "Annuity Benefits",
        content:
          "Annuities typically have lower immediate tax burden as income is spread over time",
      },
      {
        type: "warning",
        title: "Lump Sum Impact",
        content:
          "Taking a lump sum can push you into higher tax brackets, increasing your overall tax rate",
      },
      {
        type: "info",
        title: "Timing Matters",
        content:
          "Consider your current income and tax bracket when deciding withdrawal timing",
      },
    ],
    actions: [
      "Calculate tax impact for each scenario",
      "Consider spreading withdrawals across tax years",
      "Explore tax-efficient investment options",
      "Consult with a tax professional",
    ],
  };
};

const generateSampleScenarios = () => {
  return [
    {
      id: "lump-sum",
      name: "Lump Sum Withdrawal",
      description: "Take the entire amount now and invest it yourself",
      totalValue: 2000000,
      monthlyIncome: 45000,
      taxImplication: 600000,
      pros: [
        "Full control over investments",
        "Liquidity for emergencies",
        "Potential for higher returns",
      ],
      cons: [
        "Market risk",
        "High immediate tax burden",
        "Risk of outliving money",
      ],
      riskLevel: "High",
      suitability: 75,
    },
    {
      id: "annuity",
      name: "Life Annuity",
      description: "Guaranteed monthly income for life",
      totalValue: 2000000,
      monthlyIncome: 38000,
      taxImplication: 200000,
      pros: [
        "Guaranteed income for life",
        "Protection against longevity risk",
        "Lower tax burden",
      ],
      cons: [
        "No liquidity",
        "Fixed payments (inflation risk)",
        "No inheritance value",
      ],
      riskLevel: "Low",
      suitability: 90,
    },
    {
      id: "phased",
      name: "Phased Withdrawal",
      description: "Systematic withdrawal over time with remaining invested",
      totalValue: 2000000,
      monthlyIncome: 42000,
      taxImplication: 300000,
      pros: [
        "Balanced approach",
        "Some liquidity maintained",
        "Potential for growth",
      ],
      cons: [
        "Market risk on remaining amount",
        "Complex management",
        "Sequence of returns risk",
      ],
      riskLevel: "Medium",
      suitability: 85,
    },
  ];
};