import { Button, Checkbox, Group, NativeSelect, Pagination, Paper, Stack, Table, Text, TextInput } from '@mantine/core';
import { type ReactNode, useState } from 'react';
import { tt } from '#content/index.ts';
import classes from './RecordTable.module.css';
import { type RecordTableProps } from './types.ts';

export const RecordTable = <T extends { id: string }>({
  columns,
  getRowLabel,
  getSearchText,
  label,
  onSelectionChange,
  records,
  selectable = true,
  selectedIds: controlledSelectedIds,
  selectionActions,
}: RecordTableProps<T>): ReactNode => {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [internalSelectedIds, setInternalSelectedIds] = useState<Set<string>>(() => new Set());
  const selectedIds = controlledSelectedIds === undefined ? internalSelectedIds : new Set(controlledSelectedIds);

  const setSelectedIds = (next: Set<string>): void => {
    if (controlledSelectedIds === undefined) {
      setInternalSelectedIds(next);
    }

    onSelectionChange?.([...next]);
  };

  const search = query.trim().toLocaleLowerCase();
  const filtered = records.filter(record => getSearchText(record).toLocaleLowerCase().includes(search));
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const selectedCount = records.filter(record => selectedIds.has(record.id)).length;
  const visibleSelectedCount = visible.filter(record => selectedIds.has(record.id)).length;
  const isAllVisibleSelected = visible.length > 0 && visibleSelectedCount === visible.length;

  const toggleVisibleRows = (): void => {
    const next = new Set(selectedIds);

    for (const record of visible) {
      if (isAllVisibleSelected) {
        next.delete(record.id);
      } else {
        next.add(record.id);
      }
    }

    setSelectedIds(next);
  };

  const toggleRow = (id: string): void => {
    const next = new Set(selectedIds);

    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }

    setSelectedIds(next);
  };

  return (
    <Paper radius="md" withBorder>
      <Stack gap={0}>
        <Group className={classes.toolbar} justify="space-between" p="md">
          <TextInput
            aria-label={tt('records.search')}
            onChange={event => {
              setQuery(event.currentTarget.value);
              setPage(1);
            }}
            placeholder={tt('records.search')}
            type="search"
            value={query}
          />
          <Group gap="xs">
            <Text aria-live="polite" c="dimmed" size="sm">
              {filtered.length} {tt(filtered.length === 1 ? 'records.record' : 'records.records')}
              {selectable && ` · ${String(selectedCount)} ${tt('records.selected')}`}
            </Text>
            {selectable && selectedCount > 0 && (
              <Button
                onClick={() => {
                  setSelectedIds(new Set());
                }}
                size="compact-sm"
                variant="subtle"
              >
                {tt('records.clearSelection')}
              </Button>
            )}
            {selectionActions}
          </Group>
        </Group>
        {/* The scrollable region must be focusable for keyboard scrolling. */}
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
        <div aria-label={label} className={classes.viewport} role="region" tabIndex={0}>
          <Table
            aria-label={label}
            classNames={{ td: classes.cell, thead: classes.header, tr: classes.row }}
            highlightOnHover
            miw={720}
            stickyHeader
            verticalSpacing="sm"
          >
            <Table.Thead>
              <Table.Tr>
                {selectable && (
                  <Table.Th className={classes.selectionColumn} scope="col">
                    <Checkbox
                      aria-label={tt('records.selectVisible')}
                      checked={isAllVisibleSelected}
                      disabled={visible.length === 0}
                      indeterminate={visibleSelectedCount > 0 && !isAllVisibleSelected}
                      onChange={toggleVisibleRows}
                    />
                  </Table.Th>
                )}
                {columns.map(column => (
                  <Table.Th
                    className={column.stickyRight ? classes.stickyColumn : undefined}
                    key={column.key}
                    scope="col"
                  >
                    {column.label}
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {visible.map(record => (
                <Table.Tr data-selected={selectable && selectedIds.has(record.id) ? true : undefined} key={record.id}>
                  {selectable && (
                    <Table.Td>
                      <Checkbox
                        aria-label={`${tt('records.selectRow')} ${getRowLabel(record)}`}
                        checked={selectedIds.has(record.id)}
                        onChange={() => {
                          toggleRow(record.id);
                        }}
                      />
                    </Table.Td>
                  )}
                  {columns.map(column => (
                    <Table.Td className={column.stickyRight ? classes.stickyColumn : undefined} key={column.key}>
                      {column.render(record)}
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))}
              {visible.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={columns.length + Number(selectable)}>
                    <Text c="dimmed" py="xl" ta="center">
                      {tt(records.length === 0 ? 'records.empty' : 'records.noMatches')}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </div>
        <Group className={classes.footer} justify="space-between" p="md">
          <NativeSelect
            aria-label={tt('records.pageSize')}
            data={['25', '50', '100']}
            label={tt('records.pageSize')}
            onChange={event => {
              setPageSize(Number(event.currentTarget.value));
              setPage(1);
            }}
            size="xs"
            value={String(pageSize)}
            w={110}
          />
          <Pagination
            aria-label={tt('records.pagination')}
            onChange={setPage}
            size="sm"
            total={totalPages}
            value={currentPage}
          />
        </Group>
      </Stack>
    </Paper>
  );
};
