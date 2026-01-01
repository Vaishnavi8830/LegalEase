// backend/controllers/lawController.js
import indianLaws from "../data/indianLaws.js";
import { generateGeminiResponse } from "../services/geminiService.js";
import gTTS from "gtts";

export const getCategories = (req, res) => {
    const categories = Object.keys(indianLaws);
    res.json({ categories });
};

export const getLawsByCategory = (req, res) => {
    const { category } = req.params;
    const laws = indianLaws[category];
    if (!laws) return res.status(404).json({ error: "Category not found" });
    res.json({ category, laws });
};

export const explainCategory = async (req, res) => {
    try {
        const { category } = req.body;
        const laws = indianLaws[category];
        if (!laws) return res.status(404).json({ error: "Category not found" });

        const prompt = `Explain the category "${category}" as a fun story in 200 words for an Indian audience. End with a summary.`;
        const aiText = await generateGeminiResponse(prompt);
        res.json({ category, explanation: aiText });
    } catch (error) {
        res.status(500).json({ error: "AI text generation failed" });
    }
};

export const explainLaw = async (req, res) => {
    try {
        const { category, law } = req.body;
        if (!indianLaws[category]) return res.status(404).json({ error: "Law not found" });

        const prompt = `Explain the Indian law "${law}" as a story in 200 words. Use simple daily examples.`;
        const aiText = await generateGeminiResponse(prompt);
        res.json({ category, law, explanation: aiText });
    } catch (error) {
        res.status(500).json({ error: "AI text generation failed" });
    }
};

// --- UPDATED AUDIO ROUTES WITH ERROR HANDLING ---

export const explainCategoryAudio = async (req, res) => {
    try {
        const { category } = req.body;
        const laws = indianLaws[category];
        if (!laws) return res.status(404).json({ error: "Category not found" });

        const prompt = `Explain the category "${category}" as a short, funny Indian story (max 150 words).`;
        const aiText = await generateGeminiResponse(prompt);

        const gtts = new gTTS(aiText, "en");
        res.setHeader("Content-Type", "audio/mpeg");

        const stream = gtts.stream();
        stream.on("error", (err) => {
            console.error("gTTS Stream Error:", err);
            res.status(500).end(); // End the response if streaming fails
        });
        stream.pipe(res);
    } catch (error) {
        console.error("Audio Route Error:", error);
        res.status(500).json({ error: "Failed to generate category audio" });
    }
};

export const explainLawAudio = async (req, res) => {
    try {
        const { category, law } = req.body;
        if (!indianLaws[category]) return res.status(404).json({ error: "Category/Law not found" });

        const prompt = `Explain the law "${law}" as a short, funny Indian story (max 150 words).`;
        const aiText = await generateGeminiResponse(prompt);

        const gtts = new gTTS(aiText, "en");
        res.setHeader("Content-Type", "audio/mpeg");

        const stream = gtts.stream();
        stream.on("error", (err) => {
            console.error("gTTS Stream Error:", err);
            if (!res.headersSent) res.status(500).json({ error: "Audio stream failed" });
        });
        stream.pipe(res);
    } catch (error) {
        console.error("Audio Route Error:", error);
        res.status(500).json({ error: "Failed to generate law audio" });
    }
};