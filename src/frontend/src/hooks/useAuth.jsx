import { useState, useEffect, useCallback } from 'react';
import { AuthClient } from "@dfinity/auth-client";
import { Actor } from "@dfinity/agent";
import { Principal } from '@dfinity/principal';
import { backend } from 'declarations/backend';

export const useAuth = () => {
    const [authClient, setAuthClient] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [principalId, setPrincipalId] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);

    const initializeAuthClient = useCallback(async () => {
        try {
            const client = await AuthClient.create({
                idleOptions: {
                    disableIdle: true,
                    disableDefaultIdleCallback: true
                },
            });
            setAuthClient(client);
            return client;
        } catch (err) {
            setError('Failed to initialize authentication client');
            throw new Error('Failed to initialize authentication client', { cause: err });
        }
    }, []);

    const checkAuthenticationState = useCallback(async (client) => {
        try {
            const isAuthenticated = await client.isAuthenticated();
            if (isAuthenticated) {
                const identity = await client.getIdentity();
                if (!identity) throw new Error("Identity is undefined");
                Actor.agentOf(backend).replaceIdentity(identity);
                setPrincipalId(identity.getPrincipal().toText());
            }
            setIsAuthenticated(isAuthenticated);
        } catch (err) {
            setError(err.message || 'Failed to check authentication state');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchUserData = async () => {
        if (!isAuthenticated || !principalId) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const principal = Principal.fromText(principalId);
            let userData = await backend.getUserByPrincipal(principal);
            
            // Handle array response from the backend
            let fetchedUser = Array.isArray(userData) ? userData[0] : userData;
            
            // If user doesn't exist, register and fetch again
            if (!fetchedUser) {
                await backend.authenticateUser(principalId);
                userData = await backend.getUserByPrincipal(principal);
                fetchedUser = Array.isArray(userData) ? userData[0] : userData;
            }
            
            setUser(fetchedUser);
        } catch (err) {
            setError('Failed to load user data.');
            throw new Error('Failed to load user data', { cause: err });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const client = await initializeAuthClient();
                await checkAuthenticationState(client);
            } catch (err) {
                setIsLoading(false);
            }
        };

        initializeAuth();
        fetchUserData();
    }, [initializeAuthClient, checkAuthenticationState, principalId, isAuthenticated]);

    const handleLogin = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const client = await initializeAuthClient();
            setAuthClient(client);

            await new Promise((resolve, reject) => {
                client.login({
                    identityProvider: 'https://identity.ic0.app',
                    onSuccess: resolve,
                    onError: reject,
                });
            });

            const identity = client.getIdentity();
            Actor.agentOf(backend).replaceIdentity(identity);
            setPrincipalId(identity.getPrincipal().toText());
            setIsAuthenticated(true);
            window.location.reload();
        } catch (err) {
            setError(err.message || 'Login failed');
            throw new Error('Login failed', { cause: err });
        } finally {
            setIsLoading(false);
        }
    }, [authClient, initializeAuthClient]);

    const handleLogout = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            if (authClient) await authClient.logout();
            setAuthClient(null);
            setPrincipalId('');
            setIsAuthenticated(false);
        } catch (err) {
            setError('Logout failed');
            throw new Error('Logout failed', { cause: err });
        } finally {
            setIsLoading(false);
        }
    }, [authClient]);

    return {
        user,
        isAuthenticated,
        principalId,
        authClient,
        isLoading,
        error,
        handleLogin,
        handleLogout,
        initializeAuthClient,
    };
};