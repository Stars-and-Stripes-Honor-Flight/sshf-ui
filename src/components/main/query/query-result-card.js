'use client'

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { PropertyList } from '@/components/core/property-list';
import { PropertyItem } from '@/components/core/property-item';

/**
 * Display a single document from query results as a card with property list
 */
export function QueryResultCard({ doc, index }) {
  // Extract _id and type for special display
  const { _id, _rev, type, ...otherFields } = doc;

  // Flatten nested objects for display
  const flattenObject = (obj, prefix = '') => {
    const items = [];
    
    Object.entries(obj).forEach(([key, value]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (value === null || value === undefined) {
        items.push({ key: fullKey, value: 'null' });
      } else if (Array.isArray(value)) {
        items.push({ key: fullKey, value: JSON.stringify(value, null, 2) });
      } else if (typeof value === 'object' && !(value instanceof Date)) {
        items.push(...flattenObject(value, fullKey));
      } else {
        items.push({ key: fullKey, value: String(value) });
      }
    });
    
    return items;
  };

  const properties = flattenObject(otherFields);

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Document {index + 1}
          </Typography>
          {type && (
            <Chip label={type} size="small" color="primary" variant="outlined" />
          )}
          {_id && (
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
              {_id}
            </Typography>
          )}
        </Box>

        <PropertyList>
          {properties.map(({ key, value }, idx) => (
            <PropertyItem
              key={`${key}-${idx}`}
              label={key}
              value={value}
            />
          ))}
        </PropertyList>

        {_rev && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary">
              Revision: {_rev}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
