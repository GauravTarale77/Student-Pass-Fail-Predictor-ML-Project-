"use client";

import { useState } from "react";

export default function Home() {
  const [studyHours, setStudyHours] = useState("");
  const [previousScore, setPreviousScore] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (studyHours === "" || previousScore === "") {
      setError("Enter both study hours and previous score.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        study_hours: Number(studyHours),
        previous_score: Number(previousScore),
      };

      const res = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Prediction failed");

      setResult(data);
    } catch (err) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-xl mx-auto mt-10 p-6 font-sans">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Student Pass Predictor
      </h1>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <label className="flex flex-col gap-1">
          Study Hours:
          <input
            type="number"
            step="0.1"
            value={studyHours}
            onChange={(e) => setStudyHours(e.target.value)}
            placeholder="e.g., 5.5"
            required
            className="border p-2 rounded"
          />
        </label>

        <label className="flex flex-col gap-1">
          Previous Exam Score:
          <input
            type="number"
            step="0.1"
            value={previousScore}
            onChange={(e) => setPreviousScore(e.target.value)}
            placeholder="0 - 100"
            required
            className="border p-2 rounded"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? "Predicting..." : "Predict"}
        </button>
      </form>

      {error && <p className="text-red-500 mt-4">Error: {error}</p>}

      {result && (
        <div className="mt-6 border p-4 rounded bg-gray-100">
          <h2 className="text-xl font-semibold mb-2">Result</h2>
          <p>
            <strong>Prediction:</strong> {result.prediction}
          </p>
          <p>
            <strong>Confidence:</strong> {(result.confidence * 100).toFixed(2)}%
          </p>
        </div>
      )}
    </main>
  );
}
