import { useState, useEffect, useCallback } from 'react';
import { backend } from 'declarations/backend';

/**
 * Converts optional text values to Motoko-compatible arrays
 * (?Text → [] | [Text])
 */
const toMotokoOption = (value) => {
    return value != null && value !== '' ? [value] : [];
};

export const useUser = (initialUser) => {
    const [user, setUser] = useState(initialUser || null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateError, setUpdateError] = useState(null);

    /**
     * Update user profile using Motoko-compatible format
     */
    const updateUserProfile = useCallback(async ({ username, name, profilePicture }) => {
        setIsUpdating(true);
        setUpdateError(null);

        try {
            const updateData = {
                username: toMotokoOption(username),
                name: toMotokoOption(name),
                profilePicture: toMotokoOption(profilePicture),
            };

            await backend.updateUserProfile(updateData);

            // Optionally update local state
            setUser(prev => ({
                ...prev,
                username: username ?? prev?.username,
                name: name ?? prev?.name,
                profilePicture: profilePicture ?? prev?.profilePicture,
            }));

        } catch (err) {
            console.error('Update failed', err);
            setUpdateError(err.message || 'Failed to update user profile');
        } finally {
            setIsUpdating(false);
        }
    }, [user]);

    return {
        user,
        setUser,
        updateUserProfile,
        isUpdating,
        updateError,
    };
};