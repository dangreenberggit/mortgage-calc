import { createFileRoute } from "@tanstack/react-router";
import { createServerFileRoute } from "@tanstack/react-start/server";
import {
    MortgageInputs,
    MortgageCalculation,
    AmortizationEntry,
} from "../lib/mortgage-calculator";
import { GoogleSheetsExportService } from "../lib/google-sheets-export";
import { createGoogleSheetsService } from "../lib/google-sheets";

export const ServerRoute = createServerFileRoute(
    "/api/google-sheets-export"
).methods({
    POST: async ({ request }) => {
        try {
            const body = await request.json();
            const { inputs, calculation, amortization, scenarioName } = body;

            // Validate required fields
            if (!inputs || !calculation || !amortization || !scenarioName) {
                return new Response(
                    JSON.stringify({ error: "Missing required fields" }),
                    {
                        status: 400,
                        headers: { "Content-Type": "application/json" },
                    }
                );
            }

            // Initialize Google Sheets service
            const sheetsService = createGoogleSheetsService();
            const exportService = new GoogleSheetsExportService(sheetsService);

            // Export to Google Sheets
            const result = await exportService.exportMortgageCalculation(
                inputs as MortgageInputs,
                calculation as MortgageCalculation,
                amortization as AmortizationEntry[],
                scenarioName as string
            );

            return new Response(
                JSON.stringify({
                    success: true,
                    spreadsheetId: result.spreadsheetId,
                    url: result.url,
                }),
                {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                }
            );
        } catch (error) {
            console.error("Google Sheets export error:", error);
            return new Response(
                JSON.stringify({
                    error: "Failed to export to Google Sheets",
                    details:
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
