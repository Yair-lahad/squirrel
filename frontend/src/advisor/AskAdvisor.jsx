import { useState } from 'react';
import { fetchAdvisorAnswer } from '../routes/advisor';

export default function AskAdvisor({ category, transactions }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!question.trim() || loading) return;
    setLoading(true);
    fetchAdvisorAnswer({ category, transactions, question }).then((data) => {
      setAnswer(data.answer);
      setLoading(false);
    });
  }

  return (
    <form className="advisor-ask" onSubmit={handleSubmit}>
      <div className="advisor-ask-row">
        <input
          type="text"
          className="advisor-ask-input"
          placeholder="Ask the advisor something…"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button type="submit" disabled={loading}>{loading ? '…' : 'Ask'}</button>
      </div>
      {answer && <p className="advisor-ask-answer">{answer}</p>}
    </form>
  );
}
