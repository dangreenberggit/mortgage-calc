import { createFileRoute } from "@tanstack/react-router";
import {
    MortgageCalculator,
    MortgageInputs,
    MortgageUtils,
} from "../lib/mortgage-calculator";

export const Route = createFileRoute("/test-mortgage-calc")({
    component: TestMortgageCalc,
});

function TestMortgageCalc() {
    // Test data
    const testInputs: MortgageInputs = {
        loanAmount: 300000,
        interestRate: 6.5,
        loanTermYears: 30,
        propertyTaxAnnual: 3600,
        homeInsuranceAnnual: 1200,
        pmiRate: 0.5,
        hoaFees: 100,
        downPayment: 60000,
        closingCosts: 5000,
    };

    // Calculate mortgage
    const calculation = MortgageCalculator.calculateMortgage(testInputs);
    const amortizationTable =
        MortgageCalculator.generateAmortizationTable(testInputs);
    const validationErrors = MortgageUtils.validateInputs(testInputs);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                    Mortgage Calculator Test
                </h1>

                {/* Test Inputs */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                        Test Inputs
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <strong>Loan Amount:</strong>{" "}
                            {MortgageUtils.formatCurrency(
                                testInputs.loanAmount
                            )}
                        </div>
                        <div>
                            <strong>Interest Rate:</strong>{" "}
                            {MortgageUtils.formatPercentage(
                                testInputs.interestRate
                            )}
                        </div>
                        <div>
                            <strong>Loan Term:</strong>{" "}
                            {testInputs.loanTermYears} years
                        </div>
                        <div>
                            <strong>Down Payment:</strong>{" "}
                            {MortgageUtils.formatCurrency(
                                testInputs.downPayment
                            )}
                        </div>
                        <div>
                            <strong>Property Tax:</strong>{" "}
                            {MortgageUtils.formatCurrency(
                                testInputs.propertyTaxAnnual
                            )}
                            /year
                        </div>
                        <div>
                            <strong>Home Insurance:</strong>{" "}
                            {MortgageUtils.formatCurrency(
                                testInputs.homeInsuranceAnnual
                            )}
                            /year
                        </div>
                        <div>
                            <strong>PMI Rate:</strong> {testInputs.pmiRate}%
                        </div>
                        <div>
                            <strong>HOA Fees:</strong>{" "}
                            {MortgageUtils.formatCurrency(
                                testInputs.hoaFees || 0
                            )}
                            /month
                        </div>
                    </div>

                    {validationErrors.length > 0 && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <h3 className="text-red-800 font-semibold mb-2">
                                Validation Errors:
                            </h3>
                            <ul className="text-red-700 list-disc list-inside">
                                {validationErrors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Calculation Results */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                        Calculation Results
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <strong>Purchase Price:</strong>{" "}
                            {MortgageUtils.formatCurrency(
                                calculation.purchasePrice
                            )}
                        </div>
                        <div>
                            <strong>LTV:</strong>{" "}
                            {MortgageUtils.formatPercentage(
                                MortgageUtils.calculateLTV(
                                    calculation.loanAmount,
                                    calculation.purchasePrice
                                )
                            )}
                        </div>
                        <div>
                            <strong>Principal & Interest:</strong>{" "}
                            {MortgageUtils.formatCurrency(
                                calculation.principalAndInterest
                            )}
                        </div>
                        <div>
                            <strong>Property Tax (Monthly):</strong>{" "}
                            {MortgageUtils.formatCurrency(
                                calculation.propertyTaxMonthly
                            )}
                        </div>
                        <div>
                            <strong>Home Insurance (Monthly):</strong>{" "}
                            {MortgageUtils.formatCurrency(
                                calculation.homeInsuranceMonthly
                            )}
                        </div>
                        <div>
                            <strong>PMI (Monthly):</strong>{" "}
                            {MortgageUtils.formatCurrency(
                                calculation.pmiMonthly
                            )}
                        </div>
                        <div>
                            <strong>HOA Fees (Monthly):</strong>{" "}
                            {MortgageUtils.formatCurrency(
                                calculation.hoaFeesMonthly
                            )}
                        </div>
                        <div>
                            <strong>Total Monthly Payment:</strong>{" "}
                            {MortgageUtils.formatCurrency(
                                calculation.totalMonthlyPayment
                            )}
                        </div>
                        <div>
                            <strong>Total Interest:</strong>{" "}
                            {MortgageUtils.formatCurrency(
                                calculation.totalInterest
                            )}
                        </div>
                        <div>
                            <strong>Total PMI:</strong>{" "}
                            {MortgageUtils.formatCurrency(calculation.totalPMI)}
                        </div>
                        <div>
                            <strong>Total Payments:</strong>{" "}
                            {MortgageUtils.formatCurrency(
                                calculation.totalPayments
                            )}
                        </div>
                        <div>
                            <strong>Monthly Rate:</strong>{" "}
                            {MortgageUtils.formatPercentage(
                                calculation.monthlyRate * 100
                            )}
                        </div>
                    </div>
                </div>

                {/* Amortization Table Sample */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                        Amortization Table (First 12 Payments)
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Payment #
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Beginning Balance
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Payment
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Principal
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Interest
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ending Balance
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {amortizationTable.slice(0, 12).map((entry) => (
                                    <tr key={entry.paymentNumber}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {entry.paymentNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(
                                                entry.paymentDate
                                            ).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {MortgageUtils.formatCurrency(
                                                entry.beginningBalance
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {MortgageUtils.formatCurrency(
                                                entry.monthlyPayment
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {MortgageUtils.formatCurrency(
                                                entry.principalPayment
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {MortgageUtils.formatCurrency(
                                                entry.interestPayment
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {MortgageUtils.formatCurrency(
                                                entry.endingBalance
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">
                        Total payments: {amortizationTable.length} | Final
                        balance:{" "}
                        {MortgageUtils.formatCurrency(
                            amortizationTable[amortizationTable.length - 1]
                                ?.endingBalance || 0
                        )}
                    </p>
                </div>

                {/* Navigation */}
                <div className="mt-8 text-center">
                    <a
                        href="/mortgage-calculator"
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Try the Interactive Calculator
                    </a>
                </div>
            </div>
        </div>
    );
}

