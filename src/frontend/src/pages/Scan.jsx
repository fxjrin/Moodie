import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { backend } from "declarations/backend";

export default function Scan() {
    const [previewImage, setPreviewImage] = useState("");
    const [base64Image, setBase64Image] = useState("");
    const [resultText, setResultText] = useState("");
    const [promptResult, setPromptResult] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

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
        reader.onload = (event) => {
            const base64 = event.target.result;
            setPreviewImage(base64);
            setBase64Image(base64);
            setError(null);
        };
        reader.readAsDataURL(file);
    };

    const handleScan = async () => {
        if (!base64Image) {
            setError("Please upload an image first.");
            return;
        }

        setLoading(true);
        setError(null);
        setResultText("");
        setPromptResult("");

        try {
            await backend.scanImage(base64Image); // layer 1
            await new Promise(resolve => setTimeout(resolve, 1000));
            const scanResult = await backend.scanImage(base64Image); // layer 2
            setResultText(scanResult);

            // for Indonesian, you can change the prompt.
            const promptText = `
Berdasarkan data makanan berikut, berikan penjelasan mengenai kandungan gizinya dan apakah ini termasuk makanan sehat:
${scanResult}

Selain itu, analisa juga mood user dan berikan saran agar mood user menjadi lebih baik
`;

            const promptResult = await backend.prompt(promptText);
            setPromptResult(promptResult);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background px-4 sm:px-6 md:px-8 py-10">
            <div className="max-w-xl mx-auto space-y-6">
                <h1 className="text-2xl font-bold text-center">Scan Food Nutrition</h1>

                {/* Image Upload Preview */}
                {previewImage && (
                    <Card>
                        <CardContent className="flex justify-center p-4">
                            <img
                                src={previewImage}
                                alt="Uploaded preview"
                                className="rounded-lg max-h-64 object-contain"
                            />
                        </CardContent>
                    </Card>
                )}

                <div className="space-y-2">
                    <Label htmlFor="imageUpload">Upload Food Image</Label>
                    <Input
                        id="imageUpload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button
                    onClick={handleScan}
                    className="w-full"
                    disabled={loading || !base64Image}
                >
                    {loading ? "Scanning..." : "Scan Food"}
                </Button>

                {/* Output */}
                {promptResult && (
                    <Card>
                        <CardContent className="p-4">
                            <h2 className="text-lg font-medium mb-2">AI Analysis:</h2>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {promptResult}
                            </p>
                        </CardContent>
                    </Card>
                )}

            </div>
        </div>
    );
}
