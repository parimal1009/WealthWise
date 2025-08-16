// Chatbot logic for generating responses and determining components to render

export const generateBotResponse = async (
  userMessage,
  formData,
  userData,
  scenarios
) => {
  const message = userMessage?.toLowerCase() || "";

  // Profile setup flow
  if (
    message.includes("basic information") ||
    message.includes("start") ||
    message.includes("profile")
  ) {
    return {
      content:
        "Great! Let's start by collecting some basic information about you. This will help me create personalized retirement scenarios.",
      component: "profile-form",
    };
  }

  // After profile form submission
  if (formData && (formData.age || formData.pensionAmount)) {
    return {
      content:
        "Perfect! Now let's understand your risk tolerance and retirement goals. This will help me recommend the most suitable strategies for you.",
      component: "risk-assessment",
      updateUserData: formData,
    };
  }

  // After risk assessment
  if (formData && (formData.riskTolerance || formData.goals)) {
    const scenarios = generateScenarios(userData, formData);
    return {
      content:
        "Excellent! Based on your profile, I've generated personalized retirement scenarios. Here's what I recommend:",
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
          "I'd be happy to show you comparison charts! First, let me generate some scenarios for you.",
        component: "profile-form",
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

  // Market conditions
  if (
    message.includes("market") ||
    message.includes("inflation") ||
    message.includes("economy")
  ) {
    return {
      content:
        "Current market conditions significantly impact retirement planning. Here's my analysis:",
      component: "recommendation",
      data: getMarketRecommendation(),
    };
  }

  // General pension questions
  if (
    message.includes("pension") ||
    message.includes("retirement") ||
    message.includes("options")
  ) {
    return {
      content:
        "I can explain different pension payout options and help you choose the best strategy. Here are the main approaches:",
      component: "recommendation",
      data: getPensionOptionsRecommendation(),
    };
  }

  // Planning factors
  if (
    message.includes("factors") ||
    message.includes("consider") ||
    message.includes("planning")
  ) {
    return {
      content:
        "There are several key factors to consider in retirement planning. Let me break them down for you:",
      component: "recommendation",
      data: getPlanningFactorsRecommendation(),
    };
  }

  // Update profile
  if (
    message.includes("update") ||
    message.includes("change") ||
    message.includes("modify")
  ) {
    return {
      content:
        "I can help you update your profile information. What would you like to change?",
      component: "profile-form",
    };
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

  // Quick demo with specific data
  if (
    message.includes("58 years old") ||
    message.includes("20,00,000") ||
    message.includes("₹20,00,000")
  ) {
    const demoUserData = {
      age: "58",
      pensionAmount: "2000000",
      riskTolerance: "moderate",
      goals: ["Maximize monthly income", "Ensure spouse coverage"],
    };
    const demoScenarios = generateScenarios(demoUserData, demoUserData);
    return {
      content:
        "Perfect! I've created scenarios based on your sample data. Here's what I recommend for a 58-year-old with ₹20 lakh pension:",
      component: "scenario-visualization",
      data: { scenarios: demoScenarios },
      updateUserData: demoUserData,
      updateScenarios: demoScenarios,
    };
  }

  // Show demo component for first-time users
  if (!userData.age && !userData.pensionAmount) {
    return {
      content:
        "I'm here to help with your retirement planning! You can try the demo or start with your own information:",
      component: "demo",
    };
  }

  // Default response with quick actions
  return {
    content:
      "I'm here to help with your retirement planning! Here are some things I can assist you with:",
    component: "quick-actions",
  };
};

const generateScenarios = (userData, formData) => {
  const pensionAmount = parseInt(
    userData.pensionAmount || formData.pensionAmount
  );
  const age = parseInt(userData.age || formData.age);
  const riskTolerance = formData.riskTolerance || userData.riskTolerance;
  const goals = formData.goals || userData.goals || [];

  const lifeExpectancy = 80;
  const yearsInRetirement = lifeExpectancy - age;

  const scenarios = [
    {
      id: "lump-sum",
      name: "Lump Sum Withdrawal",
      description: "Take the entire amount now and invest it yourself",
      totalValue: pensionAmount,
      monthlyIncome: Math.round((pensionAmount * 0.05) / 12),
      taxImplication: Math.round(pensionAmount * 0.3),
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
      suitability:
        riskTolerance === "aggressive"
          ? 95
          : riskTolerance === "moderate"
          ? 70
          : 45,
    },
    {
      id: "annuity",
      name: "Life Annuity",
      description: "Guaranteed monthly income for life",
      totalValue: pensionAmount,
      monthlyIncome: Math.round(
        (pensionAmount / (yearsInRetirement * 12)) * 1.1
      ),
      taxImplication: Math.round(pensionAmount * 0.1),
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
      suitability:
        riskTolerance === "conservative"
          ? 95
          : riskTolerance === "moderate"
          ? 80
          : 60,
    },
    {
      id: "phased",
      name: "Phased Withdrawal",
      description: "Systematic withdrawal over time with remaining invested",
      totalValue: pensionAmount,
      monthlyIncome: Math.round((pensionAmount * 0.04) / 12),
      taxImplication: Math.round(pensionAmount * 0.15),
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
      suitability: riskTolerance === "moderate" ? 95 : 75,
    },
  ];

  // Add joint-life if spouse exists
  if (userData.spouseAge || formData.spouseAge) {
    scenarios.push({
      id: "joint-life",
      name: "Joint Life Annuity",
      description: "Guaranteed income for both you and your spouse",
      totalValue: pensionAmount,
      monthlyIncome: Math.round(
        (pensionAmount / (yearsInRetirement * 12)) * 0.9
      ),
      taxImplication: Math.round(pensionAmount * 0.1),
      pros: [
        "Spouse protection",
        "Guaranteed income for both lives",
        "Peace of mind",
      ],
      cons: [
        "Lower monthly payments",
        "No liquidity",
        "Complex survivor benefits",
      ],
      riskLevel: "Low",
      suitability: goals.includes("Ensure spouse coverage") ? 95 : 70,
    });
  }

  return scenarios;
};

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

const getMarketRecommendation = () => {
  return {
    title: "Market Conditions Impact",
    subtitle: "How current economic conditions affect your retirement",
    main: {
      type: "info",
      title: "Market Volatility Considerations",
      content:
        "Current market conditions create both opportunities and risks for retirement planning.",
    },
    points: [
      {
        type: "warning",
        title: "Inflation Risk",
        content:
          "Rising inflation erodes purchasing power over time, especially for fixed income strategies",
      },
      {
        type: "info",
        title: "Interest Rates",
        content:
          "Current interest rate environment affects annuity payouts and bond returns",
      },
      {
        type: "success",
        title: "Diversification Benefits",
        content:
          "Mixed strategies can help balance market risks with guaranteed income",
      },
    ],
    actions: [
      "Consider inflation-protected investments",
      "Review and rebalance regularly",
      "Maintain emergency fund",
      "Stay informed about economic trends",
    ],
  };
};

const getPensionOptionsRecommendation = () => {
  return {
    title: "Pension Payout Options Explained",
    subtitle: "Understanding your choices for retirement income",
    main: {
      type: "info",
      title: "Multiple Strategies Available",
      content:
        "Each pension payout option has unique advantages and trade-offs based on your situation.",
    },
    points: [
      {
        type: "success",
        title: "Lump Sum",
        content:
          "Maximum control and flexibility, but requires active management and carries market risk",
      },
      {
        type: "success",
        title: "Annuity",
        content:
          "Guaranteed lifetime income with no market risk, but limited flexibility",
      },
      {
        type: "success",
        title: "Phased Withdrawal",
        content:
          "Balanced approach combining guaranteed income with growth potential",
      },
    ],
    actions: [
      "Assess your risk tolerance",
      "Consider your health and longevity",
      "Evaluate your other income sources",
      "Think about legacy goals",
    ],
  };
};

const getPlanningFactorsRecommendation = () => {
  return {
    title: "Key Retirement Planning Factors",
    subtitle: "Essential considerations for your retirement strategy",
    main: {
      type: "info",
      title: "Comprehensive Planning Required",
      content:
        "Successful retirement planning involves balancing multiple factors unique to your situation.",
    },
    points: [
      {
        type: "warning",
        title: "Longevity Risk",
        content:
          "Risk of outliving your money - consider your health, family history, and life expectancy",
      },
      {
        type: "warning",
        title: "Inflation Impact",
        content:
          "Rising costs over time can significantly erode purchasing power",
      },
      {
        type: "info",
        title: "Healthcare Costs",
        content:
          "Medical expenses typically increase with age and can be substantial",
      },
      {
        type: "success",
        title: "Family Considerations",
        content:
          "Spouse needs, dependent care, and legacy planning affect strategy choice",
      },
    ],
    actions: [
      "Estimate your life expectancy realistically",
      "Plan for healthcare cost inflation",
      "Consider spouse and family needs",
      "Build in flexibility for changing circumstances",
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
    {
      id: "joint-life",
      name: "Joint Life Annuity",
      description: "Guaranteed income for both you and your spouse",
      totalValue: 2000000,
      monthlyIncome: 35000,
      taxImplication: 200000,
      pros: [
        "Spouse protection",
        "Guaranteed income for both lives",
        "Peace of mind",
      ],
      cons: [
        "Lower monthly payments",
        "No liquidity",
        "Complex survivor benefits",
      ],
      riskLevel: "Low",
      suitability: 80,
    },
  ];
};
