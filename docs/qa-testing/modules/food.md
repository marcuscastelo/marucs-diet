# Food Module - QA Testing

## 🎯 Overview

The Food module is responsible for managing the application's food database, including search, categorization, favorites, and integration with the barcode system. It is essential for the functionality of adding items to the diet.

## 🏗️ Main Components

- **Food Database**: Comprehensive food database
- **Search Engine**: Diacritic-insensitive search engine
- **Categorization**: Filters by type (All, Favorites, Recents, Recipes)
- **Barcode Integration**: Search by barcode
- **Favorites System**: Favorites system with stars
- **Nutritional Data**: Complete macronutrient information

## 🧪 Test Cases

### Test F-01: Search by Food Name
**Priority**: 🔴 Critical
**Objective**: Validate search functionality by name

**Prerequisites**:
- Search modal open
- Food database loaded

**Steps**:
1. Type "rice" in the search field
2. Check if results appear instantly
3. Test search with accents "arroz cozido"
4. Test search without accents "acai"
5. Search by partial name "pumpk"
6. Check the sorting of the results
7. Test case-insensitive search "RICE"

**Expected Result**:
- Diacritic-insensitive search working
- Results appear in real-time
- Case-insensitive search
- Sorting by relevance
- Highlighting of found terms

**Edge Cases**:
- Search with special characters
- Search with extra spaces
- Search with very short terms (< 3 characters)
- Search with non-existent terms
- Search with multiple words

### Test F-02: Search by Barcode
**Priority**: 🟡 High
**Objective**: Validate search functionality by EAN/barcode

**Prerequisites**:
- Search modal open
- Barcode scanner accessible

**Steps**:
1. Click the scanner icon
2. Allow camera access
3. Scan a valid barcode
4. Check if the product is found
5. Test manual code entry
6. Test a non-existent code
7. Check the data of the found product

**Expected Result**:
- Scanner works correctly
- Valid codes find products
- Correct nutritional data
- Handling of non-existent codes
- Clear interface for manual scanning

**Edge Cases**:
- Damaged barcodes
- Very long or short codes
- Multiple products with the same code
- International vs. national codes
- Camera access failure

### Test F-03: Categorization and Filter System
**Priority**: 🟡 High
**Objective**: Validate All, Favorites, Recents, Recipes filters

**Prerequisites**:
- Existing search history
- Marked favorites
- Available recipes

**Steps**:
1. Test "All" filter (default)
2. Click "Favorites" and check the list
3. Test "Recents" with history
4. Click "Recipes" and check the 📖 icon
5. Switch between filters rapidly
6. Test search with active filters
7. Check filter persistence

**Expected Result**:
- Filters work correctly
- Appropriate content for each category
- Smooth transition between filters
- Search respects active filters
- Clear filter interface

**Edge Cases**:
- Empty category (no favorites)
- Multiple categories for the same item
- Filters with a large volume of data
- Search that finds no results in the active filter
- Synchronization between sessions

### Test F-04: Favorites System
**Priority**: 🟢 Medium
**Objective**: Validate marking and unmarking of favorites

**Prerequisites**:
- List of available foods
- Functional favorites system

**Steps**:
1. Click the empty star (☆) of a food
2. Check if it turns into a full star (★)
3. Go to the "Favorites" tab
4. Check if the item appears on the list
5. Unmark the favorite on the list
6. Check for removal from the list
7. Test synchronization between tabs

**Expected Result**:
- Instant visual marking
- Persistence between sessions
- Synchronization between tabs
- Updated favorites list
- Reversible operation

**Edge Cases**:
- Favoriting a large number of items
- Favoriting and unfavoriting rapidly
- Favorites with corrupted data
- Synchronization between devices
- Backup and restoration of favorites

### Test F-05: View Nutritional Data
**Priority**: 🔴 Critical
**Objective**: Validate the display of nutritional information

**Prerequisites**:
- Foods with complete nutritional data
- Different types of foods

**Steps**:
1. Check the format "C: X, P: Y, G: Z"
2. Validate calorie calculation (4-4-9)
3. Check the default quantity (100g)
4. Test different types of foods
5. Check foods with zero macros
6. Test foods with fractional values
7. Check for consistent formatting

**Expected Result**:
- Correct nutritional data
- Accurate calorie calculations
- Consistent formatting
- Zero values handled appropriately
- Clear and legible information

**Edge Cases**:
- Foods without nutritional data
- Extreme nutritional values
- Foods with incomplete data
- Calculations with fractional values
- Formatting of large numbers

### Test F-06: Search Performance
**Priority**: 🟡 High
**Objective**: Validate performance with a large volume of data

**Prerequisites**:
- Full database loaded
- Stopwatch for measurements

**Steps**:
1. Measure initial loading time
2. Test search with a common term ("rice")
3. Measure response time
4. Test rapid filter changes
5. Check scrolling with many results
6. Test search with unique terms
7. Measure memory usage

**Expected Result**:
- Instant search (< 300ms)
- Fluid scrolling with many results
- Filters respond quickly
- Efficient memory usage
- Responsive interface

**Edge Cases**:
- Search that returns 1000+ results
- Very rapid filter changes
- Intense scrolling in the list
- Search with complex patterns
- Prolonged use of the search

### Test F-07: Integration with Diet System
**Priority**: 🔴 Critical
**Objective**: Validate selection and addition of foods to the diet

**Prerequisites**:
- Search modal opened via "Add item"
- Meal selected for addition

**Steps**:
1. Search and select a food
2. Check if the quantity modal appears
3. Set a custom quantity
4. Confirm the addition
5. Check if the item appears in the meal
6. Test adding a recipe
7. Check the update of the totals

**Expected Result**:
- Clear selection of foods
- Intuitive quantity modal
- Successful addition to the meal
- Automatic update of totals
- Differentiation between foods and recipes

**Edge Cases**:
- Selection of foods without data
- Addition of extreme quantities
- Canceling an addition
- Rapid addition of multiple items
- Addition to different meals

### Test F-08: History of Recent Items
**Priority**: 🟢 Medium
**Objective**: Validate the functionality of recent items

**Prerequisites**:
- History of added items
- Recent use of the system

**Steps**:
1. Add several items to the diet
2. Open the search modal
3. Click "Recents"
4. Check if items appear sorted
5. Test the limit of recent items
6. Check persistence between sessions
7. Test clearing the history

**Expected Result**:
- Items sorted by recency
- Reasonable limit of items (50-100)
- Persistence between sessions
- Automatic update
- Clear history interface

**Edge Cases**:
- Very long history
- Items removed from the database
- Multiple uses of the same item
- Corrupted history
- Manual clearing of history

### Test F-09: Interface Responsiveness
**Priority**: 🟢 Medium
**Objective**: Validate adaptability on different devices

**Prerequisites**:
- Different screen sizes
- Functional search modal

**Steps**:
1. Test on desktop (1920x1080)
2. Resize to tablet (768x1024)
3. Test on mobile (375x667)
4. Check the search field
5. Test list scrolling
6. Check buttons and filters
7. Test touch interactions

**Expected Result**:
- Adaptive layout
- Accessible search field
- Scrollable list
- Well-positioned buttons
- Responsive touch interactions

**Edge Cases**:
- Very small screens
- Landscape/portrait orientation
- Accessibility zoom
- Gesture interactions
- Virtual keyboard

### Test F-10: Error Handling and Edge Cases
**Priority**: 🟡 High
**Objective**: Validate system robustness

**Prerequisites**:
- Active search system
- Simmulatable error scenarios

**Steps**:
1. Test with an unstable connection
2. Simulate a loading failure
3. Test search with special characters
4. Check for search timeout
5. Test with an empty database
6. Simulate a synchronization error
7. Check for error recovery

**Expected Result**:
- Clear error messages
- Graceful recovery
- Functional fallbacks
- Automatic retry when appropriate
- Stable interface even with errors

**Edge Cases**:
- Completely offline network
- Data corruption
- Request timeouts
- Data parsing error
- Complete system failure

## 🐛 Known Bugs and Limitations

### Known Bugs
- Search occasionally does not clear results when changing filters
- Barcode scanner may fail in low light conditions
- Favorites may not synchronize immediately between tabs

### Limitations
- Database limited to Brazilian products
- No validation of nutritional data
- Lack of integration with external food APIs
- No user contribution system

## 📊 Quality Metrics

### Acceptance Criteria
- **Performance**: Search < 300ms
- **Accuracy**: Relevant and correct results
- **Usability**: Intuitive and responsive interface
- **Reliability**: Accurate nutritional data

### Priority Regression Tests
1. F-01, F-07 (core functionalities)
2. F-02, F-05 (critical data)
3. F-06 (performance)
4. F-10 (robustness)

## 🔄 Updates

**Last updated**: 2025-01-09
**Tested version**: v0.12.0-dev
**Next improvements**: External food API, user contributions, better synchronization
