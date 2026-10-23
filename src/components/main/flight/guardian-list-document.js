import * as React from 'react';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

import { getGuardianListColumns } from '@/components/main/flight/guardian-list-range';

const COLUMN_WIDTHS = {
  name: 110,
  name_middle: 48,
  phone_mbl: 70,
  birth_date: 52,
  training: 68,
  training_notes: 166,
  flight_waiver: 42,
  flight_training_see_doc: 42,
  mail_call_received: 46,
  mail_call_adopt: 48,
  checked_in: 44,
};

const CENTERED = new Set([
  'flight_waiver',
  'flight_training_see_doc',
  'mail_call_received',
  'mail_call_adopt',
  'checked_in',
]);

const styles = StyleSheet.create({
  page: {
    paddingTop: 78,
    paddingBottom: 36,
    paddingHorizontal: 28,
    fontFamily: 'Helvetica',
    fontSize: 8,
  },
  header: {
    position: 'absolute',
    top: 16,
    left: 28,
    right: 28,
  },
  title: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  range: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderBottomWidth: 0.4,
    borderBottomColor: '#cccccc',
    paddingVertical: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingBottom: 3,
  },
  cell: {
    paddingRight: 3,
  },
  headerCell: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
  },
  centered: {
    textAlign: 'center',
  },
  check: {
    width: 9,
    height: 8,
    position: 'relative',
  },
  checkShort: {
    position: 'absolute',
    left: 0,
    top: 4,
    width: 4,
    height: 1.2,
    backgroundColor: '#000000',
    transform: 'rotate(45deg)',
  },
  checkLong: {
    position: 'absolute',
    left: 2,
    top: 2,
    width: 7,
    height: 1.2,
    backgroundColor: '#000000',
    transform: 'rotate(-50deg)',
  },
  checkedIn: {
    width: 11,
    height: 11,
    borderWidth: 1,
    borderColor: '#000000',
    alignSelf: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 28,
    right: 28,
    fontSize: 8,
  },
});

function CheckMark({ checked }) {
  if (!checked) return null;
  return (
    <View style={styles.check}>
      <View style={styles.checkShort} />
      <View style={styles.checkLong} />
    </View>
  );
}

function cellText(columnId, row) {
  switch (columnId) {
    case 'name':
      return row.name;
    case 'name_middle':
      return row.middle;
    case 'phone_mbl':
      return row.mobile;
    case 'birth_date':
      return row.dob;
    case 'training_notes':
      return row.trainingNotes;
    default:
      return '';
  }
}

function Cell({ column, row }) {
  const width = COLUMN_WIDTHS[column.id];
  const centered = CENTERED.has(column.id);

  if (column.id === 'checked_in') {
    return (
      <View style={[styles.cell, { width, alignItems: 'center' }]}>
        <View style={styles.checkedIn} />
      </View>
    );
  }

  if (column.id === 'training') {
    return (
      <View style={[styles.cell, { width, flexDirection: 'row', alignItems: 'center' }]}>
        <Text>{row.training}</Text>
        <CheckMark checked={row.trainingComplete} />
      </View>
    );
  }

  if (
    column.id === 'flight_waiver' ||
    column.id === 'flight_training_see_doc' ||
    column.id === 'mail_call_received' ||
    column.id === 'mail_call_adopt'
  ) {
    const checked =
      column.id === 'flight_waiver'
        ? row.waiver
        : column.id === 'flight_training_see_doc'
          ? row.seeDoc
          : column.id === 'mail_call_received'
            ? row.mailCallReceived
            : row.mailCallAdopt;
    return (
      <View style={[styles.cell, { width, alignItems: 'center' }]}>
        <CheckMark checked={checked} />
      </View>
    );
  }

  return <Text style={[styles.cell, { width }, centered ? styles.centered : null]}>{cellText(column.id, row)}</Text>;
}

/**
 * Landscape guardian list. Rows, labels, and the printed timestamp are already built.
 */
export function GuardianListDocument({ rows, flightName, flightDate, from, to, printedAtLabel }) {
  const columns = getGuardianListColumns();

  return (
    <Document>
      <Page size="LETTER" orientation="landscape" style={styles.page}>
        <View fixed style={styles.header}>
          <Text style={styles.title}>
            {flightName} · {flightDate}
          </Text>
          <Text style={styles.range}>{`Guardians ${from}–${to}`}</Text>
          <View style={styles.headerRow}>
            {columns.map((column) => (
              <Text
                key={column.id}
                style={[
                  styles.headerCell,
                  styles.cell,
                  { width: COLUMN_WIDTHS[column.id] },
                  CENTERED.has(column.id) ? styles.centered : null,
                ]}
              >
                {column.label}
              </Text>
            ))}
          </View>
        </View>
        {rows.map((row) => (
          <View key={row.id} style={styles.row}>
            {columns.map((column) => (
              <Cell key={column.id} column={column} row={row} />
            ))}
          </View>
        ))}
        <Text
          fixed
          style={styles.footer}
          render={({ pageNumber, totalPages }) => `Printed ${printedAtLabel}    Page ${pageNumber} of ${totalPages}`}
        />
      </Page>
    </Document>
  );
}
