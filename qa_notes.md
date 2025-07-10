# QA Notes for Issue #730 Refactoring

## Strange Observations:

- **Persistent 'Initializing app...' message:** The application displays 'Initializing app...' even after macro targets are set and the `MacroTargetNotFoundForDayError` is resolved. This seems to be related to a failed image load from Supabase storage (`https://sbhhxgeaflzmzpmatnir.supabase.co/storage/v1/object/public/uploads/3.jpg`), resulting in a `net::ERR_NAME_NOT_RESOLVED` error. This error is being ignored for the purpose of functional QA.

## Test Results:

### TEST MP-01: Validation of Non-Negative Values
- **Result:** FAIL
- **Expected:** Display message "The 'gramsPerKgCarbs' field of the macro profile must be a non-negative number" below the field.
- **Actual:** No validation message appeared.

### TEST MP-02: Data Type Validation
- **Result:** PARTIAL PASS (Browser native validation prevents non-numeric input)
- **Expected:** Display message "The 'gramsPerKgProtein' field of the macro profile must be a number" below the field.
- **Actual:** Browser's native validation prevented typing "abc" into the number input field. No application-level validation message was displayed. This is a positive behavior as it prevents invalid data entry at the browser level.

### TEST MP-03: Reactive Macro Calculation
- **Result:** FAIL (Calculation error)
- **Expected:** Update INSTANTANEOUSLY the value "kcal" (from 450 to 900) and the percentage without reloading page.
- **Actual:** The "kcal" value for fat updated from 630 kcal to 900 kcal, which is correct. However, the total "Daily caloric goal" changed from 1630 kcal to 2030 kcal, which is incorrect (should be 1900 kcal). The percentage for fat also changed from 38.65% to 39.13%, which is incorrect for 900 kcal out of 1900 kcal (should be 47.3%). This indicates a calculation error.

### TEST W-01: Negative Weight Validation
- **Result:** FAIL
- **Expected:** Display toast red message "The 'weight' field of the weight must be a non-negative number".
- **Actual:** No toast message appeared.

### TEST W-02: Data Type Validation
- **Result:** FAIL
- **Expected:** Display toast red message "The 'weight' field of the weight must be a number".
- **Actual:** No toast message appeared.

### TEST W-03: Empty Field Validation
- **Result:** FAIL
- **Expected:** Display toast red message "Enter a weight".
- **Actual:** No toast message appeared.
