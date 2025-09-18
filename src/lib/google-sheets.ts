import { google } from "googleapis";
import { JWT } from "google-auth-library";

export interface GoogleSheetsConfig {
    clientEmail: string;
    privateKey: string;
    spreadsheetId: string;
}

export interface MortgageCalculationData {
    principal: number;
    interestRate: number;
    loanTermYears: number;
    monthlyPayment: number;
    totalInterest: number;
    totalPayment: number;
    calculationDate: string;
    userId?: string;
}

export class GoogleSheetsService {
    public sheets: any;
    public config: GoogleSheetsConfig;

    constructor(config: GoogleSheetsConfig) {
        this.config = config;
        this.initializeAuth();
    }

    private initializeAuth() {
        const auth = new JWT({
            email: this.config.clientEmail,
            key: this.config.privateKey,
            scopes: [
                "https://www.googleapis.com/auth/spreadsheets",
                "https://www.googleapis.com/auth/drive.file",
            ],
        });

        this.sheets = google.sheets({ version: "v4", auth });
    }

    /**
     * Test connection to Google Sheets
     */
    async testConnection(): Promise<boolean> {
        try {
            const response = await this.sheets.spreadsheets.get({
                spreadsheetId: this.config.spreadsheetId,
                fields: "properties.title",
            });

            console.log(
                "✅ Connected to spreadsheet:",
                response.data.properties.title
            );
            return true;
        } catch (error) {
            console.error("❌ Failed to connect to Google Sheets:", error);
            return false;
        }
    }

    /**
     * Get spreadsheet metadata
     */
    async getSpreadsheetInfo() {
        try {
            const response = await this.sheets.spreadsheets.get({
                spreadsheetId: this.config.spreadsheetId,
                fields: "properties,sheets.properties",
            });

            return {
                title: response.data.properties.title,
                sheets: response.data.sheets.map((sheet: any) => ({
                    id: sheet.properties.sheetId,
                    title: sheet.properties.title,
                    rowCount: sheet.properties.gridProperties.rowCount,
                    columnCount: sheet.properties.gridProperties.columnCount,
                })),
            };
        } catch (error) {
            console.error("Error getting spreadsheet info:", error);
            throw error;
        }
    }

    /**
     * Read data from a specific range
     */
    async readRange(range: string) {
        try {
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.config.spreadsheetId,
                range: range,
            });

            return response.data.values || [];
        } catch (error) {
            console.error("Error reading range:", error);
            throw error;
        }
    }

    /**
     * Write data to a specific range
     */
    async writeRange(range: string, values: any[][]) {
        try {
            const response = await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.config.spreadsheetId,
                range: range,
                valueInputOption: "USER_ENTERED",
                resource: {
                    values: values,
                },
            });

            return response.data;
        } catch (error) {
            console.error("Error writing to range:", error);
            throw error;
        }
    }

    /**
     * Append data to a sheet
     */
    async appendData(sheetName: string, values: any[][]) {
        try {
            const response = await this.sheets.spreadsheets.values.append({
                spreadsheetId: this.config.spreadsheetId,
                range: `${sheetName}!A:Z`,
                valueInputOption: "USER_ENTERED",
                insertDataOption: "INSERT_ROWS",
                resource: {
                    values: values,
                },
            });

            return response.data;
        } catch (error) {
            console.error("Error appending data:", error);
            throw error;
        }
    }

    /**
     * Save mortgage calculation to the master template
     */
    async saveMortgageCalculation(data: MortgageCalculationData) {
        const timestamp = new Date().toISOString();
        const rowData = [
            [
                data.principal,
                data.interestRate,
                data.loanTermYears,
                data.monthlyPayment,
                data.totalInterest,
                data.totalPayment,
                data.calculationDate,
                data.userId || "anonymous",
                timestamp,
            ],
        ];

        try {
            await this.appendData("Calculations", rowData);
            console.log("✅ Mortgage calculation saved to Google Sheets");
            return true;
        } catch (error) {
            console.error("❌ Failed to save mortgage calculation:", error);
            throw error;
        }
    }

    /**
     * Get all mortgage calculations
     */
    async getMortgageCalculations() {
        try {
            const values = await this.readRange("Calculations!A:I");

            if (!values || values.length <= 1) {
                return [];
            }

            // Skip header row and map to objects
            return values.slice(1).map((row: any[]) => ({
                principal: parseFloat(row[0]) || 0,
                interestRate: parseFloat(row[1]) || 0,
                loanTermYears: parseInt(row[2]) || 0,
                monthlyPayment: parseFloat(row[3]) || 0,
                totalInterest: parseFloat(row[4]) || 0,
                totalPayment: parseFloat(row[5]) || 0,
                calculationDate: row[6] || "",
                userId: row[7] || "anonymous",
                timestamp: row[8] || "",
            }));
        } catch (error) {
            console.error("Error getting mortgage calculations:", error);
            throw error;
        }
    }

    /**
     * Create a new user-specific spreadsheet
     */
    async createUserSpreadsheet(userId: string, userName: string) {
        try {
            // Note: Drive API not needed for this implementation
            // const drive = google.drive({
            //     version: "v3",
            //     auth: this.sheets.auth,
            // });

            // Create new spreadsheet
            const spreadsheet = await this.sheets.spreadsheets.create({
                resource: {
                    properties: {
                        title: `Mortgage Calculator - ${userName} (${userId})`,
                    },
                    sheets: [
                        {
                            properties: {
                                title: "Calculations",
                                gridProperties: {
                                    rowCount: 1000,
                                    columnCount: 10,
                                },
                            },
                        },
                    ],
                },
            });

            const spreadsheetId = spreadsheet.data.spreadsheetId!;

            // Set up headers
            await this.writeRange("Calculations!A1:I1", [
                [
                    "Principal",
                    "Interest Rate (%)",
                    "Loan Term (Years)",
                    "Monthly Payment",
                    "Total Interest",
                    "Total Payment",
                    "Calculation Date",
                    "User ID",
                    "Timestamp",
                ],
            ]);

            // Make the spreadsheet accessible to the user (you'll need to implement user email sharing)
            console.log(`✅ Created user spreadsheet: ${spreadsheetId}`);

            return {
                spreadsheetId,
                url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
            };
        } catch (error) {
            console.error("Error creating user spreadsheet:", error);
            throw error;
        }
    }
}

/**
 * Initialize Google Sheets service from environment variables
 */
export function createGoogleSheetsService(): GoogleSheetsService {
    const config: GoogleSheetsConfig = {
        clientEmail: process.env.GOOGLE_CLIENT_EMAIL || "",
        privateKey: (process.env.GOOGLE_PRIVATE_KEY || "").replace(
            /\\n/g,
            "\n"
        ),
        spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID || "",
    };

    if (!config.clientEmail || !config.privateKey || !config.spreadsheetId) {
        throw new Error("Missing required Google Sheets environment variables");
    }

    return new GoogleSheetsService(config);
}
