
import React, { useState } from "react";

export default function Estimator() {
  const pitchMultipliers = {
    "1/12": 1.003, "2/12": 1.014, "3/12": 1.031, "4/12": 1.054,
    "5/12": 1.083, "6/12": 1.118, "7/12": 1.158, "8/12": 1.202,
    "9/12": 1.25, "10/12": 1.302, "11/12": 1.357, "12/12": 1.414
  };

  const [areas, setAreas] = useState([
    {
      id: Date.now(),
      length: 0,
      width: 0,
      roofPitch: "1/12",
      foamType: "Open",
      foamThickness: 6,
      materialPrice: 1870
    }
  ]);

  const [manualRate, setManualRate] = useState(25);
  const [manualHours, setManualHours] = useState(0);
  const [wasteCost, setWasteCost] = useState(0);
  const [equipmentCost, setEquipmentCost] = useState(0);
  const [travelDistance, setTravelDistance] = useState(0);
  const [fuelCostPerMile, setFuelCostPerMile] = useState(0.67);
  const [finalCharge, setFinalCharge] = useState(0);

  const [actualGallons, setActualGallons] = useState(0);
  const [actualLaborHours, setActualLaborHours] = useState(0);
  const [actualLaborRate, setActualLaborRate] = useState(0);
  const [adjustedProfit, setAdjustedProfit] = useState(0);
  const [adjustedMargin, setAdjustedMargin] = useState(0);

  const handleAreaChange = (index, field, value) => {
    const updated = [...areas];
    updated[index][field] = field === "materialPrice" || field === "foamThickness" ? parseFloat(value) : value;
    setAreas(updated);
  };

  const calculateEstimate = () => {
    const setSize = 55;
    let totalSqFt = 0;
    let totalGallons = 0;

    areas.forEach((area) => {
      const sqFt = area.length * area.width * pitchMultipliers[area.roofPitch];
      totalSqFt += sqFt;
      const thicknessFactor = area.foamThickness / (area.foamType === "Open" ? 6 : 2);
      totalGallons += (sqFt / 2000) * thicknessFactor * setSize;
    });

    const setsNeeded = totalGallons / setSize;
    const materialCost = setsNeeded * (areas[0].foamType === "Open" ? 1870 : 2470);
    const laborCost = manualHours * manualRate;
    const travelCost = travelDistance * fuelCostPerMile;
    const baseCost = materialCost + laborCost + travelCost + wasteCost + equipmentCost;
    const markup = 1.5;
    const charge = baseCost * markup;

    setFinalCharge(charge.toFixed(2));
  };

  const calculateAdjusted = () => {
    const matCost = areas[0]?.foamType === "Open" ? 1870 : 2470;
    const adjustedMaterial = (actualGallons / 55) * matCost;
    const rateToUse = actualLaborRate || manualRate;
    const adjustedLabor = actualLaborHours * rateToUse;
    const otherCosts = wasteCost + equipmentCost + (travelDistance * fuelCostPerMile);
    const totalAdjusted = adjustedMaterial + adjustedLabor + otherCosts;
    const profit = finalCharge - totalAdjusted;
    const margin = (profit / finalCharge) * 100;

    setAdjustedProfit(profit.toFixed(2));
    setAdjustedMargin(margin.toFixed(2));
  };

  const handlePrint = () => window.print();

  const handleDownload = () => {
    const data = {
      areas, manualRate, manualHours, wasteCost, equipmentCost,
      travelDistance, fuelCostPerMile, finalCharge,
      actualGallons, actualLaborHours, adjustedProfit, adjustedMargin
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "estimate.json";
    link.click();
  };

  return (
    <div className="p-6 space-y-4 print:bg-white print:text-black">
      <h1 className="text-xl font-bold">Spray Foam Estimator</h1>

      {areas.map((area, index) => (
        <div key={area.id} className="border p-4 mb-4">
          <h2 className="font-semibold">Spray Area #{index + 1}</h2>
          <div>
            <label>Length (ft): </label>
            <input type="number" value={area.length} onChange={(e) => handleAreaChange(index, "length", e.target.value)} className="border p-1" />
          </div>
          <div>
            <label>Width (ft): </label>
            <input type="number" value={area.width} onChange={(e) => handleAreaChange(index, "width", e.target.value)} className="border p-1" />
          </div>
          <div>
            <label>Foam Type:</label>
            <select value={area.foamType} onChange={(e) => handleAreaChange(index, "foamType", e.target.value)} className="border p-1">
              <option value="Open">Open Cell</option>
              <option value="Closed">Closed Cell</option>
            </select>
          </div>
          <div>
            <label>Foam Thickness (in):</label>
            <input type="number" value={area.foamThickness} onChange={(e) => handleAreaChange(index, "foamThickness", e.target.value)} className="border p-1" />
          </div>
          <div>
            <label>Roof Pitch:</label>
            <select value={area.roofPitch} onChange={(e) => handleAreaChange(index, "roofPitch", e.target.value)} className="border p-1">
              {Object.keys(pitchMultipliers).map((pitch) => (
                <option key={pitch} value={pitch}>{pitch}</option>
              ))}
            </select>
          </div>
        </div>
      ))}

      <div>
        <label>Manual Rate: $</label>
        <input type="number" value={manualRate} onChange={(e) => setManualRate(+e.target.value)} className="border p-1" />
      </div>
      <div>
        <label>Manual Hours:</label>
        <input type="number" value={manualHours} onChange={(e) => setManualHours(+e.target.value)} className="border p-1" />
      </div>
      <div>
        <label>Travel Distance (miles):</label>
        <input type="number" value={travelDistance} onChange={(e) => setTravelDistance(+e.target.value)} className="border p-1" />
      </div>
      <div>
        <label>Fuel Cost per Mile: $</label>
        <input type="number" value={fuelCostPerMile} onChange={(e) => setFuelCostPerMile(+e.target.value)} className="border p-1" />
      </div>
      <div>
        <label>Waste Cost: $</label>
        <input type="number" value={wasteCost} onChange={(e) => setWasteCost(+e.target.value)} className="border p-1" />
      </div>
      <div>
        <label>Equipment Cost: $</label>
        <input type="number" value={equipmentCost} onChange={(e) => setEquipmentCost(+e.target.value)} className="border p-1" />
      </div>

      <button onClick={calculateEstimate} className="bg-blue-500 text-white px-4 py-2 rounded">Estimate</button>
      <div>
        <strong>Final Charge:</strong> ${finalCharge}
      </div>

      <hr />
      <h2 className="text-lg font-semibold">Actuals Entry</h2>
      <div>
        <label>Actual Gallons Used:</label>
        <input type="number" value={actualGallons} onChange={(e) => setActualGallons(+e.target.value)} className="border p-1" />
      </div>
      <div>
        <label>Actual Manual Hours:</label>
        <input type="number" value={actualLaborHours} onChange={(e) => setActualLaborHours(+e.target.value)} className="border p-1" />
      </div>
      <div>
        <label>Actual Labor Rate (Optional):</label>
        <input type="number" value={actualLaborRate} onChange={(e) => setActualLaborRate(+e.target.value)} className="border p-1" />
      </div>
      <button onClick={calculateAdjusted} className="bg-purple-600 text-white px-4 py-2 rounded mt-2">Calculate Adjusted Profit</button>

      <div className="mt-4">
        <strong>Adjusted Profit:</strong> ${adjustedProfit} <br />
        <strong>Adjusted Margin:</strong> {adjustedMargin}%
      </div>

      <div className="space-x-4 mt-4">
        <button onClick={handlePrint} className="bg-green-500 text-white px-4 py-2 rounded">Print Estimate</button>
        <button onClick={handleDownload} className="bg-gray-700 text-white px-4 py-2 rounded">Download JSON</button>
      </div>
    </div>
  );
}
