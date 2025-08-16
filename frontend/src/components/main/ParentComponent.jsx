
import React, { useState } from "react";
import SideNavComponent from "./SideNavComponent";
import SummaryComponent from "./SummaryComponent";
import ChatInterface from "../ChatInterface";
import Dashboard from "../../pages/DashboardPage.jsx"; // ✅ Import your Dashboard component

const ParentComponent = ({
    userData,
    setUserData,
    scenarios,
    setScenarios,
}) => {
    const [activePage, setActivePage] = useState("chat"); // default page is chat
    return (
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
            {/* Main Layout */}
            <div className="flex max-h-screen ">
                {/* Left Sidebar - Profile */}
                <div className="w-80 bg-white/70 backdrop-blur-sm border-r border-gray-200 shadow-xl">
                    <div className="p-6">
                        <div className="mb-8">
                            <SideNavComponent userData={userData} onNavClick={setActivePage} />
                        </div>
                    </div>
                </div>

                {/* Center + Right Section */}
                {activePage === "dashboard" ? (
                    // ✅ Show Dashboard Component
                    <div className="flex-1 flex flex-col overflow-y-auto">
                        <Dashboard userData={userData} scenarios={scenarios} />
                    </div>
                ) : (
                    // ✅ Default: Show Chat + Summary
                    <>
                        {/* Center - Chat Interface */}
                        <div className="flex-1 flex flex-col">
                            <div className="flex-1 overflow-y-auto">
                                <ChatInterface
                                    userData={userData}
                                    setUserData={setUserData}
                                    scenarios={scenarios}
                                    setScenarios={setScenarios}
                                />
                            </div>
                        </div>

                        {/* Right Sidebar - Summary */}
                        <div className="w-90 p-6 bg-white/70 backdrop-blur-sm border-l border-gray-200 shadow-xl overflow-y-auto">
                            <div className="border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                            <span className="text-white text-sm">📊</span>
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900">Summary</h2>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <SummaryComponent userData={userData} scenarios={scenarios} />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ParentComponent;
