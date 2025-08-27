// moved from src/__tests__/jest-dom.d.ts to avoid Jest discovering this as a test file

declare namespace jest {
  // minimal augmentation placeholder to satisfy @testing-library/jest-dom types in tests
  // extend as needed by the project
}
declare namespace jest {
  interface Matchers<R> {
    toBeInTheDocument(): R
    toHaveClass(className: string): R
    toHaveAttribute(name: string, value?: string): R
    toHaveValue(value: string | number): R
    toBeDisabled(): R
    toBeEnabled(): R
    toBeVisible(): R
    toBeChecked(): R
  }
}
