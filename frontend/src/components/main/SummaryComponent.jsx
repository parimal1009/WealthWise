import React from "react";
import { BarChart3, TrendingUp, DollarSign, PieChart } from "lucide-react";
const SummaryComponent = ({ userData, scenarios }) => {
    // Helper function to check if a value is not empty
    const hasValue = (value) => value && value.toString().trim() !== "";

    // Get all non-empty fields
    const getPopulatedFields = () => {
        const fields = [];
        // Basic Information
        if (hasValue(userData.name) && userData.name !== "Full Name")
            fields.push({ label: "Name", value: userData.name, category: "basic" });
        if (hasValue(userData.email) && userData.email !== "abc@gmail.com")
            fields.push({ label: "Email", value: userData.email, category: "basic" });
        if (hasValue(userData.age))
            fields.push({ label: "Age", value: userData.age, category: "basic" });
        if (hasValue(userData.dateOfBirth))
            fields.push({
                label: "Date of Birth",
                value: userData.dateOfBirth,
                category: "basic",
            });
        if (hasValue(userData.gender))
            fields.push({
                label: "Gender",
                value: userData.gender,
                category: "basic",
            });
        if (hasValue(userData.location))
            fields.push({
                label: "Location",
                value: userData.location,
                category: "basic",
            });
        if (hasValue(userData.maritalStatus))
            fields.push({
                label: "Marital Status",
                value: userData.maritalStatus,
                category: "basic",
            });
        if (hasValue(userData.numberOfDependants))
            fields.push({
                label: "Dependants",
                value: userData.numberOfDependants,
                category: "basic",
            });

        // Income Status
        if (hasValue(userData.currentSalary))
            fields.push({
                label: "Current Salary",
                value: userData.currentSalary,
                category: "income",
            });
        if (hasValue(userData.yearsOfService))
            fields.push({
                label: "Years of Service",
                value: userData.yearsOfService,
                category: "income",
            });
        if (hasValue(userData.employerType))
            fields.push({
                label: "Employer Type",
                value: userData.employerType,
                category: "income",
            });
        if (hasValue(userData.pensionScheme))
            fields.push({
                label: "Pension Scheme",
                value: userData.pensionScheme,
                category: "income",
            });
        if (hasValue(userData.pensionBalance))
            fields.push({
                label: "Pension Balance",
                value: userData.pensionBalance,
                category: "income",
            });
        if (hasValue(userData.employerContribution))
            fields.push({
                label: "Employer Contribution",
                value: userData.employerContribution,
                category: "income",
            });

        // Retirement Information
        if (hasValue(userData.plannedRetirementAge))
            fields.push({
                label: "Planned Retirement Age",
                value: userData.plannedRetirementAge,
                category: "retirement",
            });
        if (hasValue(userData.retirementLifestyle))
            fields.push({
                label: "Retirement Lifestyle",
                value: userData.retirementLifestyle,
                category: "retirement",
            });
        if (hasValue(userData.monthlyRetirementExpense))
            fields.push({
                label: "Monthly Retirement Expense",
                value: userData.monthlyRetirementExpense,
                category: "retirement",
            });
        if (hasValue(userData.legacyGoal))
            fields.push({
                label: "Legacy Goal",
                value: userData.legacyGoal,
                category: "retirement",
            });

        return fields;
    };

    const populatedFields = getPopulatedFields();
    const hasData = populatedFields.length > 0;

    // Group fields by category
    const groupedFields = populatedFields.reduce((acc, field) => {
        if (!acc[field.category]) acc[field.category] = [];
        acc[field.category].push(field);
        return acc;
    }, {});

    const categoryIcons = {
        basic: <BarChart3 className="w-5 h-5" />,
        income: <DollarSign className="w-5 h-5" />,
        retirement: <TrendingUp className="w-5 h-5" />,
    };

    const categoryTitles = {
        basic: "Personal Information",
        income: "Income & Employment",
        retirement: "Retirement Planning",
    };

    const categoryColors = {
        basic: "from-purple-500 to-pink-500",
        income: "from-green-500 to-blue-500",
        retirement: "from-orange-500 to-red-500",
    };

    if (!hasData) {
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

                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                        Summary Panel
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
                        Your financial overview and insights will appear here once you start
                        analyzing your portfolio
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {Object.entries(groupedFields).map(([category, fields]) => (
                <div
                    key={category}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 break-words whitespace-normal"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div
                            className={`w-8 h-8 bg-gradient-to-r ${categoryColors[category]} rounded-lg flex items-center justify-center text-white`}
                        >
                            {categoryIcons[category]}
                        </div>
                        <h4 className="font-semibold text-gray-900">
                            {categoryTitles[category]}
                        </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {fields.map((field, index) => (
                            <div key={index} className="flex flex-col">
                                <dt className="text-xs font-medium text-gray-500 mb-1">
                                    {field.label}
                                </dt>
                                <dd className="text-sm text-gray-900 font-medium">
                                    {field.value}
                                </dd>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SummaryComponent;
