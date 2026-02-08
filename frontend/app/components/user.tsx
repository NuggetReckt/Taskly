import {Dispatch, SetStateAction, createContext, useContext} from "react";

export interface User {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
}

export type UserState = User | null | undefined;

export type UserContextValue = {
    user: UserState;
    setUser: Dispatch<SetStateAction<UserState>>;
};

export const UserContext = createContext<UserContextValue | undefined>(undefined);

export function useUser() {
    return useContext(UserContext)?.user;
}

export function useSetUser() {
    return useContext(UserContext)?.setUser;
}
