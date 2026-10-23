import { pdf } from '@react-pdf/renderer';

import { GuardianListDocument } from '@/components/main/flight/guardian-list-document';

const output = await pdf(
  <GuardianListDocument
    rows={[
      {
        id: 'g1',
        name: 'Ng, Nina',
        middle: 'S',
        mobile: '555-010-1003',
        dob: '—',
        training: 'Bus',
        trainingComplete: true,
        trainingNotes: 'Sample packet',
        waiver: false,
        seeDoc: false,
        mailCallReceived: true,
        mailCallAdopt: false,
      },
    ]}
    flightName="Sample Flight 2099"
    flightDate="May 01, 2099"
    from="N"
    to="N"
    printedAtLabel="Oct 23, 2026, 1:45 PM CDT"
  />
).toBuffer();

const chunks = [];
if (Buffer.isBuffer(output)) {
  chunks.push(output);
} else {
  for await (const chunk of output) {
    chunks.push(Buffer.from(chunk));
  }
}
const buffer = Buffer.concat(chunks);
if (buffer.subarray(0, 5).toString() !== '%PDF-') {
  console.error('renderer did not produce a PDF');
  process.exit(4);
}
process.stdout.write(`%PDF- ${buffer.length}\n`);
