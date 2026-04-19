import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";
import { User } from "@/types";

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    hasHydrated: boolean;
    setAuth: (user: User, token: string) => void;
    logout: () => void;
    setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (
            set: (
                partial:
                    | AuthState
                    | Partial<AuthState>
                    | ((state: AuthState) => AuthState | Partial<AuthState>),
                replace?: boolean
            ) => void
        ): AuthState => ({
            user: null,
            token: null,
            isAuthenticated: false,
            hasHydrated: false,
            setHasHydrated: (value) => set({ hasHydrated: value }),
            setAuth: (user, token) => {
                const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
                Cookies.set("haba_token", token, {
                    expires: 7,
                    secure: isHttps,
                    sameSite: "lax",
                    path: "/",
                });
                set({ user, token, isAuthenticated: true });
            },
            logout: () => {
                Cookies.remove("haba_token");
                set({ user: null, token: null, isAuthenticated: false });
            },
        }),
        {
            name: "haba-auth",
            partialize: (s: AuthState) => ({ user: s.user, token: s.token, isAuthenticated: s.isAuthenticated }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);