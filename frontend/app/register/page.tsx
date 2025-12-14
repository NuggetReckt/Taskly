"use client";

import {useMemo, useState} from "react";
import {useRouter} from "next/navigation";
//import {metadata} from "@/app/layout";
import {register} from "@/app/http/auth";

export default function Page() {
    //metadata.title = "Taskly - Register";

    const router = useRouter();

    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const passwordsMatch = password.length > 0 && password === confirmPassword;

    const canSubmit = useMemo(() => {
        return (
            email.trim().length > 0 &&
            name.trim().length > 0 &&
            password.length > 0 &&
            confirmPassword.length > 0 &&
            passwordsMatch &&
            !loading
        );
    }, [email, name, password, confirmPassword, passwordsMatch, loading]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!passwordsMatch) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            await register({email: email.trim(), name: name.trim(), password});
            setSuccess("Account created. Redirecting to login...");
            setTimeout(() => router.push("/login"), 600);
        } catch (err: any) {
            setError(err?.message ?? "Register failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-card">
            <h1 className="auth-title">Register</h1>

            <form className="auth-form" onSubmit={onSubmit}>
                <label className="auth-field">
                    <span className="auth-label">Email</span>
                    <input
                        className="auth-input"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                    />
                </label>

                <label className="auth-field">
                    <span className="auth-label">Name</span>
                    <input
                        className="auth-input"
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        required
                    />
                </label>

                <label className="auth-field">
                    <span className="auth-label">Password</span>
                    <input
                        className="auth-input"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                    />
                </label>

                <label className="auth-field">
                    <span className="auth-label">Confirm password</span>
                    <input
                        className="auth-input"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                    />
                </label>

                <div className="auth-row">
                    <div className="toggle">
                        <input
                            id="register-show-password"
                            className="toggle-input"
                            type="checkbox"
                            checked={showPassword}
                            onChange={(e) => setShowPassword(e.target.checked)}
                        />
                        <label className="toggle-label" htmlFor="register-show-password">
                            <span className="toggle-slider" aria-hidden="true"/>
                        </label>
                    </div>
                    <span className="auth-hint">Show password</span>
                </div>

                {!passwordsMatch && confirmPassword.length > 0 && (
                    <p className="auth-error">Passwords do not match.</p>
                )}

                {error && <p className="auth-error">{error}</p>}
                {success && <p className="auth-success">{success}</p>}

                <button className="auth-button" type="submit" disabled={!canSubmit}>
                    {loading ? "Creating account..." : "Register"}
                </button>
            </form>

            <p className="auth-footer">
                Already have an account? <a className="auth-link" href="/login">Login</a>
            </p>
        </div>
    );
}