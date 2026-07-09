import { useEffect, useState } from 'react';
import { fetchAdvisorMessages } from '../routes/advisor';

export default function Advisor({ category, transactions }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    let cancelled = false;
    fetchAdvisorMessages({ category, transactions }).then((data) => {
      if (!cancelled) setMessages(data.messages);
    });
    return () => {
      cancelled = true;
    };
  }, [category, transactions]);

  return (
    <div className="advisor-panel">
      <div className="advisor-header">
        <span className="advisor-title">Advisor</span>
        <img src="/squirrel.png" alt="Squirrel advisor" className="advisor-avatar" />
      </div>
      <div className="advisor-bubbles">
        {messages.map((message, i) => (
          <div key={i} className="advisor-bubble">{message}</div>
        ))}
      </div>
    </div>
  );
}
