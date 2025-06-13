
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
  const [actualGallons, setActualGallons] = useState(0);
  const [actualManualHours, setActualManualHours] = useState(0);
  const [actualManualRate, setActualManualRate] = useState(0);

  const gallonsPerSet = 55;

  const updateArea = (id, field, value) => {
    setAreas((prev) =>
      prev.map((area) => (area.id === id ? { ...area, [field]: value } : area))
    );
  };

  const addArea = () => {
    setAreas((prev) => [
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
    setAreas((prev) => prev.filter((area) => area.id !== id));
  };

  const totalSqFt = areas.reduce((sum, area) => {
    const multiplier = pitchMultipliers[area.roofPitch] || 1.0;
    return sum + area.length * area.width * multiplier;
  }, 0);

  const totalGallons = areas.reduce(
    (sum, area) =>
      sum +
      ((area.length * area.width * (pitchMultipliers[area.roofPitch] || 1)) *
        area.foamThickness /
        6) /
        2000 *
        gallonsPerSet,
    0
  );

  const totalMaterialCost = areas.reduce((sum, area) => {
    const sqFt = area.length * area.width * (pitchMultipliers[area.roofPitch] || 1);
    const gallons = (sqFt * area.foamThickness / 6) / 2000 * gallonsPerSet;
    const sets = gallons / gallonsPerSet;
    return sum + sets * area.materialPrice;
  }, 0);

  const baseLaborCost = manualHours * manualRate;
  const travelCost = travelDistance * fuelCostPerMile;
  const baseCost = totalMaterialCost + baseLaborCost + wasteCost + equipmentCost + travelCost;
  const markedUpMaterial = totalMaterialCost * (1 + materialMarkup / 100);
  const markedUpLabor = baseLaborCost * (1 + laborMarkup / 100);
  const subtotal = markedUpMaterial + markedUpLabor + wasteCost + equipmentCost + travelCost;
  const complexityAdjusted = subtotal * complexity;
  const grandTotal = complexityAdjusted * (1 - discount / 100);
  const profitMargin = ((grandTotal - baseCost) / grandTotal) * 100;

  const actualMaterialCost = actualGallons * (totalMaterialCost / totalGallons || 0);
  const actualLaborCost =
    actualManualRate > 0 ? actualManualHours * actualManualRate : actualManualHours * manualRate;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Spray Foam Estimator</h1>

      <div className="space-y-4">
        {areas.map((area, index) => (
          <div key={area.id} className="p-4 bg-gray-100 rounded shadow space-y-2">
            <h2 className="font-semibold">Area #{index + 1}</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold">Area Type</label>
                <input type="text" value={area.areaType} onChange={(e) => updateArea(area.id, 'areaType', e.target.value)} className="border p-1 w-full" />
              </div>
              <div>
                <label className="block font-semibold">Roof Pitch</label>
                <select value={area.roofPitch} onChange={(e) => updateArea(area.id, 'roofPitch', e.target.value)} className="border p-1 w-full">
                  {Object.keys(pitchMultipliers).map(pitch => <option key={pitch}>{pitch}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-semibold">Length (ft)</label>
                <input type="number" value={area.length} onChange={(e) => updateArea(area.id, 'length', parseFloat(e.target.value))} className="border p-1 w-full" />
              </div>
              <div>
                <label className="block font-semibold">Width (ft)</label>
                <input type="number" value={area.width} onChange={(e) => updateArea(area.id, 'width', parseFloat(e.target.value))} className="border p-1 w-full" />
              </div>
              <div>
                <label className="block font-semibold">Foam Type</label>
                <select value={area.foamType} onChange={(e) => {
                  const newType = e.target.value;
                  const thickness = newType === 'Open' ? 6 : 2;
                  const price = newType === 'Open' ? 1870 : 2470;
                  updateArea(area.id, 'foamType', newType);
                  updateArea(area.id, 'foamThickness', thickness);
                  updateArea(area.id, 'materialPrice', price);
                }} className="border p-1 w-full">
                  <option>Open</option>
                  <option>Closed</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold">Foam Thickness (in)</label>
                <input type="number" value={area.foamThickness} onChange={(e) => updateArea(area.id, 'foamThickness', parseFloat(e.target.value))} className="border p-1 w-full" />
              </div>
              <div>
                <label className="block font-semibold">Material Price ($)</label>
                <input type="number" value={area.materialPrice} onChange={(e) => updateArea(area.id, 'materialPrice', parseFloat(e.target.value))} className="border p-1 w-full" />
              </div>
            </div>
            {areas.length > 1 && (
              <button onClick={() => removeArea(area.id)} className="text-red-500">Remove</button>
            )}
          </div>
        ))}

        <button onClick={addArea} className="bg-blue-500 text-white px-4 py-2 rounded">Add Area</button>
      </div>

      <div className="text-sm text-gray-500">* All costs are estimated. Please verify with actual job data.</div>
    </div>
  );
}
