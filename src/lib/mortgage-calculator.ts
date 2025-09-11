export interface MortgageInputs {
    // Loan details
    loanAmount: number;
    interestRate: number; // Annual percentage rate
    loanTermYears: number;

    // Additional monthly costs
    propertyTaxAnnual: number;
    homeInsuranceAnnual: number;
    pmiRate?: number; // Private Mortgage Insurance rate (annual %)
    hoaFees?: number; // Homeowners Association fees (monthly)

    // Down payment
    downPayment: number;

    // Other costs
    closingCosts?: number;
}

export interface MortgageCalculation {
    // Basic loan info
    loanAmount: number;
    downPayment: number;
    purchasePrice: number;

    // Monthly payments
    principalAndInterest: number;
    propertyTaxMonthly: number;
    homeInsuranceMonthly: number;
    pmiMonthly: number;
    hoaFeesMonthly: number;
    totalMonthlyPayment: number;

    // Totals
    totalInterest: number;
    totalPayments: number;
    totalPMI: number;

    // Loan details
    interestRate: number;
    loanTermYears: number;
    monthlyRate: number;
}

export interface AmortizationEntry {
    paymentNumber: number;
    paymentDate: string;
    beginningBalance: number;
    monthlyPayment: number;
    principalPayment: number;
    interestPayment: number;
    endingBalance: number;
    cumulativeInterest: number;
    cumulativePrincipal: number;
}

export class MortgageCalculator {
    /**
     * Calculate monthly mortgage payment (P&I only)
     */
    static calculateMonthlyPayment(
        principal: number,
        annualRate: number,
        termYears: number
    ): number {
        const monthlyRate = annualRate / 100 / 12;
        const numPayments = termYears * 12;

        if (monthlyRate === 0) {
            return principal / numPayments;
        }

        return (
            (principal *
                (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
            (Math.pow(1 + monthlyRate, numPayments) - 1)
        );
    }

    /**
     * Calculate total interest paid over loan term
     */
    static calculateTotalInterest(
        principal: number,
        monthlyPayment: number,
        termYears: number
    ): number {
        const totalPayments = monthlyPayment * termYears * 12;
        return totalPayments - principal;
    }

    /**
     * Calculate PMI monthly payment
     */
    static calculatePMI(
        loanAmount: number,
        pmiRate: number,
        downPaymentPercent: number
    ): number {
        // PMI typically required when down payment < 20%
        if (downPaymentPercent >= 20) {
            return 0;
        }

        // PMI is typically 0.5% to 1% of loan amount annually
        return (loanAmount * pmiRate) / 100 / 12;
    }

    /**
     * Generate complete mortgage calculation
     */
    static calculateMortgage(inputs: MortgageInputs): MortgageCalculation {
        const purchasePrice = inputs.loanAmount + inputs.downPayment;
        const downPaymentPercent = (inputs.downPayment / purchasePrice) * 100;

        // Calculate principal and interest
        const principalAndInterest = this.calculateMonthlyPayment(
            inputs.loanAmount,
            inputs.interestRate,
            inputs.loanTermYears
        );

        // Calculate additional monthly costs
        const propertyTaxMonthly = inputs.propertyTaxAnnual / 12;
        const homeInsuranceMonthly = inputs.homeInsuranceAnnual / 12;
        const pmiMonthly = inputs.pmiRate
            ? this.calculatePMI(
                  inputs.loanAmount,
                  inputs.pmiRate,
                  downPaymentPercent
              )
            : 0;
        const hoaFeesMonthly = inputs.hoaFees || 0;

        // Calculate totals
        const totalMonthlyPayment =
            principalAndInterest +
            propertyTaxMonthly +
            homeInsuranceMonthly +
            pmiMonthly +
            hoaFeesMonthly;

        const totalInterest = this.calculateTotalInterest(
            inputs.loanAmount,
            principalAndInterest,
            inputs.loanTermYears
        );

        const totalPayments = totalMonthlyPayment * inputs.loanTermYears * 12;
        const totalPMI = pmiMonthly * inputs.loanTermYears * 12;

        return {
            loanAmount: inputs.loanAmount,
            downPayment: inputs.downPayment,
            purchasePrice,
            principalAndInterest,
            propertyTaxMonthly,
            homeInsuranceMonthly,
            pmiMonthly,
            hoaFeesMonthly,
            totalMonthlyPayment,
            totalInterest,
            totalPayments,
            totalPMI,
            interestRate: inputs.interestRate,
            loanTermYears: inputs.loanTermYears,
            monthlyRate: inputs.interestRate / 100 / 12,
        };
    }

    /**
     * Generate amortization table
     */
    static generateAmortizationTable(
        inputs: MortgageInputs,
        startDate: Date = new Date()
    ): AmortizationEntry[] {
        const calculation = this.calculateMortgage(inputs);
        const monthlyPayment = calculation.principalAndInterest;
        const monthlyRate = calculation.monthlyRate;
        const numPayments = inputs.loanTermYears * 12;

        const amortizationTable: AmortizationEntry[] = [];
        let balance = inputs.loanAmount;
        let cumulativeInterest = 0;
        let cumulativePrincipal = 0;

        for (let i = 1; i <= numPayments; i++) {
            const interestPayment = balance * monthlyRate;
            const principalPayment = monthlyPayment - interestPayment;
            const endingBalance = Math.max(0, balance - principalPayment);

            cumulativeInterest += interestPayment;
            cumulativePrincipal += principalPayment;

            // Calculate payment date
            const paymentDate = new Date(startDate);
            paymentDate.setMonth(paymentDate.getMonth() + i);

            amortizationTable.push({
                paymentNumber: i,
                paymentDate: paymentDate.toISOString().split("T")[0],
                beginningBalance: balance,
                monthlyPayment,
                principalPayment,
                interestPayment,
                endingBalance,
                cumulativeInterest,
                cumulativePrincipal,
            });

            balance = endingBalance;

            // Stop if balance is paid off
            if (balance <= 0.01) {
                break;
            }
        }

        return amortizationTable;
    }

    /**
     * Calculate how much principal will be paid off by a specific date
     */
    static calculatePrincipalPaidByDate(
        inputs: MortgageInputs,
        targetDate: Date,
        startDate: Date = new Date()
    ): number {
        const amortizationTable = this.generateAmortizationTable(
            inputs,
            startDate
        );
        const targetDateStr = targetDate.toISOString().split("T")[0];

        const entry = amortizationTable.find(
            (entry) => entry.paymentDate === targetDateStr
        );
        return entry ? entry.cumulativePrincipal : 0;
    }

    /**
     * Calculate remaining balance at a specific date
     */
    static calculateRemainingBalance(
        inputs: MortgageInputs,
        targetDate: Date,
        startDate: Date = new Date()
    ): number {
        const amortizationTable = this.generateAmortizationTable(
            inputs,
            startDate
        );
        const targetDateStr = targetDate.toISOString().split("T")[0];

        const entry = amortizationTable.find(
            (entry) => entry.paymentDate === targetDateStr
        );
        return entry ? entry.endingBalance : inputs.loanAmount;
    }

    /**
     * Calculate total interest paid by a specific date
     */
    static calculateInterestPaidByDate(
        inputs: MortgageInputs,
        targetDate: Date,
        startDate: Date = new Date()
    ): number {
        const amortizationTable = this.generateAmortizationTable(
            inputs,
            startDate
        );
        const targetDateStr = targetDate.toISOString().split("T")[0];

        const entry = amortizationTable.find(
            (entry) => entry.paymentDate === targetDateStr
        );
        return entry ? entry.cumulativeInterest : 0;
    }
}

/**
 * Utility functions for formatting and validation
 */
export class MortgageUtils {
    /**
     * Format currency for display
     */
    static formatCurrency(amount: number): string {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    }

    /**
     * Format percentage for display
     */
    static formatPercentage(rate: number): string {
        return `${rate.toFixed(3)}%`;
    }

    /**
     * Validate mortgage inputs
     */
    static validateInputs(inputs: MortgageInputs): string[] {
        const errors: string[] = [];

        // Loan amount can be 0 for cash purchases, so we don't validate it here
        // It's calculated from purchase price - down payment and handled in the UI

        if (inputs.interestRate < 0 || inputs.interestRate > 50) {
            errors.push("Interest rate must be between 0% and 50%");
        }

        if (inputs.loanTermYears <= 0 || inputs.loanTermYears > 50) {
            errors.push("Loan term must be between 1 and 50 years");
        }

        if (inputs.downPayment < 0) {
            errors.push("Down payment cannot be negative");
        }

        // Check if down payment exceeds purchase price (which would make loan amount negative)
        const purchasePrice = inputs.loanAmount + inputs.downPayment;
        if (inputs.downPayment > purchasePrice) {
            errors.push("Down payment cannot be greater than purchase price");
        }

        if (inputs.propertyTaxAnnual < 0) {
            errors.push("Property tax cannot be negative");
        }

        if (inputs.homeInsuranceAnnual < 0) {
            errors.push("Home insurance cannot be negative");
        }

        if (inputs.pmiRate && (inputs.pmiRate < 0 || inputs.pmiRate > 10)) {
            errors.push("PMI rate must be between 0% and 10%");
        }

        if (inputs.hoaFees && inputs.hoaFees < 0) {
            errors.push("HOA fees cannot be negative");
        }

        if (inputs.closingCosts && inputs.closingCosts < 0) {
            errors.push("Closing costs cannot be negative");
        }

        return errors;
    }

    /**
     * Calculate loan-to-value ratio
     */
    static calculateLTV(loanAmount: number, purchasePrice: number): number {
        return (loanAmount / purchasePrice) * 100;
    }

    /**
     * Calculate debt-to-income ratio (simplified)
     */
    static calculateDTI(
        monthlyDebtPayments: number,
        monthlyGrossIncome: number
    ): number {
        return (monthlyDebtPayments / monthlyGrossIncome) * 100;
    }
}
