import { afterEach, describe, expect, it } from '@jest/globals';
import { userEvent } from '@testing-library/user-event';
import { cleanup, renderWithMantine, screen } from '#__testUtils__/index.ts';
import { RecordTable } from './RecordTable.tsx';

const records = Array.from({ length: 30 }, (_, index) => ({ id: String(index), name: `Project ${String(index + 1)}` }));
const columns = [{ key: 'name', label: 'Name', render: (record: (typeof records)[number]) => record.name }];
const getRowLabel = (record: (typeof records)[number]): string => record.name;
const getSearchText = getRowLabel;
const props = { columns, getRowLabel, getSearchText, label: 'Projects', records };

describe('RecordTable', () => {
  afterEach(cleanup);

  it('When a record is selected, then its checkbox and the visible-page checkbox reflect partial selection', async () => {
    // Arrange
    const user = userEvent.setup();
    renderWithMantine(<RecordTable {...props} />);

    // Act
    await user.click(screen.getByRole('checkbox', { name: 'Select row Project 1' }));

    // Assert
    expect(screen.getByRole('checkbox', { name: 'Select row Project 1' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Select visible rows' })).toBePartiallyChecked();
    expect(screen.getByText('30 records · 1 selected')).toBeVisible();
  });

  it('When visible rows are selected, then selection persists across pages and can be cleared', async () => {
    // Arrange
    const user = userEvent.setup();
    renderWithMantine(<RecordTable {...props} />);

    // Act
    await user.click(screen.getByRole('checkbox', { name: 'Select visible rows' }));
    await user.click(screen.getByRole('button', { name: '2' }));

    // Assert
    expect(screen.getByText('30 records · 25 selected')).toBeVisible();
    expect(screen.getByRole('checkbox', { name: 'Select row Project 26' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Select visible rows' })).not.toBeChecked();

    // Act
    await user.click(screen.getByRole('button', { name: 'Clear selection' }));

    // Assert
    expect(screen.getByText('30 records · 0 selected')).toBeVisible();
  });

  it('When search changes on a later page, then it returns to the first matching page', async () => {
    // Arrange
    const user = userEvent.setup();
    renderWithMantine(<RecordTable {...props} />);
    await user.click(screen.getByRole('button', { name: '2' }));

    // Act
    await user.type(screen.getByRole('searchbox', { name: 'Search records' }), 'Project 1');

    // Assert
    expect(screen.getByText('11 records · 0 selected')).toBeVisible();
    expect(screen.getByText('Project 1', { exact: true })).toBeVisible();
    expect(screen.queryByText('Project 26', { exact: true })).not.toBeInTheDocument();
  });

  it('When no records or no matching records exist, then the appropriate empty state is shown', async () => {
    // Arrange
    const user = userEvent.setup();
    const { rerender } = renderWithMantine(<RecordTable {...props} records={[]} />);
    expect(screen.getByText('No records yet.')).toBeVisible();
    expect(screen.getByRole('checkbox', { name: 'Select visible rows' })).toBeDisabled();
    rerender(<RecordTable {...props} />);

    // Act
    await user.type(screen.getByRole('searchbox', { name: 'Search records' }), 'No matching project');

    // Assert
    expect(screen.getByText('No records match your search.')).toBeVisible();
  });

  it('When selection is disabled, then the table renders without checkboxes', () => {
    // Arrange / Act
    renderWithMantine(<RecordTable {...props} selectable={false} />);

    // Assert
    expect(screen.getByRole('table', { name: 'Projects' })).toBeVisible();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });
});
