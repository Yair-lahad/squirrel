import { useState } from 'react';

// Tracks which table row is being edited (by index), its draft value, and a
// rule scope ('once' vs 'always') - the shape shared by TransactionsTable's
// title-edit and category-edit columns.
export function useInlineEdit(defaultScope = 'always') {
  const [row, setRow] = useState(null);
  const [value, setValue] = useState('');
  const [scope, setScope] = useState(defaultScope);

  function start(rowIndex, initialValue) {
    setRow(rowIndex);
    setValue(initialValue);
    setScope(defaultScope);
  }

  function cancel() {
    setRow(null);
  }

  return { row, value, setValue, scope, setScope, start, cancel };
}
