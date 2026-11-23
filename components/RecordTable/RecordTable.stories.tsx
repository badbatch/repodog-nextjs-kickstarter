import { type ReactNode } from 'react';
import { RecordTable } from './RecordTable.tsx';

export default { title: 'Data/Record table' };

const records = Array.from({ length: 200 }, (_, index) => ({
  id: String(index),
  name: `Project ${String(index + 1)}`,
  status: 'Draft',
}));

const columns = [
  { key: 'name', label: 'Project', render: (record: (typeof records)[number]): string => record.name },
  { key: 'status', label: 'Status', render: (record: (typeof records)[number]): string => record.status },
];

const getRowLabel = (record: (typeof records)[number]): string => record.name;
const getSearchText = getRowLabel;

export const Projects = (): ReactNode => (
  <RecordTable
    columns={columns}
    getRowLabel={getRowLabel}
    getSearchText={getSearchText}
    label="Projects"
    records={records}
  />
);

export const Empty = (): ReactNode => (
  <RecordTable
    columns={columns}
    getRowLabel={getRowLabel}
    getSearchText={getSearchText}
    label="Projects"
    records={[]}
  />
);
