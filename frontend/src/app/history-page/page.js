'use client';
import React, { useState, useEffect } from "react";
import HistoryTable from "../../component/HistoryTable";

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        console.log("History Service URL:", process.env.NEXT_PUBLIC_HISTORY_SERVICE_URL);
        const response = await fetch(`${process.env.NEXT_PUBLIC_HISTORY_SERVICE_URL}/api/history`);
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log("History data fetched from API:", data); // ตรวจสอบข้อมูลที่ได้จาก API
        setHistory(data);
      } catch (error) {
        console.error("Failed to fetch history:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div>
      <HistoryTable history={history} />
    </div>
  );
};

export default HistoryPage;