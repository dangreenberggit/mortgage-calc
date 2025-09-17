import { Link } from "@tanstack/react-router";
import { useTheme } from "../lib/theme-context";

export default function Header() {
    const { theme, setTheme } = useTheme();

    const themes = [
        { name: "caramellatte", label: "Caramel Latte", icon: "☕" },
        { name: "luxury", label: "Luxury", icon: "💎" },
        { name: "halloween", label: "Halloween", icon: "🎃" },
    ] as const;

    const handleThemeChange = (themeName: string) => {
        setTheme(themeName as any);
    };

    return (
        <header className="navbar bg-base-100 shadow-lg">
            <div className="navbar-start">
                <Link to="/" className="btn btn-ghost text-xl">
                    Mortgage Calculator
                </Link>
            </div>
            <div className="navbar-end">
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost">
                        <span className="text-lg">
                            {themes.find((t) => t.name === theme)?.icon}
                        </span>
                        <span className="hidden sm:inline ml-2">
                            {themes.find((t) => t.name === theme)?.label}
                        </span>
                        <svg
                            className="w-4 h-4 ml-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </div>
                    <ul
                        tabIndex={0}
                        className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-52 z-50"
                    >
                        {themes.map((themeOption) => (
                            <li key={themeOption.name}>
                                <button
                                    onClick={() =>
                                        handleThemeChange(themeOption.name)
                                    }
                                    className={`flex items-center gap-3 ${
                                        theme === themeOption.name
                                            ? "active"
                                            : ""
                                    }`}
                                >
                                    <span className="text-lg">
                                        {themeOption.icon}
                                    </span>
                                    <span>{themeOption.label}</span>
                                    {theme === themeOption.name && (
                                        <span className="ml-auto text-primary">
                                            ✓
                                        </span>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </header>
    );
}
