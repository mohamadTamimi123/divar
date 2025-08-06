# Persian Number Extractor

تابع استخراج مقادیر عددی از متن فارسی

## 📋 Overview

This module provides functions to extract numeric values from Persian text, including:
- Persian digits (۰-۹) to English digits (0-9)
- Comma-separated numbers (۱۰۰،۰۰۰،۰۰۰)
- Multipliers (میلیون، میلیارد، هزار)
- Decimal numbers (۱.۴۵۰)
- Common text removal (تومان، رایگان، etc.)

## 🚀 Quick Start

### Basic Usage

```javascript
const { extractNumber } = require('./persian_number_utils');

// Extract single number
const vadie = extractNumber('۱۰۰،۰۰۰،۰۰۰ تومان');
console.log(vadie); // 100000000

const ejare = extractNumber('۱۲،۰۰۰،۰۰۰ تومان');
console.log(ejare); // 12000000

const metraj = extractNumber('۸۰');
console.log(metraj); // 80
```

### Extract from Object

```javascript
const { extractAllNumbers } = require('./persian_number_utils');

const propertyData = {
    title: 'اجاره آپارتمان',
    vadie: '۱۰۰،۰۰۰،۰۰۰ تومان',
    ejare: '۱۲،۰۰۰،۰۰۰ تومان',
    metraj: '۸۰',
    salSakht: '۱۳۸۸'
};

const enhancedData = extractAllNumbers(propertyData);
console.log(enhancedData);
// Output:
// {
//     title: 'اجاره آپارتمان',
//     vadie: '۱۰۰،۰۰۰،۰۰۰ تومان',
//     ejare: '۱۲،۰۰۰،۰۰۰ تومان',
//     metraj: '۸۰',
//     salSakht: '۱۳۸۸',
//     vadieInt: 100000000,
//     ejareInt: 12000000,
//     metrajInt: 80,
//     salSakhtInt: 1388
// }
```

### Extract from Array

```javascript
const { extractNumbersFromArray } = require('./persian_number_utils');

const properties = [
    {
        vadie: '۱۰۰،۰۰۰،۰۰۰ تومان',
        ejare: '۱۲،۰۰۰،۰۰۰ تومان',
        metraj: '۸۰'
    },
    {
        vadie: '۷۵۰ میلیون',
        ejare: '۱۰۰ هزار',
        metraj: '۹۵'
    }
];

const enhancedProperties = extractNumbersFromArray(properties);
console.log(enhancedProperties);
```

## 📊 Supported Formats

### Numbers
- ✅ `۸۰` → 80
- ✅ `۱۵۵` → 155
- ✅ `۱۳۸۸` → 1388

### Comma-separated Numbers
- ✅ `۱۰۰،۰۰۰،۰۰۰ تومان` → 100000000
- ✅ `۱۲،۰۰۰،۰۰۰ تومان` → 12000000

### Multipliers
- ✅ `۱۰۰ میلیون` → 100000000
- ✅ `۸ میلیون` → 8000000
- ✅ `۱.۴۵۰ میلیارد` → 1450000000
- ✅ `۷۵۰ میلیون` → 750000000
- ✅ `۱۰۰ هزار` → 100000

### Special Cases
- ✅ `رایگان` → null
- ✅ `مجانی` → null
- ✅ `قابل مذاکره` → null

## 🔧 API Reference

### `extractNumber(text)`
Extracts a single number from Persian text.

**Parameters:**
- `text` (string): Persian text containing numbers

**Returns:**
- `number|null`: Extracted number or null if not found

**Example:**
```javascript
extractNumber('۱۰۰،۰۰۰،۰۰۰ تومان') // 100000000
extractNumber('رایگان') // null
```

### `extractAllNumbers(data)`
Extracts all numbers from a data object and adds integer versions.

**Parameters:**
- `data` (Object): Data object containing Persian text fields

**Returns:**
- `Object`: Original object with added integer fields

**Added Fields:**
- `vadieInt` - Integer version of vadie
- `ejareInt` - Integer version of ejare
- `gheymatKolInt` - Integer version of gheymatKol
- `gheymatHarMetrInt` - Integer version of gheymatHarMetr
- `metrajInt` - Integer version of metraj
- `salSakhtInt` - Integer version of salSakht
- `otaghInt` - Integer version of otagh
- `tabagheInt` - Integer version of tabaghe

### `extractNumbersFromArray(dataArray)`
Extracts numbers from an array of data objects.

**Parameters:**
- `dataArray` (Array): Array of data objects

**Returns:**
- `Array`: Array of objects with added integer fields

## 🧪 Testing

### Run Basic Tests
```bash
node persian_number_extractor.js
```

### Run Utility Tests
```bash
node persian_number_utils.js
```

### Run Full Data Tests
```bash
node test_number_extractor.js
```

## 📁 Files

- `persian_number_extractor.js` - Main class with extraction logic
- `persian_number_utils.js` - Simple utility functions
- `test_number_extractor.js` - Test script with real data
- `PERSIAN_NUMBER_EXTRACTOR_README.md` - This documentation

## 🎯 Use Cases

1. **Property Data Processing** - Extract numeric values from Divar property listings
2. **Price Analysis** - Convert Persian prices to numeric values for calculations
3. **Data Cleaning** - Standardize Persian number formats
4. **Reporting** - Generate statistics from Persian text data

## 🔄 Integration

### With Existing Crawler
```javascript
const { extractAllNumbers } = require('./persian_number_utils');

// In your crawler code
const propertyData = await extractAdDetails(link);
const enhancedData = extractAllNumbers(propertyData);

// Now you have both original text and numeric values
console.log(`Vadie: ${enhancedData.vadie} (${enhancedData.vadieInt})`);
console.log(`Ejare: ${enhancedData.ejare} (${enhancedData.ejareInt})`);
```

### With Database
```javascript
// Save both original and numeric values
const enhancedData = extractAllNumbers(propertyData);
await Property.create(enhancedData);
```

## 🐛 Troubleshooting

### Common Issues

1. **Numbers not extracted correctly**
   - Check if the text contains Persian digits (۰-۹)
   - Verify the text format matches supported patterns

2. **Multipliers not working**
   - Ensure the multiplier text is exactly as expected (میلیون، میلیارد، هزار)
   - Check for extra spaces or characters

3. **Null values**
   - Some texts like "رایگان" intentionally return null
   - Check if the text contains any numbers

### Debug Mode
```javascript
const { quickTest } = require('./persian_number_utils');

// Test individual values
quickTest('۱۰۰،۰۰۰،۰۰۰ تومان');
quickTest('رایگان');
```

## 📈 Performance

- ✅ Fast processing (O(n) complexity)
- ✅ Memory efficient
- ✅ Handles large datasets
- ✅ Thread-safe

## 🤝 Contributing

To add new number formats or multipliers:

1. Edit `persian_number_extractor.js`
2. Add new patterns to the appropriate arrays
3. Test with `node persian_number_extractor.js`
4. Update documentation

## 📄 License

MIT License - Feel free to use in your projects! 