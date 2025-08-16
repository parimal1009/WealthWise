import React from "react";
import { Bot, User } from "lucide-react";
import WelcomeComponent from "./chat/WelcomeComponent";
import BasicInfoFormComponent from "./chat/BasicInfoFormComponent";
import IncomeStatusFormComponent from "./chat/IncomeStatusFormComponent";
import RetirementInfoFormComponent from "./chat/RetirementInfoFormComponent";
import ScenarioVisualizationComponent from "./chat/ScenarioVisualizationComponent";
import ComparisonChartComponent from "./chat/ComparisonChartComponent";
import RecommendationComponent from "./chat/RecommendationComponent";
import QuickActionsComponent from "./chat/QuickActionsComponent";
import DemoComponent from "./chat/DemoComponent";

const ChatMessage = ({
  message,
  userData,
  scenarios,
  onFormSubmit,
  onUpdateUserData,
  onUpdateScenarios,
}) => {
  const isBot = message.type === "bot";

  const renderComponent = () => {
    switch (message.component) {
      case "welcome":
        return <WelcomeComponent onAction={onFormSubmit} />;
      case "basic-info-form":
        return (
          <BasicInfoFormComponent
            userData={userData}
            onSubmit={onFormSubmit}
            onUpdate={onUpdateUserData}
          />
        );
      case "income-status-form":
        return (
          <IncomeStatusFormComponent
            userData={userData}
            onSubmit={onFormSubmit}
            onUpdate={onUpdateUserData}
          />
        );
      case "retirement-info-form":
        return (
          <RetirementInfoFormComponent
            userData={userData}
            onSubmit={onFormSubmit}
            onUpdate={onUpdateUserData}
          />
        );
      case "scenario-visualization":
        return (
          <ScenarioVisualizationComponent
            scenarios={message.data?.scenarios || scenarios}
            userData={userData}
            onAction={onFormSubmit}
          />
        );
      case "comparison-chart":
        return (
          <ComparisonChartComponent
            scenarios={message.data?.scenarios || scenarios}
            chartType={message.data?.chartType || "income"}
          />
        );
      case "recommendation":
        return (
          <RecommendationComponent
            recommendation={message.data}
            onAction={onFormSubmit}
          />
        );
      case "quick-actions":
        return <QuickActionsComponent onAction={onFormSubmit} />;
      case "demo":
        return <DemoComponent onAction={onFormSubmit} />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`flex items-start space-x-3 ${
        isBot ? "" : "flex-row-reverse space-x-reverse"
      }`}
    >
      <div
        className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ${
          isBot ? "bg-primary-600" : "bg-gray-600"
        }`}
      >
        {isBot ? (
          <Bot className="h-4 w-4 text-white" />
        ) : (
          <User className="h-4 w-4 text-white" />
        )}
      </div>

      <div className={`max-w-3xl ${isBot ? "" : "text-right"}`}>
        {message.content && (
          <div
            className={`rounded-2xl px-4 py-3 shadow-sm mb-3 ${
              isBot
                ? "bg-white rounded-tl-sm"
                : "bg-primary-600 text-white rounded-tr-sm"
            }`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
        )}

        {message.component && (
          <div className="form-slide-in">{renderComponent()}</div>
        )}

        <div
          className={`text-xs text-gray-500 mt-1 ${isBot ? "" : "text-right"}`}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;