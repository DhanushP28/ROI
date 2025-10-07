const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/roiSimulator", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Scenario schema
const scenarioSchema = new mongoose.Schema({
  scenario_name: String,
  inputs: Object,
  results: Object,
  createdAt: { type: Date, default: Date.now },
});

const Scenario = mongoose.model("Scenario", scenarioSchema);

// Root route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Save scenario
app.post("/scenarios", async (req, res) => {
  try {
    const scenario = new Scenario(req.body);
    await scenario.save();
    res.status(201).json({ message: "Scenario saved", scenario });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all scenarios
app.get("/scenarios", async (req, res) => {
  try {
    const scenarios = await Scenario.find().sort({ createdAt: -1 });
    res.json(scenarios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get scenario by id
app.get("/scenarios/:id", async (req, res) => {
  try {
    const scenario = await Scenario.findById(req.params.id);
    res.json(scenario);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete scenario by id
app.delete("/scenarios/:id", async (req, res) => {
  try {
    await Scenario.findByIdAndDelete(req.params.id);
    res.json({ message: "Scenario deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
