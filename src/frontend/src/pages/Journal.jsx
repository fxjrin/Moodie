import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { backend } from "declarations/backend";

function getMoodColor(mood) {
    const lowerMood = mood.toLowerCase();
    if (lowerMood.includes("happy")) return "bg-green-100 text-green-800";
    if (lowerMood.includes("sad")) return "bg-blue-100 text-blue-800";
    if (lowerMood.includes("angry")) return "bg-red-100 text-red-800";
    if (lowerMood.includes("relaxed")) return "bg-purple-100 text-purple-800";
    if (lowerMood.includes("neutral")) return "bg-gray-100 text-gray-800";
    return "bg-gray-50 text-gray-500"; // fallback/default
}


export default function Journal() {
    const { user } = useOutletContext();
    const [journals, setJournals] = useState([]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchJournals = async () => {
        if (!user?.id) return;
        const result = await backend.getJournals(user.id);

        if (result && result.length > 0) {
            const flatJournals = result[0].map(entry => ({
                ...entry,
                createdAt: Number(entry.createdAt),
                updatedAt: Number(entry.updatedAt),
            }));
            setJournals(flatJournals);
        } else {
            setJournals([]);
        }
    };


    useEffect(() => {
        fetchJournals();
    }, [user]);

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) return;
        setLoading(true);

        const entry = {
            id: crypto.randomUUID(),
            title,
            content,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            mood: "",
            reflection: "",
        };

        const result = await backend.addJournalEntry(entry);
        if ("ok" in result) {
            await fetchJournals();
            setTitle("");
            setContent("");
        } else {
            console.error("Add journal failed:", result.err);
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        const result = await backend.deleteJournalEntry(id);
        if ("ok" in result) {
            setJournals((prev) => prev.filter((j) => j.id !== id));
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4 space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold">My Journal</h1>
                <Input
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <Textarea
                    placeholder="Write something..."
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
                <Button onClick={handleSubmit} disabled={loading || !title || !content}>
                    {loading ? "Saving..." : "Add Journal"}
                </Button>
            </div>

            <div className="space-y-4">
                {journals.length === 0 ? (
                    <p className="text-gray-500 text-sm">No journal entries yet.</p>
                ) : (
                    journals
                        .sort((a, b) => b.createdAt - a.createdAt)
                        .map((entry) => {
                            const created = typeof entry.createdAt === "bigint"
                                ? Number(entry.createdAt)
                                : entry.createdAt;

                            const moodColor = entry.mood ? getMoodColor(entry.mood) : "";

                            return (
                                <Card key={entry.id}>
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h2 className="font-semibold text-lg">{entry.title}</h2>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(created).toLocaleString()}
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(entry.id)}
                                            >
                                                Delete
                                            </Button>
                                        </div>

                                        <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800">
                                            {entry.content}
                                        </p>

                                        {entry.mood && (
                                            <span
                                                className={`inline-block mt-3 px-3 py-1 text-xs font-medium rounded-full ${moodColor}`}
                                            >
                                                Mood: {entry.mood.toLowerCase()}
                                            </span>
                                        )}

                                        {entry.reflection && (
                                            <p className="mt-2 italic text-sm text-gray-600">
                                                {entry.reflection}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })

                )}
            </div>
        </div>
    );
}