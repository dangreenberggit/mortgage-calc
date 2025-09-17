import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useRef,
} from "react";

type Theme = "caramellatte" | "luxury" | "halloween";

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Constants to avoid magic strings
const THEMES: Theme[] = ["caramellatte", "luxury", "halloween"];
const STORAGE_KEY = "theme";

// Utility functions
const isValidTheme = (theme: string): theme is Theme => {
    return THEMES.includes(theme as Theme);
};

const getSystemTheme = (): Theme => {
    if (typeof window === "undefined") return "caramellatte";

    try {
        const prefersDark = window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches;
        return prefersDark ? "luxury" : "caramellatte";
    } catch {
        return "caramellatte";
    }
};

const getStoredTheme = (): Theme | null => {
    if (typeof window === "undefined") return null;

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored && isValidTheme(stored) ? stored : null;
    } catch {
        return null;
    }
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    // Initialize with default theme to prevent hydration mismatch
    const [theme, setThemeState] = useState<Theme>("caramellatte");

    // Track if user has manually set a theme
    const hasUserSetTheme = useRef(false);
    const mediaQueryRef = useRef<MediaQueryList | null>(null);
    const handleChangeRef = useRef<((e: MediaQueryListEvent) => void) | null>(
        null
    );

    // Load actual theme after hydration to prevent mismatch
    useEffect(() => {
        const storedTheme = getStoredTheme();
        const systemTheme = getSystemTheme();
        const actualTheme = storedTheme || systemTheme;
        setThemeState(actualTheme);
    }, []);

    // Single effect for initialization and system theme listening
    useEffect(() => {
        // Apply theme to DOM immediately
        document.documentElement.setAttribute("data-theme", theme);

        // Set up system theme listener only once
        if (!mediaQueryRef.current && typeof window !== "undefined") {
            const mediaQuery = window.matchMedia(
                "(prefers-color-scheme: dark)"
            );
            mediaQueryRef.current = mediaQuery;

            const handleChange = (e: MediaQueryListEvent) => {
                // Only auto-switch if user hasn't manually set a theme preference
                if (!hasUserSetTheme.current) {
                    const newTheme = e.matches ? "luxury" : "caramellatte";
                    setThemeState(newTheme);
                    // Apply immediately to prevent flash
                    document.documentElement.setAttribute(
                        "data-theme",
                        newTheme
                    );
                }
            };

            // Store the handler reference for cleanup
            handleChangeRef.current = handleChange;
            mediaQuery.addEventListener("change", handleChange);
        }

        // Cleanup
        return () => {
            if (mediaQueryRef.current && handleChangeRef.current) {
                mediaQueryRef.current.removeEventListener(
                    "change",
                    handleChangeRef.current
                );
            }
        };
    }, [theme]); // Re-run when theme changes to apply to DOM

    const setTheme = (newTheme: Theme) => {
        if (!isValidTheme(newTheme)) {
            console.warn(`Invalid theme: ${newTheme}`);
            return;
        }

        // Update state
        setThemeState(newTheme);

        // Apply to DOM immediately (prevents flash)
        document.documentElement.setAttribute("data-theme", newTheme);

        // Store preference and mark as user-set
        try {
            localStorage.setItem(STORAGE_KEY, newTheme);
            hasUserSetTheme.current = true;
        } catch (error) {
            console.warn("Failed to store theme preference:", error);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
