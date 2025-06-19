// Spray Foam Estimator - Complete UI with Multiple Area Entries
// React + Tailwind CSS

import React, { useState } from "react";

export default function Estimator() {
  // pitch multipliers for roof decks
  const pitchMultipliers = {
    "1/12": 1.003, "2/12": 1.014, "3/12": 1.031, "4/12": 1.054,
    "5/12": 1.083, "6/12": 1.118, "7/12": 1.158, "8/12": 1.202,
    "9/12": 1.25, "10/12": 1.302, "11/12": 1.357, "12/12": 1.414
  };

  const [areas, setAreas] = useState([
    {
      id: Date.now(),
      areaType: "General Area",
      roofPitch: "1/12",
      length: 0,
      width: 0,
      foamType: "Open",
      foamThickness: 6,
      materialPrice: 1870
    }
  ]);

  const [manualRate, setManualRate] = useState(0);
  const [manualHours, setManualHours] = useState(0);
  const [wasteCost, setWasteCost] = useState(0);
  const [equipmentCost, setEquipmentCost] = useState(0);
  const [travelDistance, setTravelDistance] = useState(0);
  const [fuelCostPerMile, setFuelCostPerMile] = useState(0.68);
  const [materialMarkup, setMaterialMarkup] = useState(50);
  const [laborMarkup, setLaborMarkup] = useState(30);
  const [complexity, setComplexity] = useState(1.0);
  const [discount, setDiscount] = useState(0);

  const gallonsPerSet = 55;

  const updateArea = (id, field, value) => {
    setAreas(prev => prev.map(area =>
      area.id === id ? { ...area, [field]: value } : area
    ));
  };

  const addArea = () => {
    setAreas(prev => [
      ...prev,
      {
        id: Date.now(),
        areaType: "General Area",
        roofPitch: "1/12",
        length: 0,
        width: 0,
        foamType: "Open",
        foamThickness: 6,
        materialPrice: 1870
      }
    ]);
  };

  const removeArea = (id) => {
    setAreas(prev => prev.filter(a => a.id !== id));
  };

  let totalGallons = 0;
  let totalMaterialCost = 0;

  const areaOutputs = areas.map(area => {
    const boardFeetPerSet = area.foamType === "Open" ? 12000 : 4000;
    const pitchMultiplier = pitchMultipliers[area.roofPitch] || 1.0;
    const rawArea = area.length * area.width;

    const calcArea = area.areaType === "Roof Deck"
      ? rawArea * pitchMultiplier
      : area.areaType === "Gable Ends"
      ? rawArea / 2
      : rawArea;

    const requiredBoardFeet = calcArea * area.foamThickness;
    const gallonsNeeded = (requiredBoardFeet / boardFeetPerSet) * gallonsPerSet;
    const baseMatCost = (area.materialPrice / gallonsPerSet) * gallonsNeeded;

    totalGallons += gallonsNeeded;
    totalMaterialCost += baseMatCost;

    return {
      ...area,
      area: calcArea,
      gallons: gallonsNeeded,
      baseCost: baseMatCost
    };
  });

  const markedMaterialCost = totalMaterialCost * (1 + materialMarkup / 100);
  const baseLaborCost = manualRate * manualHours;
  const markedLaborCost = baseLaborCost * (1 + laborMarkup / 100);
  const fuelCost = travelDistance * fuelCostPerMile;

  const totalBaseCost = totalMaterialCost + baseLaborCost + wasteCost + equipmentCost + fuelCost;
  const totalCostBeforeDiscount = (markedMaterialCost + markedLaborCost + wasteCost + equipmentCost + fuelCost) * complexity;
  const totalCostAfterDiscount = totalCostBeforeDiscount * (1 - discount / 100);

  const revenue = totalCostAfterDiscount;
  const royalty = revenue * 0.06;
  const brandFund = revenue * 0.01;
  const salesCommission = revenue * 0.03;
  const totalFees = royalty + brandFund + salesCommission;

  const profit = revenue - totalFees - totalBaseCost;
  const profitMargin = (profit / revenue) * 100;

  return (
    <div className="space-y-6">
      <button onClick={addArea} className="bg-blue-600 text-white px-4 py-2 rounded">
        + Add Area
      </button>

      {areaOutputs.map((area, idx) => (
        <div key={area.id} className="border rounded p-4 space-y-2 bg-white shadow">
          <div className="flex justify-between items-center">
            <h2 className="font-bold">Area #{idx + 1}</h2>
            <button onClick={() => removeArea(area.id)} className="text-red-500 font-semibold">
              Remove
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold">Area Type</label>
              <select className="border p-1 w-full" value={area.areaType} onChange={(e) => updateArea(area.id, "areaType", e.target.value)}>
                <option>General Area</option>
                <option>Roof Deck</option>
                <option>Gable Ends</option>
              </select>
            </div>
            {area.areaType === "Roof Deck" && (
              <div>
                <label className="block font-semibold">Roof Pitch</label>
                <select className="border p-1 w-full" value={area.roofPitch} onChange={(e) => updateArea(area.id, "roofPitch", e.target.value)}>
                  {Object.keys(pitchMultipliers).map((pitch) => (
                    <option key={pitch} value={pitch}>{pitch}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block font-semibold">Length (ft)</label>
              <input className="border p-1 w-full" type="number" value={area.length} onChange={(e) => updateArea(area.id, "length", parseFloat(e.target.value))} />
            </div>
            <div>
              <label className="block font-semibold">Width (ft)</label>
              <input className="border p-1 w-full" type="number" value={area.width} onChange={(e) => updateArea(area.id, "width", parseFloat(e.target.value))} />
            </div>
            <div>
              <label className="block font-semibold">Area (sq ft)</label>
              <input className="border p-1 w-full bg-gray-100" type="number" readOnly value={area.area.toFixed(2)} />
            </div>
            <div>
              <label className="block font-semibold">Foam Type</label>
              <select
                className="border p-1 w-full"
                value={area.foamType}
                onChange={(e) => {
                  const foamType = e.target.value;
                  updateArea(area.id, "foamType", foamType);
                  updateArea(area.id, "foamThickness", foamType === "Open" ? 6 : 2);
                  updateArea(area.id, "materialPrice", foamType === "Open" ? 1870 : 2470);
                }}
              >
                <option>Open</option>
                <option>Closed</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold">Foam Thickness (in)</label>
              <input className="border p-1 w-full" type="number" value={area.foamThickness} onChange={(e) => updateArea(area.id, "foamThickness", parseFloat(e.target.value))} />
            </div>
            <div>
              <label className="block font-semibold">Material Price per Set</label>
              <input className="border p-1 w-full" type="number" value={area.materialPrice} onChange={(e) => updateArea(area.id, "materialPrice", parseFloat(e.target.value))} />
            </div>
            <div>
              <label className="block font-semibold">Material Cost for Area</label>
              <input className="border p-1 w-full bg-gray-100" type="number" readOnly value={area.baseCost.toFixed(2)} />
            </div>
          </div>
        </div>
      ))}

      <div className="bg-white p-4 rounded shadow-md grid grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold">Manual Labor Rate</label>
          <input className="border p-1 w-full" type="number" value={manualRate} onChange={(e) => setManualRate(parseFloat(e.target.value))} />
        </div>
        <div>
          <label className="block font-semibold">Manual Labor Hours</label>
          <input className="border p-1 w-full" type="number" value={manualHours} onChange={(e) => setManualHours(parseFloat(e.target.value))} />
        </div>
        <div>
          <label className="block font-semibold">Waste Disposal Cost</label>
          <input className="border p-1 w-full" type="number" value={wasteCost} onChange={(e) => setWasteCost(parseFloat(e.target.value))} />
        </div>
        <div>
          <label className="block font-semibold">Equipment Rental Cost</label>
          <input className="border p-1 w-full" type="number" value={equipmentCost} onChange={(e) => setEquipmentCost(parseFloat(e.target.value))} />
        </div>
        <div>
          <label className="block font-semibold">Travel Distance (miles)</label>
          <input className="border p-1 w-full" type="number" value={travelDistance} onChange={(e) => setTravelDistance(parseFloat(e.target.value))} />
        </div>
        <div>
          <label className="block font-semibold">Fuel Cost per Mile</label>
          <input className="border p-1 w-full" type="number" value={fuelCostPerMile} onChange={(e) => setFuelCostPerMile(parseFloat(e.target.value))} />
        </div>
        <div>
          <label className="block font-semibold">Material Markup (%)</label>
          <input className="border p-1 w-full" type="number" value={materialMarkup} onChange={(e) => setMaterialMarkup(parseFloat(e.target.value))} />
        </div>
        <div>
          <label className="block font-semibold">Labor Markup (%)</label>
          <input className="border p-1 w-full" type="number" value={laborMarkup} onChange={(e) => setLaborMarkup(parseFloat(e.target.value))} />
        </div>
        <div>
          <label className="block font-semibold">Complexity Multiplier</label>
          <select className="border p-1 w-full" value={complexity} onChange={(e) => setComplexity(parseFloat(e.target.value))}>
            <option value={1.0}>1.0 (Typical)</option>
            <option value={1.2}>1.2 (Mild Difficulty)</option>
            <option value={1.4}>1.4 (Difficult)</option>
            <option value={1.6}>1.6 (Extremely Difficult)</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold">Discount (%)</label>
          <input className="border p-1 w-full" type="number" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value))} />
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded shadow-md">
        <h2 className="text-xl font-bold mb-4">Estimate Summary</h2>
        <p><strong>Total Gallons Estimated:</strong> {totalGallons.toFixed(2)}</p>
        <p><strong>Base Material Cost:</strong> ${totalMaterialCost.toFixed(2)}</p>
        <p><strong>Base Labor Cost:</strong> ${baseLaborCost.toFixed(2)}</p>
        <p><strong>Fuel Cost:</strong> ${fuelCost.toFixed(2)}</p>
        <p><strong>Waste Disposal:</strong> ${wasteCost.toFixed(2)}</p>
        <p><strong>Equipment Rental:</strong> ${equipmentCost.toFixed(2)}</p>
        <p><strong>Total Base Cost:</strong> ${totalBaseCost.toFixed(2)}</p>
        <p><strong>Total Cost (with markup & discount):</strong> ${totalCostAfterDiscount.toFixed(2)}</p>
        <p><strong>Franchise Royalty (6%):</strong> ${royalty.toFixed(2)}</p>
        <p><strong>Brand Fund (1%):</strong> ${brandFund.toFixed(2)}</p>
        <p><strong>Sales Commission (3%):</strong> ${salesCommission.toFixed(2)}</p>
        <p><strong>Total Fees:</strong> ${totalFees.toFixed(2)}</p>
        <p><strong>Profit:</strong> ${profit.toFixed(2)}</p>
        <p><strong>Profit Margin:</strong> {profitMargin.toFixed(2)}%</p>
      </div>
    </div>
  );
}

