import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { Sparkles, Utensils, BookText } from "lucide-react";

export default function Home() {
    const { user, isAuthenticated } = useOutletContext();
    const { updateUserProfile, isUpdating, updateError } = useUser(user);
    const isNameEmpty = Array.isArray(user?.name) ? user.name.length === 0 : !user?.name;

    const [name, setName] = useState("");

    useEffect(() => {
        if (user?.name) {
            setName(typeof user.name === "string" ? user.name : user.name?.[0] || "");
        }
    }, [user]);

    const handleSave = async () => {
        if (!name.trim()) {
            alert("Please enter your name.");
            return;
        }

        try {
            await updateUserProfile({ name: name.trim() });
            alert("Name saved successfully!");
        } catch (e) {
            console.error("Failed to update name:", e);
            alert("Failed to save name.");
        }
    };

    const features = [
        {
            title: "Mood Chat AI",
            description: "Consult your mood with AI who is ready to listen and give feedback.",
            icon: <Sparkles className="h-6 w-6 text-primary" />,
            link: "/chat",
        },
        {
            title: "Food Scan",
            description: "Scan food photos and get instant nutritional analysis.",
            icon: <Utensils className="h-6 w-6 text-primary" />,
            link: "/food-scan",
        },
        {
            title: "Jurnal AI",
            description: "Write your daily journal and get feedback from AI.",
            icon: <BookText className="h-6 w-6 text-primary" />,
            link: "/journal",
        },
    ];

    return (
        <div className="min-h-screen px-4 py-10 flex flex-col items-center">
            {isAuthenticated && isNameEmpty && (
                <Card className="w-full max-w-md mb-6">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl mb-2 font-bold">
                            Welcome to Mood<span className="text-primary">ie</span>
                        </CardTitle>
                        <CardDescription>
                            Let’s get you started by adding your name.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSave();
                            }}
                        >
                            <div className="grid w-full items-center gap-4">
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="name">Your Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="Enter your name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={isUpdating}
                                    />
                                </div>
                            </div>
                            <CardFooter className="flex justify-end px-0 pt-4">
                                <Button type="submit" disabled={isUpdating} className="w-full">
                                    {isUpdating ? "Saving..." : "Save"}
                                </Button>
                            </CardFooter>

                            {updateError && (
                                <p className="text-red-500 text-center mt-2">
                                    Error: {updateError}
                                </p>
                            )}
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold mb-2">
                    Welcome to Mood<span className="text-primary">ie</span>
                </h1>
                <p className="text-muted-foreground max-w-xl mx-auto">
                    An AI platform to help you maintain your mental and physical health through mood consultations, food analysis, and journaling.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
                {features.map((feature, index) => (
                    <Card key={index} className="hover:shadow-lg transition-all">
                        <CardHeader className="flex items-center gap-4">
                            {feature.icon}
                            <div>
                                <CardTitle>{feature.title}</CardTitle>
                                <CardDescription>{feature.description}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardFooter>
                            <Link to={feature.link} className="ml-auto">
                                <Button variant="outline">Coba Sekarang</Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}