import { type ReactNode } from 'react';

export type RecordColumn<T> = {
  key: string;
  label: string;
  render: (record: T) => ReactNode;
  stickyRight?: boolean;
};

export type RecordTableProps<T extends { id: string }> = {
  columns: RecordColumn<T>[];
  getRowLabel: (record: T) => string;
  getSearchText: (record: T) => string;
  label: string;
  onSelectionChange?: (ids: string[]) => void;
  records: T[];
  selectable?: boolean;
  selectedIds?: string[];
  selectionActions?: ReactNode;
};
