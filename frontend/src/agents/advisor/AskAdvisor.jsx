import { useState } from 'react';
import { fetchAdvisorAnswer } from '../../routes/advisor';
import Button from '../../components/ui/Button';

export default function AskAdvisor({ categories, transactions }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!question.trim() || loading) return;
    setLoading(true);
    fetchAdvisorAnswer({ categories, transactions, question }).then((data) => {
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
        <Button type="submit" disabled={loading}>{loading ? '…' : 'Ask'}</Button>
      </div>
      {answer && <p className="advisor-ask-answer">{answer}</p>}
    </form>
  );
}
