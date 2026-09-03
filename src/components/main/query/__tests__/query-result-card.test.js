import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { QueryResultCard } from '../query-result-card';

describe('QueryResultCard', () => {
  it('should render document with type and ID', () => {
    const doc = {
      _id: 'vet-123',
      type: 'Veteran',
      name: { first: 'John', last: 'Doe' }
    };

    render(<QueryResultCard doc={doc} index={0} />);

    expect(screen.getByText('Document 1')).toBeInTheDocument();
    expect(screen.getByText('Veteran')).toBeInTheDocument();
    expect(screen.getByText('vet-123')).toBeInTheDocument();
  });

  it('should show field labels with nested paths', () => {
    const doc = {
      _id: 'vet-123',
      name: { first: 'Ryan', last: 'Ohrmundt' }
    };

    render(<QueryResultCard doc={doc} index={0} />);

    // Should show the field path as the label
    expect(screen.getByText('name.first')).toBeInTheDocument();
    expect(screen.getByText('Ryan')).toBeInTheDocument();
    expect(screen.getByText('name.last')).toBeInTheDocument();
    expect(screen.getByText('Ohrmundt')).toBeInTheDocument();
  });

  it('should flatten nested objects and show field paths', () => {
    const doc = {
      _id: 'doc-1',
      address: {
        city: 'Chicago',
        state: 'IL',
        contact: {
          phone: '555-1234'
        }
      }
    };

    render(<QueryResultCard doc={doc} index={0} />);

    expect(screen.getByText('address.city')).toBeInTheDocument();
    expect(screen.getByText('Chicago')).toBeInTheDocument();
    expect(screen.getByText('address.state')).toBeInTheDocument();
    expect(screen.getByText('IL')).toBeInTheDocument();
    expect(screen.getByText('address.contact.phone')).toBeInTheDocument();
    expect(screen.getByText('555-1234')).toBeInTheDocument();
  });

  it('should handle arrays in field values', () => {
    const doc = {
      _id: 'doc-1',
      tags: ['tag1', 'tag2']
    };

    render(<QueryResultCard doc={doc} index={0} />);

    expect(screen.getByText('tags')).toBeInTheDocument();
    // Array should be JSON stringified
    expect(screen.getByText(/tag1/)).toBeInTheDocument();
  });

  it('should show revision when present', () => {
    const doc = {
      _id: 'doc-1',
      _rev: '2-abc123',
      field: 'value'
    };

    render(<QueryResultCard doc={doc} index={0} />);

    expect(screen.getByText(/Revision/)).toBeInTheDocument();
    expect(screen.getByText(/2-abc123/)).toBeInTheDocument();
  });
});
