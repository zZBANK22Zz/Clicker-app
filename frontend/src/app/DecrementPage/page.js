'use client';
import React, { useState, useEffect } from "react";

const DecrementPage = () => {
  const [currentValue, setCurrentValue] = useState(0);
  const [currentId, setCurrentId] = useState(null); // Store click ID
  const [isDecrementing, setIsDecrementing] = useState(false);

  useEffect(() => {
    const fetchCurrentValue = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/count`);
        if (!response.ok) throw new Error("Failed to fetch current value");
        const data = await response.json();
        setCurrentValue(data.count);
        setCurrentId(data.id); // Set currentId
      } catch (error) {
        console.error("Error fetching current value:", error);
      }
    };

    // Fetch every second to display real-time count
    const interval = setInterval(fetchCurrentValue, 1000);
    return () => clearInterval(interval); // Clear interval on component unmount
  }, []);

  const handleStartDecrement = async () => {
    if (!currentId) {
      console.error("Error: ID is not defined. Please ensure the API returns a valid ID.");
      alert("Error: Unable to start the decrement task. Please try again.");
      return;
    }

    try {
      console.log("Sending ID to backend:", currentId);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/extra-decrease`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: currentId }),
      });

      if (!response.ok) {
        throw new Error("Failed to start decrement task.");
      }

      alert("Decrement task started successfully!");
      setIsDecrementing(true);
    } catch (error) {
      console.error("Error starting decrement task:", error);
      alert("An error occurred while starting the decrement task.");
    }
  };


  const handleStopDecrement = async () => {
    if (!currentId) {
      alert("Error: No valid ID found to stop the decrement task.");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/stop-decrease`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: currentId }), // Use currentId instead of currentValue
      });

      if (!response.ok) {
        throw new Error("Failed to stop decrement task.");
      }

      setIsDecrementing(false);
      alert("Decrement task stopped successfully!");
    } catch (error) {
      console.error("Error stopping decrement task:", error);
      alert("An error occurred while stopping the decrement task.");
    }
  };

  return (
    <div className="flex flex-col items-center mt-10">
      <h1 className="text-3xl font-bold mb-5">Decrement Feature</h1>
      <h2 className="text-xl mb-3">Current Value: {currentValue}</h2>
      <div className="space-x-4">
        <button
          className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700"
          onClick={handleStartDecrement}
          disabled={isDecrementing}
        >
          Start Continuous Decrease
        </button>
        <button
          className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-700"
          onClick={handleStopDecrement}
          disabled={!isDecrementing}
        >
          Stop Decrease
        </button>
      </div>
    </div>
  );
};

export default DecrementPage;