import { useState, useEffect } from "react";

const HistoryPage = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${RABBITMQ_URL}/api/history`);
        const data = await response.json();
        setHistory(data);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="history">
      <h1>Click History</h1>
      <table>
        <thead>
          <tr>
            <th>Date/Time</th>
            <th>Event Type</th>
            <th>Current Value</th>
          </tr>
        </thead>
        <tbody>
          {history.map((event) => (
            <tr key={event.id}>
              <td>{new Date(event.timestamp).toLocaleString()}</td>
              <td>{event.eventType}</td>
              <td>{event.currentValue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HistoryPage;