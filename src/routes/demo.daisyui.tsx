import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

function DaisyUIDemo() {
    useEffect(() => {
        // Theme switching functionality
        const handleThemeChange = (event: Event) => {
            const target = event.target as HTMLElement;
            if (target.hasAttribute("data-set-theme")) {
                const theme = target.getAttribute("data-set-theme");
                if (theme) {
                    document.documentElement.setAttribute("data-theme", theme);
                    localStorage.setItem("theme", theme);
                }
            }
        };

        // Set initial theme from localStorage
        const savedTheme = localStorage.getItem("theme") || "light";
        document.documentElement.setAttribute("data-theme", savedTheme);

        // Add event listeners to theme buttons
        document.addEventListener("click", handleThemeChange);

        return () => {
            document.removeEventListener("click", handleThemeChange);
        };
    }, []);

    return (
        <div className="min-h-screen bg-base-100">
            <div className="navbar bg-base-100 shadow-lg">
                <div className="navbar-start">
                    <Link to="/" className="btn btn-ghost text-xl">
                        ← Back to Home
                    </Link>
                </div>
                <div className="navbar-center">
                    <h1 className="text-2xl font-bold">DaisyUI v5 Demo</h1>
                </div>
                <div className="navbar-end">
                    <div className="dropdown dropdown-end">
                        <div
                            tabIndex={0}
                            role="button"
                            className="btn btn-ghost"
                        >
                            Theme
                        </div>
                        <ul
                            tabIndex={0}
                            className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                        >
                            <li>
                                <button data-set-theme="light">Light</button>
                            </li>
                            <li>
                                <button data-set-theme="dark">Dark</button>
                            </li>
                            <li>
                                <button data-set-theme="cupcake">
                                    Cupcake
                                </button>
                            </li>
                            <li>
                                <button data-set-theme="cyberpunk">
                                    Cyberpunk
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-6 space-y-8">
                {/* Buttons */}
                <div className="card bg-base-200 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Buttons</h2>
                        <div className="flex flex-wrap gap-2">
                            <button className="btn btn-primary">Primary</button>
                            <button className="btn btn-secondary">
                                Secondary
                            </button>
                            <button className="btn btn-accent">Accent</button>
                            <button className="btn btn-info">Info</button>
                            <button className="btn btn-success">Success</button>
                            <button className="btn btn-warning">Warning</button>
                            <button className="btn btn-error">Error</button>
                            <button className="btn btn-ghost">Ghost</button>
                            <button className="btn btn-outline">Outline</button>
                        </div>
                    </div>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="card bg-base-100 shadow-xl">
                        <figure>
                            <img
                                src="https://daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg"
                                alt="Shoes"
                            />
                        </figure>
                        <div className="card-body">
                            <h2 className="card-title">Shoes!</h2>
                            <p>
                                If a dog chews shoes whose shoes does he choose?
                            </p>
                            <div className="card-actions justify-end">
                                <button className="btn btn-primary">
                                    Buy Now
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="card bg-base-100 shadow-xl">
                        <figure>
                            <img
                                src="https://daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg"
                                alt="Shoes"
                            />
                        </figure>
                        <div className="card-body">
                            <h2 className="card-title">Shoes!</h2>
                            <p>
                                If a dog chews shoes whose shoes does he choose?
                            </p>
                            <div className="card-actions justify-end">
                                <button className="btn btn-primary">
                                    Buy Now
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="card bg-base-100 shadow-xl">
                        <figure>
                            <img
                                src="https://daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg"
                                alt="Shoes"
                            />
                        </figure>
                        <div className="card-body">
                            <h2 className="card-title">Shoes!</h2>
                            <p>
                                If a dog chews shoes whose shoes does he choose?
                            </p>
                            <div className="card-actions justify-end">
                                <button className="btn btn-primary">
                                    Buy Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Elements */}
                <div className="card bg-base-200 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Form Elements</h2>
                        <div className="space-y-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Email</span>
                                </label>
                                <input
                                    type="email"
                                    placeholder="email@example.com"
                                    className="input input-bordered"
                                />
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Password</span>
                                </label>
                                <input
                                    type="password"
                                    placeholder="Enter password"
                                    className="input input-bordered"
                                />
                            </div>
                            <div className="form-control">
                                <label className="cursor-pointer label">
                                    <span className="label-text">
                                        Remember me
                                    </span>
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-primary"
                                    />
                                </label>
                            </div>
                            <button className="btn btn-primary">Submit</button>
                        </div>
                    </div>
                </div>

                {/* Alerts */}
                <div className="space-y-4">
                    <div className="alert alert-info">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            className="stroke-current shrink-0 w-6 h-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                        </svg>
                        <span>New software update available.</span>
                    </div>
                    <div className="alert alert-success">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="stroke-current shrink-0 h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span>Your purchase has been confirmed!</span>
                    </div>
                    <div className="alert alert-warning">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="stroke-current shrink-0 h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                        </svg>
                        <span>Warning: Invalid email address!</span>
                    </div>
                    <div className="alert alert-error">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="stroke-current shrink-0 h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span>Error! Task failed successfully.</span>
                    </div>
                </div>

                {/* Modal */}
                <div className="card bg-base-200 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Modal Example</h2>
                        <p>Click the button below to open a modal</p>
                        <div className="card-actions justify-end">
                            <button
                                className="btn btn-primary"
                                onClick={() =>
                                    (
                                        document.getElementById(
                                            "my_modal_1"
                                        ) as HTMLDialogElement
                                    )?.showModal()
                                }
                            >
                                Open Modal
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modal */}
                <dialog id="my_modal_1" className="modal">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Hello!</h3>
                        <p className="py-4">
                            This is a modal example using DaisyUI!
                        </p>
                        <div className="modal-action">
                            <form method="dialog">
                                <button className="btn">Close</button>
                            </form>
                        </div>
                    </div>
                </dialog>
            </div>
        </div>
    );
}

export const Route = createFileRoute("/demo/daisyui")({
    component: DaisyUIDemo,
});
