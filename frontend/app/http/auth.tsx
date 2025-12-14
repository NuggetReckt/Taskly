import {client} from "@/app/http/client";

export type LoginPayload = {
    email: string;
    password: string;
};

export type RegisterPayload = {
    email: string;
    name: string;
    password: string;
};

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
