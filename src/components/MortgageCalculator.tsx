import { useState, useEffect, useCallback, useMemo, memo, useRef } from "react";
import {
    MortgageInputs,
    MortgageCalculation,
    AmortizationEntry,
    MortgageCalculator,
    MortgageUtils,
} from "../lib/mortgage-calculator";

// Constants
const DEFAULT_INPUTS: MortgageInputs = {
    loanAmount: 300000,
    interestRate: 6.5,
    loanTermYears: 30,
    propertyTaxAnnual: 3600,
    homeInsuranceAnnual: 1200,
    pmiRate: 0.5,
    hoaFees: 0,
    downPayment: 60000,
    closingCosts: 0,
};

const LOAN_TERM_OPTIONS = [
    { value: 15, label: "15 years" },
    { value: 20, label: "20 years" },
    { value: 25, label: "25 years" },
    { value: 30, label: "30 years" },
] as const;

const AMORTIZATION_DISPLAY_LIMIT = 12;

interface MortgageCalculatorProps {
    readonly onCalculationComplete?: (
        calculation: MortgageCalculation,
        amortization: AmortizationEntry[]
    ) => void;
    readonly initialInputs?: Partial<MortgageInputs>;
}

interface CalculationResult {
    calculation: MortgageCalculation;
    amortization: AmortizationEntry[];
}

interface CalculationError {
    error: string;
}

const MortgageCalculatorComponent = memo(function MortgageCalculatorComponent({
    onCalculationComplete,
    initialInputs,
}: MortgageCalculatorProps) {
    const [inputs, setInputs] = useState<MortgageInputs>({
        ...DEFAULT_INPUTS,
        ...initialInputs,
    });

    const [calculation, setCalculation] = useState<MortgageCalculation | null>(
        null
    );
    const [amortizationTable, setAmortizationTable] = useState<
        AmortizationEntry[]
    >([]);
    const [showAmortization, setShowAmortization] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);
    const [calculationError, setCalculationError] = useState<string | null>(
        null
    );

    // Use ref to store the latest callback without causing re-renders
    const onCalculationCompleteRef = useRef(onCalculationComplete);
    onCalculationCompleteRef.current = onCalculationComplete;

    // Memoize expensive calculations to prevent unnecessary recalculations
    const validationErrors = useMemo(
        () => MortgageUtils.validateInputs(inputs),
        [inputs]
    );

    const calculationResult = useMemo(():
        | CalculationResult
        | CalculationError
        | null => {
        if (validationErrors.length > 0) {
            return null;
        }

        try {
            const calculation = MortgageCalculator.calculateMortgage(inputs);
            const amortization =
                MortgageCalculator.generateAmortizationTable(inputs);
            return { calculation, amortization };
        } catch (error) {
            console.error("Calculation error:", error);
            return {
                error: "Error calculating mortgage. Please check your inputs.",
            };
        }
    }, [inputs, validationErrors]);

    // Update state when calculations change
    useEffect(() => {
        if (calculationResult && "error" in calculationResult) {
            setCalculationError(calculationResult.error);
            setCalculation(null);
            setAmortizationTable([]);
            setIsCalculating(false);
        } else if (calculationResult && "calculation" in calculationResult) {
            setCalculationError(null); // Clear calculation errors on success
            setCalculation(calculationResult.calculation);
            setAmortizationTable(calculationResult.amortization);
            setIsCalculating(false);
            if (onCalculationCompleteRef.current) {
                onCalculationCompleteRef.current(
                    calculationResult.calculation,
                    calculationResult.amortization
                );
            }
        } else {
            // calculationResult is null (validation errors)
            setCalculationError(null);
            setCalculation(null);
            setAmortizationTable([]);
            setIsCalculating(false);
        }
    }, [calculationResult]);

    const handleInputChange = (
        field: keyof MortgageInputs,
        value: string | number
    ) => {
        const numericValue =
            typeof value === "string" ? parseFloat(value) || 0 : value;
        setInputs((prev) => ({
            ...prev,
            [field]: numericValue,
        }));
    };

    // Memoize formatting functions to prevent unnecessary re-renders
    const formatCurrency = useCallback(
        (amount: number) => MortgageUtils.formatCurrency(amount),
        []
    );
    const formatPercentage = useCallback(
        (rate: number) => MortgageUtils.formatPercentage(rate),
        []
    );

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-base-content mb-2">
                    Mortgage Calculator
                </h1>
                <p className="text-base-content/70">
                    Calculate your monthly payment, total costs, and view
                    amortization schedule
                </p>
            </div>

            {(validationErrors.length > 0 || calculationError) && (
                <div
                    className="alert alert-error"
                    role="alert"
                    aria-live="polite"
                >
                    <h3 className="font-semibold mb-2">
                        Please fix the following errors:
                    </h3>
                    <ul className="list-disc list-inside space-y-1">
                        {validationErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                        {calculationError && (
                            <li key="calculation-error">{calculationError}</li>
                        )}
                    </ul>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Form */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title text-2xl font-semibold mb-6">
                            Loan Details
                        </h2>

                        <div className="space-y-4">
                            {/* Purchase Price */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">
                                        Purchase Price
                                    </span>
                                </label>
                                <div className="flex border border-base-300 rounded-md overflow-hidden">
                                    {/* Dollar amount section - larger */}
                                    <div className="flex-[2] px-3 py-2 bg-base-100 flex items-center">
                                        <input
                                            id="purchase-price"
                                            type="number"
                                            value={
                                                inputs.loanAmount +
                                                inputs.downPayment
                                            }
                                            onChange={(e) => {
                                                const purchasePrice =
                                                    parseFloat(
                                                        e.target.value
                                                    ) || 0;
                                                const newLoanAmount = Math.max(
                                                    0,
                                                    purchasePrice -
                                                        inputs.downPayment
                                                );
                                                handleInputChange(
                                                    "loanAmount",
                                                    newLoanAmount
                                                );
                                            }}
                                            className="w-full border-none outline-none bg-transparent text-base-content [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            placeholder="400000"
                                            aria-describedby="purchase-price-help"
                                        />
                                    </div>
                                    {/* Divider */}
                                    <div className="w-px bg-base-300"></div>
                                    {/* Monthly payment estimate section - smaller */}
                                    <div className="flex-[1] px-3 py-2 bg-base-100 flex items-center justify-center">
                                        <span className="text-base-content text-sm">
                                            Est. Payment
                                        </span>
                                    </div>
                                </div>
                                <div
                                    id="purchase-price-help"
                                    className="sr-only"
                                >
                                    Enter the total purchase price of the
                                    property
                                </div>
                            </div>

                            {/* Down Payment */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">
                                        Down payment
                                        <span className="ml-2 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-primary bg-primary/10 rounded-full">
                                            i
                                        </span>
                                    </span>
                                </label>
                                <div className="flex border border-base-300 rounded-md overflow-hidden">
                                    {/* Dollar amount section - larger */}
                                    <div className="flex-[2] px-3 py-2 bg-base-100 flex items-center">
                                        <input
                                            type="number"
                                            value={inputs.downPayment}
                                            onChange={(e) => {
                                                const newDownPayment =
                                                    parseFloat(
                                                        e.target.value
                                                    ) || 0;
                                                const purchasePrice =
                                                    inputs.loanAmount +
                                                    inputs.downPayment;
                                                const maxDownPayment =
                                                    purchasePrice; // Can't exceed purchase price
                                                const clampedDownPayment =
                                                    Math.min(
                                                        newDownPayment,
                                                        maxDownPayment
                                                    );
                                                handleInputChange(
                                                    "downPayment",
                                                    clampedDownPayment
                                                );
                                            }}
                                            className="w-full border-none outline-none bg-transparent text-base-content [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            placeholder="80000"
                                        />
                                    </div>
                                    {/* Divider */}
                                    <div className="w-px bg-base-300"></div>
                                    {/* Percentage section - smaller */}
                                    <div className="flex-[1] px-3 py-2 bg-base-100 flex items-center justify-center">
                                        <input
                                            type="number"
                                            value={Math.round(
                                                (inputs.downPayment /
                                                    (inputs.loanAmount +
                                                        inputs.downPayment)) *
                                                    100
                                            )}
                                            onChange={(e) => {
                                                const percentage =
                                                    parseFloat(
                                                        e.target.value
                                                    ) || 0;
                                                const purchasePrice =
                                                    inputs.loanAmount +
                                                    inputs.downPayment;
                                                const newDownPayment =
                                                    (percentage / 100) *
                                                    purchasePrice;
                                                const maxDownPayment =
                                                    purchasePrice;
                                                const clampedDownPayment =
                                                    Math.min(
                                                        newDownPayment,
                                                        maxDownPayment
                                                    );
                                                handleInputChange(
                                                    "downPayment",
                                                    clampedDownPayment
                                                );
                                            }}
                                            className="w-full border-none outline-none bg-transparent text-gray-900 text-center"
                                            placeholder="20"
                                        />
                                        <span className="text-gray-900 ml-1">
                                            %
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Loan Amount (calculated) */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">
                                        Loan Amount
                                    </span>
                                </label>
                                <div className="flex border border-base-300 rounded-md overflow-hidden bg-base-200">
                                    {/* Dollar amount section - larger */}
                                    <div className="flex-[2] px-3 py-2 flex items-center">
                                        <span className="text-base-content">
                                            {formatCurrency(inputs.loanAmount)}
                                        </span>
                                    </div>
                                    {/* Divider */}
                                    <div className="w-px bg-base-300"></div>
                                    {/* LTV section - smaller */}
                                    <div className="flex-[1] px-3 py-2 flex items-center justify-center">
                                        <span className="text-base-content">
                                            {inputs.loanAmount > 0
                                                ? `${Math.round((inputs.loanAmount / (inputs.loanAmount + inputs.downPayment)) * 100)}% LTV`
                                                : "Cash"}
                                        </span>
                                    </div>
                                </div>
                                {inputs.loanAmount === 0 && (
                                    <p className="text-sm text-success mt-1">
                                        💰 Cash purchase - no mortgage needed!
                                    </p>
                                )}
                            </div>

                            {/* Interest Rate */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">
                                        Interest Rate (%)
                                    </span>
                                </label>
                                <div className="flex border border-base-300 rounded-md overflow-hidden">
                                    {/* Annual rate section - larger */}
                                    <div className="flex-[2] px-3 py-2 bg-base-100 flex items-center">
                                        <input
                                            type="number"
                                            step="0.001"
                                            value={inputs.interestRate}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "interestRate",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full border-none outline-none bg-transparent text-base-content [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            placeholder="6.5"
                                        />
                                    </div>
                                    {/* Divider */}
                                    <div className="w-px bg-base-300"></div>
                                    {/* Monthly rate section - smaller */}
                                    <div className="flex-[1] px-3 py-2 bg-base-100 flex items-center justify-center">
                                        <span className="text-gray-900 text-sm">
                                            {(inputs.interestRate / 12).toFixed(
                                                4
                                            )}
                                            % mo.
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Loan Term */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">
                                        Loan Term (Years)
                                    </span>
                                </label>
                                <select
                                    value={inputs.loanTermYears}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "loanTermYears",
                                            parseInt(e.target.value)
                                        )
                                    }
                                    className="select select-bordered w-full"
                                >
                                    {LOAN_TERM_OPTIONS.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <h3 className="text-xl font-semibold text-base-content mt-8 mb-4">
                            Additional Costs
                        </h3>

                        <div className="space-y-4">
                            {/* Property Tax */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">
                                        Property Tax (Annual)
                                    </span>
                                </label>
                                <div className="flex border border-base-300 rounded-md overflow-hidden">
                                    {/* Annual amount section - larger */}
                                    <div className="flex-[2] px-3 py-2 bg-base-100 flex items-center">
                                        <input
                                            type="number"
                                            value={inputs.propertyTaxAnnual}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "propertyTaxAnnual",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full border-none outline-none bg-transparent text-base-content [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            placeholder="3600"
                                        />
                                    </div>
                                    {/* Divider */}
                                    <div className="w-px bg-base-300"></div>
                                    {/* Monthly amount section - smaller */}
                                    <div className="flex-[1] px-3 py-2 bg-base-100 flex items-center justify-center">
                                        <span className="text-gray-900 text-sm">
                                            {formatCurrency(
                                                inputs.propertyTaxAnnual / 12
                                            )}
                                            /mo
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Home Insurance */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">
                                        Home Insurance (Annual)
                                    </span>
                                </label>
                                <div className="flex border border-base-300 rounded-md overflow-hidden">
                                    {/* Annual amount section - larger */}
                                    <div className="flex-[2] px-3 py-2 bg-base-100 flex items-center">
                                        <input
                                            type="number"
                                            value={inputs.homeInsuranceAnnual}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "homeInsuranceAnnual",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full border-none outline-none bg-transparent text-base-content [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            placeholder="1200"
                                        />
                                    </div>
                                    {/* Divider */}
                                    <div className="w-px bg-base-300"></div>
                                    {/* Monthly amount section - smaller */}
                                    <div className="flex-[1] px-3 py-2 bg-base-100 flex items-center justify-center">
                                        <span className="text-gray-900 text-sm">
                                            {formatCurrency(
                                                inputs.homeInsuranceAnnual / 12
                                            )}
                                            /mo
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* PMI Rate */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">
                                        PMI Rate (%) - Only if down payment &lt;
                                        20%
                                    </span>
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={inputs.pmiRate || ""}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "pmiRate",
                                            e.target.value
                                                ? parseFloat(e.target.value)
                                                : 0
                                        )
                                    }
                                    className="input input-bordered w-full"
                                    placeholder="0.5"
                                />
                            </div>

                            {/* HOA Fees */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">
                                        HOA Fees (Monthly)
                                    </span>
                                </label>
                                <div className="flex border border-base-300 rounded-md overflow-hidden">
                                    {/* Monthly amount section - larger */}
                                    <div className="flex-[2] px-3 py-2 bg-base-100 flex items-center">
                                        <input
                                            type="number"
                                            value={inputs.hoaFees || ""}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "hoaFees",
                                                    e.target.value
                                                        ? parseFloat(
                                                              e.target.value
                                                          )
                                                        : 0
                                                )
                                            }
                                            className="w-full border-none outline-none bg-transparent text-base-content [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            placeholder="0"
                                        />
                                    </div>
                                    {/* Divider */}
                                    <div className="w-px bg-base-300"></div>
                                    {/* Annual amount section - smaller */}
                                    <div className="flex-[1] px-3 py-2 bg-base-100 flex items-center justify-center">
                                        <span className="text-gray-900 text-sm">
                                            {formatCurrency(
                                                (inputs.hoaFees || 0) * 12
                                            )}
                                            /yr
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Closing Costs */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">
                                        Closing Costs
                                    </span>
                                </label>
                                <div className="flex border border-base-300 rounded-md overflow-hidden">
                                    {/* Total amount section - larger */}
                                    <div className="flex-[2] px-3 py-2 bg-base-100 flex items-center">
                                        <input
                                            type="number"
                                            value={inputs.closingCosts || ""}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "closingCosts",
                                                    e.target.value
                                                        ? parseFloat(
                                                              e.target.value
                                                          )
                                                        : 0
                                                )
                                            }
                                            className="w-full border-none outline-none bg-transparent text-base-content [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            placeholder="0"
                                        />
                                    </div>
                                    {/* Divider */}
                                    <div className="w-px bg-base-300"></div>
                                    {/* Percentage of loan section - smaller */}
                                    <div className="flex-[1] px-3 py-2 bg-base-100 flex items-center justify-center">
                                        <span className="text-gray-900 text-sm">
                                            {inputs.loanAmount > 0
                                                ? `${(((inputs.closingCosts || 0) / inputs.loanAmount) * 100).toFixed(1)}%`
                                                : "0%"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title text-2xl font-semibold mb-6">
                            Payment Breakdown
                        </h2>

                        {isCalculating ? (
                            <div className="text-center py-8">
                                <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-info bg-info/10">
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-info"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Calculating...
                                </div>
                            </div>
                        ) : calculation ? (
                            <div className="space-y-4">
                                {/* Monthly Payment Breakdown */}
                                <div className="alert alert-info">
                                    <h3 className="text-lg font-semibold mb-3">
                                        Monthly Payment
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-base-content/70">
                                                Principal & Interest:
                                            </span>
                                            <span className="font-semibold">
                                                {formatCurrency(
                                                    calculation.principalAndInterest
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-base-content/70">
                                                Property Tax:
                                            </span>
                                            <span>
                                                {formatCurrency(
                                                    calculation.propertyTaxMonthly
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-base-content/70">
                                                Home Insurance:
                                            </span>
                                            <span>
                                                {formatCurrency(
                                                    calculation.homeInsuranceMonthly
                                                )}
                                            </span>
                                        </div>
                                        {calculation.pmiMonthly > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-base-content/70">
                                                    PMI:
                                                </span>
                                                <span>
                                                    {formatCurrency(
                                                        calculation.pmiMonthly
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                        {calculation.hoaFeesMonthly > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-base-content/70">
                                                    HOA Fees:
                                                </span>
                                                <span>
                                                    {formatCurrency(
                                                        calculation.hoaFeesMonthly
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                        <hr className="border-base-300" />
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total Monthly Payment:</span>
                                            <span className="text-info">
                                                {formatCurrency(
                                                    calculation.totalMonthlyPayment
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Total Costs */}
                                <div className="alert alert-success">
                                    <h3 className="text-lg font-semibold mb-3">
                                        Total Costs
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-base-content/70">
                                                Total Interest:
                                            </span>
                                            <span className="font-semibold">
                                                {formatCurrency(
                                                    calculation.totalInterest
                                                )}
                                            </span>
                                        </div>
                                        {calculation.totalPMI > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-base-content/70">
                                                    Total PMI:
                                                </span>
                                                <span>
                                                    {formatCurrency(
                                                        calculation.totalPMI
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-base-content/70">
                                                Total Payments:
                                            </span>
                                            <span className="font-semibold">
                                                {formatCurrency(
                                                    calculation.totalPayments
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Loan Metrics */}
                                <div className="alert">
                                    <h3 className="text-lg font-semibold mb-3">
                                        Loan Metrics
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-base-content/70">
                                                Loan-to-Value (LTV):
                                            </span>
                                            <span>
                                                {formatPercentage(
                                                    MortgageUtils.calculateLTV(
                                                        calculation.loanAmount,
                                                        calculation.purchasePrice
                                                    )
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-base-content/70">
                                                Monthly Rate:
                                            </span>
                                            <span>
                                                {formatPercentage(
                                                    calculation.monthlyRate *
                                                        100
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-base-content/70">
                                                Number of Payments:
                                            </span>
                                            <span>
                                                {calculation.loanTermYears * 12}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Amortization Table Toggle */}
                                {inputs.loanAmount > 0 && (
                                    <div className="text-center">
                                        <button
                                            onClick={() =>
                                                setShowAmortization(
                                                    !showAmortization
                                                )
                                            }
                                            className="btn btn-primary"
                                        >
                                            {showAmortization ? "Hide" : "Show"}{" "}
                                            Amortization Table
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center text-base-content/60 py-8">
                                {inputs.loanAmount === 0
                                    ? "Cash purchase - no mortgage payment required"
                                    : "Enter loan details to see calculations"}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Amortization Table */}
            {showAmortization && amortizationTable.length > 0 && (
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title text-2xl font-semibold mb-6">
                            Amortization Schedule
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Payment #</th>
                                        <th>Date</th>
                                        <th>Beginning Balance</th>
                                        <th>Payment</th>
                                        <th>Principal</th>
                                        <th>Interest</th>
                                        <th>Ending Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {amortizationTable
                                        .slice(0, AMORTIZATION_DISPLAY_LIMIT)
                                        .map((entry) => (
                                            <tr key={entry.paymentNumber}>
                                                <td>{entry.paymentNumber}</td>
                                                <td>
                                                    {new Date(
                                                        entry.paymentDate
                                                    ).toLocaleDateString()}
                                                </td>
                                                <td>
                                                    {formatCurrency(
                                                        entry.beginningBalance
                                                    )}
                                                </td>
                                                <td>
                                                    {formatCurrency(
                                                        entry.monthlyPayment
                                                    )}
                                                </td>
                                                <td>
                                                    {formatCurrency(
                                                        entry.principalPayment
                                                    )}
                                                </td>
                                                <td>
                                                    {formatCurrency(
                                                        entry.interestPayment
                                                    )}
                                                </td>
                                                <td>
                                                    {formatCurrency(
                                                        entry.endingBalance
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                            {amortizationTable.length >
                                AMORTIZATION_DISPLAY_LIMIT && (
                                <div className="text-center mt-4 text-base-content/60">
                                    Showing first {AMORTIZATION_DISPLAY_LIMIT}{" "}
                                    payments of {amortizationTable.length} total
                                    payments
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default MortgageCalculatorComponent;
