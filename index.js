const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initializeDatabase } = require('./db/db.connect');
const Meal = require('./models/meal.model');
const { GoogleGenAI } = require('@google/genai');

dotenv.config();

const corsOption = {
  origin: "*",
  credentials: true,
};

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors(corsOption));
initializeDatabase();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.use(express.json());

// Main endpoint to generate a meal from ingredients
app.post('/api/generate-meal', async (req, res) => {
    try {
        const { ingredients } = req.body;

        if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
            return res.status(400).json({ error: 'Please provide a valid array of ingredients.' });
        }

        console.log(`Generating meal with ingredients: ${ingredients.join(', ')}`);

        // --------------------------------------------------------------------------
        // AI AGENT INTEGRATION
        // --------------------------------------------------------------------------
        const prompt = `You are an expert chef. Create a delicious, easy-to-follow recipe using ONLY or PRIMARILY the following ingredients: ${ingredients.join(', ')}.
        You can include basic pantry staples like salt, pepper, oil, and water.
        
        Respond ONLY with a valid JSON format perfectly matching the following schema. Do not include any markdown formatting like \`\`\`json.
        {
          "title": "String, a catchy name for the dish",
          "description": "String, a short appetizing description",
          "instructions": ["String", "Array of step-by-step instructions"]
        }`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        const generatedText = response.text;
        let aiGeneratedMeal;
        try {
            aiGeneratedMeal = JSON.parse(generatedText);
        } catch (parseError) {
             console.error("Error parsing Gemini response:", generatedText);
             return res.status(500).json({ error: 'Failed to parse meal from AI agent.' });
        }

        // Save the generated meal to the database
        const newMeal = new Meal({
            ingredients: ingredients,
            title: aiGeneratedMeal.title,
            description: aiGeneratedMeal.description,
            instructions: aiGeneratedMeal.instructions
        });

        const savedMeal = await newMeal.save();

        return res.status(200).json({
            success: true,
            meal: savedMeal
        });

    } catch (error) {
        console.error('Error generating meal:', error);
        return res.status(500).json({ error: 'Failed to generate meal from AI agent.' });
    }
});

// Get all generated meals
app.get('/api/meals', async (req, res) => {
    try {
        // Fetch meals, sorted by newest first
        const meals = await Meal.find().sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            meals
        });
    } catch (error) {
        console.error('Error fetching meals:', error);
        return res.status(500).json({ error: 'Failed to fetch meals.' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Meal API is running!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
