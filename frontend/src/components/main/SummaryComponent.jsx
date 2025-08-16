import React from 'react';
import { BarChart3, TrendingUp, DollarSign, PieChart } from 'lucide-react';

const SummaryComponent = ({ userData, scenarios }) => {
    return (
        <div className="space-y-6">
            {/* Beautiful empty state */}
            <div className="text-center py-8">
                <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                        <BarChart3 className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-green-500 rounded-full animate-pulse delay-150"></div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">Summary Panel</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
                    Your financial overview and insights will appear here once you start analyzing your portfolio
                </p>
            </div>
        </div>
    );
};

export default SummaryComponent;