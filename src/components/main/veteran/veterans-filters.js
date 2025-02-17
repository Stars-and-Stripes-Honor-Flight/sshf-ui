'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { paths } from '@/paths';
import { FilterButton, FilterPopover, useFilterContext } from '@/components/core/filter-button';
import { Option } from '@/components/core/option';

// The tabs should be generated using API data
const tabs = [
  { label: 'All', value: '', count: 0 },
  { label: 'Active', value: 'Active', count: 0 },
  { label: 'Flown', value: 'Flown', count: 0 },
  { label: 'Future', value: 'Future', count: 0 }
];

export function VeteransFilters({ filters = {}, sortDir = 'desc' }) {
  const { status, flightGroup, branch } = filters;
  const router = useRouter();

  const updateSearchParams = React.useCallback(
    (newFilters, newSortDir) => {
      const searchParams = new URLSearchParams();

      if (newSortDir === 'asc') {
        searchParams.set('sortDir', newSortDir);
      }

      if (newFilters.status) {
        searchParams.set('status', newFilters.status);
      }

      if (newFilters.flightGroup) {
        searchParams.set('flightGroup', newFilters.flightGroup);
      }

      if (newFilters.branch) {
        searchParams.set('branch', newFilters.branch);
      }

      router.push(`${paths.main.veterans.list}?${searchParams.toString()}`);
    },
    [router]
  );

  const handleClearFilters = React.useCallback(() => {
    updateSearchParams({}, sortDir);
  }, [updateSearchParams, sortDir]);

  const handleStatusChange = React.useCallback(
    (_, value) => {
      updateSearchParams({ ...filters, status: value }, sortDir);
    },
    [updateSearchParams, filters, sortDir]
  );

  const handleBranchChange = React.useCallback(
    (value) => {
      updateSearchParams({ ...filters, branch: value }, sortDir);
    },
    [updateSearchParams, filters, sortDir]
  );

  const handleFlightGroupChange = React.useCallback(
    (value) => {
      updateSearchParams({ ...filters, flightGroup: value }, sortDir);
    },
    [updateSearchParams, filters, sortDir]
  );

  const handleSortChange = React.useCallback(
    (event) => {
      updateSearchParams(filters, event.target.value);
    },
    [updateSearchParams, filters]
  );

  const hasFilters = status || branch || flightGroup;

  return (
    <div>
      <Tabs onChange={handleStatusChange} sx={{ px: 3 }} value={status ?? ''} variant="scrollable">
        {tabs.map((tab) => (
          <Tab
            icon={<Chip label={tab.count} size="small" variant="soft" />}
            iconPosition="end"
            key={tab.value}
            label={tab.label}
            sx={{ minHeight: 'auto' }}
            tabIndex={0}
            value={tab.value}
          />
        ))}
      </Tabs>
      <Divider />
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap', p: 2 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flex: '1 1 auto', flexWrap: 'wrap' }}>
          <FilterButton
            displayValue={branch || undefined}
            label="Branch"
            onFilterApply={(value) => {
              handleBranchChange(value);
            }}
            onFilterDelete={() => {
              handleBranchChange();
            }}
            popover={<BranchFilterPopover />}
            value={branch || undefined}
          />
          <FilterButton
            displayValue={flightGroup || undefined}
            label="Flight Group"
            onFilterApply={(value) => {
              handleFlightGroupChange(value);
            }}
            onFilterDelete={() => {
              handleFlightGroupChange();
            }}
            popover={<FlightGroupFilterPopover />}
            value={flightGroup || undefined}
          />
          {hasFilters ? <Button onClick={handleClearFilters}>Clear filters</Button> : null}
        </Stack>
        <Select name="sort" onChange={handleSortChange} sx={{ maxWidth: '100%', width: '120px' }} value={sortDir}>
          <Option value="desc">Newest</Option>
          <Option value="asc">Oldest</Option>
        </Select>
      </Stack>
    </div>
  );
}

function BranchFilterPopover() {
  const { anchorEl, onApply, onClose, open, value: initialValue } = useFilterContext();
  const [value, setValue] = React.useState('');

  React.useEffect(() => {
    setValue(initialValue ?? '');
  }, [initialValue]);

  return (
    <FilterPopover anchorEl={anchorEl} onClose={onClose} open={open} title="Filter by branch">
      <FormControl>
        <Select
          onChange={(event) => {
            setValue(event.target.value);
          }}
          value={value}
        >
          <Option value="">Select a branch</Option>
          <Option value="Army">Army</Option>
          <Option value="Air Force">Air Force</Option>
          <Option value="Navy">Navy</Option>
          <Option value="Marines">Marines</Option>
          <Option value="Coast Guard">Coast Guard</Option>
        </Select>
      </FormControl>
      <Button
        onClick={() => {
          onApply(value);
        }}
        variant="contained"
      >
        Apply
      </Button>
    </FilterPopover>
  );
}

function FlightGroupFilterPopover() {
  const { anchorEl, onApply, onClose, open, value: initialValue } = useFilterContext();
  const [value, setValue] = React.useState('');

  React.useEffect(() => {
    setValue(initialValue ?? '');
  }, [initialValue]);

  return (
    <FilterPopover anchorEl={anchorEl} onClose={onClose} open={open} title="Filter by flight group">
      <FormControl>
        <Select
          onChange={(event) => {
            setValue(event.target.value);
          }}
          value={value}
        >
          <Option value="">Select a flight group</Option>
          <Option value="SSHF-Nov2024">SSHF-Nov2024</Option>
          <Option value="SSHF-Apr2025">SSHF-Apr2025</Option>
        </Select>
      </FormControl>
      <Button
        onClick={() => {
          onApply(value);
        }}
        variant="contained"
      >
        Apply
      </Button>
    </FilterPopover>
  );
} 