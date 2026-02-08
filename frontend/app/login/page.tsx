"use client";

import React, {Suspense, useMemo, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
//import {metadata} from "@/app/layout";
import {isTokenValid, login} from "@/app/http/auth";
import {useSetUser} from "@/app/components/user";

function LoginContent() {
    const router = useRouter();
    const setUser = useSetUser();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canSubmit = useMemo(() => {
        return email.trim().length > 0 && password.length > 0 && !loading;
    }, [email, password, loading]);

    const searchParams = useSearchParams();
    let nextPage = searchParams.get('next');

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const token = await login({email: email.trim(), password});
            localStorage.setItem("taskly_jwt", token);
            const validatedUser = await isTokenValid(token);
            if (!validatedUser) {
                localStorage.removeItem("taskly_jwt");
                throw new Error("Failed to load user data");
            }
            setUser?.(validatedUser);

            if (!nextPage)
                nextPage = "/app";
            router.push(nextPage);
        } catch (err: any) {
            setError(err?.message ?? "Login failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-card">
            <h1 className="auth-title">Login</h1>

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
                    <span className="auth-label">Password</span>
                    <input
                        className="auth-input"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                    />
                </label>

                <div className="auth-row">
                    <div className="toggle">
                        <input
                            id="login-show-password"
                            className="toggle-input"
                            type="checkbox"
                            checked={showPassword}
                            onChange={(e) => setShowPassword(e.target.checked)}
                        />
                        <label className="toggle-label" htmlFor="login-show-password">
                            <span className="toggle-slider" aria-hidden="true"/>
                        </label>
                    </div>
                    <span className="auth-hint">Show password</span>
                </div>

                {error && <p className="auth-error">{error}</p>}

                <button className="auth-button" type="submit" disabled={!canSubmit}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>

            <p className="auth-footer">
                No account? <a className="auth-link" href="/register">Register</a>
            </p>
        </div>
    );
}

export default function Page() {
    //metadata.title = "Taskly - Login";

    return (
        <Suspense fallback={<div>Loading login...</div>}>
            <LoginContent/>
        </Suspense>
    );
}
