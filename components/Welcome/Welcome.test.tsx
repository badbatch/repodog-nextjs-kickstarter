import { describe, expect, it } from '@jest/globals';
import { renderWithMantine, screen } from '#__testUtils__/index.ts';
import { tt } from '#content/index.ts';
import { Welcome } from './Welcome.tsx';

describe('Welcome component', () => {
  it('When the component renders, then the guide link has the correct destination', () => {
    // Arrange
    const linkText = tt('pages.home.linkText');

    // Act
    renderWithMantine(<Welcome />);

    // Assert
    expect(screen.getByRole('link', { name: linkText })).toHaveAttribute('href', 'https://mantine.dev/guides/next/');
  });
});
