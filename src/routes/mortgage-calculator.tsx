import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import MortgageCalculatorComponent from "../components/MortgageCalculator";
import {
    MortgageCalculation,
    AmortizationEntry,
    MortgageInputs,
} from "../lib/mortgage-calculator";
import { LocalStorageService, SavedScenario } from "../lib/local-storage";

export const Route = createFileRoute("/mortgage-calculator")({
    component: MortgageCalculatorPage,
});

function MortgageCalculatorPage() {
    const [currentCalculation, setCurrentCalculation] = useState<{
        calculation: MortgageCalculation;
        amortization: AmortizationEntry[];
        inputs: MortgageInputs;
    } | null>(null);
    const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [scenarioName, setScenarioName] = useState("");
    const [exportStatus, setExportStatus] = useState<
        "idle" | "exporting" | "success" | "error"
    >("idle");
    const [exportUrl, setExportUrl] = useState<string | null>(null);

    // Load saved scenarios on mount
    useEffect(() => {
        setSavedScenarios(LocalStorageService.getAllScenarios());
    }, []);

    const handleCalculationComplete = (
        calculation: MortgageCalculation,
        amortization: AmortizationEntry[]
    ) => {
        // Store the current calculation for saving
        setCurrentCalculation({
            calculation,
            amortization,
            inputs: {
                loanAmount: calculation.loanAmount,
                interestRate: calculation.interestRate,
                loanTermYears: calculation.loanTermYears,
                propertyTaxAnnual: calculation.propertyTaxMonthly * 12,
                homeInsuranceAnnual: calculation.homeInsuranceMonthly * 12,
                pmiRate:
                    calculation.pmiMonthly > 0
                        ? ((calculation.pmiMonthly * 12) /
                              calculation.loanAmount) *
                          100
                        : undefined,
                hoaFees: calculation.hoaFeesMonthly,
                downPayment: calculation.downPayment,
            },
        });
    };

    const handleSaveScenario = () => {
        if (!currentCalculation || !scenarioName.trim()) return;

        const savedScenario = LocalStorageService.saveScenario(
            scenarioName.trim(),
            currentCalculation.inputs,
            currentCalculation.calculation,
            currentCalculation.amortization
        );

        setSavedScenarios((prev) => [...prev, savedScenario]);
        setShowSaveDialog(false);
        setScenarioName("");
    };

    const handleExportToGoogleSheets = async () => {
        if (!currentCalculation) return;

        setExportStatus("exporting");
        try {
            const response = await fetch("/api/google-sheets-export", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    inputs: currentCalculation.inputs,
                    calculation: currentCalculation.calculation,
                    amortization: currentCalculation.amortization,
                    scenarioName: scenarioName || "Mortgage Calculation",
                }),
            });

            const result = await response.json();

            if (result.success) {
                setExportUrl(result.url);
                setExportStatus("success");
            } else {
                throw new Error(result.error || "Export failed");
            }
        } catch (error) {
            console.error("Error exporting to Google Sheets:", error);
            setExportStatus("error");
        }
    };

    const handleLoadScenario = (_scenario: SavedScenario) => {
        // This would need to be passed to the calculator component
        // For now, we'll just show the scenario details
        // TODO: Implement scenario loading functionality
    };

    return (
        <div className="min-h-screen bg-base-100">
            <div className="container mx-auto py-8">
                <MortgageCalculatorComponent
                    onCalculationComplete={handleCalculationComplete}
                />

                {/* Save & Export Section */}
                <div className="max-w-6xl mx-auto mt-8">
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title text-2xl font-semibold mb-4">
                                Save & Export
                            </h2>
                            <p className="text-base-content/70 mb-6">
                                Save your calculations locally, export to Google
                                Sheets, or download as JSON for sharing.
                            </p>

                            <div className="flex flex-wrap gap-4 mb-6">
                                <button
                                    onClick={() => setShowSaveDialog(true)}
                                    disabled={!currentCalculation}
                                    className={`btn ${
                                        !currentCalculation
                                            ? "btn-disabled"
                                            : "btn-primary"
                                    }`}
                                >
                                    Save Scenario
                                </button>

                                <button
                                    onClick={handleExportToGoogleSheets}
                                    disabled={
                                        !currentCalculation ||
                                        exportStatus === "exporting"
                                    }
                                    className={`btn ${
                                        !currentCalculation ||
                                        exportStatus === "exporting"
                                            ? "btn-disabled"
                                            : "btn-success"
                                    }`}
                                >
                                    {exportStatus === "exporting"
                                        ? "Exporting..."
                                        : "Export to Google Sheets"}
                                </button>

                                <button
                                    onClick={() => {
                                        if (!currentCalculation) return;
                                        const data = {
                                            inputs: currentCalculation.inputs,
                                            calculation:
                                                currentCalculation.calculation,
                                            amortization:
                                                currentCalculation.amortization.slice(
                                                    0,
                                                    12
                                                ), // First 12 payments
                                        };
                                        const blob = new Blob(
                                            [JSON.stringify(data, null, 2)],
                                            { type: "application/json" }
                                        );
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement("a");
                                        a.href = url;
                                        a.download = `mortgage-calculation-${new Date().toISOString().split("T")[0]}.json`;
                                        a.click();
                                        URL.revokeObjectURL(url);
                                    }}
                                    disabled={!currentCalculation}
                                    className={`btn ${
                                        !currentCalculation
                                            ? "btn-disabled"
                                            : "btn-secondary"
                                    }`}
                                >
                                    Download JSON
                                </button>
                            </div>

                            {exportStatus === "success" && exportUrl && (
                                <div className="alert alert-success">
                                    <span className="font-semibold">
                                        ✓ Exported successfully!
                                    </span>
                                    <a
                                        href={exportUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="link link-hover"
                                    >
                                        Open Spreadsheet
                                    </a>
                                </div>
                            )}

                            {exportStatus === "error" && (
                                <div className="alert alert-error">
                                    <span className="font-semibold">
                                        Error exporting to Google Sheets. Please
                                        check your configuration.
                                    </span>
                                </div>
                            )}

                            {!currentCalculation && (
                                <p className="text-base-content/60 text-sm mt-2">
                                    Enter loan details above to enable saving
                                    and exporting.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Saved Scenarios */}
                {savedScenarios.length > 0 && (
                    <div className="max-w-6xl mx-auto mt-8">
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                Saved Scenarios
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {savedScenarios.map((scenario) => (
                                    <div
                                        key={scenario.id}
                                        className="border border-gray-200 rounded-lg p-4"
                                    >
                                        <h3 className="font-semibold text-gray-900 mb-2">
                                            {scenario.name}
                                        </h3>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <div>
                                                Loan: $
                                                {scenario.inputs.loanAmount.toLocaleString()}
                                            </div>
                                            <div>
                                                Rate:{" "}
                                                {scenario.inputs.interestRate}%
                                            </div>
                                            <div>
                                                Term:{" "}
                                                {scenario.inputs.loanTermYears}{" "}
                                                years
                                            </div>
                                            <div>
                                                Payment: $
                                                {scenario.calculation.totalMonthlyPayment.toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="mt-3 flex space-x-2">
                                            <button
                                                onClick={() =>
                                                    handleLoadScenario(scenario)
                                                }
                                                className="text-blue-600 hover:text-blue-800 text-sm"
                                            >
                                                Load
                                            </button>
                                            <button
                                                onClick={() => {
                                                    LocalStorageService.deleteScenario(
                                                        scenario.id
                                                    );
                                                    setSavedScenarios((prev) =>
                                                        prev.filter(
                                                            (s) =>
                                                                s.id !==
                                                                scenario.id
                                                        )
                                                    );
                                                }}
                                                className="text-red-600 hover:text-red-800 text-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Save Dialog */}
                {showSaveDialog && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Save Scenario
                            </h3>
                            <input
                                type="text"
                                value={scenarioName}
                                onChange={(e) =>
                                    setScenarioName(e.target.value)
                                }
                                placeholder="Enter scenario name..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                            />
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleSaveScenario}
                                    disabled={!scenarioName.trim()}
                                    className={`px-4 py-2 rounded-lg font-semibold ${
                                        !scenarioName.trim()
                                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                            : "bg-blue-600 text-white hover:bg-blue-700"
                                    }`}
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => {
                                        setShowSaveDialog(false);
                                        setScenarioName("");
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Features Section */}
                <div className="max-w-6xl mx-auto mt-8">
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            Features
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                    <svg
                                        className="w-8 h-8 text-blue-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Comprehensive Calculations
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    Calculate principal, interest, taxes,
                                    insurance, PMI, and HOA fees for accurate
                                    monthly payments.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                    <svg
                                        className="w-8 h-8 text-green-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Amortization Table
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    View detailed payment schedule showing
                                    principal and interest breakdown for each
                                    payment.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                    <svg
                                        className="w-8 h-8 text-purple-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Google Sheets Integration
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    Save your calculations to Google Sheets with
                                    formulas for easy sharing and further
                                    analysis.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
