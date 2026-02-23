'use client';

import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';

import { downloadFlightRosterCSV, downloadCallCenterFollowupCSV, downloadTourLeadCSV } from '@/lib/exports';
import { toast } from '@/components/core/toaster';

export function FlightExportMenu({ flightName, onExporting, disabled = false, stopPropagation = false }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isExporting, setIsExporting] = React.useState(false);

  const handleMenuOpen = (event) => {
    if (stopPropagation) event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event) => {
    if (stopPropagation && event?.stopPropagation) event.stopPropagation();
    setAnchorEl(null);
  };

  const handleExportClick = async (exportType, filter, event) => {
    if (stopPropagation) event.stopPropagation();
    handleMenuClose(event);
    
    try {
      setIsExporting(true);
      onExporting?.(true);
      
      if (exportType === 'roster') {
        await downloadFlightRosterCSV({
          flightName: flightName,
          filter: filter
        });
      } else if (exportType === 'callcenter') {
        await downloadCallCenterFollowupCSV({
          flightName: flightName
        });
      } else if (exportType === 'tourlead') {
        await downloadTourLeadCSV({
          flightName: flightName
        });
      }
      toast.success('Export completed successfully');
    } catch (err) {
      console.error('Failed to export flight data:', err);
      toast.error('Failed to export flight data. Please try again later.');
    } finally {
      setIsExporting(false);
      onExporting?.(false);
    }
  };

  return (
    <>
      <IconButton
        size="small"
        onClick={handleMenuOpen}
        disabled={disabled || isExporting}
        title="Export flight data"
        sx={{ flexShrink: 0 }}
      >
        <DownloadIcon size={20} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={(event) => { event.stopPropagation(); handleExportClick('roster', 'All', event); }}>
          <DownloadIcon size={18} style={{ marginRight: 8 }} />
          <Typography>Export All (CSV)</Typography>
        </MenuItem>
        <MenuItem onClick={(event) => { event.stopPropagation(); handleExportClick('roster', 'Veterans', event); }}>
          <DownloadIcon size={18} style={{ marginRight: 8 }} />
          <Typography>Export Veterans Only</Typography>
        </MenuItem>
        <MenuItem onClick={(event) => { event.stopPropagation(); handleExportClick('roster', 'Guardians', event); }}>
          <DownloadIcon size={18} style={{ marginRight: 8 }} />
          <Typography>Export Guardians Only</Typography>
        </MenuItem>
        <MenuItem disabled sx={{ opacity: 0.5 }} />
        <MenuItem onClick={(event) => { event.stopPropagation(); handleExportClick('callcenter', null, event); }}>
          <DownloadIcon size={18} style={{ marginRight: 8 }} />
          <Typography>Export Call Center CSV</Typography>
        </MenuItem>
        <MenuItem onClick={(event) => { event.stopPropagation(); handleExportClick('tourlead', null, event); }}>
          <DownloadIcon size={18} style={{ marginRight: 8 }} />
          <Typography>Export Tour Lead CSV</Typography>
        </MenuItem>
      </Menu>
    </>
  );
}
