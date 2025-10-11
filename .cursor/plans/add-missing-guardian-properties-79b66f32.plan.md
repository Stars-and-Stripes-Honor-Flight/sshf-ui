<!-- 79b66f32-c685-4a76-9d80-b906a22eb2de 95510476-d3f4-4376-b47b-47a3a711a6b9 -->
# Expand Guardian Edit Form with Missing Properties

## Overview

Add approximately 40 missing properties to `guardian-edit-form.js` by creating new cards and expanding existing ones, following the patterns established in the veteran form.

## Implementation Steps

### 1. Update Default Values Structure

**File:** `src/components/main/guardian/guardian-edit-form.js`

Expand the `defaultValues` object (lines 95-163) to include all missing nested properties:

- Add `name.nickname`
- Add `call` object with: `assigned_to`, `notes`, `fm_number`, `email_sent`
- Add missing `flight` properties: `training_notes`, `status_note`, `mediaWaiver`, `infection_test`, `nofly`, `booksOrdered`, `confirmed_date`, `confirmed_by`
- Add missing `medical` properties: `release`, `form`
- Add missing `apparel` properties: `date`, `by`, `notes`
- Add missing `accommodations` properties: `arrival_time`, `arrival_flight`, `attend_banquette`, `banquette_guest`, `departure_time`, `departure_flight`
- Add `metadata` object with: `created_at`, `created_by`, `updated_at`, `updated_by`

### 2. Add Missing Icons

Import additional icons needed for new cards:

- `Headset` for Call Center
- `Clock` for Metadata

### 3. Enhance Personal Information Card

Add nickname field after last name in Personal Information Card (~line 438).

### 4. Create Medical Information Card

Insert new comprehensive Medical Information Card after Personal Information Card, including:

- Weight field (number input, 60-450 range)
- Occupation field (text input)
- "Are you a veteran?" select (notes.service)
- Service details textarea (notes.other)
- Medical level input (A-D)
- Food restriction select (already in defaults)
- Physical capability checkboxes (can_push, can_lift)
- Medical limitations textarea
- Medical experience textarea  
- Medical form/release checkboxes

### 5. Create Call Center Information Card

Insert new Call Center Card after Medical Information, within Essential Information group:

- Call assigned to field
- FM number field
- Call notes textarea
- Email sent checkbox
- Confirmed date field
- Confirmed by field

### 6. Expand Flight Status Card

Add missing fields to existing Flight Status Card (~line 473):

- Training select dropdown (None/Main/Previous/Phone/Web)
- Training notes textarea
- Status note textarea
- Training complete checkbox
- Training see doc checkbox
- Media waiver checkbox
- Infection test checkbox
- Exempt checkbox
- Books ordered number field
- Not flying checkbox

### 7. Expand Apparel Information Card

Add missing fields to Apparel Card (~line 858):

- Apparel shirt size select with W sizes (WXS, WS, WM, WL, WXL, W2XL, W3XL, W4XL, W5XL, plus standard)
- Date sent field
- Sent by field
- Apparel notes textarea

### 8. Create Accommodations Card

Insert new Accommodations Card in Additional Details group:

- Hotel name, room type, arrival/departure dates (already partially implemented in defaults)
- Arrival time field
- Arrival flight field
- Attend banquette checkbox
- Banquette guest field
- Departure time field
- Departure flight field
- Accommodations notes textarea

### 9. Create Metadata Card

Insert new read-only Metadata/Record Information Card at the end of Additional Details:

- Created at (read-only)
- Created by (read-only)
- Updated at (read-only)
- Updated by (read-only)

## Key Patterns to Follow

- Use `Controller` from react-hook-form for all fields
- Use `SectionHeader` component for card titles with appropriate icons
- Use `Grid` with responsive breakpoints (xs={12}, md={6}, etc.)
- Group related checkboxes in Stack with Typography subtitle
- Use appropriate input types (date, number, email, textarea with multiline/rows)
- Maintain consistent error handling with `FormHelperText`
- Place read-only fields with `InputProps={{ readOnly: true }}` or `disabled` attribute

## Files Modified

- `src/components/main/guardian/guardian-edit-form.js` - Main form component with all additions

### To-dos

- [ ] Update defaultValues structure to include all missing properties with proper nesting
- [ ] Import Headset and Clock icons from phosphor-icons
- [ ] Add nickname field to Personal Information Card
- [ ] Create comprehensive Medical Information Card with all medical fields, veteran status, and physical capabilities
- [ ] Create Call Center Information Card with assignment, notes, and confirmation fields
- [ ] Expand Flight Status Card with training, status notes, and all missing checkboxes
- [ ] Expand Apparel Card with shirt sizes including W sizes, date, sent by, and notes
- [ ] Create Accommodations Card with flight details and banquette information
- [ ] Create read-only Metadata Card with created/updated timestamps and users