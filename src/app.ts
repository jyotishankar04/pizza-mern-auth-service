import express from "express";

const app = express();

app.get("/", (req, res) => {
    res.send("Welcome to Pizza Shop Auth Service!");
});

export default app;