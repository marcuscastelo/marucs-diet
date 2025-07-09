# Macro Profile Module - QA Testing

## 🎯 Overview

The Macro Profile module is responsible for managing the user's macronutrient goals, including setting dietary objectives (cutting, bulking, maintenance) and calculating macronutrient ratios based on body weight.

## 🏗️ Main Components

- **Macro Goals Management**: Configuration of carbohydrate, protein, and fat goals
- **Diet Type Selection**: Selection between cutting, bulking, and maintenance
- **Caloric Distribution**: Caloric distribution among macronutrients
- **Weight-Based Calculations**: Calculations based on the user's body weight
- **Profile Restoration**: Restoration of previously saved profiles

## 🧪 Test Cases

### Test MP-01: Macronutrient Goal Configuration
**Priority**: 🔴 Critical
**Objective**: Validate the configuration of individual macronutrient goals

**Prerequisites**:
- User logged in with a basic profile filled out
- Body weight defined in the profile
- Navigate to /profile#macros

**Steps**:
1. Check if the daily caloric goal is visible
2. Set the carbohydrate goal in grams
3. Check for automatic update of the g/kg ratio
4. Set the protein goal
5. Check for automatic recalculation of calories
6. Set the fat goal
7. Check the final percentage distribution

**Expected Result**:
- Correct mathematical calculations (4 kcal/g carb+prot, 9 kcal/g fat)
- g/kg ratios based on body weight
- Percentage distribution sums to 100%
- Real-time update of values
- Clear visual feedback of values

**Edge Cases**:
- Very high values (>500g of any macro)
- Very low values (<5g of any macro)
- Body weight not defined
- Rapid change of multiple values

### Test MP-02: Diet Types and Pre-defined Settings
**Priority**: 🟡 High
**Objective**: Validate the selection of diet types and their settings

**Prerequisites**:
- User on the profile page
- Body weight defined (e.g., 80kg)

**Steps**:
1. Select "Cutting" in the Diet field
2. Check if macro suggestions appear
3. Select "Bulking"
4. Check for changes in suggestions
5. Select "Maintenance"
6. Check for neutral configuration
7. Switch between types rapidly

**Expected Result**:
- Cutting: Lower caloric intake, higher protein ratio
- Bulking: Higher caloric intake, more carbohydrates
- Maintenance: Balanced distribution
- Smooth transitions between types
- Values consistent with the selected type

**Edge Cases**:
- Changing type with already configured goals
- Diet types with very low/high body weight
- Rapid switching between types
- Restoration after changing type

### Test MP-03: Body Weight Ratio Calculations
**Priority**: 🔴 Critical
**Objective**: Validate g/kg ratio calculations based on weight

**Prerequisites**:
- Body weight defined in the profile (e.g., 80kg)
- Macro goals configured

**Steps**:
1. Set 160g of protein
2. Check if the ratio shows 2.0 g/kg
3. Change body weight to 70kg
4. Check for automatic recalculation to 2.29 g/kg
5. Directly set the ratio to 2.5 g/kg
6. Check if grams update to 175g
7. Test with different macronutrients

**Expected Result**:
- Accurate mathematical calculations (grams ÷ weight = g/kg)
- Bidirectional update (grams ↔ ratio)
- Synchronization with weight changes
- Values rounded appropriately
- Consistency across all macronutrients

**Edge Cases**:
- Zero or negative body weight
- Very high ratio values (>10 g/kg)
- Simultaneous changes in weight and macros
- Fractional weight values

### Test MP-04: Restore Old Profile
**Priority**: 🟢 Medium
**Objective**: Validate the functionality of restoring saved profiles

**Prerequisites**:
- Old profile exists in the database
- Current settings are different from the old profile

**Steps**:
1. Check if "Have an old profile? Yes, from [date]" appears
2. Click "Restore old profile"
3. Check if a confirmation modal appears
4. Confirm the restoration
5. Check if the values are restored
6. Test with multiple old profiles
7. Check if the profile date is shown correctly

**Expected Result**:
- Automatic detection of old profiles
- Clear confirmation modal
- Complete restoration of values
- Profile date displayed correctly
- Success feedback for the operation

**Edge Cases**:
- Old profiles with incomplete data
- Multiple old profiles available
- Restoration of very old profiles
- Canceling a restoration

### Test MP-05: Caloric Distribution and Percentages
**Priority**: 🟡 High
**Objective**: Validate caloric distribution calculations among macronutrients

**Prerequisites**:
- Macro goals configured
- Daily caloric goal defined

**Steps**:
1. Set 150g carbohydrates, 120g proteins, 80g fats
2. Check calculation: (150×4) + (120×4) + (80×9) = 1800 kcal
3. Check percentages: carb 33.3%, prot 26.7%, fat 40%
4. Change only carbohydrates to 200g
5. Check for automatic recalculation of percentages
6. Zero out one macronutrient
7. Check the behavior of the percentages

**Expected Result**:
- Correct caloric calculations (4-4-9 kcal/g)
- Percentages sum to 100%
- Real-time update
- Correct formatting (decimal places)
- Handling of zero values

**Edge Cases**:
- All macros zeroed out
- One macro with a very high value
- Values that result in percentages < 1%
- Very rapid changes in values

### Test MP-06: Integration with Body Weight
**Priority**: 🟡 High
**Objective**: Validate integration with weight data from the Weight module

**Prerequisites**:
- Body weight registered in the Weight module
- Macro goals configured

**Steps**:
1. Check if the current weight is used in calculations
2. Change the weight in the "Weight" section
3. Go back to "Goals" and check for recalculation
4. Set a goal in g/kg
5. Check if it uses the most recent weight
6. Test with weight history
7. Check behavior without a registered weight

**Expected Result**:
- Most recent weight used automatically
- Automatic recalculation when changing weight
- Accurate g/kg calculations
- Synchronization between sections
- Handling of unavailable weight

**Edge Cases**:
- Multiple weight entries on the same day
- Zero or negative weight
- Drastic weight change
- Absence of weight records

### Test MP-07: Input Validation and Limits
**Priority**: 🟡 High
**Objective**: Validate input validation and value limits

**Prerequisites**:
- Access to the macro goals page
- Different input scenarios

**Steps**:
1. Try to enter negative values
2. Try to enter non-numeric values
3. Enter extremely high values (>1000g)
4. Enter decimal values
5. Test empty fields
6. Test pasting invalid values
7. Check for error messages

**Expected Result**:
- Rejection of negative values
- Numeric input validation
- Reasonable limits for values
- Handling of decimals
- Clear error messages
- Prevention of invalid states

**Edge Cases**:
- Values with many decimal places
- Scientific notation (1e10)
- Special characters
- Values very close to zero

### Test MP-08: Persistence and Synchronization
**Priority**: 🔴 Critical
**Objective**: Validate data persistence and synchronization

**Prerequisites**:
- Goals configured and saved
- Multiple sessions/devices (if applicable)

**Steps**:
1. Configure macro goals
2. Navigate to another page
3. Go back and check if values persist
4. Reload the page (F5)
5. Check if settings are maintained
6. Test in another tab/window
7. Check for synchronization of changes

**Expected Result**:
- Persistence between navigations
- Data maintained after reload
- Synchronization between sessions
- Automatic backup of settings
- Data recovery in case of failure

**Edge Cases**:
- Unstable internet connection
- Multiple simultaneous changes
- Synchronization failures
- Corrupted data

### Test MP-09: Responsive Interface and Usability
**Priority**: 🟢 Medium
**Objective**: Validate interface responsiveness and usability

**Prerequisites**:
- Different screen sizes
- Various devices (desktop, tablet, mobile)

**Steps**:
1. Test on desktop (1920x1080)
2. Resize to tablet (768x1024)
3. Test on mobile (375x667)
4. Check input fields
5. Test touch navigation
6. Check text legibility
7. Test accessibility (keyboard)

**Expected Result**:
- Adaptive layout
- Accessible input fields
- Legible texts at all sizes
- Consistent navigation
- Touch and keyboard support
- Accessibility compliance

**Edge Cases**:
- Very small screens (<320px)
- Very large screens (>2560px)
- Landscape/portrait orientation
- Accessibility zoom

### Test MP-10: Performance and Real-Time Calculations
**Priority**: 🟢 Medium
**Objective**: Validate the performance of real-time calculations

**Prerequisites**:
- Stopwatch to measure times
- Multiple input fields

**Steps**:
1. Measure initial loading time
2. Measure response time to inputs
3. Test rapid changes in sequence
4. Check interface fluidity
5. Test with extreme values
6. Measure synchronization time
7. Check memory usage

**Expected Result**:
- Initial loading < 1 second
- Response to inputs < 100ms
- Fluid interface during changes
- Instant calculations
- Efficient resource usage
- No freezes or lags

**Edge Cases**:
- Low-performance devices
- Multiple simultaneous changes
- Values that require complex calculations
- Prolonged use of the interface

## 🐛 Known Bugs and Limitations

### Known Bugs
- Occasionally calculations may not update immediately with very rapid changes
- Restoration of an old profile may not work with very old data
- The distribution chart may not load immediately

### Limitations
- No validation of safe nutritional limits
- Change history is not maintained
- No personalized suggestions based on specific goals
- Lack of integration with physical activity data

## 📊 Quality Metrics

### Acceptance Criteria
- **Accuracy**: Mathematically correct calculations
- **Performance**: Real-time calculations < 100ms
- **Usability**: Intuitive and responsive interface
- **Persistence**: Data maintained between sessions

### Priority Regression Tests
1. MP-01, MP-03, MP-05 (core calculations)
2. MP-02, MP-06 (integrations)
3. MP-08 (persistence)
4. MP-10 (performance)

## 🔄 Updates

**Last updated**: 2025-01-09
**Tested version**: v0.12.0-dev
**Next improvements**: Nutritional validation, personalized suggestions, integration with physical activity
