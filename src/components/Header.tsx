import { Link } from "@tanstack/react-router";

export default function Header() {
    return (
        <header className="navbar">
            <div className="navbar-start">
                <Link to="/" className="btn btn-ghost text-xl">
                    Mortgage Calculator
                </Link>
            </div>
            <div className="navbar-center">
                <ul className="menu menu-horizontal">
                    <li>
                        <Link to="/demo/start/server-funcs">
                            Server Functions
                        </Link>
                    </li>
                    <li>
                        <Link to="/demo/start/api-request">API Request</Link>
                    </li>
                    <li>
                        <Link to="/demo/daisyui">DaisyUI Demo</Link>
                    </li>
                </ul>
            </div>
        </header>
    );
}
