# Weight Module - QA Testing

## 🎯 Overview

The Weight module is responsible for managing the user's weight control, including logging weigh-ins, visualizing progress through charts, calculating averages, and tracking progress against goals.

## 🏗️ Main Components

- **Weight Logging**: Logging of weigh-ins with date and time
- **Progress Tracking**: Tracking progress with charts
- **Goal Management**: Comparison with desired weight
- **Data Visualization**: Interactive charts with different periods
- **Historical Data**: Management of weigh-in history

## 🧪 Test Cases

### Test W-01: Log New Weight
**Priority**: 🔴 Critical
**Objective**: Validate logging of new weigh-ins

**Prerequisites**:
- User logged in on the /profile#weight page
- Access to the weight input field

**Steps**:
1. Enter weight in the field (e.g., 75.5)
2. Check if the value is accepted
3. Click "Add weight"
4. Check if the entry appears in the list
5. Check if the chart updates
6. Check if the statistics update
7. Try to add a duplicate weight for the same time

**Expected Result**:
- Weight logged with the current timestamp
- Weight list updated instantly
- Chart reflects the new entry
- Statistics recalculated (average, progress)
- Validation of duplicate entries

**Edge Cases**:
- Very low weight (< 30kg)
- Very high weight (> 300kg)
- Values with many decimal places
- Negative or zero weight
- Multiple entries in the same minute

### Test W-02: Edit Existing Weights
**Priority**: 🟡 High
**Objective**: Validate editing of already logged weigh-ins

**Prerequisites**:
- At least 3 weigh-ins logged
- Different dates and times

**Steps**:
1. Click the weight field of an entry
2. Change the value (e.g., 75.5 to 76.0)
3. Confirm the change
4. Check for the update in the list
5. Check for the update in the chart
6. Edit the date/time of an entry
7. Check for reordering of the list

**Expected Result**:
- Inline editing working
- Validation of new values
- Immediate update of the chart
- Recalculation of statistics
- Chronological reordering maintained

**Edge Cases**:
- Editing to an invalid value
- Changing the date that alters the order
- Rapid editing of multiple entries
- Canceling an edit
- Conflict with existing times

### Test W-03: Remove Weight Records
**Priority**: 🟡 High
**Objective**: Validate removal of weigh-ins

**Prerequisites**:
- History with at least 5 weigh-ins
- Different periods represented

**Steps**:
1. Click the remove icon of an entry
2. Check if a confirmation modal appears
3. Confirm the removal
4. Check if the entry has disappeared
5. Check for the update of the chart
6. Try to remove the oldest entry
7. Check the impact on statistics

**Expected Result**:
- Clear confirmation modal
- Immediate removal from the interface
- Updated chart
- Recalculated statistics
- Irreversible operation

**Edge Cases**:
- Removal of a single entry
- Removal of the most recent entry
- Rapid removal of multiple entries
- Canceling a removal
- Removal that leaves a period empty

### Test W-04: Evolution Chart and Periods
**Priority**: 🔴 Critical
**Objective**: Validate graphical visualization and period filters

**Prerequisites**:
- History with data from different periods
- At least 30 days of data

**Steps**:
1. Check the chart in "All time"
2. Change to "Last 7 days"
3. Check if the data is filtered correctly
4. Test "Last 30 days"
5. Check "Last year"
6. Test chart interactivity (zoom, navigation)
7. Check legends and scales

**Expected Result**:
- Chart loads correctly
- Filters work precisely
- Scales adjusted to the period
- Responsive interactivity
- Correct data for each period

**Edge Cases**:
- Periods without data
- Period with only one entry
- Very old data (> 1 year)
- Rapid change between periods
- Chart with many data points

### Test W-05: Calculation of Statistics and Progress
**Priority**: 🟡 High
**Objective**: Validate average and progress calculations

**Prerequisites**:
- Target weight defined in the profile (e.g., 70kg)
- History with weight variation

**Steps**:
1. Check the progress indicator (e.g., 100% + 87.0kg 🎉)
2. Manually calculate the average for the period
3. Compare with the displayed value
4. Change the target weight in the profile
5. Check for recalculation of progress
6. Add a new weigh-in
7. Check for automatic update

**Expected Result**:
- Progress calculated correctly
- Accurate mathematical average
- Automatic update when changing the goal
- Appropriate visual indicators
- Consistent formatting

**Edge Cases**:
- Current weight equal to the target
- Current weight far above the target
- Target weight not defined
- History with a single entry
- Extreme weight variations

### Test W-06: Date and Time Management
**Priority**: 🟡 High
**Objective**: Validate date and time functionality of weigh-ins

**Prerequisites**:
- Possibility to edit timestamps
- Different time zones

**Steps**:
1. Add weight with the current date/time
2. Edit the date to yesterday
3. Check for reordering of the list
4. Add weight with a future date
5. Check the behavior
6. Test the date/time format
7. Check for chronological ordering

**Expected Result**:
- Editable timestamps
- Chronological ordering maintained
- Consistent date format
- Validation of future dates
- Automatic reordering

**Edge Cases**:
- Very old date (< 1900)
- Very future date (> 2100)
- Invalid date format
- Multiple entries at the same timestamp
- Time zone change

### Test W-07: Integration with User Profile
**Priority**: 🟡 High
**Objective**: Validate integration with profile data

**Prerequisites**:
- Target weight defined in the profile
- User data filled out

**Steps**:
1. Check if the profile's target weight is used
2. Change the target weight in the "Information" section
3. Check for the update in the "Weight" section
4. Test bidirectional synchronization
5. Check calculations based on the profile
6. Test with an incomplete profile
7. Check behavior without a goal

**Expected Result**:
- Automatic synchronization
- Calculations based on the profile
- Bidirectional update
- Handling of missing data
- Consistency between sections

**Edge Cases**:
- Profile without a target weight
- Drastic goal change
- Incomplete profile
- Conflicting data
- Synchronization failure

### Test W-08: Data Export and Backup
**Priority**: 🟢 Medium
**Objective**: Validate export functionalities (if available)

**Prerequisites**:
- Substantial history of weigh-ins
- Export functionality implemented

**Steps**:
1. Check if there is an export option
2. Test export in different formats
3. Check the integrity of the exported data
4. Test data import
5. Check for automatic backup
6. Test backup restoration
7. Check export logs

**Expected Result**:
- Complete data export
- Standard formats supported
- Data integrity
- Reliable backup process
- Functional restoration

**Edge Cases**:
- Export of large volumes
- Corrupted data
- Export failure
- Import of invalid data
- Backup with missing data

### Test W-09: Performance with Large Volumes
**Priority**: 🟢 Medium
**Objective**: Validate performance with an extensive history

**Prerequisites**:
- Ability to generate a lot of data
- Stopwatch for measurements

**Steps**:
1. Add 100+ weight records
2. Measure loading time
3. Test navigation in the chart
4. Check interface responsiveness
5. Test period filters
6. Measure calculation times
7. Check memory usage

**Expected Result**:
- Loading < 3 seconds
- Responsive chart
- Functional filters
- Fluid interface
- Efficient calculations

**Edge Cases**:
- 1000+ weight records
- Data from several years
- Intense navigation in the chart
- Multiple simultaneous operations
- Low-performance devices

### Test W-10: Responsiveness and Accessibility
**Priority**: 🟢 Medium
**Objective**: Validate interface adaptability

**Prerequisites**:
- Different devices and sizes
- Accessibility tools

**Steps**:
1. Test on desktop (1920x1080)
2. Test on tablet (768x1024)
3. Test on mobile (375x667)
4. Check chart accessibility
5. Test keyboard navigation
6. Check color contrast
7. Test with a screen reader

**Expected Result**:
- Responsive layout
- Adaptable chart
- Accessible navigation
- Adequate contrast
- Compatibility with assistive technologies

**Edge Cases**:
- Very small screens
- Ultrawide screens
- High contrast
- Accessibility zoom
- Keyboard-only navigation

## 🐛 Known Bugs and Limitations

### Known Bugs
- The chart may take a long time to load with a lot of data
- Rapid editing of multiple entries can cause inconsistencies
- Chart zoom occasionally does not reset correctly

### Limitations
- No validation of healthy weight limits
- Lack of integration with weighing devices
- History is not automatically backed up
- No trend analysis or predictions

## 📊 Quality Metrics

### Acceptance Criteria
- **Accuracy**: Correct average and progress calculations
- **Performance**: Operations < 2 seconds
- **Usability**: Intuitive and responsive interface
- **Visualization**: Clear and informative charts

### Priority Regression Tests
1. W-01, W-04, W-05 (core functionalities)
2. W-02, W-03 (CRUD operations)
3. W-07 (integration with profile)
4. W-09 (performance)

## 🔄 Updates

**Last updated**: 2025-01-09
**Tested version**: v0.12.0-dev
**Next improvements**: Integration with devices, trend analysis, health alerts
