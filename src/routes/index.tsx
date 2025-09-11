import { createFileRoute, Link } from "@tanstack/react-router";
import logo from "../logo.svg";

export const Route = createFileRoute("/")({
    component: App,
});

function App() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 py-16">
                <div className="text-center">
                    <div className="mb-8">
                        <img
                            src={logo}
                            className="h-32 w-32 mx-auto mb-6 animate-[spin_20s_linear_infinite]"
                            alt="logo"
                        />
                        <h1 className="text-5xl font-bold text-gray-900 mb-4">
                            Mortgage Calculator
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                            Calculate your monthly mortgage payment, view
                            amortization schedules, and save your calculations
                            to Google Sheets for easy sharing and analysis.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                        <Link
                            to="/mortgage-calculator"
                            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
                        >
                            Start Calculating
                        </Link>
                        <a
                            href="https://github.com/your-username/mortgage-calculator"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gray-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-700 transition-colors shadow-lg"
                        >
                            View on GitHub
                        </a>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <div className="bg-white rounded-lg shadow-lg p-6">
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
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                Comprehensive Calculations
                            </h3>
                            <p className="text-gray-600">
                                Calculate principal, interest, taxes, insurance,
                                PMI, and HOA fees for accurate monthly payments.
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg p-6">
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
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                Amortization Schedule
                            </h3>
                            <p className="text-gray-600">
                                View detailed payment schedule showing principal
                                and interest breakdown for each payment.
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg p-6">
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
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                Google Sheets Integration
                            </h3>
                            <p className="text-gray-600">
                                Save your calculations to Google Sheets with
                                formulas for easy sharing and further analysis.
                            </p>
                        </div>
                    </div>

                    <div className="mt-16 text-center">
                        <p className="text-gray-500 mb-4">
                            Built with React, TanStack Router, and Google Sheets
                            API
                        </p>
                        <div className="flex justify-center space-x-6 text-sm text-gray-400">
                            <a
                                href="https://reactjs.org"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-gray-600 transition-colors"
                            >
                                React
                            </a>
                            <a
                                href="https://tanstack.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-gray-600 transition-colors"
                            >
                                TanStack
                            </a>
                            <a
                                href="https://developers.google.com/sheets"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-gray-600 transition-colors"
                            >
                                Google Sheets API
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
