import React, { useState } from 'react';
import ProfileComponent from './ProfileComponent';
import SummaryComponent from './SummaryComponent';
import ChatInterface from '../ChatInterface';


const ParentComponent = () => {
    const [userData, setUserData] = useState({
        name: 'Sarah Connor',
        email: 'sarah@gmail.com',
        avatar: '/api/placeholder/60/60'
    });

    const [scenarios, setScenarios] = useState([]);

    return (
        <div className="h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Main Layout */}
            <div className="flex h-[calc(100vh-65px)]">
                {/* Left Sidebar - Profile */}
                <div className="w-80 bg-white/70 backdrop-blur-sm border-r border-gray-200 shadow-xl">
                    <div className="p-6">
                        <div className="mb-8">
                            <ProfileComponent userData={userData} />
                        </div>

                    </div>
                </div>

                {/* Center - Chat Interface */}
                <div className="flex-1 flex flex-col">
                    <div className="flex-1 overflow-y-scroll">
                        <ChatInterface
                            userData={userData}
                            setUserData={setUserData}
                            scenarios={scenarios}
                            setScenarios={setScenarios}
                        />
                    </div>
                </div>

                {/* Right Sidebar - Summary */}
                <div className="w-80 bg-white/70 backdrop-blur-sm border-l border-gray-200 shadow-xl">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white text-sm">📊</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Summary</h2>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <SummaryComponent userData={userData} scenarios={scenarios} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParentComponent;