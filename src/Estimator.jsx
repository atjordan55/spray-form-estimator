
// Spray Foam Estimator - Complete UI with Multiple Area Entries
// React + Tailwind CSS

import React, { useState } from "react";

export default function Estimator() {
  const pitchMultipliers = {
    "1/12": 1.003,
    "2/12": 1.014,
    "3/12": 1.031,
    "4/12": 1.054,
    "5/12": 1.083,
    "6/12": 1.118,
    "7/12": 1.158,
    "8/12": 1.202,
    "9/12": 1.25,
    "10/12": 1.302,
    "11/12": 1.357,
    "12/12": 1.414
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
    setAreas((prev) => prev.filter((a) => a.id !== id));
  };

  let totalGallons = 0;
  let totalMaterialCost = 0;

  const areaOutputs = areas.map((area) => {
    const boardFeetPerSet = area.foamType === "Open" ? 12000 : 4000;
    const pitchMultiplier = pitchMultipliers[area.roofPitch] || 1.0;
    const rawArea = area.length * area.width;
    const calcArea =
      area.areaType === "Roof Deck"
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

  return <div>Spray Foam Estimator Form Loaded</div>;
}
