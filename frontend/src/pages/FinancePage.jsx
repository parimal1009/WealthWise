import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { BarChart3, Info, Loader2, TrendingUp, TrendingDown, DollarSign, Building2, Calendar, X, ExternalLink } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const FinancePage = () => {
    const [userStocks, setUserStocks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [stockCharts, setStockCharts] = useState({});
    const [portfolioValue, setPortfolioValue] = useState(0);
    const [selectedPeriod, setSelectedPeriod] = useState('7d');
    const [selectedStock, setSelectedStock] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch user's stock holdings from Zerodha
    const fetchUserStocks = async () => {
        try {
            setLoading(true);
            setError('');

            let token = localStorage.getItem("token");
            if (!token) {
                const cookies = document.cookie.split(';');
                const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
                if (tokenCookie) token = tokenCookie.split('=')[1];
            }

            const headers = { "Content-Type": "application/json" };
            if (token) headers["Authorization"] = `Bearer ${token}`;

            const response = await fetch('http://localhost:8000/api/financial/stocks/details/', {
                method: 'GET',
                headers,
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            const result = await response.json();
            setUserStocks(result.stocks || []);

            // Calculate total portfolio value
            const totalValue = result.stocks?.reduce((sum, stock) => {
                return sum + (stock.currentPrice || 0);
            }, 0) || 0;
            setPortfolioValue(totalValue);

            // Fetch historical data for charts
            if (result.stocks && result.stocks.length > 0) {
                fetchStockCharts(result.stocks);
            }

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch historical data for stock charts
    const fetchStockCharts = async (stocks) => {
        try {
            const symbols = stocks.map(stock => stock.originalSymbol || stock.symbol);

            let token = localStorage.getItem("token");
            if (!token) {
                const cookies = document.cookie.split(';');
                const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
                if (tokenCookie) token = tokenCookie.split('=')[1];
            }

            const headers = { "Content-Type": "application/json" };
            if (token) headers["Authorization"] = `Bearer ${token}`;

            const response = await fetch("http://localhost:8000/api/financial/stocks/", {
                method: "POST",
                headers,
                credentials: 'include',
                body: JSON.stringify({ symbols }),
            });

            if (response.ok) {
                const data = await response.json();
                const chartData = data.data || {};
                setStockCharts(chartData);
            }
        } catch (error) {
            console.error("Error fetching stock charts:", error);
        }
    };

    // Load user stocks on component mount
    useEffect(() => {
        fetchUserStocks();
    }, []);

    // Refetch chart data when period changes
    useEffect(() => {
        if (userStocks.length > 0 && Object.keys(stockCharts).length > 0) {
            const hasDataForPeriod = userStocks.some(stock => {
                const chartKey = stock.originalSymbol || stock.symbol;
                return stockCharts[chartKey] && stockCharts[chartKey][selectedPeriod];
            });

            if (!hasDataForPeriod) {
                fetchStockCharts(userStocks);
            }
        }
    }, [selectedPeriod]);

    // Format currency
    const formatCurrency = (value) => {
        if (!value) return 'N/A';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    // Format percentage
    const formatPercentage = (current, previous) => {
        if (!current || !previous) return '0%';
        const change = ((current - previous) / previous) * 100;
        return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
    };

    // Get price change color
    const getPriceChangeColor = (current, previous) => {
        if (!current || !previous) return 'text-gray-500';
        return current >= previous ? 'text-green-600' : 'text-red-600';
    };

    // Create chart data for a stock
    const createChartData = (symbol, stockData, period) => {
        if (!stockData || !stockData[period]) {
            return null;
        }

        const periodData = stockData[period];
        if (!periodData.history) {
            return null;
        }

        const isPositive = periodData.current_price >= periodData.history[0];

        return {
            labels: periodData.dates || [],
            datasets: [
                {
                    label: `${symbol} (${period})`,
                    data: periodData.history || [],
                    borderColor: isPositive ? '#10b981' : '#ef4444',
                    backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                },
            ],
        };
    };

    // Open stock modal
    const openStockModal = (stock) => {
        setSelectedStock(stock);
        setIsModalOpen(true);
    };

    // Close stock modal
    const closeStockModal = () => {
        setIsModalOpen(false);
        setSelectedStock(null);
    };

    return (
        <div className="w-full h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-y-auto">
            <div className="w-full max-w-none p-8">
                {/* Header */}
                <div className="mb-8 flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                        <BarChart3 className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                            My Portfolio Dashboard
                        </h1>
                        <p className="text-slate-600 text-lg mt-1">
                            Track your Zerodha investments and get real-time market insights
                        </p>
                    </div>
                </div>

                {/* Portfolio Summary */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-slate-900">Portfolio Overview</h2>
                        <button
                            onClick={fetchUserStocks}
                            disabled={loading}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                            Refresh
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-4 rounded-xl border border-green-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500 rounded-lg">
                                    <DollarSign className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-green-600 font-medium">Total Value</p>
                                    <p className="text-xl font-bold text-green-800">{formatCurrency(portfolioValue)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-4 rounded-xl border border-blue-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500 rounded-lg">
                                    <Building2 className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-blue-600 font-medium">Stocks</p>
                                    <p className="text-xl font-bold text-blue-800">{userStocks.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-4 rounded-xl border border-purple-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500 rounded-lg">
                                    <Calendar className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-purple-600 font-medium">Last Updated</p>
                                    <p className="text-lg font-bold text-purple-800">{new Date().toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                        <p className="text-red-700 text-sm"><strong>Error:</strong> {error}</p>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="ml-2 text-blue-600">Loading your portfolio...</span>
                    </div>
                )}

                {/* Stock Grid - 2 Column Layout */}
                {!loading && userStocks.length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">Your Stocks</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {userStocks.map((stock, index) => (
                                <div
                                    key={index}
                                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
                                    onClick={() => openStockModal(stock)}
                                >
                                    {/* Stock Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                {stock.longName}
                                            </h3>
                                            <p className="text-lg text-slate-600 font-mono">{stock.originalSymbol || stock.symbol}</p>
                                            {stock.sector && (
                                                <p className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-full inline-block mt-1">
                                                    {stock.sector}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-3xl font-bold text-slate-900">₹{stock.currentPrice?.toFixed(2)}</p>
                                            <p className={`text-lg font-semibold ${getPriceChangeColor(stock.currentPrice, stock.previousClose)}`}>
                                                {formatPercentage(stock.currentPrice, stock.previousClose)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="bg-slate-50 p-3 rounded-lg">
                                            <p className="text-xs text-slate-500 font-medium">Day High</p>
                                            <p className="text-sm font-semibold text-slate-700">{stock.dayHigh}</p>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-lg">
                                            <p className="text-xs text-slate-500 font-medium">Day Low</p>
                                            <p className="text-sm font-semibold text-slate-700">{stock.dayLow}</p>
                                        </div>
                                    </div>

                                    {/* Click Indicator */}
                                    <div className="flex items-center justify-center text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        Click to view details
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && userStocks.length === 0 && !error && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-12 text-center">
                        <BarChart3 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-700 mb-2">No Stocks Found</h3>
                        <p className="text-slate-500 mb-6">
                            It looks like you don't have any stock holdings in your Zerodha account, or there was an issue fetching your portfolio.
                        </p>
                        <button
                            onClick={fetchUserStocks}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>

            {/* Stock Detail Modal */}
            {isModalOpen && selectedStock && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 rounded-t-2xl">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h2 className="text-3xl font-bold text-slate-900">{selectedStock.longName}</h2>
                                    <p className="text-xl text-slate-600 font-mono">{selectedStock.originalSymbol || selectedStock.symbol}</p>
                                    {selectedStock.sector && (
                                        <p className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full inline-block mt-2">
                                            {selectedStock.sector}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right ml-6">
                                    <p className="text-4xl font-bold text-slate-900">₹{selectedStock.currentPrice?.toFixed(2)}</p>
                                    <p className={`text-xl font-semibold ${getPriceChangeColor(selectedStock.currentPrice, selectedStock.previousClose)}`}>
                                        {formatPercentage(selectedStock.currentPrice, selectedStock.previousClose)}
                                    </p>
                                </div>
                                <button
                                    onClick={closeStockModal}
                                    className="ml-6 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6 text-slate-600" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left Column - Stock Details */}
                                <div className="space-y-6">
                                    {/* Key Metrics */}
                                    <div className="bg-slate-50 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Key Metrics</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-slate-500 font-medium">Previous Close</p>
                                                <p className="text-lg font-semibold text-slate-700">{formatCurrency(selectedStock.previousClose)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-500 font-medium">Market Cap</p>
                                                <p className="text-lg font-semibold text-slate-700">{formatCurrency(selectedStock.marketCap)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-500 font-medium">Day High</p>
                                                <p className="text-lg font-semibold text-slate-700">{formatCurrency(selectedStock.dayHigh)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-500 font-medium">Day Low</p>
                                                <p className="text-lg font-semibold text-slate-700">{formatCurrency(selectedStock.dayLow)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 52 Week Range */}
                                    <div className="bg-slate-50 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-slate-900 mb-4">52 Week Range</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-slate-600">Low</span>
                                                <span className="text-lg font-semibold text-red-600">{formatCurrency(selectedStock.fiftyTwoWeekLow)}</span>
                                            </div>
                                            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-red-500 to-green-500"
                                                    style={{
                                                        width: `${((selectedStock.currentPrice - selectedStock.fiftyTwoWeekLow) / (selectedStock.fiftyTwoWeekHigh - selectedStock.fiftyTwoWeekLow)) * 100}%`
                                                    }}
                                                ></div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-slate-600">High</span>
                                                <span className="text-lg font-semibold text-green-600">{formatCurrency(selectedStock.fiftyTwoWeekHigh)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Performance Summary */}
                                    {(() => {
                                        const chartKey = selectedStock.originalSymbol || selectedStock.symbol;
                                        const hasChartData = stockCharts[chartKey] && stockCharts[chartKey][selectedPeriod];

                                        return hasChartData ? (
                                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="text-center">
                                                        <p className="text-sm text-blue-600 font-medium">Total Return</p>
                                                        <p className={`text-2xl font-bold ${stockCharts[chartKey][selectedPeriod].total_return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                            {stockCharts[chartKey][selectedPeriod].total_return >= 0 ? '+' : ''}{stockCharts[chartKey][selectedPeriod].total_return}%
                                                        </p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-sm text-blue-600 font-medium">Volatility</p>
                                                        <p className="text-2xl font-bold text-blue-800">{stockCharts[chartKey][selectedPeriod].volatility}%</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : null;
                                    })()}
                                </div>

                                {/* Right Column - Chart */}
                                <div className="space-y-6">
                                    {/* Chart */}
                                    <div className="bg-white border border-slate-200 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Price Chart</h3>
                                        {(() => {
                                            const chartKey = selectedStock.originalSymbol || selectedStock.symbol;

                                            if (stockCharts[chartKey] && stockCharts[chartKey][selectedPeriod]) {
                                                const chartData = createChartData(chartKey, stockCharts[chartKey], selectedPeriod);

                                                if (chartData) {
                                                    return (
                                                        <div className="h-80">
                                                            <Line
                                                                data={chartData}
                                                                options={{
                                                                    responsive: true,
                                                                    maintainAspectRatio: false,
                                                                    plugins: {
                                                                        legend: { display: false },
                                                                        tooltip: {
                                                                            mode: 'index',
                                                                            intersect: false,
                                                                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                                                            titleColor: 'white',
                                                                            bodyColor: 'white',
                                                                        },
                                                                    },
                                                                    scales: {
                                                                        x: {
                                                                            grid: { color: 'rgba(0,0,0,0.1)' },
                                                                            ticks: { color: '#64748b' }
                                                                        },
                                                                        y: {
                                                                            grid: { color: 'rgba(0,0,0,0.1)' },
                                                                            ticks: { color: '#64748b' }
                                                                        },
                                                                    },
                                                                    elements: {
                                                                        point: {
                                                                            hoverRadius: 6,
                                                                        },
                                                                    },
                                                                }}
                                                            />
                                                        </div>
                                                    );
                                                }
                                            }

                                            return (
                                                <div className="h-80 flex items-center justify-center bg-slate-50 rounded-lg">
                                                    <div className="text-center">
                                                        <Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-2" />
                                                        <p className="text-slate-500">Chart loading...</p>
                                                        <p className="text-xs text-slate-400 mt-1">Period: {selectedPeriod}</p>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* Additional Info */}
                                    <div className="bg-slate-50 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Additional Information</h3>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Exchange</span>
                                                <span className="font-medium text-slate-900">NSE</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Last Updated</span>
                                                <span className="font-medium text-slate-900">{new Date().toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinancePage;
