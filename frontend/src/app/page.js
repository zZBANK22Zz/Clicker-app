"use client";

import { useState, useEffect } from "react";

const Clicker = () => {
  const [count, setCount] = useState(null); // Initialize count as null to handle loading state
  const [usePlugin, setPlugin] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Loading state

  // Fetch the current count from the server
  const fetchCount = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/count");
      if (!response.ok) {
        throw new Error("Failed to fetch count");
      }
      const data = await response.json();
      setCount(data.count);
    } catch (error) {
      console.error("Error fetching count:", error);
    } finally {
      setIsLoading(false); // Stop loading once fetch is complete
    }
  };

  // Increase the count on the server
  const handleIncrease = async () => {
    try {
      const endpoint = usePlugin
        ? "http://localhost:8080/api/increase-plugin"
        : "http://localhost:8080/api/increase";

      const response = await fetch(endpoint, { method: "POST" });
      if (!response.ok) {
        throw new Error("Failed to increase count");
      }
      const data = await response.json();
      setCount(data.count);
    } catch (error) {
      console.error("Error increasing count:", error);
    }
  };

  // Decrease the count on the server
  const handleDecrease = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/decrease", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to decrease count");
      }
      const data = await response.json();
      setCount(data.count);
    } catch (error) {
      console.error("Error decreasing count:", error);
    }
  };

  // Toggle the plugin feature
  const togglePlugin = () => {
    setPlugin(!usePlugin);
    console.log(`Plugin is now ${!usePlugin ? "enabled" : "disabled"}`);
  };

  // Fetch the initial count when the component loads
  useEffect(() => {
    fetchCount();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="mt-10">
        <label className="inline-flex items-center cursor-pointer">
          <input
            onClick={togglePlugin}
            type="checkbox"
            value=""
            className="sr-only peer"
          />
          <div className="relative w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
          <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
            Use Plugin
          </span>
        </label>
      </div>
      <div className="flex flex-col justify-center items-center mt-[240px]">
        <h1 className="text-2xl font-mono font-bold">Clicker Counter</h1>

        {/* Display "Loading..." until the count is fetched */}
        {isLoading ? (
          <h2>Loading...</h2>
        ) : (
          <h2>Count: {count}</h2>
        )}

        <div className="flex flex-row gap-10 p-10">
          {/* Increase Count Button */}
          <button
            onClick={handleIncrease}
            className="text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
          >
            Increase
          </button>

          {/* Decrease Count Button */}
          <button
            onClick={handleDecrease}
            className="text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
          >
            Decrease
          </button>
        </div>
      </div>
    </div>
  );
};

export default Clicker;