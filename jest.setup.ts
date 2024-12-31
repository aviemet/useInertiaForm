import '@testing-library/jest-dom';

global.window = global.window || ({} as unknown as Window & typeof globalThis);
global.window.performance = global.window.performance || ({} as Performance);
global.window.performance.getEntriesByType = jest.fn().mockReturnValue([]);
