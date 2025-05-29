import React, { useState, useEffect } from 'react';
import { useOutletContext } from "react-router-dom";
import { useUser } from "../hooks/useUser";

export default function Profile() {
    const { user } = useOutletContext();
    const { updateUserProfile, isUpdating, updateError } = useUser(user);

    const [username, setUsername] = useState(user?.username || '');
    const [name, setName] = useState(user?.name?.[0] || '');
    const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');
    const [previewImage, setPreviewImage] = useState(user?.profilePicture || '');
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
            setUsername(user.username || '');
            setName(user.name?.[0] || '');
            setProfilePicture(user.profilePicture?.[0] || '');
            setPreviewImage(user.profilePicture?.[0] || '');
        }
    }, [user]);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Only image files are allowed.");
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setError("Maximum image size is 2MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewImage(e.target.result);
            setProfilePicture(e.target.result); // Base64 string
        };
        reader.readAsDataURL(file);
    };

    const handleUpdate = async () => {
        await updateUserProfile({ username, name, profilePicture });
    };

    return (
        <div className="min-h-screen bg-background px-4 sm:px-6 md:px-8 py-10">
            {/* Profile Header */}
            <div className="flex flex-col items-center text-center space-y-2 mb-8">
                {/* Avatar */}
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-blue-500 shadow-md">
                    <img
                        src={previewImage || './profile.png'}
                        alt={name}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Name */}
                <h1 className="text-xl md:text-2xl font-semibold text-foreground">
                    {user?.name || 'Unnamed'}
                </h1>

                {/* Join Info */}
                <p className="text-sm text-muted-foreground">Member since {user?.joined || 'unknown'}</p>
            </div>

            {/* Form */}
            <div className="max-w-md mx-auto space-y-4">
                <input
                    className="w-full p-2 border rounded"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    className="w-full p-2 border rounded"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <label className="text-sm font-medium text-gray-700">Upload Profile Picture</label>
                <input
                    type="file"
                    accept="image/*"
                    className="w-full p-2 border rounded"
                    onChange={handleImageUpload}
                />

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                    onClick={handleUpdate}
                    className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80"
                    disabled={isUpdating}
                >
                    {isUpdating ? 'Updating...' : 'Update Profile'}
                </button>

                {updateError && (
                    <p className="text-red-500 text-sm">Error: {updateError}</p>
                )}
            </div>
        </div>
    );
}
