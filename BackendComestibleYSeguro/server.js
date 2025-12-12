// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const recipesRouter = require("./src/routes/recipes");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/recipes", recipesRouter);

// Ruta principal
app.get("/", (req, res) => {
  res.json({
    service: "Comestible y Seguro API",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    port: PORT,
    endpoints: {
      home: "/",
      test: "/api/test",
      searchRecipes: "POST /api/recipes/by-ingredients",
      randomRecipes: "GET /api/recipes/random",
      randomRecipesCount: "GET /api/recipes/random/:count"
    }
  });
});

// Ruta de prueba
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: " Backend funcionando",
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(" Comestible y Seguro API");
  console.log(` Puerto: ${PORT}`);
  console.log(` URL: http://localhost:${PORT}`);
  
});