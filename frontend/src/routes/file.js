import { parseJson } from './http';

export function fetchFile() {
  return fetch('/api/fetch/file').then(parseJson);
}
