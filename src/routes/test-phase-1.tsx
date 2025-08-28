import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/test-phase-1")({
    component: TestPhase1,
});

function TestPhase1() {
    return (
        <div className="min-h-screen bg-base-100 flex items-center justify-center">
            <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title">Phase 1 Validation Test</h2>
                    <p>This route validates that Phase 1 setup is complete.</p>
                    <div className="mt-4">
                        <h3 className="font-semibold">Expected Response:</h3>
                        <pre className="bg-base-300 p-3 rounded mt-2 text-sm">
                            {`{
  "phase": 1,
  "tanstack_version": "1.131.28",
  "bun_version": "1.2.20",
  "status": "success"
}`}
                        </pre>
                    </div>
                    <div className="card-actions justify-end mt-4">
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                // This would normally be an API endpoint
                                // For now, just show the expected structure
                                alert(
                                    "Phase 1 validation test route created successfully!"
                                );
                            }}
                        >
                            Test Phase 1
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
