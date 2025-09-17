import "@testing-library/jest-dom";
import { vi } from "vitest";
import "../styles.css";

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};

// Mock matchMedia
const matchMediaMock = vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
}));

// Setup mocks when DOM is available
if (typeof window !== "undefined") {
    Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
    });

    Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: matchMediaMock,
    });
}

// Simple console mock for testing
export const mockConsole = {
    setup() {
        // No-op since we removed debug logging
    },
    restore() {
        // No-op since we removed debug logging
    },
};
