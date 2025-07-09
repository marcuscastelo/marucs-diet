# Day Diet Module - QA Testing

## 🎯 Overview

The Day Diet module is the core of the application, responsible for managing daily diets, meals, and macronutrient calculations. It is the most critical and complex module in the system.

## 🏗️ Main Components

- **DayDiet Entity**: Main entity representing a daily diet
- **Meals Management**: Management of meals within the diet
- **Macro Calculations**: Calculation of total macronutrients
- **Date Navigation**: Navigation between dates
- **Item Operations**: Addition, editing, and removal of items

## 🧪 Test Cases

### Test DD-01: Create New Daily Diet
**Priority**: 🔴 Critical
**Objective**: Validate the creation of a new diet for a specific date

**Prerequisites**:
- User logged in
- Navigate to a date without an existing diet

**Steps**:
1. Navigate to http://localhost:3002/diet
2. Change the date to a future date without a diet
3. Observe if the interface shows an empty diet
4. Try to add an item
5. Check if the diet is created automatically

**Expected Result**:
- The interface shows an empty diet for the new date
- The system allows adding items
- The diet is created automatically when adding the first item
- Macro totals initially show zero values

**Edge Cases**:
- Dates far in the future (>1 year)
- Dates far in the past
- Rapidly changing between dates

### Test DD-02: Add Foods to Meals
**Priority**: 🔴 Critical
**Objective**: Validate adding foods to different meals

**Prerequisites**:
- Existing diet for the day
- At least one visible meal

**Steps**:
1. Click "Add item" in any meal
2. Search for "Rice" in the search modal
3. Select "Cooked Rice" from the list
4. Set the quantity (100g)
5. Confirm the addition
6. Check if the item appears in the meal
7. Check if the macro totals have been updated

**Expected Result**:
- The search modal opens correctly
- The search returns relevant results
- The item is added to the correct meal
- Macro totals update instantly
- The interface shows success feedback

**Edge Cases**:
- Search for non-existent terms
- Addition of large quantities (>1000g)
- Addition of very small quantities (<1g)
- Rapid addition of multiple items

### Test DD-03: Macronutrient Calculations
**Priority**: 🔴 Critical
**Objective**: Validate the accuracy of macronutrient calculations

**Prerequisites**:
- Diet with at least 2 different items
- Macro goal set in the profile

**Steps**:
1. Note the macro values of individual items
2. Manually calculate the expected totals
3. Compare with the totals shown in the interface
4. Change the quantity of an existing item
5. Check the update of the totals
6. Check the progress indicators of the goals

**Expected Result**:
- Mathematically correct calculations
- Instant updates when changing quantities
- Accurate progress indicators
- Correct formatting of values (decimal places)

**Edge Cases**:
- Items with zero values in any macro
- Large quantities that result in high values
- Removal of items that leave totals at zero

### Test DD-04: Navigation between Dates
**Priority**: 🟡 High
**Objective**: Validate navigation between different dates

**Prerequisites**:
- Existing diets on at least 3 different dates
- Access to the diet page

**Steps**:
1. Use the date selector to navigate to yesterday
2. Check if the correct diet for the date is loaded
3. Navigate to tomorrow
4. Check if it shows an empty or existing diet
5. Navigate to a date with an existing diet
6. Check for correct data loading

**Expected Result**:
- Fluid navigation between dates
- Correct data loaded for each date
- Responsive interface during navigation
- Application state maintained correctly

**Edge Cases**:
- Rapid navigation between multiple dates
- Dates with large volumes of data
- Navigation to very old/future dates

### Test DD-05: Edit Existing Items
**Priority**: 🟡 High
**Objective**: Validate editing of items already added to the diet

**Prerequisites**:
- Diet with at least 2 items
- Items of different types (food, recipe)

**Steps**:
1. Click the edit icon of an item
2. Change the quantity of the item
3. Save the changes
4. Check for the update in the interface
5. Check for the update of the totals
6. Try to edit a recipe item
7. Check for specific behavior for recipes

**Expected Result**:
- The edit modal opens with the current values
- Changes are saved correctly
- The interface updates immediately
- Totals are recalculated automatically
- Consistent behavior between item types

**Edge Cases**:
- Editing quantity to zero
- Editing multiple items rapidly
- Canceling an edit
- Editing items with complex recipes

### Test DD-06: Remove Items
**Priority**: 🟡 High
**Objective**: Validate the removal of items from the diet

**Prerequisites**:
- Diet with at least 3 items
- Items in different meals

**Steps**:
1. Click the remove icon of an item
2. Confirm the removal in the confirmation modal
3. Check if the item has been removed from the interface
4. Check if the totals have been updated
5. Try to remove the last item from a meal
6. Check the behavior of the empty meal

**Expected Result**:
- The confirmation modal appears
- The item is removed after confirmation
- Totals are updated correctly
- The interface is reorganized appropriately
- Empty meals maintain their structure

**Edge Cases**:
- Removal of all items from the diet
- Rapid removal of multiple items
- Canceling a removal
- Removal of complex items (recipes)

### Test DD-07: Copy Previous Day
**Priority**: 🟢 Medium
**Objective**: Validate the copy previous day functionality

**Prerequisites**:
- Existing diet on the previous day
- Current day is empty or has few items

**Steps**:
1. Click the "Copy previous day" button
2. Check if a confirmation modal appears
3. Confirm the copy
4. Check if the items were copied
5. Check if the totals were recalculated
6. Try to copy again
7. Check the overwrite behavior

**Expected Result**:
- Clear confirmation modal
- All items copied correctly
- Totals recalculated automatically
- Meal structure maintained
- Success feedback for the operation

**Edge Cases**:
- Copying when the previous day is empty
- Copying over an existing diet
- Copying days with many items
- Copying complex recipes

### Test DD-08: Delete Entire Day
**Priority**: 🟡 High
**Objective**: Validate the complete deletion of a daily diet

**Prerequisites**:
- Existing diet with several items
- Access to the delete button

**Steps**:
1. Click the "DANGER: Delete day" button
2. Check for a risk confirmation modal
3. Confirm the deletion
4. Check if the diet has been completely removed
5. Check if the interface shows an empty day
6. Try to navigate to another date and back
7. Check the persistence of the deletion

**Expected Result**:
- Confirmation modal with a clear warning
- Complete deletion of the diet
- Clean interface for a new day
- Irreversible operation working
- Confirmation feedback of the deletion

**Edge Cases**:
- Deletion of days with a lot of data
- Deletion followed by rapid navigation
- Attempting to delete an empty day
- Canceling a deletion

### Test DD-09: Macro Goal Alerts
**Priority**: 🟢 Medium
**Objective**: Validate alerts when macro goals are exceeded

**Prerequisites**:
- Macro goals defined in the profile
- Diet close to the goal limits

**Steps**:
1. Add an item that exceeds the carbohydrate goal
2. Check if an alert is shown
3. Confirm the addition even with the excess
4. Check for visual indicators of excess
5. Try to exceed the protein goal
6. Check for consistent behavior

**Expected Result**:
- Clear alert when a goal is exceeded
- Option to continue or cancel
- Visual indicators of excess
- Consistent behavior between macros
- Correct calculations even with excess

**Edge Cases**:
- Very large excess in goals
- Multiple goals exceeded simultaneously
- Changing goals with an existing excess
- Removing items that resolve the excess

### Test DD-10: Performance with Large Volumes
**Priority**: 🟢 Medium
**Objective**: Validate performance with large amounts of data

**Prerequisites**:
- Ability to add many items
- Stopwatch to measure times

**Steps**:
1. Add 20 different items to the diet
2. Measure the page load time
3. Measure the time to add new items
4. Test navigation between dates
5. Check the responsiveness of the interface
6. Measure the calculation time of totals

**Expected Result**:
- Loading < 2 seconds
- Adding items < 500ms
- Fluid navigation
- Responsive interface
- Instant calculations

**Edge Cases**:
- 50+ items in a diet
- Very complex recipes
- Rapid navigation with a lot of data
- Multiple simultaneous operations

## 🐛 Known Bugs and Limitations

### Known Bugs
- Occasionally totals may not update immediately with very rapid changes
- Very rapid navigation between dates can cause inconsistent loading

### Limitations
- The maximum number of items per diet is not limited (may affect performance)
- There is no validation for extremely high quantities
- Change history is not maintained

## 📊 Quality Metrics

### Acceptance Criteria
- **Performance**: Basic operations < 500ms
- **Accuracy**: Mathematically correct calculations
- **Usability**: Responsive and intuitive interface
- **Reliability**: Data persists correctly

### Priority Regression Tests
1. DD-01, DD-02, DD-03 (core functionalities)
2. DD-05, DD-06 (CRUD operations)
3. DD-09 (business validations)
4. DD-10 (performance)

## 🔄 Updates

**Last updated**: 2025-01-09
**Tested version**: v0.12.0-dev
**Next improvements**: Concurrency tests, historical data validation
