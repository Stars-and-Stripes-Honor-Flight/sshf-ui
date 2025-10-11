<!-- 79b66f32-c685-4a76-9d80-b906a22eb2de 73abf5cd-6bbb-4fbd-9ee0-d3ae96ca4dd4 -->
# Add Missing Veteran Properties to Edit Form

## Overview

Expand `veteran-edit-form.js` to include all properties from the legacy Mustache template, organized into logical sections with proper UI components.

## Implementation Strategy

### 1. Update Default Values Structure

Modify the `defaultValues` useMemo hook (lines 106-127) to include all missing properties with proper nested structure:

- Add `name.nickname`
- Add `weight`
- Add `address.phone_eve`
- Expand `service` to include `activity`
- Expand `medical` object with all mobility/medical fields
- Expand `flight` object with all flight-related fields
- Add `call` object (new section)
- Expand `mail_call.address` with phone/email
- Expand `emerg_contact.address` with full address fields
- Expand `alt_contact.address` with full address fields
- Add `guardian.id`
- Expand `apparel` with all fields
- Expand `accommodations` with all fields
- Add `homecoming` object (new section)
- Add `metadata` object for read-only display

### 2. Add Missing Fields to Personal Information Card

Location: Lines 398-484

- Add nickname field after last name
- Add weight field (numeric input) with birth_date

### 3. Add Service Activity Field

Location: Lines 486-563 (Service Information Card)

- Add textarea for `service.activity` below service dates

### 4. Create Medical Information Card

New card in Essential Information Group (after Service Information)

- Add section with FirstAid or Heartbeat icon
- Include medical level, alt_level, food_restriction (already exists)
- Add mobility equipment checkboxes (cane, walker, wheelchair, scooter)
- Add wheelchair bound checkbox
- Add requires oxygen checkbox
- Add exam required checkbox
- Add medical limitations field (hidden, for data compatibility)
- Add medical review notes textarea
- Add medical release checkbox
- Add medical form checkbox

### 5. Expand Flight Status Card

Location: Lines 565-633

- Add flight group field
- Add flight seat field
- Add flight status note (textarea)
- Add confirmed date field
- Add confirmed by field
- Add media waiver checkbox (hidden per template)
- Add vaccinated checkbox
- Add infection test checkbox (hidden per template)
- Add nofly checkbox
- Update bus to be a Select dropdown with specific options (Alpha1-5, Bravo1-5)

### 6. Create Call Center Information Card

New card in Contact Information Group

- Add icon (Phone or Headset)
- Add call assigned to field
- Add call center notes textarea
- Add FM number field
- Add veteran mail sent checkbox
- Add email veteran checkbox (hidden)
- Add flight confirmed date
- Add flight confirmed by

### 7. Expand Mail Call Card

Location: Lines 932-993

- Add mail call phone field
- Add mail call email field
- Add mail call adoption checkbox

### 8. Expand Emergency Contact Card

Location: Lines 766-828

- Add full address fields (street, city, state, zip)
- Add evening phone field
- Add mobile phone field

### 9. Expand Alternate Contact Card  

Location: Lines 830-892

- Add full address fields (street, city, state, zip)
- Add evening phone field
- Add mobile phone field

### 10. Expand Guardian Card

Location: Lines 894-930

- Add hidden guardian.id field for reference
- Consider making guardian.name read-only with edit link (per template)

### 11. Expand Apparel Card

Location: Lines 1010-1078

- Add apparel item select (None/Jacket/Polo/Both)
- Add apparel shirt size with extended options (W sizes: WXS, WS, WM, WL, WXL, W2XL, W3XL, W4XL, W5XL plus regular sizes)
- Add date sent field
- Add sent by field
- Add apparel notes textarea

### 12. Expand Accommodations Card

New card in Additional Details Group (or create Accommodations group)

- Add arrival time field
- Add arrival flight field
- Add attend banquette checkbox
- Add banquette guest field
- Add departure time field
- Add departure flight field

### 13. Create Homecoming Card

New card in Additional Details Group

- Add icon (House or similar)
- Add homecoming destination field

### 14. Create Metadata Card

New card at the end (read-only section)

- Add icon (Clock or Info)
- Add created_at field (read-only)
- Add created_by field (read-only)
- Add updated_at field (read-only)
- Add updated_by field (read-only)

## Key Considerations

1. **Icons**: Import additional icons from `@phosphor-icons/react` as needed:

- FirstAid or Heartbeat for Medical
- House for Homecoming
- Clock or Info for Metadata
- Headset for Call Center

2. **Field Types**:

- Use `OutlinedInput` for text fields
- Use `Select` with `Option` for dropdowns
- Use `Checkbox` with `FormControlLabel` for boolean fields
- Use `type="date"` for date fields
- Use `type="number"` for numeric fields (weight)
- Use `multiline rows={2-3}` for textareas

3. **Hidden Fields**: Some fields marked as hidden in template should still be included but can be conditionally rendered or kept in form state without display

4. **Read-Only Fields**: Metadata fields and guardian_name should use `InputProps={{ readOnly: true }}` or similar

5. **Data Structure**: Maintain nested object structure to match the API data model from `Veteran_Data_Example.json`

6. **Grid Layout**: Continue using `Grid` with appropriate `xs` and `md` breakpoints for responsive design

7. **Card Organization**: Group related fields into cards within the existing group structure (Essential Information, Contact Information, Additional Details)

## Files to Modify

- `src/components/main/veteran/veteran-edit-form.js` - Main component file (~700 lines of additions expected)

### To-dos

- [ ] Update defaultValues structure to include all missing properties with proper nesting
- [ ] Add nickname and weight fields to Personal Information Card
- [ ] Add service activity textarea to Service Information Card
- [ ] Create comprehensive Medical Information Card with all medical/mobility fields
- [ ] Expand Flight Status Card with all missing flight-related fields
- [ ] Create Call Center Information Card in Contact Information group
- [ ] Add phone, email, and adoption fields to Mail Call Card
- [ ] Add full address fields to Emergency Contact Card
- [ ] Add full address fields to Alternate Contact Card
- [ ] Add guardian ID field to Guardian Card
- [ ] Add item, shirt sizes, date, sent by, and notes to Apparel Card
- [ ] Add flight/time details and banquette fields to Accommodations Card
- [ ] Create Homecoming Card with destination field
- [ ] Create read-only Metadata Card with created/updated timestamps and users