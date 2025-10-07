import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [inputs, setInputs] = useState({
    monthlyInvoiceVolume: 2000,
    numAPStaff: 3,
    avgHoursPerInvoice: 0.17,
    hourlyWage: 30,
    errorRateManual: 0.5,
    errorCost: 100,
    timeHorizonMonths: 36,
    implementationCost: 50000,
  });

  const [results, setResults] = useState({
    monthlySavings: 0,
    cumulativeSavings: 0,
    netSavings: 0,
    paybackMonths: 0,
    roiPercentage: 0,
  });

  const [scenarios, setScenarios] = useState([]);
  const [scenarioName, setScenarioName] = useState("");

  // Internal constants
  const automatedCostPerInvoice = 0.2;
  const errorRateAuto = 0.001; // 0.1%
  const roiBoost = 1.1;

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs({
      ...inputs,
      [name]: value === "" ? 0 : parseFloat(value),
    });
  };

  // Live calculation
  useEffect(() => {
    const {
      monthlyInvoiceVolume,
      numAPStaff,
      avgHoursPerInvoice,
      hourlyWage,
      errorRateManual,
      errorCost,
      timeHorizonMonths,
      implementationCost,
    } = inputs;

    const laborCostManual =
      numAPStaff * hourlyWage * avgHoursPerInvoice * monthlyInvoiceVolume;

    const autoCost = monthlyInvoiceVolume * automatedCostPerInvoice;

    const errorSavings =
      (errorRateManual / 100 - errorRateAuto) *
      monthlyInvoiceVolume *
      errorCost;

    const monthlySavings = (laborCostManual + errorSavings - autoCost) * roiBoost;

    const cumulativeSavings = monthlySavings * timeHorizonMonths;
    const netSavings = cumulativeSavings - implementationCost;
    const paybackMonths = monthlySavings > 0 ? implementationCost / monthlySavings : 0;
    const roiPercentage = implementationCost > 0 ? (netSavings / implementationCost) * 100 : 0;

    setResults({
      monthlySavings: monthlySavings.toFixed(2),
      cumulativeSavings: cumulativeSavings.toFixed(2),
      netSavings: netSavings.toFixed(2),
      paybackMonths: paybackMonths.toFixed(1),
      roiPercentage: roiPercentage.toFixed(1),
    });
  }, [inputs]);

  // Fetch scenarios from backend
  const fetchScenarios = async () => {
    const res = await fetch("http://localhost:5000/scenarios");
    const data = await res.json();
    setScenarios(data);
  };

  useEffect(() => {
    fetchScenarios();
  }, []);

  // Save scenario
  const saveScenario = async () => {
    if (!scenarioName) {
      alert("Enter a scenario name");
      return;
    }
    const res = await fetch("http://localhost:5000/scenarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenario_name: scenarioName, inputs, results }),
    });
    const data = await res.json();
    console.log(data);
    setScenarioName("");
    fetchScenarios();
  };

  // Load scenario
  const loadScenario = (scenario) => {
    setInputs(scenario.inputs);
  };

  // Delete scenario
  const deleteScenario = async (id) => {
    await fetch(`http://localhost:5000/scenarios/${id}`, { method: "DELETE" });
    fetchScenarios();
  };

  return (
    <div className="container">
      <h1>Invoicing ROI Simulator</h1>

      <div className="form-container">
        <div className="form-group">
          <label>Scenario Name</label>
          <input
            type="text"
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
          />
          <button onClick={saveScenario}>Save Scenario</button>
        </div>

        {Object.keys(inputs).map((key) => (
          <div className="form-group" key={key}>
            <label>{key.replace(/([A-Z])/g, " $1")}</label>
            <input
              type="number"
              name={key}
              value={inputs[key]}
              step="any"
              onChange={handleChange}
            />
          </div>
        ))}
      </div>

      <div className="results">
        <h2>Results</h2>
        <p>
          Monthly Savings:{" "}
          <span className={results.monthlySavings >= 0 ? "positive" : "negative"}>
            ${results.monthlySavings}
          </span>
        </p>
        <p>
          Cumulative Savings:{" "}
          <span
            className={results.cumulativeSavings >= 0 ? "positive" : "negative"}
          >
            ${results.cumulativeSavings}
          </span>
        </p>
        <p>
          Net Savings:{" "}
          <span className={results.netSavings >= 0 ? "positive" : "negative"}>
            ${results.netSavings}
          </span>
        </p>
        <p>Payback Period: {results.paybackMonths} months</p>
        <p>
          ROI:{" "}
          <span className={results.roiPercentage >= 0 ? "positive" : "negative"}>
            {results.roiPercentage}%
          </span>
        </p>
      </div>

      <div className="results">
        <h2>Saved Scenarios</h2>
        {scenarios.map((scenario) => (
          <div key={scenario._id} style={{ marginBottom: "10px" }}>
            <b>{scenario.scenario_name}</b>
            <button onClick={() => loadScenario(scenario)}>Load</button>
            <button onClick={() => deleteScenario(scenario._id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
