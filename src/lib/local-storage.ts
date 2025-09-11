import {
    MortgageInputs,
    MortgageCalculation,
    AmortizationEntry,
} from "./mortgage-calculator";

export interface SavedScenario {
    id: string;
    name: string;
    inputs: MortgageInputs;
    calculation: MortgageCalculation;
    amortization: AmortizationEntry[];
    createdAt: string;
    updatedAt: string;
}

export class LocalStorageService {
    private static readonly STORAGE_KEY = "mortgage-calculator-scenarios";

    /**
     * Save a mortgage calculation scenario
     */
    static saveScenario(
        name: string,
        inputs: MortgageInputs,
        calculation: MortgageCalculation,
        amortization: AmortizationEntry[]
    ): SavedScenario {
        const scenarios = this.getAllScenarios();
        const now = new Date().toISOString();

        const scenario: SavedScenario = {
            id: `scenario_${Date.now()}`,
            name,
            inputs,
            calculation,
            amortization,
            createdAt: now,
            updatedAt: now,
        };

        scenarios.push(scenario);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(scenarios));

        return scenario;
    }

    /**
     * Get all saved scenarios
     */
    static getAllScenarios(): SavedScenario[] {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error("Error reading scenarios from localStorage:", error);
            return [];
        }
    }

    /**
     * Get a specific scenario by ID
     */
    static getScenario(id: string): SavedScenario | null {
        const scenarios = this.getAllScenarios();
        return scenarios.find((s) => s.id === id) || null;
    }

    /**
     * Update an existing scenario
     */
    static updateScenario(
        id: string,
        name: string,
        inputs: MortgageInputs,
        calculation: MortgageCalculation,
        amortization: AmortizationEntry[]
    ): SavedScenario | null {
        const scenarios = this.getAllScenarios();
        const index = scenarios.findIndex((s) => s.id === id);

        if (index === -1) return null;

        const updatedScenario: SavedScenario = {
            ...scenarios[index],
            name,
            inputs,
            calculation,
            amortization,
            updatedAt: new Date().toISOString(),
        };

        scenarios[index] = updatedScenario;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(scenarios));

        return updatedScenario;
    }

    /**
     * Delete a scenario
     */
    static deleteScenario(id: string): boolean {
        const scenarios = this.getAllScenarios();
        const filtered = scenarios.filter((s) => s.id !== id);

        if (filtered.length === scenarios.length) return false;

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
        return true;
    }

    /**
     * Clear all scenarios
     */
    static clearAllScenarios(): void {
        localStorage.removeItem(this.STORAGE_KEY);
    }

    /**
     * Export scenarios to JSON
     */
    static exportScenarios(): string {
        const scenarios = this.getAllScenarios();
        return JSON.stringify(scenarios, null, 2);
    }

    /**
     * Import scenarios from JSON
     */
    static importScenarios(jsonData: string): boolean {
        try {
            const scenarios = JSON.parse(jsonData);
            if (!Array.isArray(scenarios)) return false;

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(scenarios));
            return true;
        } catch (error) {
            console.error("Error importing scenarios:", error);
            return false;
        }
    }
}
