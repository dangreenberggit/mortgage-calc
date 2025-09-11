import {
    MortgageInputs,
    MortgageCalculation,
    AmortizationEntry,
} from "./mortgage-calculator";
import { GoogleSheetsService } from "./google-sheets";

export class GoogleSheetsExportService {
    private sheetsService: GoogleSheetsService;

    constructor(sheetsService: GoogleSheetsService) {
        this.sheetsService = sheetsService;
    }

    /**
     * Export mortgage calculation to a simple Google Sheets spreadsheet
     */
    async exportMortgageCalculation(
        inputs: MortgageInputs,
        calculation: MortgageCalculation,
        amortizationTable: AmortizationEntry[],
        scenarioName: string
    ): Promise<{ spreadsheetId: string; url: string }> {
        try {
            // Create a new spreadsheet
            const spreadsheet = await this.sheetsService[
                "sheets"
            ].spreadsheets.create({
                resource: {
                    properties: {
                        title: `Mortgage Calculator - ${scenarioName}`,
                    },
                    sheets: [
                        {
                            properties: {
                                title: "Summary",
                                gridProperties: {
                                    rowCount: 50,
                                    columnCount: 4,
                                },
                            },
                        },
                        {
                            properties: {
                                title: "Amortization",
                                gridProperties: {
                                    rowCount: 500,
                                    columnCount: 8,
                                },
                            },
                        },
                    ],
                },
            });

            const spreadsheetId = spreadsheet.data.spreadsheetId!;

            // Populate summary sheet
            await this.populateSummarySheet(spreadsheetId, inputs, calculation);

            // Populate amortization sheet
            await this.populateAmortizationSheet(
                spreadsheetId,
                amortizationTable
            );

            const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

            return { spreadsheetId, url };
        } catch (error) {
            console.error("Error exporting to Google Sheets:", error);
            throw error;
        }
    }

    /**
     * Populate the summary sheet with calculation results
     */
    private async populateSummarySheet(
        spreadsheetId: string,
        inputs: MortgageInputs,
        calculation: MortgageCalculation
    ): Promise<void> {
        const summaryData = [
            ["Mortgage Calculator Summary", "", "", ""],
            ["", "", "", ""],
            ["Loan Details", "", "", ""],
            ["Purchase Price", calculation.purchasePrice, "", ""],
            ["Down Payment", inputs.downPayment, "", ""],
            ["Loan Amount", inputs.loanAmount, "", ""],
            ["Interest Rate", `${inputs.interestRate}%`, "", ""],
            ["Loan Term", `${inputs.loanTermYears} years`, "", ""],
            ["", "", "", ""],
            ["Monthly Payments", "", "", ""],
            ["Principal & Interest", calculation.principalAndInterest, "", ""],
            ["Property Tax", calculation.propertyTaxMonthly, "", ""],
            ["Home Insurance", calculation.homeInsuranceMonthly, "", ""],
            ["PMI", calculation.pmiMonthly, "", ""],
            ["HOA Fees", calculation.hoaFeesMonthly, "", ""],
            ["Total Monthly Payment", calculation.totalMonthlyPayment, "", ""],
            ["", "", "", ""],
            ["Total Costs", "", "", ""],
            ["Total Interest", calculation.totalInterest, "", ""],
            ["Total PMI", calculation.totalPMI, "", ""],
            ["Total Payments", calculation.totalPayments, "", ""],
            ["", "", "", ""],
            ["Loan Metrics", "", "", ""],
            [
                "Loan-to-Value (LTV)",
                `${((inputs.loanAmount / calculation.purchasePrice) * 100).toFixed(2)}%`,
                "",
                "",
            ],
            [
                "Monthly Rate",
                `${(calculation.monthlyRate * 100).toFixed(4)}%`,
                "",
                "",
            ],
            ["Number of Payments", calculation.loanTermYears * 12, "", ""],
        ];

        await this.sheetsService.writeRange("Summary!A1:D27", summaryData);
    }

    /**
     * Populate the amortization sheet
     */
    private async populateAmortizationSheet(
        spreadsheetId: string,
        amortizationTable: AmortizationEntry[]
    ): Promise<void> {
        // Headers
        const headers = [
            [
                "Payment #",
                "Date",
                "Beginning Balance",
                "Payment",
                "Principal",
                "Interest",
                "Ending Balance",
                "Cumulative Interest",
            ],
        ];

        await this.sheetsService.writeRange("Amortization!A1:H1", headers);

        // Data (limit to first 100 payments to avoid API limits)
        const limitedData = amortizationTable
            .slice(0, 100)
            .map((entry) => [
                entry.paymentNumber,
                entry.paymentDate,
                entry.beginningBalance,
                entry.monthlyPayment,
                entry.principalPayment,
                entry.interestPayment,
                entry.endingBalance,
                entry.cumulativeInterest,
            ]);

        if (limitedData.length > 0) {
            await this.sheetsService.writeRange(
                `Amortization!A2:H${1 + limitedData.length}`,
                limitedData
            );
        }

        // Add note if truncated
        if (amortizationTable.length > 100) {
            await this.sheetsService.writeRange(
                `Amortization!A${2 + limitedData.length}:H${2 + limitedData.length}`,
                [
                    [
                        "Note: Showing first 100 payments only",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                    ],
                ]
            );
        }
    }
}
