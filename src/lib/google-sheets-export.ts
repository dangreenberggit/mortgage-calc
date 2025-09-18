import {
    MortgageInputs,
    MortgageCalculation,
    AmortizationEntry,
} from "./mortgage-calculator";
import { GoogleSheetsService } from "./google-sheets";

/**
 * Service for exporting mortgage calculations to Google Sheets
 * Creates new sheets within the master template spreadsheet for each calculation
 */
export class GoogleSheetsExportService {
    private sheetsService: GoogleSheetsService;

    constructor(sheetsService: GoogleSheetsService) {
        this.sheetsService = sheetsService;
    }

    /**
     * Export mortgage calculation to a new sheet in the existing spreadsheet
     *
     * @param inputs - The mortgage input parameters
     * @param calculation - The calculated mortgage results
     * @param amortizationTable - The amortization schedule
     * @param scenarioName - Name for the scenario (will be sanitized for sheet name)
     * @returns Object containing spreadsheet ID, URL, and new sheet ID
     */
    async exportMortgageCalculation(
        inputs: MortgageInputs,
        calculation: MortgageCalculation,
        amortizationTable: AmortizationEntry[],
        scenarioName: string
    ): Promise<{ spreadsheetId: string; url: string; sheetId: number }> {
        try {
            const spreadsheetId = this.sheetsService.config.spreadsheetId;
            const sheetName = `Mortgage_${scenarioName.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}`;

            // Create a new sheet in the existing spreadsheet
            const response =
                await this.sheetsService.sheets.spreadsheets.batchUpdate({
                    spreadsheetId,
                    resource: {
                        requests: [
                            {
                                addSheet: {
                                    properties: {
                                        title: sheetName,
                                        gridProperties: {
                                            rowCount: 200,
                                            columnCount: 10,
                                        },
                                    },
                                },
                            },
                        ],
                    },
                });

            const newSheetId =
                response.data.replies?.[0]?.addSheet?.properties?.sheetId!;

            // Populate the new sheet with summary data
            await this.populateSummarySheet(sheetName, inputs, calculation);

            // Populate amortization data in the same sheet (starting from row 30)
            await this.populateAmortizationSheet(sheetName, amortizationTable);

            const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=${newSheetId}`;

            return { spreadsheetId, url, sheetId: newSheetId };
        } catch (error) {
            console.error("Error exporting to Google Sheets:", error);
            throw error;
        }
    }

    /**
     * Populate the summary sheet with calculation results
     */
    private async populateSummarySheet(
        sheetName: string,
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

        await this.sheetsService.writeRange(`${sheetName}!A1:D27`, summaryData);
    }

    /**
     * Populate the amortization sheet
     */
    private async populateAmortizationSheet(
        sheetName: string,
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

        await this.sheetsService.writeRange(`${sheetName}!A30:H30`, headers);

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
                `${sheetName}!A31:H${30 + limitedData.length}`,
                limitedData
            );
        }

        // Add note if truncated
        if (amortizationTable.length > 100) {
            await this.sheetsService.writeRange(
                `${sheetName}!A${31 + limitedData.length}:H${31 + limitedData.length}`,
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
