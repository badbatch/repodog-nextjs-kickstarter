import { afterEach, describe, expect, it } from '@jest/globals';
import { cleanup, renderWithMantine, screen } from '#__testUtils__/index.ts';
import { PageLayout } from './PageLayout.tsx';

describe('PageLayout', () => {
  afterEach(cleanup);

  it('When page content and actions are provided, then the title, description, breadcrumbs and actions render together', () => {
    // Arrange / Act
    renderWithMantine(
      <PageLayout
        actions={<button type="button">Create project</button>}
        breadcrumbs={<nav aria-label="Test breadcrumb">Catalog</nav>}
        description="Project catalogue"
        title="Projects"
      >
        <p>Page content</p>
      </PageLayout>,
    );

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Projects' })).toBeVisible();
    expect(screen.getByText('Project catalogue')).toBeVisible();
    expect(screen.getByRole('navigation', { name: 'Test breadcrumb' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Create project' })).toBeVisible();
    expect(screen.getByText('Page content')).toBeVisible();
  });
});
