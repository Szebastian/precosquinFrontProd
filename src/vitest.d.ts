import 'vitest';

declare module 'vitest' {
  export interface Assertion<T> extends CustomMatchers<T> {}
  export interface AsymmetricMatchersContaining extends CustomMatchers {}
}

interface CustomMatchers<R = unknown> {
  toBeInvalid(): R;
  toBeValid(): R;
  toBeDirty(): R;
  toBePristine(): R;
  toBeTouched(): R;
  toBeUntouched(): R;
  toHaveCssClass(expected: string): R;
  toContainText(expected: string): R;
  toHaveAttribute(name: string, value?: string): R;
  // etc.
}

declare global {
  const describe: typeof import('vitest')['describe'];
  const it: typeof import('vitest')['it'];
  const expect: typeof import('vitest')['expect'];
  const beforeEach: typeof import('vitest')['beforeEach'];
  const afterEach: typeof import('vitest')['afterEach'];
  const vi: typeof import('vitest')['vi'];
  const test: typeof import('vitest')['test'];
  const afterAll: typeof import('vitest')['afterAll'];
  const beforeAll: typeof import('vitest')['beforeAll'];
}
