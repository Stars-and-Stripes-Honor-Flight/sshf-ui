import * as React from 'react';
import { pdf } from '@react-pdf/renderer';

import { formatFlightNameForDisplay } from '@/lib/flights';
import { GuardianListDocument } from '@/components/main/flight/guardian-list-document';
import {
  buildGuardianListRows,
  formatFlightDateLong,
  formatPrintedAt,
} from '@/components/main/flight/guardian-list-range';

function fileName(displayName, from, to) {
  const safe = String(displayName || 'flight')
    .replace(/[^\w.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return `${safe || 'flight'}-guardians-${from}-${to}.pdf`;
}

/**
 * Build the guardian-list PDF and show it in the tab opened by the click,
 * or download it when that tab is unavailable.
 */
export async function openGuardianListPdf({ guardians, flightName, flightDate, from, to, printedAt, targetWindow }) {
  const displayName = formatFlightNameForDisplay(flightName);
  const blob = await pdf(
    <GuardianListDocument
      rows={buildGuardianListRows(guardians)}
      flightName={displayName}
      flightDate={formatFlightDateLong(flightDate)}
      from={from}
      to={to}
      printedAtLabel={formatPrintedAt(printedAt)}
    />
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const name = fileName(displayName, from, to);

  if (targetWindow && !targetWindow.closed) {
    targetWindow.location.href = url;
  } else {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}
