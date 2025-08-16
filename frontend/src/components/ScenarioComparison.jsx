import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Shield,
  ArrowRight,
} from "lucide-react";
import ScenarioChart from "./ScenarioChart";

const ScenarioComparison = ({ userData, scenarios, setScenarios }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userData.age && userData.pensionAmount && scenarios.length === 0) {
      generateScenarios();
    }
  }, [userData]);

  const generateScenarios = () => {
    setLoading(true);

    // Simulate API call with realistic calculations
    setTimeout(() => {
      const pensionAmount = parseInt(userData.pensionAmount);
      const age = parseInt(userData.age);
      const lifeExpectancy = 80; // Simplified
      const yearsInRetirement = lifeExpectancy - age;

      const newScenarios = [
        {
          id: "lump-sum",
          name: "Lump Sum Withdrawal",
          description: "Take the entire amount now and invest it yourself",
          totalValue: pensionAmount,
          monthlyIncome: Math.round((pensionAmount * 0.05) / 12), // 5% annual return
          taxImplication: Math.round(pensionAmount * 0.3), // 30% tax
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
            userData.riskTolerance === "aggressive"
              ? 95
              : userData.riskTolerance === "moderate"
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
          ), // Slightly higher due to insurance
          taxImplication: Math.round(pensionAmount * 0.1), // Lower tax on annuity
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
            userData.riskTolerance === "conservative"
              ? 95
              : userData.riskTolerance === "moderate"
              ? 80
              : 60,
        },
        {
          id: "phased",
          name: "Phased Withdrawal",
          description:
            "Systematic withdrawal over time with remaining invested",
          totalValue: pensionAmount,
          monthlyIncome: Math.round((pensionAmount * 0.04) / 12), // 4% rule
          taxImplication: Math.round(pensionAmount * 0.15), // Moderate tax
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
          suitability: userData.riskTolerance === "moderate" ? 95 : 75,
        },
      ];

      // Add joint-life option if spouse exists
      if (userData.spouseAge) {
        newScenarios.push({
          id: "joint-life",
          name: "Joint Life Annuity",
          description: "Guaranteed income for both you and your spouse",
          totalValue: pensionAmount,
          monthlyIncome: Math.round(
            (pensionAmount / (yearsInRetirement * 12)) * 0.9
          ), // Slightly lower for joint coverage
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
          suitability: userData.goals.includes("Ensure spouse coverage")
            ? 95
            : 70,
        });
      }

      setScenarios(newScenarios);
      setLoading(false);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating personalized scenarios...</p>
        </div>
      </div>
    );
  }

  if (!scenarios.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">
          Please complete your profile first to generate scenarios.
        </p>
        <Link to="/input" className="btn-primary">
          Complete Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Your Retirement Scenarios
        </h1>
        <p className="text-gray-600">
          Compare different payout strategies based on your profile and goals
        </p>
      </div>

      {/* Scenario Cards */}
      <div className="grid lg:grid-cols-2 gap-6">
        {scenarios.map((scenario) => (
          <div key={scenario.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {scenario.name}
                </h3>
                <p className="text-gray-600 text-sm">{scenario.description}</p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  scenario.riskLevel === "High"
                    ? "bg-red-100 text-red-800"
                    : scenario.riskLevel === "Medium"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {scenario.riskLevel} Risk
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <DollarSign className="h-6 w-6 text-primary-600 mx-auto mb-1" />
                <div className="text-lg font-semibold">
                  ₹{scenario.monthlyIncome.toLocaleString("en-IN")}
                </div>
                <div className="text-xs text-gray-600">Monthly Income</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Shield className="h-6 w-6 text-warning-600 mx-auto mb-1" />
                <div className="text-lg font-semibold">
                  ₹{scenario.taxImplication.toLocaleString("en-IN")}
                </div>
                <div className="text-xs text-gray-600">Tax Impact</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Suitability Score</span>
                <span className="text-sm text-gray-600">
                  {scenario.suitability}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    scenario.suitability >= 90
                      ? "bg-green-500"
                      : scenario.suitability >= 70
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${scenario.suitability}%` }}
                ></div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-green-700 mb-2 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Pros
                </h4>
                <ul className="space-y-1">
                  {scenario.pros.map((pro, index) => (
                    <li key={index} className="text-gray-600">
                      • {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-red-700 mb-2 flex items-center">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  Cons
                </h4>
                <ul className="space-y-1">
                  {scenario.cons.map((con, index) => (
                    <li key={index} className="text-gray-600">
                      • {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Comparison */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-6">
          Income Projection Comparison
        </h2>
        <ScenarioChart scenarios={scenarios} />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button onClick={generateScenarios} className="btn-secondary">
          Regenerate Scenarios
        </button>
        <Link to="/results" className="btn-primary flex items-center space-x-2">
          <span>View Detailed Analysis</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

export default ScenarioComparison;
