
'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
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
    organizationId?: number | null;
    status?: 'ACTIVE' | 'PENDING' | 'REJECTED';
    signupToken?: string;
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
    createOwnerOrganization: (data: RegisterOrganizationCommand) => Promise<number>;
    joinInstructorOrganization: (data: JoinOrganizationCommand) => Promise<void>;
    checkAuth: () => Promise<void>;
    loadProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthContent({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const [user, setUser] = useState<User | null>(null);
    const [signupToken, setSignupToken] = useState<string | null>(null);
    const [registrationData, setRegistrationData] = useState<Partial<SignUpCommand> | null>(null);
    const router = useRouter();

    const isLoading = status === 'loading';

    // Load profile from API
    const loadProfile = async () => {
        try {
            const profile = await authApi.getMe();
            console.log('AuthContext: Loaded profile from API:', profile);
            setUser(prev => ({
                id: profile.accountId,
                name: profile.name,
                email: prev?.email || '',
                phone: prev?.phone,
                role: profile.identity as UserRole,
                organizationId: profile.organizationId,
                status: 'ACTIVE',
            }));
        } catch (error) {
            console.error('AuthContext: Failed to load profile:', error);
        }
    };

    // Sync Session to Local User State
    useEffect(() => {
        if (session?.user) {
            // Handle Signup Token
            if (session.user.signupToken) {
                console.log("AuthContext: Retrieved signupToken from session", session.user.signupToken);
                setSignupToken(session.user.signupToken);
                sessionStorage.setItem('signupToken', session.user.signupToken);
            }

            // Set initial user from session
            setUser({
                id: session.user.id || '',
                name: session.user.name || '',
                email: session.user.email || '',
                role: (session.user.role as UserRole) || null,
                organizationId: session.user.organizationId,
                status: 'ACTIVE',
                signupToken: session.user.signupToken
            });

            // Load complete profile from API if user has a role (fully authenticated)
            if (session.user.role && session.user.role !== 'TEMPUSER') {
                loadProfile();
            }
        } else {
            setUser(null);
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
            loadProfile
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
