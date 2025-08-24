import React, { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import RetirementChart from "../components/dashboard/RetirementChart";
import RetirementSimulationChart from "../components/dashboard/RetirementSimulationChart";
import PayoutComparison from "../components/dashboard/PayoutComparison";
import HybridPayoutChart from "../components/dashboard/HybridPayoutOptions";
import ChartExplanationIcon from "../components/ChartExplanationIcon";

ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DashboardPage = () => {
  const { user } = useAuth();

  // ---------- KPI States ----------
  const [currentAge, setCurrentAge] = useState(30);
  const [monthlyIncome, setMonthlyIncome] = useState(105000);
  const [retirementAge, setRetirementAge] = useState(62);
  const [lifeExpectancy, setLifeExpectancy] = useState(78);
  const [retirementExpense, setRetirementExpense] = useState(60000);
  const [lifestyle, setLifestyle] = useState("Comfortable");
  const [inflationRate, setInflationRate] = useState(6);
  const [taxBracket, setTaxBracket] = useState(30);
  const [activeScenario, setActiveScenario] = useState("base");

  // ---------- Dynamic Calculations ----------
  const calculations = useMemo(() => {
    const yearsToRetirement = retirementAge - currentAge;
    const retirementYears = lifeExpectancy - retirementAge;
    const annualIncome = monthlyIncome * 12;

    // Calculate corpus needed
    const futureValueExpense =
      retirementExpense * Math.pow(1 + inflationRate / 100, yearsToRetirement);
    const requiredCorpus =
      (futureValueExpense * 12 * retirementYears) /
      Math.pow(1.06, yearsToRetirement);

    // Calculate required monthly SIP
    const monthlyReturn = 0.12 / 12; // 12% annual return
    const monthsToRetirement = yearsToRetirement * 12;
    const requiredMonthlySIP =
      (requiredCorpus * monthlyReturn) /
      (Math.pow(1 + monthlyReturn, monthsToRetirement) - 1);

    // Tax savings calculation
    const taxSavingsAnnual =
      Math.min(annualIncome * 0.25, 200000) * (taxBracket / 100);
    const lifetimeTaxSavings = taxSavingsAnnual * yearsToRetirement;

    // Income replacement ratio
    const replacementRatio = ((requiredMonthlySIP * 12) / annualIncome) * 100;

    return {
      requiredCorpus: Math.round(requiredCorpus / 100000) / 10, // In Crores
      monthlyPension: Math.round(futureValueExpense / 1000), // In thousands
      requiredMonthlySIP: Math.round(requiredMonthlySIP),
      taxSavingsAnnual: Math.round(taxSavingsAnnual / 1000), // In thousands
      lifetimeTaxSavings: Math.round(lifetimeTaxSavings / 100000) / 10, // In Lakhs
      replacementRatio: Math.round(replacementRatio),
      yearsToRetirement,
      retirementYears,
    };
  }, [
    currentAge,
    monthlyIncome,
    retirementAge,
    lifeExpectancy,
    retirementExpense,
    inflationRate,
    taxBracket,
  ]);

  // ---------- Chart Data Generation ----------
  const generateIncomeTriangleData = () => {
    const ages = Array.from(
      { length: lifeExpectancy - currentAge },
      (_, i) => currentAge + i
    );
    const incomes = ages.map((age) => {
      if (age < retirementAge) {
        // Growing income until retirement
        const growthFactor = Math.min(1 + (age - currentAge) * 0.05, 2.5);
        return monthlyIncome * growthFactor;
      } else {
        // Pension income after retirement
        return (
          calculations.monthlyPension *
          1000 *
          Math.pow(0.98, age - retirementAge)
        );
      }
    });

    return {
      labels: ages,
      datasets: [
        {
          label: "Monthly Income (₹)",
          data: incomes,
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          fill: true,
          tension: 0.4,
          pointRadius: 1,
        },
      ],
    };
  };

  const generateBenefitAgeData = () => {
    const retirementAges = [58, 60, 62, 65, 67];
    const benefits = retirementAges.map((age) => {
      const workingYears = age - currentAge;
      const retirementYears = lifeExpectancy - age;
      const corpus = calculations.requiredMonthlySIP * 12 * workingYears * 1.5;
      return Math.round(corpus / 100000) / 10; // In Crores
    });

    return {
      labels: retirementAges.map((age) => `Age ${age}`),
      datasets: [
        {
          label: "Lifetime Benefits (₹ Crores)",
          data: benefits,
          backgroundColor: benefits.map((_, idx) =>
            idx === 2 ? "rgba(34, 197, 94, 0.8)" : "rgba(59, 130, 246, 0.8)"
          ),
          borderColor: benefits.map((_, idx) =>
            idx === 2 ? "rgb(34, 197, 94)" : "rgb(59, 130, 246)"
          ),
          borderWidth: 2,
        },
      ],
    };
  };

  const generatePayoutData = () => {
    const baseValue = calculations.requiredCorpus;
    return {
      labels: [
        "100% Annuity",
        "60% Annuity + 40% Lump-sum",
        "80% Lump-sum + 20% Annuity",
      ],
      datasets: [
        {
          data: [baseValue * 1.1, baseValue * 1.2, baseValue * 0.9],
          backgroundColor: [
            "rgba(59, 130, 246, 0.8)",
            "rgba(34, 197, 94, 0.8)",
            "rgba(251, 191, 36, 0.8)",
          ],
          borderColor: [
            "rgb(59, 130, 246)",
            "rgb(34, 197, 94)",
            "rgb(251, 191, 36)",
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  const generateTaxSavingsData = () => {
    const withoutPlanning = (monthlyIncome * 12 * (taxBracket / 100)) / 100000;
    const withEPF = withoutPlanning * 0.85;
    const withNPS = withoutPlanning * 0.7;
    const optimized = withoutPlanning * 0.55;

    return {
      labels: ["No Planning", "EPF Only", "EPF + NPS", "Optimized"],
      datasets: [
        {
          label: "Annual Tax (₹ Lakhs)",
          data: [withoutPlanning, withEPF, withNPS, optimized],
          backgroundColor: "rgba(239, 68, 68, 0.8)",
          borderColor: "rgb(239, 68, 68)",
          borderWidth: 2,
        },
        {
          label: "Tax Saved (₹ Lakhs)",
          data: [
            0,
            withoutPlanning - withEPF,
            withoutPlanning - withNPS,
            withoutPlanning - optimized,
          ],
          backgroundColor: "rgba(34, 197, 94, 0.8)",
          borderColor: "rgb(34, 197, 94)",
          borderWidth: 2,
        },
      ],
    };
  };

  const generateCorpusGrowthData = () => {
    const years = Array.from(
      { length: calculations.yearsToRetirement },
      (_, i) => currentAge + i
    );
    const npsCorpus = years.map(
      (_, i) =>
        (calculations.requiredMonthlySIP * 0.4 * 12 * (i + 1) * 1.12) / 10000000
    );
    const epfCorpus = years.map(
      (_, i) =>
        (calculations.requiredMonthlySIP * 0.6 * 12 * (i + 1) * 1.085) /
        10000000
    );

    return {
      labels: years,
      datasets: [
        {
          label: "NPS Corpus (₹ Cr)",
          data: npsCorpus,
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          fill: false,
          tension: 0.1,
        },
        {
          label: "EPF Corpus (₹ Cr)",
          data: epfCorpus,
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          fill: false,
          tension: 0.1,
        },
      ],
    };
  };

  // ---------- Scenario Data ----------
  const scenarioData = {
    base: {
      name: "Base Case",
      corpus: `₹${calculations.requiredCorpus} Cr`,
      pension: `₹${calculations.monthlyPension}K`,
      tax: `₹${calculations.lifetimeTaxSavings} L`,
      ratio: `${calculations.replacementRatio}%`,
    },
    aggressive: {
      name: "Aggressive",
      corpus: `₹${Math.round(calculations.requiredCorpus * 1.4 * 10) / 10} Cr`,
      pension: `₹${Math.round(calculations.monthlyPension * 1.4)}K`,
      tax: `₹${Math.round(calculations.lifetimeTaxSavings * 1.1 * 10) / 10} L`,
      ratio: `${Math.min(calculations.replacementRatio * 1.3, 100)}%`,
    },
    conservative: {
      name: "Conservative",
      corpus: `₹${Math.round(calculations.requiredCorpus * 0.7 * 10) / 10} Cr`,
      pension: `₹${Math.round(calculations.monthlyPension * 0.7)}K`,
      tax: `₹${Math.round(calculations.lifetimeTaxSavings * 0.8 * 10) / 10} L`,
      ratio: `${Math.round(calculations.replacementRatio * 0.7)}%`,
    },
    earlyRetirement: {
      name: "Early Retirement (55)",
      corpus: `₹${Math.round(calculations.requiredCorpus * 0.6 * 10) / 10} Cr`,
      pension: `₹${Math.round(calculations.monthlyPension * 0.6)}K`,
      tax: `₹${Math.round(calculations.lifetimeTaxSavings * 0.7 * 10) / 10} L`,
      ratio: `${Math.round(calculations.replacementRatio * 0.6)}%`,
    },
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      x: {
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          padding: 15,
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="">
          {/* Header */}
          <div className="text-left mb-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r  text-black bg-clip-text mb-4">
              Welcome to your Dashboard
            </h1>
          </div>

          {/* Enhanced KPI Inputs */}
          <div className="bg-gradient-to-r rounded-xl p-8 mb-3 col-span-12 lg:col-span-8 shadow-xl border border-blue-200/50 transition-all duration-300">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="bg-blue-100 p-2 rounded-full mr-3">👤</span>
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Income (₹)
                </label>
                <input
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) =>
                    setMonthlyIncome(Number(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-purple-500">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Retirement Age
                </label>
                <input
                  type="number"
                  value={retirementAge}
                  onChange={(e) =>
                    setRetirementAge(Number(e.target.value) || 60)
                  }
                  min="50"
                  max="70"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-red-500">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Retirement Expense (₹/month)
                </label>
                <input
                  type="number"
                  value={retirementExpense}
                  onChange={(e) =>
                    setRetirementExpense(Number(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-teal-500">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lifestyle
                </label>
                <select
                  value={lifestyle}
                  onChange={(e) => setLifestyle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="Minimalistic">Minimalistic</option>
                  <option value="Comfortable">Comfortable</option>
                  <option value="Lavish">Lavish</option>
                </select>
              </div>
            </div>
          </div>

          {/* KPI Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-4 shadow-md">
              <div className="text-2xl font-bold text-center">
                ₹{calculations.requiredCorpus}Cr
              </div>
              <div className="text-blue-100 mt-1 text-sm text-center">
                Required Corpus
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-4 shadow-md">
              <div className="text-2xl font-bold text-center">
                ₹{calculations.monthlyPension}K
              </div>
              <div className="text-green-100 mt-1 text-sm text-center">
                Monthly Pension
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-4 shadow-md">
              <div className="text-2xl font-bold text-center">
                {calculations.replacementRatio}%
              </div>
              <div className="text-purple-100 mt-1 text-sm text-center">
                Income Replacement
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl p-4 shadow-md">
              <div className="text-2xl font-bold text-center">
                ₹{calculations.lifetimeTaxSavings}L
              </div>
              <div className="text-yellow-100 mt-1 text-sm text-center">
                Tax Savings
              </div>
            </div>
          </div>

          {/* Bento Grid Layout for Charts */}
          <div className="flex flex-col gap-4 mb-3">
            {/* Income Triangle Chart - Large Card */}
            <div className="col-span-12 lg:col-span-6 bg-gradient-to-br rounded-3xl shadow-xl p-8 border border-blue-200/50 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] relative">
              <ChartExplanationIcon chartType="retirementCorpus" />
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-xl mr-4 shadow-lg">
                  📈
                </span>
                Retirement Corpus Projection
              </h3>
              <RetirementChart />
              <HybridPayoutChart />
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-blue-200/30">
                <p className="text-blue-800 text-sm leading-relaxed">
                  <strong>AI Insight:</strong> Your income peaks around age{" "}
                  {Math.round(retirementAge * 0.85)}
                  and transitions to pension income at {retirementAge}. Plan
                  maximum contributions during peak earning years.
                </p>
              </div>
            </div>

            {/* Optimal Retirement Age - Medium Card */}
            <div className="rounded-3xl shadow-xl p-6 border border-green-200/50 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-xl mr-4 shadow-lg">
                    📈
                  </span>
                  Payout Comparison
                </h3>
                <PayoutComparison />
              </div>
            </div>

            <div className="rounded-3xl shadow-xl p-6 border border-green-200/50 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-xl mr-3 shadow-lg">
                  🎯
                </span>
                Optimal Retirement Age
              </h3>
              <div className="mb-4">
                <RetirementSimulationChart />
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-green-200/30">
                <p className="text-green-800 text-xs leading-relaxed">
                  <strong>AI:</strong> Age 62 provides maximum lifetime
                  benefits. Each additional year increases corpus by 12-15%.
                </p>
              </div>
            </div>
          </div>

          {/* Scenario Analysis */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <span className="bg-indigo-100 p-2 rounded-full mr-3">🔄</span>
              What-If Scenarios
            </h3>

            <div className="flex flex-wrap gap-3 mb-6">
              {Object.entries(scenarioData).map(([key, scenario]) => (
                <button
                  key={key}
                  onClick={() => setActiveScenario(key)}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${
                    activeScenario === key
                      ? "bg-indigo-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {scenario.name}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="text-sm text-blue-600 font-medium">
                  Final Corpus
                </div>
                <div className="text-2xl font-bold text-blue-800">
                  {scenarioData[activeScenario].corpus}
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="text-sm text-green-600 font-medium">
                  Monthly Pension
                </div>
                <div className="text-2xl font-bold text-green-800">
                  {scenarioData[activeScenario].pension}
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="text-sm text-purple-600 font-medium">
                  Tax Savings
                </div>
                <div className="text-2xl font-bold text-purple-800">
                  {scenarioData[activeScenario].tax}
                </div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="text-sm text-yellow-600 font-medium">
                  Replacement Ratio
                </div>
                <div className="text-2xl font-bold text-yellow-800">
                  {scenarioData[activeScenario].ratio}
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 rounded-lg p-4 mt-6">
              <p className="text-sm text-indigo-800">
                <strong>AI Insight:</strong> The{" "}
                {scenarioData[activeScenario].name} scenario
                {activeScenario === "aggressive"
                  ? "offers higher returns with increased market risk. Consider this if you have high risk tolerance."
                  : activeScenario === "conservative"
                  ? "prioritizes capital protection over growth. Suitable for risk-averse investors."
                  : activeScenario === "earlyRetirement"
                  ? "requires higher monthly contributions but offers more leisure years."
                  : "provides balanced growth with moderate risk. Recommended for most individuals."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
