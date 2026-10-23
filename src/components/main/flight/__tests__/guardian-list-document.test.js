import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';

import { GuardianListDocument } from '../guardian-list-document';

jest.mock('@react-pdf/renderer', () => {
  const React = require('react');
  const el = (tag) =>
    function PdfNode({ children, render: renderProp, ...props }) {
      return React.createElement(
        'div',
        { 'data-pdf': tag, 'data-props': JSON.stringify(props) },
        typeof renderProp === 'function' ? renderProp({ pageNumber: 2, totalPages: 5 }) : null,
        children
      );
    };
  return {
    Document: el('Document'),
    Page: el('Page'),
    View: el('View'),
    Text: el('Text'),
    StyleSheet: { create: (styles) => styles },
    pdf: jest.fn(),
    Font: { register: jest.fn() },
  };
});

function propsFor(node) {
  return JSON.parse(node.getAttribute('data-props'));
}

function checkMarks() {
  return [...document.querySelectorAll('[data-pdf="View"]')].filter((node) => {
    const style = propsFor(node).style;
    return style && style.width === 9 && style.height === 8;
  });
}

const longNotes = 'Bring the passport packet and the signed medical form. '.repeat(8).trim();

function renderDocument(rows) {
  return render(
    <GuardianListDocument
      rows={rows}
      flightName="May 2026"
      flightDate="May 01, 2026"
      from="M"
      to="T"
      printedAtLabel="Oct 23, 2026, 1:45 PM CDT"
    />
  );
}

describe('GuardianListDocument', () => {
  test('keeps a body row together so notes cannot split onto the next page', () => {
    renderDocument([
      {
        id: 'g1',
        name: 'Ng, Nina',
        middle: '',
        mobile: '',
        dob: '—',
        training: 'Main',
        trainingComplete: false,
        trainingNotes: longNotes,
        waiver: false,
        seeDoc: false,
        mailCallReceived: false,
        mailCallAdopt: false,
      },
    ]);

    const rows = [...document.querySelectorAll('[data-pdf="View"]')].filter((node) => propsFor(node).wrap === false);
    expect(rows).toHaveLength(1);
  });

  test('uses a landscape US Letter page', () => {
    renderDocument([]);

    const page = document.querySelector('[data-pdf="Page"]');
    expect(propsFor(page)).toEqual(expect.objectContaining({ size: 'LETTER', orientation: 'landscape' }));
  });

  test('repeats a fixed header with the flight name, flight date, and Guardians M–T', () => {
    renderDocument([]);

    const header = [...document.querySelectorAll('[data-pdf="View"]')].find((node) => propsFor(node).fixed === true);
    expect(header).toBeTruthy();
    expect(header).toHaveTextContent('May 2026');
    expect(header).toHaveTextContent('May 01, 2026');
    expect(header).toHaveTextContent('Guardians M–T');
  });

  test('uses guardian Training and Training notes labels, plus Mail Rcvd and Mail Adopt, and not Mail Rcvd / Training', () => {
    renderDocument([]);

    expect(screen.getByText('Training')).toBeInTheDocument();
    expect(screen.getByText('Training notes')).toBeInTheDocument();
    expect(screen.getByText('Mail Rcvd')).toBeInTheDocument();
    expect(screen.getByText('Mail Adopt')).toBeInTheDocument();
    expect(screen.queryByText('Mail Rcvd / Training')).not.toBeInTheDocument();
    expect(screen.queryByText('Mail Adopt / Training Notes')).not.toBeInTheDocument();
  });

  test('renders Page X of Y from the footer render prop', () => {
    renderDocument([]);

    const footer = [...document.querySelectorAll('[data-pdf="Text"]')].find((node) => propsFor(node).fixed === true);
    expect(footer).toHaveTextContent('Page 2 of 5');
    expect(footer).toHaveTextContent('Printed Oct 23, 2026, 1:45 PM CDT');
  });

  test('prints a check mark for a true waiver and nothing for a false see-doc flag', () => {
    renderDocument([
      {
        id: 'g1',
        name: 'Ng, Nina',
        middle: '',
        mobile: '',
        dob: '—',
        training: '—',
        trainingComplete: false,
        trainingNotes: '',
        waiver: true,
        seeDoc: false,
        mailCallReceived: false,
        mailCallAdopt: false,
      },
    ]);

    expect(checkMarks()).toHaveLength(1);
  });

  test('prints a mail-call check only when that row flag is true, and blank when it is false', () => {
    renderDocument([
      {
        id: 'g1',
        name: 'Ng, Nina',
        middle: '',
        mobile: '',
        dob: '—',
        training: '—',
        trainingComplete: false,
        trainingNotes: '',
        waiver: false,
        seeDoc: false,
        mailCallReceived: true,
        mailCallAdopt: false,
      },
    ]);

    expect(checkMarks()).toHaveLength(1);
  });

  test('renders Checked in as an empty box', () => {
    renderDocument([
      {
        id: 'g1',
        name: 'Ng, Nina',
        middle: '',
        mobile: '',
        dob: '—',
        training: '—',
        trainingComplete: false,
        trainingNotes: '',
        waiver: false,
        seeDoc: false,
        mailCallReceived: false,
        mailCallAdopt: false,
      },
    ]);

    const box = [...document.querySelectorAll('[data-pdf="View"]')].find((node) => {
      const style = propsFor(node).style;
      return style && style.width === 11 && style.height === 11 && style.borderWidth === 1;
    });
    expect(box).toBeTruthy();
    expect(box).toBeEmptyDOMElement();
  });

  test('passes the full training notes string through for wrapping', () => {
    renderDocument([
      {
        id: 'g1',
        name: 'Ng, Nina',
        middle: '',
        mobile: '',
        dob: '—',
        training: 'Main',
        trainingComplete: false,
        trainingNotes: longNotes,
        waiver: false,
        seeDoc: false,
        mailCallReceived: false,
        mailCallAdopt: false,
      },
    ]);

    expect(screen.getByText(longNotes)).toBeInTheDocument();
    expect(screen.getByText(longNotes).textContent.length).toBe(longNotes.length);
  });
});
