import { Maybe } from '../types';

export function isNotUndefined<T>(value: Maybe<T>): value is T {
  return value !== undefined;
}
