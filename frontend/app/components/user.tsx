import {createContext, useContext} from "react";

export interface User {
    id: number;
    email: string;
    firstName?: string;
    LastName?: string;
}

export const UserContext = createContext<User | null>(null);

export function useUser() {
    return useContext(UserContext);
}