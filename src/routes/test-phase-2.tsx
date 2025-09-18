/**
 * Phase 2 Validation Route - Google Sheets Integration Test
 *
 * This route provides both API endpoints and a web interface for testing
 * the Google Sheets integration functionality.
 *
 * GET /test-phase-2 - Test Google Sheets connection
 * POST /test-phase-2 - Test Google Sheets export functionality
 */
import { createFileRoute } from "@tanstack/react-router";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { createGoogleSheetsService } from "../lib/google-sheets";
import { GoogleSheetsExportService } from "../lib/google-sheets-export";
import { MortgageInputs, MortgageCalculator } from "../lib/mortgage-calculator";

export const ServerRoute = createServerFileRoute("/test-phase-2").methods({
    GET: async () => {
        try {
            // Test Google Sheets connection
            const sheetsService = createGoogleSheetsService();
            const isConnected = await sheetsService.testConnection();

            if (!isConnected) {
                return new Response(
                    JSON.stringify({
                        phase: 2,
                        status: "failed",
                        error: "Google Sheets connection failed",
                        google_sheets_connected: false,
                        master_template_id: null,
                        test_cell_value: null,
                    }),
                    {
                        status: 500,
                        headers: { "Content-Type": "application/json" },
                    }
                );
            }

            // Get spreadsheet info
            const info = await sheetsService.getSpreadsheetInfo();

            // Test reading a cell (try to read A1 from first sheet)
            let testCellValue = null;
            try {
                const testData = await sheetsService.readRange("A1");
                testCellValue = testData[0]?.[0] || "empty";
            } catch (error) {
                testCellValue = "error reading cell";
            }

            return new Response(
                JSON.stringify({
                    phase: 2,
                    status: "success",
                    google_sheets_connected: true,
                    master_template_id: process.env.GOOGLE_SPREADSHEET_ID,
                    spreadsheet_title: info.title,
                    sheets: info.sheets.map((s: any) => s.title),
                    test_cell_value: testCellValue,
                    timestamp: new Date().toISOString(),
                }),
                {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                }
            );
        } catch (error) {
            return new Response(
                JSON.stringify({
                    phase: 2,
                    status: "error",
                    error:
                        error instanceof Error
                            ? error.message
                            : "Unknown error",
                    google_sheets_connected: false,
                    master_template_id: null,
                    test_cell_value: null,
                }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }
    },
    POST: async () => {
        try {
            // Test Google Sheets export functionality
            const sheetsService = createGoogleSheetsService();
            const exportService = new GoogleSheetsExportService(sheetsService);

            // Create test mortgage data
            const inputs: MortgageInputs = {
                downPayment: 80000,
                loanAmount: 320000,
                interestRate: 6.5,
                loanTermYears: 30,
                propertyTaxAnnual: 4800,
                homeInsuranceAnnual: 1200,
                pmiRate: 0.5,
                hoaFees: 150,
            };

            const calculation = MortgageCalculator.calculateMortgage(inputs);
            const amortizationTable =
                MortgageCalculator.generateAmortizationTable(inputs);

            // Export to Google Sheets
            const result = await exportService.exportMortgageCalculation(
                inputs,
                calculation,
                amortizationTable,
                "Phase 2 Test Export"
            );

            return new Response(
                JSON.stringify({
                    phase: 2,
                    status: "success",
                    export_test: "passed",
                    spreadsheet_id: result.spreadsheetId,
                    spreadsheet_url: result.url,
                    test_data: {
                        monthly_payment: calculation.totalMonthlyPayment,
                        total_interest: calculation.totalInterest,
                        loan_amount: inputs.loanAmount,
                    },
                    timestamp: new Date().toISOString(),
                }),
                {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                }
            );
        } catch (error) {
            return new Response(
                JSON.stringify({
                    phase: 2,
                    status: "error",
                    export_test: "failed",
                    error:
                        error instanceof Error
                            ? error.message
                            : "Unknown error",
                }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }
    },
});

export const Route = createFileRoute("/test-phase-2")({
    component: TestPhase2Component,
});

function TestPhase2Component() {
    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">
                Phase 2: Google Sheets Integration Test
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Connection Test</h2>
                        <p>Test basic Google Sheets API connection</p>
                        <div className="card-actions justify-end">
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    fetch("/test-phase-2")
                                        .then((res) => res.json())
                                        .then((data) => {
                                            alert(
                                                JSON.stringify(data, null, 2)
                                            );
                                        })
                                        .catch((err) => {
                                            alert("Error: " + err.message);
                                        });
                                }}
                            >
                                Test Connection
                            </button>
                        </div>
                    </div>
                </div>

                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Export Test</h2>
                        <p>Test Google Sheets export functionality</p>
                        <div className="card-actions justify-end">
                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    fetch("/test-phase-2", { method: "POST" })
                                        .then((res) => res.json())
                                        .then((data) => {
                                            if (data.status === "success") {
                                                alert(
                                                    `Export successful!\nSpreadsheet URL: ${data.spreadsheet_url}`
                                                );
                                            } else {
                                                alert(
                                                    "Export failed: " +
                                                        data.error
                                                );
                                            }
                                        })
                                        .catch((err) => {
                                            alert("Error: " + err.message);
                                        });
                                }}
                            >
                                Test Export
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Test Results</h3>
                <div className="alert alert-info">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="stroke currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                    </svg>
                    <div>
                        <h4 className="font-bold">Instructions:</h4>
                        <p>
                            Click the buttons above to test the Google Sheets
                            integration. The connection test will verify API
                            access, and the export test will create a new
                            spreadsheet with sample mortgage data.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
