import { useEffect, useRef } from "react";
import * as Chart from "chart.js";

// Register Chart.js components
Chart.Chart.register(
  Chart.CategoryScale,
  Chart.LinearScale,
  Chart.LineElement,
  Chart.PointElement,
  Chart.Title,
  Chart.Tooltip,
  Chart.Legend
);

const RetirementChart = ({
  currentAge = 25,
  retirementAge = 60,
  lifeExpectancy = 85,
  initialSavings = 200000,
  annualContribution = 10000,
  growthRate = 6, // percentage
  withdrawalRate = 6, // percentage
  postRetirementGrowthRate = 4, // percentage
}) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Calculate retirement data
  const calculateRetirementData = () => {
    const data = [];
    const labels = [];

    let corpus = initialSavings;
    const currentYear = new Date().getFullYear();

    // Growth phase (current age to retirement)
    for (let age = currentAge; age <= retirementAge; age++) {
      const year = currentYear + (age - currentAge);
      labels.push(year);

      if (age === currentAge) {
        data.push(corpus);
      } else {
        // Corpus grows with returns + annual contributions
        corpus = corpus * (1 + growthRate / 100) + annualContribution;
        data.push(Math.round(corpus));
      }
    }

    // Withdrawal phase (retirement to life expectancy)
    let peakCorpus = corpus;
    for (let age = retirementAge + 1; age <= lifeExpectancy; age++) {
      const year = currentYear + (age - currentAge);
      labels.push(year);

      // Withdrawal first, then remaining corpus grows
      const annualWithdrawal = peakCorpus * (withdrawalRate / 100);
      corpus =
        (corpus - annualWithdrawal) * (1 + postRetirementGrowthRate / 100);

      corpus = Math.max(0, corpus); // avoid negatives
      data.push(Math.round(corpus));
    }

    return { labels, data };
  };

  // Create or update chart
  const createChart = () => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    const { labels, data } = calculateRetirementData();
    const retirementYearIndex = retirementAge - currentAge;

    chartInstance.current = new Chart.Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Retirement Corpus",
            data,
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            fill: true,
            tension: 0.1,
            pointBackgroundColor: (ctx) => {
              return ctx.dataIndex === retirementYearIndex
                ? "#ef4444"
                : "#3b82f6";
            },
            pointBorderColor: (ctx) => {
              return ctx.dataIndex === retirementYearIndex
                ? "#ef4444"
                : "#3b82f6";
            },
            pointRadius: (ctx) => {
              return ctx.dataIndex === retirementYearIndex ? 6 : 3;
            },
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(context.raw);

                const age = currentAge + context.dataIndex;
                const phase =
                  age <= retirementAge ? "Accumulation" : "Withdrawal";

                return [`${value}`, `Age: ${age}`, `Phase: ${phase}`];
              },
            },
          },
          legend: {
            display: true,
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Year",
            },
          },
          y: {
            title: {
              display: true,
              text: "Corpus Value (₹)",
            },
            ticks: {
              callback: (value) => {
                return new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                  notation: "compact", // gives ₹1.2L, ₹3Cr etc.
                }).format(value);
              },
            },
          },
        },
      },
    });
  };

  useEffect(() => {
    createChart();

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
    // eslint-disable-next-line
  }, [
    currentAge,
    retirementAge,
    lifeExpectancy,
    initialSavings,
    annualContribution,
    growthRate,
    withdrawalRate,
  ]);

  return (
    <div className="w-full max-w-6xl mx-auto bg-white">
      {/* Chart */}
      <div className="bg-gray-50 p-4 rounded-lg" style={{ height: "500px" }}>
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default RetirementChart;
