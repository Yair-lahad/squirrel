import { parseJson } from './http';

export function fetchMock() {
  return fetch('/api/fetch/mock').then(parseJson);
}
