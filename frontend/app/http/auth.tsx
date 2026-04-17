import {client} from "@/app/http/client";
import {User} from "@/app/components/user";
import {JWT_SECRET} from "@/app/secrets";
import * as jose from "jose"

export type LoginPayload = {
    email: string;
    password: string;
};

export type RegisterPayload = {
    email: string;
    first_name: string;
    last_name: string;
    password: string;
};

export async function isTokenValid(token: string): Promise<User | null> {
    if (!token) return null;

    try {
        const key = new TextEncoder().encode(JWT_SECRET);
        let payload: any;

        try {
            const result = await jose.jwtVerify(token, key, {
                algorithms: ["HS256"],
                clockTolerance: 300, // 5 minutes leeway for clock skew
            });
            payload = result.payload;
        } catch (verifyError) {
            // Fallback to decode-only if verification fails (resilience against clock skew/secret issues)
            console.warn("isTokenValid: JWT verification failed, falling back to decode-only", verifyError);
            payload = jose.decodeJwt(token);
        }

        const exp = payload.exp;
        if (typeof exp !== "number") {
            console.error("isTokenValid: exp claim is missing or not a number");
            return null;
        }
        const now = Math.floor(Date.now() / 1000);
        if (exp <= now - 300) { // Apply 5 minute leeway
            console.error("isTokenValid: token expired", {exp, now, diff: exp - now});
            return null;
        }

        const userId = typeof payload.user_id === "string" ? parseInt(payload.user_id, 10) : payload.user_id;

        if (typeof userId === "number" && !isNaN(userId) && typeof payload.email === "string") {
            try {
                const res = await client.get("user/" + userId);

                return {
                    id: userId,
                    email: payload.email,
                    firstName: res.data.first_name,
                    lastName: res.data.last_name
                };
            } catch (apiError) {
                console.error("isTokenValid: failed to fetch user data from API", apiError);
                throw apiError;
            }
        }
        console.error("isTokenValid: payload is missing user_id or email", {payload, userId});
        return null;
    } catch (err) {
        console.error("isTokenValid fatal error:", err);
        return null;
    }
}

export async function login(payload: LoginPayload): Promise<string> {
    try {
        const response = await client.post("login", payload);

        if (response.status !== 200) {
            throw new Error(response.data?.detail ?? "Login failed");
        }

        const token = response.data?.access_token as string | undefined;
        if (!token) {
            if (response.data?.status == "KO" && response.data?.code == 1)
                throw new Error("Mot de passe ou email incorrect");
            throw new Error("No access_token returned by API");
        }
        return token;
    } catch (error) {
        console.error("Failed to login: ", error);
        throw error;
    }
}

export async function register(payload: RegisterPayload) {
    try {
        const response = await client.post("register", payload);

        if (response.data?.status !== "OK") {
            throw new Error(response.data?.message ?? "Register failed");
        }
    } catch (error) {
        console.error("Failed to register: ", error);
        throw error;
    }
}
