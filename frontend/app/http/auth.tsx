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

        const {payload} = await jose.jwtVerify(token, key, {
            algorithms: ["HS256"],
        });

        const exp = payload.exp;
        if (typeof exp !== "number") return null;
        const now = Math.floor(Date.now() / 1000);
        if (exp <= now) return null;

        if (typeof payload.user_id === "number" && typeof payload.email === "string") {
            const res = await client.get("user/" + payload.user_id);

            return {
                id: payload.user_id,
                email: payload.email,
                firstName: res.data.first_name,
                lastName: res.data.last_name
            };
        }
        return null;
    } catch {
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
