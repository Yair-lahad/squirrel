import { useEffect, useState } from 'react';
import { fetchAdvisorInsights } from '../routes/advisor';
import AvgSpendChip from './chips/AvgSpendChip';
import MaxChip from './chips/MaxChip';
import FrequencyChip from './chips/FrequencyChip';
import PercentChip from './chips/PercentChip';
import AskAdvisor from './AskAdvisor';

const CHIP_BY_TYPE = {
  frequency: FrequencyChip,
  max: MaxChip,
  avg: AvgSpendChip,
  percent: PercentChip,
};

export default function Advisor({ category, transactions }) {
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    let cancelled = false;
    fetchAdvisorInsights({ category, transactions }).then((data) => {
      if (!cancelled) setInsights(data.insights);
    });
    return () => {
      cancelled = true;
    };
  }, [category, transactions]);

  const isEmpty = insights.length === 1 && insights[0].type === 'empty';

  return (
    <div className="advisor-panel">
      <div className="advisor-header">
        <span className="advisor-title">Advisor</span>
        <img src="/squirrel.png" alt="Squirrel advisor" className="advisor-avatar" />
      </div>
      {isEmpty ? (
        <p className="advisor-empty">No spending recorded for {category} yet.</p>
      ) : (
        <div className="advisor-chips">
          {insights.map(({ type, ...data }, i) => {
            const Chip = CHIP_BY_TYPE[type];
            return Chip ? <Chip key={i} {...data} /> : null;
          })}
        </div>
      )}
      <AskAdvisor category={category} transactions={transactions} />
    </div>
  );
}
