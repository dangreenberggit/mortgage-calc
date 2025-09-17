import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../lib/theme-context";
import { mockConsole } from "../test/setup";

// Simple test component
function SimpleThemeTest() {
    const { theme, setTheme } = useTheme();

    return (
        <div>
            <div data-testid="current-theme">{theme}</div>
            <div data-testid="dom-theme">
                {typeof document !== "undefined"
                    ? document.documentElement.getAttribute("data-theme")
                    : "N/A"}
            </div>
            <button
                data-testid="set-caramel"
                onClick={() => setTheme("caramellatte")}
            >
                Set Caramel
            </button>
            <button data-testid="set-luxury" onClick={() => setTheme("luxury")}>
                Set Luxury
            </button>
            <button
                data-testid="set-halloween"
                onClick={() => setTheme("halloween")}
            >
                Set Halloween
            </button>
        </div>
    );
}

describe("Simple Theme Tests", () => {
    beforeEach(() => {
        // Reset DOM
        document.documentElement.removeAttribute("data-theme");

        // Reset localStorage
        vi.mocked(localStorage.getItem).mockReturnValue(null);
        vi.mocked(localStorage.setItem).mockClear();

        // Reset matchMedia
        vi.mocked(window.matchMedia).mockReturnValue({
            matches: false,
            media: "(prefers-color-scheme: dark)",
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        });

        mockConsole.setup();
    });

    afterEach(() => {
        mockConsole.restore();
    });

    describe("Basic Theme Functionality", () => {
        it("should initialize with default theme", () => {
            render(
                <ThemeProvider>
                    <SimpleThemeTest />
                </ThemeProvider>
            );

            expect(screen.getByTestId("current-theme")).toHaveTextContent(
                "caramellatte"
            );
            expect(document.documentElement.getAttribute("data-theme")).toBe(
                "caramellatte"
            );
        });

        it("should change theme when button is clicked", async () => {
            render(
                <ThemeProvider>
                    <SimpleThemeTest />
                </ThemeProvider>
            );

            expect(screen.getByTestId("current-theme")).toHaveTextContent(
                "caramellatte"
            );

            fireEvent.click(screen.getByTestId("set-luxury"));

            await waitFor(() => {
                expect(screen.getByTestId("current-theme")).toHaveTextContent(
                    "luxury"
                );
                expect(screen.getByTestId("dom-theme")).toHaveTextContent(
                    "luxury"
                );
            });
        });

        it("should update DOM immediately when theme changes", async () => {
            render(
                <ThemeProvider>
                    <SimpleThemeTest />
                </ThemeProvider>
            );

            fireEvent.click(screen.getByTestId("set-halloween"));

            await waitFor(() => {
                expect(
                    document.documentElement.getAttribute("data-theme")
                ).toBe("halloween");
            });
        });

        it("should store theme preference in localStorage", async () => {
            render(
                <ThemeProvider>
                    <SimpleThemeTest />
                </ThemeProvider>
            );

            fireEvent.click(screen.getByTestId("set-luxury"));

            await waitFor(() => {
                expect(localStorage.setItem).toHaveBeenCalledWith(
                    "theme",
                    "luxury"
                );
            });
        });

        it("should cycle through all themes", async () => {
            render(
                <ThemeProvider>
                    <SimpleThemeTest />
                </ThemeProvider>
            );

            // Test caramellatte -> luxury
            fireEvent.click(screen.getByTestId("set-luxury"));
            await waitFor(() => {
                expect(screen.getByTestId("current-theme")).toHaveTextContent(
                    "luxury"
                );
            });

            // Test luxury -> halloween
            fireEvent.click(screen.getByTestId("set-halloween"));
            await waitFor(() => {
                expect(screen.getByTestId("current-theme")).toHaveTextContent(
                    "halloween"
                );
            });

            // Test halloween -> caramellatte
            fireEvent.click(screen.getByTestId("set-caramel"));
            await waitFor(() => {
                expect(screen.getByTestId("current-theme")).toHaveTextContent(
                    "caramellatte"
                );
            });
        });

        it("should reject invalid themes", async () => {
            const InvalidThemeTest = () => {
                const { theme, setTheme } = useTheme();

                return (
                    <div>
                        <div data-testid="current-theme">{theme}</div>
                        <button
                            data-testid="set-invalid"
                            onClick={() => setTheme("invalid-theme" as any)}
                        >
                            Set Invalid
                        </button>
                    </div>
                );
            };

            render(
                <ThemeProvider>
                    <InvalidThemeTest />
                </ThemeProvider>
            );

            const initialTheme =
                screen.getByTestId("current-theme").textContent;

            fireEvent.click(screen.getByTestId("set-invalid"));

            // Theme should remain unchanged
            expect(screen.getByTestId("current-theme")).toHaveTextContent(
                initialTheme!
            );
            expect(document.documentElement.getAttribute("data-theme")).toBe(
                initialTheme
            );
        });
    });

    describe("Theme Persistence", () => {
        it("should load theme from localStorage", () => {
            vi.mocked(localStorage.getItem).mockReturnValue("halloween");

            render(
                <ThemeProvider>
                    <SimpleThemeTest />
                </ThemeProvider>
            );

            expect(screen.getByTestId("current-theme")).toHaveTextContent(
                "halloween"
            );
            expect(document.documentElement.getAttribute("data-theme")).toBe(
                "halloween"
            );
        });

        it("should use system theme when no stored theme", () => {
            vi.mocked(window.matchMedia).mockReturnValue({
                matches: true, // dark mode
                media: "(prefers-color-scheme: dark)",
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            });

            render(
                <ThemeProvider>
                    <SimpleThemeTest />
                </ThemeProvider>
            );

            expect(screen.getByTestId("current-theme")).toHaveTextContent(
                "luxury"
            );
            expect(document.documentElement.getAttribute("data-theme")).toBe(
                "luxury"
            );
        });
    });

    describe("Error Handling", () => {
        it("should handle localStorage errors gracefully", async () => {
            vi.mocked(localStorage.setItem).mockImplementation(() => {
                throw new Error("Storage quota exceeded");
            });

            render(
                <ThemeProvider>
                    <SimpleThemeTest />
                </ThemeProvider>
            );

            fireEvent.click(screen.getByTestId("set-luxury"));

            await waitFor(() => {
                // Theme should still change despite localStorage error
                expect(screen.getByTestId("current-theme")).toHaveTextContent(
                    "luxury"
                );
                expect(
                    document.documentElement.getAttribute("data-theme")
                ).toBe("luxury");

                // Theme should still be applied despite localStorage error
                expect(
                    document.documentElement.getAttribute("data-theme")
                ).toBe("luxury");
            });
        });
    });
});
