import {
  TrendingUp,
  Shield,
  Target,
  ChevronRight,
  Calculator,
  PieChart,
  BarChart3,
  Sparkles,
  Brain,
  FileText,
  Zap,
  ArrowDown,
  Play,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const HomePage = () => {
  // Mock auth state - replace with actual useAuth() hook
  const user = null; // This should be: const { user } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-slate-900 overflow-hidden">
      {/* Hero Section with Half-Peeking UI */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/50 to-indigo-100/50" />

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 container mx-auto px-6 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            {/* Left Content */}
            <div
              className={`transition-all duration-1000 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              {/* Badge */}
              <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-indigo-100 backdrop-blur-sm border border-blue-200 text-blue-700 px-6 py-3 rounded-full text-sm font-medium mb-8 hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Retirement Intelligence
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">
                <span className="block text-slate-900">Plan Smart.</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-gradient">
                  Retire Confident.
                </span>
              </h1>

              <p className="text-xl md:text-xl text-slate-600 mb-8 leading-relaxed font-normal max-w-xl">
                Experience the future of retirement planning with our AI-driven
                platform that transforms complex pension decisions into clear,
                actionable insights.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 mb-12">
                {user ? (
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="group relative bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-10 py-5 rounded-2xl text-lg font-semibold transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 hover:scale-105 flex items-center justify-center overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    Go to Dashboard
                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => navigate("/login")}
                      className="group relative bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 hover:scale-105 flex items-center justify-center overflow-hidden cursor-pointer"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      Start Your Journey
                      <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                    {/* <button className="group relative bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-10 py-5 rounded-2xl text-lg font-semibold transition-all duration-300 shadow-2xl hover:shadow-white/10 border border-white/20 hover:border-white/30 flex items-center justify-center">
                      <Play className="w-5 h-5 mr-2" />
                      Watch Demo
                    </button> */}
                  </>
                )}
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-6 text-slate-500 text-sm">
                <div className="flex items-center group hover:text-blue-600 transition-colors">
                  <Shield className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  Privacy Focussed
                </div>
                <div className="flex items-center group hover:text-green-600 transition-colors">
                  <Target className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  Data-Driven Insights
                </div>
              </div>
            </div>

            {/* Right Side - Half-Peeking UI Screenshot */}
            <div
              className={`relative transition-all duration-1000 delay-300 ${
                isVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-10"
              }`}
            >
              <div className="relative group">
                {/* Glow Effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500" />

                {/* Screenshot Container - Positioned to peek */}
                <div className="relative bg-gradient-to-br from-white/80 to-slate-50/80 backdrop-blur-sm rounded-3xl p-4 border border-slate-200/50 shadow-2xl transform rotate-3 hover:rotate-1 transition-transform duration-700">
                  <img
                    src="/main-user-interface.png"
                    alt="WealthWise Dashboard Interface"
                    className="w-full h-auto rounded-2xl shadow-2xl hover:scale-103 transition-transform duration-700"
                  />

                  {/* Floating Elements */}
                  <div className="absolute -top-6 -left-6 bg-gradient-to-r from-blue-500 to-indigo-500 p-4 rounded-2xl shadow-2xl animate-float">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-indigo-500 to-purple-500 p-4 rounded-2xl shadow-2xl animate-float-delayed">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Additional floating elements around the screenshot */}
                <div className="absolute top-1/4 -left-8 bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl shadow-xl animate-float opacity-80">
                  <PieChart className="w-6 h-6 text-white" />
                </div>
                <div className="absolute bottom-1/3 -right-8 bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl shadow-xl animate-float-delayed opacity-80">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ArrowDown className="w-6 h-6 text-slate-400" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-slate-900">
              Powered by{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Intelligence
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Advanced AI and machine learning technologies working behind the
              scenes
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* AI Chatbot */}
            <div className="group relative bg-gradient-to-br from-white to-slate-50 backdrop-blur-sm rounded-3xl p-8 border border-slate-200 hover:border-blue-300 transition-all duration-500 hover:scale-105 shadow-lg hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  AI Assistant
                </h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                  Conversational AI that understands your questions, analyzes
                  documents, and provides personalized retirement advice with
                  context awareness.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                    RAG Technology
                  </span>
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
                    Document Analysis
                  </span>
                </div>
              </div>
            </div>

            {/* Predictive Analytics */}
            <div className="group relative bg-gradient-to-br from-white to-slate-50 backdrop-blur-sm rounded-3xl p-8 border border-slate-200 hover:border-green-300 transition-all duration-500 hover:scale-105 shadow-lg hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  Predictive Models
                </h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                  Machine learning algorithms predict life expectancy, market
                  trends, and optimal retirement strategies based on your unique
                  profile.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                    ML Models
                  </span>
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">
                    Risk Analysis
                  </span>
                </div>
              </div>
            </div>

            {/* Document Processing */}
            <div className="group relative bg-gradient-to-br from-white to-slate-50 backdrop-blur-sm rounded-3xl p-8 border border-slate-200 hover:border-purple-300 transition-all duration-500 hover:scale-105 shadow-lg hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="bg-gradient-to-br from-purple-500 to-violet-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  Smart Documents
                </h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                  Upload pension documents and let AI extract key information,
                  answer questions, and provide insights from your personal
                  financial data.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                    PDF Analysis
                  </span>
                  <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-sm">
                    Data Extraction
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="relative py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center items-center gap-12 text-slate-500">
            <div className="flex items-center group hover:text-blue-600 transition-colors">
              <Shield className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
              <span className="text-lg">Privacy Focussed</span>
            </div>
            <div className="flex items-center group hover:text-green-600 transition-colors">
              <Target className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
              <span className="text-lg">Data-Driven Insights</span>
            </div>
            <div className="flex items-center group hover:text-purple-600 transition-colors">
              <TrendingUp className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
              <span className="text-lg">Real-Time Analytics</span>
            </div>
            <div className="flex items-center group hover:text-indigo-600 transition-colors">
              <Sparkles className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
              <span className="text-lg">AI-Powered Optimization</span>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 3s ease-in-out infinite 1.5s;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
