
'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, SignUpCommand, RegisterOrganizationCommand, JoinOrganizationCommand } from '@/lib/api';
import { notifications } from '@mantine/notifications';
import { useSession, signIn, signOut, SessionProvider, getSession } from "next-auth/react";

export type UserRole = 'OWNER' | 'INSTRUCTOR' | 'MEMBER' | 'SYSTEM_ADMIN' | null;

interface User {
    id: number | string;
    name: string;
    email: string;
    phone?: string;
    role: UserRole;
    organizationId?: string | number | null;
    status?: 'ACTIVE' | 'PENDING' | 'REJECTED';
    signupToken?: string;
    profileImageUrl?: string | null;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (provider: 'kakao' | 'google') => Promise<void>;
    logout: () => void;
    signupToken: string | null;
    registrationData: Partial<SignUpCommand> | null;
    setRegistrationData: (data: Partial<SignUpCommand> | null) => void;
    signUp: (data: SignUpCommand) => Promise<void>;
    createOwnerOrganization: (data: RegisterOrganizationCommand) => Promise<string | number>;
    joinInstructorOrganization: (data: JoinOrganizationCommand) => Promise<void>;
    checkAuth: () => Promise<void>;
    loadProfile: () => Promise<void>;
    refreshUser: () => Promise<void>; // Manual refresh user data
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to strip "ROLE_" prefix if present, matching backend enums to frontend types
const normalizeRole = (role: string | null | undefined): UserRole => {
    if (!role) return null;
    const normalized = role.replace('ROLE_', '');
    // Validate if it matches known roles, theoretically. For now, trust the strip.
    return normalized as UserRole;
};

function AuthContent({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const [user, setUser] = useState<User | null>(null);
    const [signupToken, setSignupToken] = useState<string | null>(null);
    const [registrationData, setRegistrationData] = useState<Partial<SignUpCommand> | null>(null);
    const router = useRouter();

    // Track loaded session to prevent redundant API calls
    const loadedSessionId = useRef<string | null>(null);

    const isLoading = status === 'loading';

    const loadProfileInternal = async (sessionId: string) => {
        // Prevent multiple concurrent calls for the same session
        if (loadedSessionId.current === sessionId) return;
        loadedSessionId.current = sessionId;

        try {
            console.log('AuthContext: Loading profile for session:', sessionId);
            const profile = await authApi.getMe();
            console.log('AuthContext: Loaded profile from API:', profile);

            if (!profile) throw new Error('Profile is empty');

            setUser(prev => ({
                id: profile.accountId,
                name: profile.name,
                email: prev?.email || '',
                phone: prev?.phone,
                role: normalizeRole(profile.identity),
                organizationId: profile.organizationId,
                status: 'ACTIVE',
                profileImageUrl: profile.profileImageUrl,
            }));
        } catch (error) {
            console.error('AuthContext: Failed to load profile:', error);
            // Reset on failure so it can be retried if needed
            loadedSessionId.current = null;
        }
    };

    // Public: Reload profile (for manual refresh)
    const loadProfile = async () => {
        if (session?.user) {
            const sessionId = `${session.user.id}_${session.user.role}_${session.user.organizationId}`;
            await loadProfileInternal(sessionId);
        }
    };

    // Sync Session to Local User State
    useEffect(() => {
        if (session?.user) {
            // Create a unique session identifier
            const sessionId = `${session.user.id}_${session.user.role}_${session.user.organizationId}`;

            // Handle Signup Token
            if (session.user.signupToken) {
                console.log("AuthContext: Retrieved signupToken from session", session.user.signupToken);
                setSignupToken(session.user.signupToken);
                sessionStorage.setItem('signupToken', session.user.signupToken);
            }

            // GUARD: If we have already loaded the full profile for this session,
            // do NOT overwrite it with the potentially "lean" session object (which might lack role).
            // This prevents "flickering" back to "Staff" (role: null) when session revalidates.
            if (loadedSessionId.current === sessionId && user?.role) {
                return;
            }

            // Set initial user from session (only if not already loaded fully)
            setUser({
                id: session.user.id || '',
                name: session.user.name || '',
                email: session.user.email || '',
                role: normalizeRole(session.user.role), // Normalize role from Session
                organizationId: session.user.organizationId,
                status: 'ACTIVE',
                signupToken: session.user.signupToken
            });

            // CRITICAL: Only load complete profile from API if user has an actual JWT access token
            // This prevents /me API calls on login page or during OAuth flows where session exists
            // but user hasn't actually authenticated yet
            if (session.user.id && session.user.accessToken && loadedSessionId.current !== sessionId) {
                loadProfileInternal(sessionId);
            }
        } else {
            setUser(null);
            loadedSessionId.current = null;
            // Check session storage for signup token persistence during signup flow
            const storedToken = sessionStorage.getItem('signupToken');
            if (storedToken) {
                setSignupToken(storedToken);
            }
        }
    }, [session]);

    const login = async (provider: 'kakao' | 'google') => {
        await signIn(provider, { callbackUrl: '/' });
    };

    const logout = async () => {
        await signOut({ callbackUrl: '/login' });
        notifications.show({
            title: '로그아웃',
            message: '성공적으로 로그아웃되었습니다.',
            color: 'green',
        });
    };

    const checkAuth = async () => {
        // NextAuth handles this automatically.
    };

    const signUp = async (data: SignUpCommand) => {
        try {
            const result = await authApi.signUp(data);

            // Log the user in immediately (Identity is effectively null or ROLE_USER)
            await signIn('credentials', {
                redirect: false,
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
                role: null, // No role yet
            });

            // Note: We don't clear signupToken yet, strictly, or maybe we do?
            // The user is now authenticated.
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const createOwnerOrganization = async (data: RegisterOrganizationCommand) => {
        try {
            // 1. Create Organization (Public)
            const orgResult = await authApi.registerOrganization(data);

            const session = await getSession();
            return orgResult.organizationId;
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const joinInstructorOrganization = async (data: JoinOrganizationCommand) => {
        try {
            await authApi.joinOrganization(data);
            // Refresh Session to get new Role
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    // Public: Refresh user data (wrapper for loadProfile with better naming)
    const refreshUser = async () => {
        console.log('AuthContext: Manual refresh user requested');
        await loadProfile();
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            login,
            logout,
            signupToken,
            registrationData,
            setRegistrationData,
            signUp,
            createOwnerOrganization,
            joinInstructorOrganization,
            checkAuth,
            loadProfile,
            refreshUser
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function AuthProvider({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <AuthContent>{children}</AuthContent>
        </SessionProvider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
