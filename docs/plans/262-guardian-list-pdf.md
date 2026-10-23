# Plan: Printable guardian list PDF by last-name letter range (#262)

Approved plan for issue #262. The decisions at the end of this document are final, including the all-veterans mail-call rule. Implementation follows this plan.

## Summary

Check-in volunteers need a printed guardian list for the letter range their table covers. The list matches the Training roster’s **guardian** columns. It does not reuse the combined #267 headers (`Mail Rcvd / Training`, `Mail Adopt / Training Notes`). Mail call is two extra checkbox columns, fed by the paired veteran.

Add a **Print guardian list** button on the flight details page. It opens a small dialog with **From** and **To** letter pickers (A–Z, inclusive). The PDF includes every guardian on the flight whose last name falls in that range, sorted by last name then first name. It does not show the paired veteran, and it does not apply the current roster filters.

Generate the PDF in the browser with the `@react-pdf/renderer` 4.0.0 dependency already in `package.json`. Reuse `flightData` from `api.getFlightDetails`. No API, OpenAPI, or schema change.

The page already loads every field the PDF needs on `FlightDetailPerson` (`docs/openapi.json`). Confirmed present and rendered today:

| PDF column     | Person field                                   | Already loaded                       |
| -------------- | ---------------------------------------------- | ------------------------------------ |
| Name           | `name_last`, `name_first`                      | Yes                                  |
| Middle         | `name_middle`                                  | Yes                                  |
| Mobile         | `phone_mbl`                                    | Yes                                  |
| DOB            | `birth_date`                                   | Yes                                  |
| Training       | `training` and `training_complete`             | Yes                                  |
| Training notes | `flight_training_notes`                        | Yes                                  |
| Waivers        | `flight_waiver`                                | Yes                                  |
| See Doc        | `flight_training_see_doc`                      | Yes                                  |
| Mail Rcvd      | paired veteran's `mail_call_received`          | Yes, on the veteran in the same pair |
| Mail Adopt     | paired veteran's `mail_call_adopt`             | Yes, on the veteran in the same pair |
| Checked in     | none (blank box)                               | n/a                                  |

### Where the mail-call checks come from

`mail_call_received` and `mail_call_adopt` on `FlightDetailPerson` are documented as **Veterans only**. #267 (PR #268) shows them on the veteran row of the Training layout: `renderTrainingCell` reads `person.mail_call_received` only when `personType === 'Veteran'`, and `renderTrainingNotesCell` reads `person.mail_call_adopt` the same way. A guardian row keeps training type, `training_complete`, and `flight_training_notes` even if those mail-call properties are also present on the guardian object. The PDF follows that rule. It does not read `mail_call_received` or `mail_call_adopt` off the guardian.

Guardians do not have equivalent booleans of their own:

- The full `Guardian` document has `mail_call.received` (a date string), `mail_call.name`, `mail_call.notes`, and `mail_call.relation`. It has no `mail_call.adopt`.
- The full `Veteran` document is where `mail_call.adopt` lives (also a string on the document). The flight-detail endpoint flattens the veteran values to the booleans `mail_call_received` and `mail_call_adopt`.
- `GET /flights/{id}/detail` does not include the nested `mail_call` object. The flight details page never calls `api.getGuardian` for the roster.

So the source is the veteran `FlightDetailPerson` objects already sitting on `flightData.pairs`. No API or OpenAPI change.

How pairs are shaped. The grid takes one veteran and one guardian per pair (`people.find`). `pairId` is the veteran's id, or the guardian's id when the pair has no veteran. The detail endpoint says guardians paired with multiple veterans are deduplicated **within each pair**, so one pair does not list the same guardian twice. It does not say the guardian is collapsed across the flight. A guardian flying with two veterans is expected as two pairs, and the roster would show that guardian twice. A single pair could still contain more than one veteran; the grid would only display the first (`find`), and the PDF must not copy that limit.

Approved row rule (decisions 11 and 12):

- One PDF row per guardian id. The list is guardians, not pairs.
- Collect every `type === 'Veteran'` person in every pair that contains that guardian id. Use `filter`, not `find`.
- With exactly one paired veteran, `mailCallReceived` and `mailCallAdopt` copy that veteran's flags.
- With more than one, a flag is true only when **every** paired veteran on this flight has that flag (both, when there are two). If any one is false or missing, the box is blank. The two flags are independent.
- Steve changed the earlier "check if any" recommendation to this all-veterans rule.
- An unpaired guardian (crew, or a pair whose `people` has no veteran, including `missingPairedPerson` with the veteran absent) prints both boxes blank. A veteran who is not on this flight is not in `flightData.pairs`, so that veteran's flags are not on the page and are not fetched.
- The paired veteran's name stays off the row. `mail_call_notes` is not a column.
- Training, notes, waiver, and the other guardian columns still come from the guardian object. If the API repeats that guardian, those fields are the same person; take them from the first copy.

## Requirements settled by the issue

- Button label: **Print guardian list**.
- Dialog pickers: From and To, each A–Z. Example range M through T is inclusive.
- Population: every person with `type === 'Guardian'` in `flightData.pairs`, including guardian-only crew rows and guardians flagged `nofly`. Ignore search, bus, plane, status, training type, “No guardian”, sort, and the Guardians focus toggle.
- Sort: last name, then first name. Do not show the paired veteran.
- Columns, in order: Name (Last, First); the Training guardian columns; **Mail Rcvd**; **Mail Adopt**; a blank **Checked in** box.
- Guardian column labels for the shared Training columns stay the stored labels (`Middle`, `Mobile`, `DOB`, `Training`, `Training notes`, `Waivers`, `See Doc`), which `getColumnConfig('training', true)` returns. `getColumnConfig('training')` with the default `guardiansFocus === false` returns `Mail Rcvd / Training` and `Mail Adopt / Training Notes`. The PDF must not use those combined headers. Mail call gets its own headers, `Mail Rcvd` and `Mail Adopt`.
- Waivers, See Doc, Mail Rcvd, and Mail Adopt print as a check mark or blank.
- Page: landscape US Letter. Header carries flight name, flight date, and the letter range (for example `Guardians M–T`). The column header row repeats on every page. Footer carries the printed date/time and `Page X of Y`.
- Client-side only. Unit tests for the letter-range helper and the dialog. Test count only goes up.

## Files to add

| File                                                                      | Role                                                                                                                               |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/main/flight/roster-format.js`                             | Move the private roster birth-date formatter here so the PDF and the grid share one rule.                                          |
| `src/components/main/flight/guardian-list-range.js`                       | Pure letter-range filter, sort, name/date/timestamp formatters, row mapper, column-label list. No React, no `@react-pdf/renderer`. |
| `src/components/main/flight/__tests__/guardian-list-range.test.js`        | Helper tests listed below.                                                                                                         |
| `src/components/main/flight/guardian-list-print-dialog.js`                | MUI dialog. Also export a small button that owns `open` state, so `page.js` stays a one-line mount.                                |
| `src/components/main/flight/__tests__/guardian-list-print-dialog.test.js` | Dialog tests. Mock the PDF opener.                                                                                                 |
| `src/components/main/flight/guardian-list-document.js`                    | `GuardianListDocument` (`Document` / `Page` / `View` / `Text` only).                                                               |
| `src/components/main/flight/guardian-list-pdf.js`                         | `openGuardianListPdf`. The only module that statically imports `@react-pdf/renderer` and the document.                             |
| `src/components/main/flight/__tests__/guardian-list-document.test.js`     | Layout tests under a local Jest mock of `@react-pdf/renderer`.                                                                     |

## Files to change

| File                                                    | Change                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/main/flight/roster-cell-renderers.js`   | Import `formatRosterBirthDate` from `roster-format.js`. No cell behavior change. Existing renderer tests stay as they are.                                                                                                                                                                                                                   |
| `src/app/(main)/flights/details/page.js`                | Mount `<GuardianListPrintButton pairs={pairs} flightName={flight.name} flightDate={flight.flight_date} />` in the Participants action row (the stack that already holds **Fix Bus Mismatches**, around the `Participants ({pairs.length})` heading). Pass the unfiltered `pairs` (`flightData?.pairs`), never the `filterPairs(...)` result. |
| `src/app/(main)/flights/details/__tests__/page.test.js` | Add the three page tests below. Do not weaken the existing permission, completed-flight, or roster tests.                                                                                                                                                                                                                                    |

Do not change `src/lib/api.js`, `docs/openapi.json`, `src/schemas/generated/**`, `package.json`, or `next.config.mjs` unless `next build` fails as described under library loading.

`src/lib/birth-date-age.js` (added in #271) parses a birth date for **form age labels**. The PDF does not append an age and does not switch the roster onto that parser.

## Component and helper design

### Pure helper (`guardian-list-range.js`)

```js
export function lastNameLetter(nameLast) {}
export function selectGuardiansInLetterRange(pairs, fromLetter, toLetter) {}
export function formatGuardianListName(person) {}
export function formatFlightDateLong(isoDate) {}
export function formatPrintedAt(date, timeZone) {}
export function buildGuardianListRows(guardians) {}
export function getGuardianListColumns() {}
```

`selectGuardiansInLetterRange(pairs, from, to)` returns:

```js
{ ok: true, guardians, omittedUnlettered }
// or
{ ok: false, reason: 'inverted-range', guardians: [], omittedUnlettered: 0 }
```

Each `guardians` entry is `{ person, mailCallReceived, mailCallAdopt }`, not a bare guardian. `person` is the guardian. The two booleans follow the all-veterans rule above.

- Walk `pairs[].people`. Keep `type === 'Guardian'` only.
- One row per guardian `id`. While collapsing repeats, a mail-call box is checked only when every veteran in every pair that contains that id has the flag. Do not keep only the first pair's veteran.
- Letter rule, applied to `name_last`:
  1. Trim.
  2. `normalize('NFD')` and strip combining marks (`\p{M}`).
  3. Take the first Unicode letter (`\p{L}`), so a leading apostrophe does not hide the name.
  4. `toLocaleUpperCase('en-US')`.
  5. Keep it only when it is `A`–`Z`. Otherwise the guardian is unlettered and omitted from every range.
- Inclusive compare on the char code. `from === to` is the single letter.
- If `from > to`, `ok: false` and no rows. The helper does not swap the letters.
- Sort with `localeCompare(other, 'en', { sensitivity: 'base' })`: last name, then first name, then `id` so the order is stable. On Node 22 that order is `O'Brien`, `Oak`, `Obrien`, `Olson`, and `de la Cruz`, `Deacon`, `Delta`, and `Van` before `van Dyke`.

Worked examples for the letter rule:

| `name_last`                 | Letter | Why                                                              |
| --------------------------- | ------ | ---------------------------------------------------------------- |
| `O'Brien`                   | O      | First letter is O. The apostrophe is not the range key.          |
| `de la Cruz`                | D      | First letter of the stored last name. Particles are not skipped. |
| `van Dyke`                  | V      | Same rule.                                                       |
| `smith`                     | S      | Case fold.                                                       |
| `Álvarez`                   | A      | Accent folds off. Sorts beside `Alvarez`.                        |
| `'Brien`                    | B      | Leading non-letter is skipped.                                   |
| `  smith`                   | S      | Trim, then S.                                                    |
| `''` or `'`                 | none   | Omitted.                                                         |
| `Østergaard`, `Łukasiewicz` | none   | The letter still is not A–Z after the fold. Omitted and counted. |

`formatGuardianListName`: `"Last, First"` when both sides are non-empty. If one side is empty, print the other side with no comma. If both are empty, print `—`.

`buildGuardianListRows` maps each guardian to a plain object the PDF paints. It is the contract the document and the tests share:

```js
{
  id,
  name,
  middle,            // trimmed name_middle, or ''
  mobile,            // phone_mbl as stored, or ''
  dob,               // formatRosterBirthDate
  training,          // trimmed training, or '—'
  trainingComplete,  // Boolean(training_complete) — decision 1
  trainingNotes,     // flight_training_notes as stored, or ''
  waiver,            // Boolean(flight_waiver)
  seeDoc,            // Boolean(flight_training_see_doc)
  mailCallReceived,  // true only when every paired veteran has mail_call_received; false when none
  mailCallAdopt,     // true only when every paired veteran has mail_call_adopt; false when none
}
```

`selectGuardiansInLetterRange` returns these row inputs (`person` plus the two booleans), not a bare guardian with the veterans discarded.

`getGuardianListColumns()` returns `Name`, then `getColumnConfig(ACTIVITY_PRESETS.TRAINING, true)` labels, then `Mail Rcvd`, `Mail Adopt`, then `Checked in`. Call the config helper with `true`. Do not copy the training label strings into a second list that can drift, and do not call `getColumnConfig('training')` without the flag. The mail-call headers are not part of `COLUMN_CONFIGS.training`; they are PDF-only short labels.

`formatFlightDateLong('2026-05-01')` returns `May 01, 2026`, the same `MMMM DD, YYYY` string the flight header builds with dayjs. Implement it by splitting the `YYYY-MM-DD` string. Do not call `new Date('2026-05-01')`: that parses as UTC midnight and becomes the previous evening in US time zones. Dayjs in this repo happens to parse a date-only string as local calendar parts, but the PDF formatter should not depend on that.

`formatPrintedAt(date, timeZone)` uses `Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short', timeZone })`. The production call omits `timeZone` so the volunteer’s laptop zone is used. Example with `America/Chicago`: `2026-10-23T18:45:00Z` formats as `Oct 23, 2026, 1:45 PM CDT`.

`formatRosterBirthDate` moves unchanged from `roster-cell-renderers.js`:

- blank or non-string → `—`
- leading `YYYY-MM-DD` → `MM/DD/YYYY` (so `1969-05-07` stays `05/07/1969`, with no time-zone shift)
- anything else → the original string

Do not route roster DOB through `parseIsoBirthDate`. That helper rejects impossible dates the roster currently still displays as a sliced string.

### Dialog (`guardian-list-print-dialog.js`)

Copy the structure of the inline **Add Veterans from Waitlist** dialog on the flight details page: MUI `Dialog`, `DialogTitle`, `DialogContent`, `DialogActions`, Cancel, and one contained primary button. Copy the letter controls from the roster **Columns** picker: `TextField` `select`, `size="small"`, `MenuItem` per letter. Twenty-six letters do not need `Autocomplete`. Keep the dialog in its own component so it can be tested without rendering the whole page. `page.js` is already about a thousand lines.

`GuardianListPrintButton` renders an outlined small button, label `Print guardian list`, with the Phosphor `Printer` icon (same icon style as the header download icon). It holds `open`. The dialog props are `open`, `onClose`, `pairs`, `flightName`, `flightDate`. No filter props exist, so a caller cannot accidentally pass the filtered roster.

Dialog contents:

- Title: `Print guardian list`.
- From and To, default **A** and **Z**. Defaults reset each time the dialog opens. Do not write them to `localStorage` (roster-control persistence is a different feature).
- Helper line: `Includes every guardian on the flight. Roster filters are ignored.`
- Live count from the helper: `12 guardians`.
- When `omittedUnlettered > 0`: `2 guardians have no A–Z last name and are not on this list.`
- When the range is inverted: `From is after To.` Print disabled.
- When the range is valid and empty: `No guardians in this range.` Print disabled.
- Primary button `Print`, label `Preparing…` and disabled while `pdf().toBlob()` runs.
- Cancel closes and does nothing else.

On Print:

1. Open a blank tab synchronously inside the click, before any `await` (`window.open('', '_blank')`). Doing it after the await is what popup blockers stop. Do not pass `noopener`: that makes `window.open` return `null`, and the opener then cannot set the tab’s location.
2. `const { openGuardianListPdf } = await import('./guardian-list-pdf')`.
3. Pass the helper’s guardians, `formatFlightNameForDisplay(flightName)` (strips a leading `SSHF-`, same as the page title), the raw `flight_date`, the letters, and `new Date()` as `printedAt`.
4. On success, leave the dialog open so the next table’s range is one change away.
5. On failure, close the blank tab if it opened, `toast.error('Could not prepare the guardian list. Please try again.')`, and do not put the exception text in the toast or the dialog.

### PDF document (`guardian-list-document.js`)

`GuardianListDocument` receives already-built rows, display flight name, display flight date, `from`, `to`, and `printedAtLabel`. It does not filter, sort, or call `new Date()`.

### Button wiring and permissions

The flight details page is already behind `AuthGuard` and requires `records:read`. The CSV menu in the page header is a separate control: `FlightExportMenu` renders only when `can(PERMISSIONS.EXPORTS_READ)`.

Decided gate: show **Print guardian list** to anyone who can see the page, including a read-only volunteer and including a completed flight. Printing does not mutate and does not call the export endpoints. **Add Veterans from Waitlist** stays on `flights:manage` and stays disabled when the flight document is completed. **Fix Bus Mismatches** stays on `records:write`.

## Data mapping

Source is one `FlightDetailPerson` inside `flightData.pairs[].people` from `GET /flights/{id}/detail` (`api.getFlightDetails`). The header uses `flightData.flight.name` and `flightData.flight.flight_date`. The separate `api.getFlight` document and `api.getFlightAssignments` are not inputs.

| PDF column     | Header           | Source                                                            | Formatting                                                                                                                                                                                                                                 |
| -------------- | ---------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Name           | `Name`           | `name_last`, `name_first`                                         | `Last, First`. See helper. Not the middle name.                                                                                                                                                                                            |
| Middle         | `Middle`         | `name_middle`                                                     | Trimmed. Empty prints blank. The roster editor shows a placeholder, not a dash.                                                                                                                                                            |
| Mobile         | `Mobile`         | `phone_mbl`                                                       | As stored. No reformatting. Empty prints blank. This is the Training column, not a different phone field.                                                                                                                                  |
| DOB            | `DOB`            | `birth_date`                                                      | `formatRosterBirthDate`. `1969-05-07` → `05/07/1969`. Blank → `—`.                                                                                                                                                                         |
| Training       | `Training`       | `training`, `training_complete`                                   | Trimmed type, or `—` when empty (the cell already does `typeLabel \|\| '—'`). A check mark when `training_complete` is true, otherwise nothing beside the type.                                                                  |
| Training notes | `Training notes` | `flight_training_notes`                                           | Full string, wrapped. Empty prints blank. Do not ellipsize.                                                                                                                                                                                |
| Waivers        | `Waivers`        | `flight_waiver`                                                   | Check mark when true. Blank when false or missing. Not an em dash (veterans get a dash in the grid; this PDF has no veterans).                                                                                                             |
| See Doc        | `See Doc`        | `flight_training_see_doc` on the guardian                         | Same as Waivers.                                                                                                                                                                                                                           |
| Mail Rcvd      | `Mail Rcvd`      | `mail_call_received` on each paired veteran in `flightData.pairs` | One veteran: that veteran's flag. More than one: check only when all of them are true. Blank when any is false or missing, and when the guardian has no veteran on the flight. Ignore the property on the guardian. Not `mail_call_notes`. |
| Mail Adopt     | `Mail Adopt`     | `mail_call_adopt` on each paired veteran in `flightData.pairs`    | Same all-veterans rule, independent of Mail Rcvd.                                                                                                                                                                                          |
| Checked in     | `Checked in`     | none                                                              | Empty square on every row, including when the other flags are checked.                                                                                                                                                                     |

Flight header date: `flight.flight_date` through `formatFlightDateLong`, matching the subtitle `Flight on {dayjs(flight.flight_date).format('MMMM DD, YYYY')}`.

## PDF layout spec

- One `Page`, `size="LETTER"`, `orientation="landscape"` (792 × 612 pt).
- Font: built-in Helvetica for text. No `Font.register` and no downloaded font file.
- Margins: 28 pt left/right, `paddingTop` about 78 pt, `paddingBottom` about 36 pt. `fixed` nodes are taken out of flow in react-pdf, so this padding is what keeps row 1 from drawing through the header and the last row off the footer. Tune the numbers against a two-page sample.
- Fixed header block on every page, absolutely positioned at the top inset:
  - Line 1: `{displayFlightName} · {flightDateLong}` (for example `May 2026 · May 01, 2026`).
  - Line 2: `Guardians M–T` using an en dash. When From equals To, still print both letters (`Guardians M–M`).
  - Column header row, bold, about 8 pt, labels from `getGuardianListColumns()`, in that order.
- Body rows follow, about 8 pt, top-aligned so wrapped notes grow the row. Do not set a fixed row height. Each row sets `wrap={false}` so a row that does not fit moves to the next page intact. The two-page sample showed the default (splitting a row) leaving Moss’s notes on the next page without the name. A single note longer than one page is a residual risk; do not truncate it.
- Column order and starting widths (points). Landscape letter content width is 736 pt after 28 pt side margins. Training notes is the only flex column and must stay the widest text column. Checkbox headers may wrap to two lines (`Mail` / `Rcvd`) so they can stay narrow.

  | Column         |               Width |
  | -------------- | ------------------: |
  | Name           |                 110 |
  | Middle         |                  48 |
  | Mobile         |                  70 |
  | DOB            |                  52 |
  | Training       |                  68 |
  | Training notes | 166 (the remainder) |
  | Waivers        |                  42 |
  | See Doc        |                  42 |
  | Mail Rcvd      |                  46 |
  | Mail Adopt     |                  48 |
  | Checked in     |                  44 |

  Fixed columns sum to 570 pt, leaving about 166 pt for notes. At 8 pt Helvetica that is roughly 35 characters per line, and the notes still wrap, so a long note stays fully printed. `Mail Rcvd` and `Mail Adopt` fit on one line at 8 pt bold in those widths; `Checked in` may wrap, which only makes the header row taller. Do not drop body type below 8 pt and do not switch to legal paper. Center Waivers, See Doc, Mail Rcvd, Mail Adopt, and Checked in.

- Check mark: two short black strokes inside a 9×8 pt view. `@react-pdf/renderer` 4.0.0's standard families are only Helvetica, Times, and Courier (ZapfDingbats is not registered, and using it throws). Helvetica has no check glyph. The unit tests count that check view: one when the flag is true, none when it is false.
- Checked in: a `View` about 11 × 11 pt with a 1 pt border and no text. Same box on every row.
- Fixed footer: `Printed {printedAtLabel}    Page {pageNumber} of {totalPages}`. Page numbers come from the `Text` `render` prop (`{ pageNumber, totalPages }`). `totalPages` is only reliable inside that callback.

## Library loading

`@react-pdf/renderer` 4.0.0 is a direct dependency and is unused in `src/`. Its peer dependency is `react ^16.8.0 || ^17.0.0 || ^18.0.0`. This app is React 18.3.1 and Next `^15.5.27`, so the peer matches. Do not upgrade the renderer to a build that requires React 19.

`'use client'` does not skip server pre-rendering. A static import of the renderer from `page.js` or the dialog will execute on the server and can throw on `document` or on yoga-layout’s WASM. This repo has no `next/dynamic` usage today. Do not mount `PDFViewer` or `PDFDownloadLink` into the page.

Load path:

1. The dialog’s Print handler dynamically `import()`s `guardian-list-pdf.js` only after the click.
2. That module statically imports `{ pdf }` from `@react-pdf/renderer` and `GuardianListDocument`.
3. `const blob = await pdf(<GuardianListDocument {...props} />).toBlob()`.
4. `URL.createObjectURL(blob)`, assign it to the tab opened in the click, and `revokeObjectURL` after about 60 seconds.
5. If `window.open` returned null, fall back to a temporary `<a download>` click. Suggested filename: `{displayFlightName}-guardians-{from}-{to}.pdf` with non-filename characters stripped.

`next/dynamic(..., { ssr: false })` would also keep the module off the server, and it is the right tool if a later change must render a PDF component in the tree. It is the wrong tool here because nothing PDF-related needs to render in the React tree.

Bundle: the flight details route must not gain this graph in its initial JS. Unpacked npm sizes of the packages already locked (not the minified browser chunk):

| Package                     | Unpacked |
| --------------------------- | -------: |
| `@react-pdf/renderer@4.0.0` |   1.2 MB |
| `@react-pdf/pdfkit@4.0.0`   |   1.0 MB |
| `@react-pdf/layout@4.2.0`   |   104 KB |
| `yoga-layout@3.2.1`         |   219 KB |
| `fontkit@2.0.4`             |   5.6 MB |

Most of fontkit’s unpacked size is data the browser chunk will not carry one-for-one. The async Print chunk will still be large. The implementation PR should paste the `next build` size of that chunk. First load of the roster stays the same; the cost is paid on the first Print click of the session.

`@react-pdf/pdfkit` 4.0.0 in this lockfile does not depend on the Node `canvas` package (older pdfkit did). Do not add a `canvas` webpack alias or `transpilePackages` ahead of a failure. If `next build` cannot resolve `canvas`, `fs`, or the yoga WASM file, then alias the Node builtins to `false` in `next.config.mjs` and note why. Standard fonts only, so there is no font asset to configure.

Knip’s `ignoreDependencies` is empty and its entries include `src/components/**`. The static import inside `guardian-list-pdf.js` is what keeps `@react-pdf/renderer` counted as used. The page must not be the module that imports the renderer.

### Jest

`jest.config.mjs` uses `next/jest` and jsdom. Do not let a test evaluate the real renderer (yoga WASM and fontkit fail or hang under jsdom). Do not add a global `moduleNameMapper` for the package.

- Helper tests import `guardian-list-range.js` only.
- Dialog tests `jest.mock` `./guardian-list-pdf` and assert the dynamic import is called with the filtered rows. A `jest.mock` of that module covers `import()`.
- Document tests, in that file only:

```js
jest.mock('@react-pdf/renderer', () => {
  const React = require('react');
  const el =
    (tag) =>
    ({ children, render, ...props }) =>
      React.createElement(
        'div',
        { 'data-pdf': tag, 'data-props': JSON.stringify(props) },
        typeof render === 'function' ? render({ pageNumber: 2, totalPages: 5 }) : null,
        children
      );
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
```

Assert `data-pdf` props (`size`, `orientation`, `fixed`) and visible text. Do not parse a real PDF in Jest.

## Test plan

Existing tests stay. Implementation adds the following and does not delete or relax any current assertion. The birth-date move keeps `roster-cell-renderers.test.js` covering the cell; the new formatter tests cover the shared function directly.

`src/components/main/flight/__tests__/guardian-list-range.test.js`

1. `returns guardians whose last-name letter is inside an inclusive range`
2. `excludes veterans, including a veteran whose last name is in range`
3. `includes a guardian-only crew row and a no-fly guardian`
4. `sorts by last name, then first name, case-insensitively`
5. `orders O'Brien, Oak, Obrien, and Olson with base English collation`
6. `orders de la Cruz before Deacon, and van Dyke after Van`
7. `treats a lowercase last name as its uppercase letter`
8. `folds an accented first letter onto A–Z`
9. `omits a blank last name and a last name with no A–Z letter`
10. `uses B for a last name that starts with an apostrophe`
11. `treats From equal to To as that single letter`
12. `reports an inverted range and returns no guardians`
13. `keeps one guardian row when the same id is on two pairs and checks mail call only when every veteran is true`
14. `formats Last, First and leaves a missing side without a dangling comma`
15. `maps guardian fields from the guardian and ignores mail-call flags on the guardian object`
16. `leaves both mail-call boxes blank when the guardian has no veteran on the flight`
17. `checks mail call for every veteran in one pair only when all of them have the flag`
18. `does not include the paired veteran's name`
19. `formats date of birth as MM/DD/YYYY without Date parsing`
20. `formats a flight date as MMMM DD, YYYY from the YYYY-MM-DD string`
21. `formats the printed timestamp in America/Chicago with a short zone name`
22. `lists Name, the guardian training labels, Mail Rcvd, Mail Adopt, and Checked in`

`src/components/main/flight/__tests__/guardian-list-print-dialog.test.js`

23. `defaults From and To to A and Z and shows the full guardian count`
24. `updates the count when the letter range changes`
25. `disables Print and explains when From is after To`
26. `disables Print when no guardian falls in range`
27. `asks the opener for the filtered guardians and has no roster-filter props`
28. `shows a safe toast and stays open when PDF generation fails`
29. `closes when Cancel is clicked`
30. `disables Print while the PDF is being prepared`

`src/app/(main)/flights/details/__tests__/page.test.js`

31. `shows Print guardian list to a records:read user without exports:read`
32. `keeps Print guardian list enabled on a completed flight`
33. `opens the print dialog from the participants actions`

`src/components/main/flight/__tests__/guardian-list-document.test.js`

34. `uses a landscape US Letter page`
35. `repeats a fixed header with the flight name, flight date, and Guardians M–T`
36. `uses guardian Training and Training notes labels, plus Mail Rcvd and Mail Adopt, and not Mail Rcvd / Training`
37. `renders Page X of Y from the footer render prop`
38. `prints a check mark for a true waiver and nothing for a false see-doc flag`
39. `prints a mail-call check only when that row flag is true, and blank when it is false`
40. `renders Checked in as an empty box`
41. `passes the full training notes string through for wrapping`

That is 41 new tests. Run `npx jest` on the four files above, then `npm test`. The implementation PR also runs `npm run lint` and `npm run build`, and checks the dialog in the browser: open it, change the range, see the count move, invert the range, print, and confirm the new tab shows a multi-page landscape PDF whose second page still has the header and `Page 2 of N`.

## Risks

- **#267 header footgun.** `getColumnConfig('training')` relabels two columns for the mixed roster. The PDF passes `true` for those labels and adds `Mail Rcvd` and `Mail Adopt` as separate columns. Tests lock both.
- **Dedupe dropping a second veteran's check.** Collapsing a repeated guardian id must require every veteran's flag (decision 11). Keeping the first pair only, or checking when any veteran is true, prints the wrong mark.
- **Reading the guardian's own mail-call fields.** The flight-detail booleans are veteran-only, and the guardian document has no `adopt`. Tests pass a guardian object with the flags set and a veteran with them clear, and expect a blank.
- **SSR.** A static import of the renderer into the page or the dialog breaks the flight details render. The dynamic import is the guard.
- **Popup blockers.** Opening the tab after `await pdf().toBlob()` is blocked. The synchronous blank tab is the mitigation, with a download fallback.
- **Dingbats glyph.** The check character must be confirmed visually once. The test locks whatever character that check accepts.
- **Chunk size.** fontkit’s package is large. Acceptable only because it is async and off the first load. Record the real chunk size from `next build`.
- **WASM / Node builtins at build time.** Fix `next.config.mjs` only if the build fails. `@react-pdf/pdfkit` 4.0.0 here does not depend on `canvas`.
- **Jest loading the real package.** Keep the mock local to the document test.
- **`new Date('YYYY-MM-DD')` on the flight date.** Shifts the printed day in US time zones. The formatter slices the string.
- **Printed zone in CI.** This environment is UTC. Tests pass `America/Chicago`. Production omits the zone so the laptop’s zone is used.
- **Long notes and large flights.** Notes wrap and rows grow. A full honor-flight guardian list is on the order of a hundred rows, all already in memory, so there is no extra request and no virtualization. `toBlob()` runs on the main thread and may hitch for a moment. A note with no spaces can overflow a cell; that is accepted for v1.
- **Fixed header overlap.** Padding has to be checked on page 2 of a real PDF. A Jest prop assertion does not prove the rows clear the header.
- **Duplicate birth-date rule.** Avoided by moving `formatRosterBirthDate` instead of copying it. The move must not change the roster tests’ expected strings.
- **Unlettered names silently missing.** The dialog count is the mitigation. Ø and Ł are the realistic leftovers after accent folding.
- **Knip.** The renderer import has to live in a module under `src/components` or `src/lib`, not only inside a test.

## Sequencing and conflicts

#260 is merged. PR [#263](https://github.com/Stars-and-Stripes-Honor-Flight/sshf-ui/pull/263) merged on 2026-10-20. It added the temporary Ops **Flt Grp / Med Exp** column and the **Med Exp.** sort (`medExprnc`) in `column-configs.js`, `roster-helpers.js`, and the Sort by menu on `page.js`. The PDF does not read Ops columns or `sortPairs`. The `page.js` edit for this work is the Participants action row, not the Sort by menu.

#267 is merged. PR [#268](https://github.com/Stars-and-Stripes-Honor-Flight/sshf-ui/pull/268) merged on 2026-10-21. The PDF still uses guardian-only labels on the Training columns. The veteran booleans that PR shows in the mixed roster (`mail_call_received`, `mail_call_adopt`) are extra PDF columns, read from the paired veteran already on the detail payload. That PR did not add a guardian PDF.

There are no open pull requests. `origin/main` also contains #269/#270 (Copy to New Guardian) and #271 (age on birth-date **form labels**, `src/lib/birth-date-age.js`). Neither touches the flight details page, the roster grid, or the Training columns. This plan branch is cut from that `origin/main`.

## Decisions

Steve approved this plan on 2026-10-23. Questions 1–10 and 12 are the recommendations, unchanged. Question 11 is the one change: a mail-call box is checked only when every paired veteran on this flight has that flag.

1. **Training column.** **Decided:** print the training type and a check or blank for `training_complete`, under the header `Training`.
2. **Who sees the button.** **Decided:** anyone who can open the flight details page (`records:read`), including a completed flight. `exports:read` is not required. The CSV menu stays the gated server export.
3. **Placement.** **Decided:** the Participants action row, outlined, next to **Fix Bus Mismatches**.
4. **From after To.** **Decided:** do not swap. Show `From is after To.` and disable Print.
5. **Nobody in range.** **Decided:** disable Print and show `No guardians in this range.` Do not produce a header-only PDF.
6. **Awkward last names.** **Decided:** the letter algorithm in the helper section. `O'Brien` → O, `de la Cruz` → D, `van Dyke` → V, `smith` → S, `Álvarez` → A, `'Brien` → B. Particles stay. Blank names and letters still outside A–Z (`Ø`, `Ł`) are omitted, with a count in the dialog. Sort with base English `localeCompare`.
7. **Open or download.** **Decided:** open a new tab from the click, before the PDF is built, and fall back to a download if the window is blocked. Leave the dialog open after success.
8. **Printed time zone.** **Decided:** the browser's local zone, with a short name (`Oct 23, 2026, 1:45 PM CDT`). Tests pin `America/Chicago`.
9. **Empty cells.** **Decided:** em dash for a missing DOB or empty training type. Blank for empty middle, mobile, and notes. Blank (no box, no dash) for a false waiver, see-doc, training-complete, mail-received, or mail-adopt flag, including an unpaired guardian. Checked in is the only always-empty square.
10. **Later pages.** **Decided:** repeat the flight name, date, `Guardians M–T`, and column titles on every page, plus the footer `Page X of Y`.
11. **Two or more veterans.** **Decided (changed from the recommendation):** still one PDF row per guardian. With exactly one paired veteran, use that veteran's flag. With more than one, check Mail Rcvd only when all of those veterans have `mail_call_received`, and check Mail Adopt independently the same way. Otherwise blank. The earlier recommendation was "check if any."
12. **Paired veteran's name.** **Decided:** leave it hidden. The two check columns are the only veteran data on the sheet.
