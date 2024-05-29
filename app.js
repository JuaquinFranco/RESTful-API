const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// Connect to MongoDB
mongoose.connect('mongodb://localhost/digital-cookbook', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

// Define the Recipe schema
const RecipeSchema = new mongoose.Schema({
    title: String,
    description: String,
    ingredients: [String],
    instructions: [String],
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

// Define the User schema
const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    recipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }]
});

// Create the Recipe and User models
const Recipe = mongoose.model('Recipe', RecipeSchema);
const User = mongoose.model('User', UserSchema);

// Initialize the Express app
const app = express();

// Enable CORS and body-parser
app.use(cors());
app.use(bodyParser.json());

// GET /recipes
app.get('/recipes', async (req, res) => {
    try {
        const recipes = await Recipe.find();
        res.status(200).json(recipes);
    } catch (err) {
        res.status(500).json({ error: 'Could not fetch recipes' });
    }
});

// POST /recipes
app.post('/recipes', async (req, res) => {
    try {
        const user = await User.findById(req.body.user);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const recipe = new Recipe({ ...req.body, user: user._id });
        await recipe.save();

        res.status(201).json(recipe);
    } catch (err) {
        res.status(500).json({ error: 'Could not create recipe' });
    }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is running on port ${port}`));