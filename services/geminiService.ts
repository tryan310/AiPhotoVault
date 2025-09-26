import { GoogleGenAI, Modality } from "@google/genai";

console.log("Gemini API Key available:", !!process.env.GEMINI_API_KEY);
console.log("Gemini API Key length:", process.env.GEMINI_API_KEY?.length || 0);

if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // Remove the 'data:image/jpeg;base64,' part
            resolve(result.split(',')[1]);
        };
        reader.onerror = error => reject(error);
    });
};

const generateSingleAiPhoto = async (file: File, prompt: string): Promise<string | null> => {
    console.log("Starting image generation with prompt:", prompt);
    const base64ImageData = await fileToBase64(file);
    console.log("Image converted to base64, length:", base64ImageData.length);

    try {
        console.log("Calling Gemini API...");
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64ImageData,
                            mimeType: file.type,
                        },
                    },
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        console.log("Gemini API response received:", response);
        console.log("Number of candidates:", response.candidates?.length || 0);
        
        if (response.candidates && response.candidates[0] && response.candidates[0].content) {
            console.log("Number of parts:", response.candidates[0].content.parts?.length || 0);
            
            for (const part of response.candidates[0].content.parts) {
                console.log("Part type:", part.inlineData ? 'IMAGE' : 'TEXT');
                if (part.inlineData) {
                    console.log("Found image data, length:", part.inlineData.data?.length || 0);
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
        }
        
        console.log("No image data found in response");
    } catch (error) {
        console.error("Single image generation failed:", error);
        return null; // Return null if a single generation fails
    }
    
    return null;
};

export const generateAiPhotos = async (file: File, prompt: string, photoCount: number = 10, themeTitle?: string, userPrompt?: string): Promise<string[]> => {
    // Check if user is authenticated
    const token = localStorage.getItem('auth_token');
    if (!token) {
        throw new Error('Authentication required. Please log in first.');
    }

    // Call the backend API instead of directly calling Gemini
    try {
        const response = await fetch('http://localhost:3001/api/generate-photos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ 
                theme: themeTitle || prompt, // Use theme title if provided, otherwise fallback to prompt
                prompt: prompt,
                userPrompt: userPrompt || '', // Include user's additional guidance
                imageData: await fileToBase64(file),
                photoCount: photoCount
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            
            // If user needs credits, throw a special error
            if (errorData.redirectToPricing) {
                const error = new Error(errorData.message || 'Insufficient credits');
                (error as any).redirectToPricing = true;
                (error as any).availableCredits = errorData.available;
                throw error;
            }
            
            throw new Error(errorData.error || 'Failed to generate photos');
        }

        const data = await response.json();
        return data.images || [];
    } catch (error) {
        console.error('Error generating photos:', error);
        throw error;
    }
};
