import { TrendingUp, Shield, Target, ChevronRight, Calculator, PieChart, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  // Mock auth state - replace with actual useAuth() hook
  const user = null; // This should be: const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center max-w-5xl mx-auto">
          {/* Main Heading */}
          <div className="mb-8">
            <div className="inline-flex items-center bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <TrendingUp className="w-4 h-4 mr-2" />
              AI-Powered Retirement Planning
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              Maximize Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 block">
                Pension Benefits
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Navigate complex pension plans with confidence. Our AI-driven optimizer analyzes your unique situation to recommend the best payout strategy for your retirement goals.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            {user ? (
              <button 
                onClick={() => navigate('/dashboard')}
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                Go to Dashboard
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/register')}
                  className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  Start Optimizing
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="group bg-white/80 backdrop-blur-sm hover:bg-white text-slate-700 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl border border-slate-200 flex items-center justify-center">
                  View Demo
                  <Calculator className="w-5 h-5 ml-2" />
                </button>
              </>
            )}
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 group">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <PieChart className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Personalized Analysis</h3>
              <p className="text-slate-600 leading-relaxed">
                AI-powered modeling considers your age, salary, goals, and risk tolerance for tailored recommendations.
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 group">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Scenario Modeling</h3>
              <p className="text-slate-600 leading-relaxed">
                Compare lump-sum, annuity, and phased withdrawal options with real market data and tax implications.
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 group">
              <div className="bg-gradient-to-br from-purple-500 to-violet-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Risk Protection</h3>
              <p className="text-slate-600 leading-relaxed">
                Monte Carlo simulations and market risk analysis ensure your strategy withstands economic uncertainty.
              </p>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-slate-500 text-sm">
            <div className="flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Data-Driven Modeling
            </div>
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Compliance Assured
            </div>
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Real-Time Market Data
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;