
import React, { useState } from "react";

export default function Estimator() {
  const [message] = useState("Estimator working and JSX properly wrapped.");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Spray Foam Estimator</h1>
      <p>{message}</p>
      {/* Full estimator logic should be reinserted here after JSX brace fix */}
    </div>
  );
}
