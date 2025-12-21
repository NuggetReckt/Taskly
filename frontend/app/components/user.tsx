import {createContext, useContext} from "react";

export interface User {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
}

export const UserContext = createContext<User | null>(null);

export function useUser() {
    return useContext(UserContext);
}