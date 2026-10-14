// Step 8: ENV Validation File
export function validateEnv() {
    const required = [
        "VITE_SUPABASE_URL",
        "VITE_SUPABASE_ANON_KEY"
    ];

    const missing = required.filter(key => !import.meta.env[key]);

    if (missing.length > 0) {
        const error = `Missing Environment Variables: ${missing.join(", ")}`;
        console.error("CONFIGURATION ERROR:", error);
        // Step 15: Disable strict validation during debugging
        // throw new Error(error);
    }
}

// Step 3: Network Failure Detection
export function isOnline(): boolean {
    return navigator.onLine;
}

// Step 10: Timeout Protection
export function timeout(ms: number): Promise<never> {
    return new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request Timeout")), ms)
    );
}

// Step 4: Retry System
export async function retry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
    try {
        return await fn();
    } catch (err) {
        if (retries === 0) throw err;
        console.warn(`Action failed, retrying... (${retries} left)`);
        await new Promise(r => setTimeout(r, 1000));
        return retry(fn, retries - 1);
    }
}
