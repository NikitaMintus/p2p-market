import React from 'react';
import { render } from '@testing-library/react';
import Page from '../src/app/page';

// Mocking server component for client-side test environment if needed, 
// but primarily fixing the type error here.
// Note: Testing Server Components with standard render() is experimental/complex.
// We just fix the type signature for now.

describe('Page', () => {
  it('should render successfully', async () => {
    // @ts-ignore - Server Components are async, React Testing Library handling varies
    const { baseElement } = render(await Page({ searchParams: Promise.resolve({}) }));
    expect(baseElement).toBeTruthy();
  });
});
