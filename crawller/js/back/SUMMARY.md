# 🏠 Divar Property Crawler - Summary

## 📋 Overview

کراولر هوشمند برای استخراج آگهی‌های املاک از دیوار که قابلیت کراول کردن آگهی‌های فروش و اجاره برای شهرهای تهران و کرج را دارد.

## 🎯 Key Features

### ✅ Core Functionality
- **Multi-City Support**: تهران و کرج
- **Multi-Type Support**: فروش و اجاره
- **Comprehensive Data Extraction**: تمام جزئیات آگهی‌ها
- **Image Links**: لینک‌های تصاویر
- **Location Data**: اطلاعات مکانی
- **Price Information**: اطلاعات قیمت (قیمت کل، قیمت هر متر، ودیعه، اجاره)

### ✅ Technical Features
- **Error Handling**: مدیریت خطا و retry
- **Rate Limiting**: تاخیر بین درخواست‌ها
- **Configurable**: تنظیمات قابل تغییر
- **Logging**: لاگ‌گیری کامل
- **Modular Design**: طراحی ماژولار

## 📁 File Structure

```
crawller/js/back/
├── divar_crawler.js          # Main crawler script
├── config.js                 # Configuration file
├── test_crawler.js          # Test script
├── run_crawler.sh           # Shell script runner
├── package.json             # Dependencies
├── README.md                # Documentation
├── SUMMARY.md               # This file
└── output/                  # Output directory (created automatically)
    ├── tehran_sale_*.json
    ├── tehran_rent_*.json
    ├── karaj_sale_*.json
    ├── karaj_rent_*.json
    ├── divar_combined_*.json
    └── summary_*.json
```

## 🚀 Usage

### Quick Start
```bash
# Navigate to crawler directory
cd crawller/js/back

# Install dependencies
npm install

# Run crawler
node divar_crawler.js

# Or use the shell script
./run_crawler.sh
```

### Configuration
Edit `config.js` to customize:
- Number of ads per type
- Delays between requests
- Browser settings
- Output options

## 📊 Data Structure

### Sale Ad Structure
```json
{
    "title": "عنوان آگهی",
    "metraj": "متراژ",
    "salSakht": "سال ساخت",
    "otagh": "تعداد اتاق",
    "gheymatKol": "قیمت کل",
    "gheymatHarMetr": "قیمت هر متر",
    "tabaghe": "طبقه",
    "parking": "پارکینگ",
    "asansor": "آسانسور",
    "anbari": "انباری",
    "tozihat": "توضیحات",
    "location": "موقعیت",
    "imageLinks": ["لینک تصاویر"],
    "city": "شهر",
    "adType": "نوع آگهی",
    "url": "لینک آگهی",
    "scrapedAt": "تاریخ استخراج"
}
```

### Rent Ad Structure
```json
{
    "title": "عنوان آگهی",
    "metraj": "متراژ",
    "salSakht": "سال ساخت",
    "otagh": "تعداد اتاق",
    "vadie": "ودیعه",
    "ejare": "اجاره ماهانه",
    "tabaghe": "طبقه",
    "parking": "پارکینگ",
    "asansor": "آسانسور",
    "anbari": "انباری",
    "tozihat": "توضیحات",
    "location": "موقعیت",
    "imageLinks": ["لینک تصاویر"],
    "city": "شهر",
    "adType": "نوع آگهی",
    "url": "لینک آگهی",
    "scrapedAt": "تاریخ استخراج"
}
```

## 🔧 Technical Details

### Dependencies
- **puppeteer**: Web scraping and browser automation
- **fs**: File system operations
- **path**: Path utilities

### Browser Configuration
- **Headless Mode**: Configurable (default: false)
- **User Agent**: Modern Chrome user agent
- **Viewport**: 1920x1080
- **Arguments**: Security and performance optimizations

### Error Handling
- **Timeout Management**: Configurable timeouts for different operations
- **Retry Logic**: Automatic retry for failed requests
- **Graceful Degradation**: Continue processing even if some ads fail

### Performance Optimizations
- **Parallel Processing**: Multiple browser tabs for ad details
- **Memory Management**: Proper cleanup of browser resources
- **Rate Limiting**: Configurable delays to avoid being blocked

## 📈 Output Files

### Individual Files
- `tehran_sale_[timestamp].json`: آگهی‌های فروش تهران
- `tehran_rent_[timestamp].json`: آگهی‌های اجاره تهران
- `karaj_sale_[timestamp].json`: آگهی‌های فروش کرج
- `karaj_rent_[timestamp].json`: آگهی‌های اجاره کرج

### Combined Files
- `divar_combined_[timestamp].json`: تمام نتایج
- `summary_[timestamp].json`: خلاصه آماری

## 🎨 User Experience

### Console Output
```
🎯 شروع کراولر دیوار برای تهران و کرج...
📅 تاریخ شروع: ۱۴۰۲/۱۰/۱۵ ۱۲:۰۰:۰۰

🏙️ شروع کراول تهران...
📋 در حال پردازش فروش...
🔍 در حال دریافت لینک‌های تهران - فروش...
✅ ۴۵ لینک دریافت شد

🔍 پردازش آگهی ۱/۴۵: فروش آپارتمان ۸۰ متری
✅ آگهی ۱ پردازش شد

✅ ۴۵ آگهی فروش برای تهران پردازش شد
```

### Progress Tracking
- Real-time progress updates
- Error reporting
- Success confirmation
- Timing information

## 🔒 Security & Ethics

### Best Practices
- **Respectful Crawling**: Appropriate delays between requests
- **User Agent**: Proper user agent identification
- **Error Handling**: Graceful error handling
- **Resource Management**: Proper cleanup of resources

### Legal Considerations
- **Terms of Service**: Respect website terms of service
- **Rate Limiting**: Avoid overwhelming the server
- **Data Usage**: Use data responsibly and legally
- **Attribution**: Proper attribution when using data

## 🚀 Future Enhancements

### Potential Improvements
- **More Cities**: Support for additional cities
- **More Ad Types**: Support for land, commercial properties
- **Database Integration**: Direct database storage
- **API Development**: REST API for data access
- **Web Interface**: Web-based management interface
- **Scheduling**: Automated scheduling of crawls
- **Notifications**: Email/SMS notifications
- **Analytics**: Advanced analytics and reporting

### Technical Improvements
- **Performance**: Optimize for speed and efficiency
- **Reliability**: Improve error handling and recovery
- **Scalability**: Support for distributed crawling
- **Monitoring**: Advanced monitoring and alerting
- **Testing**: Comprehensive test coverage

## 📞 Support

### Documentation
- **README.md**: Comprehensive documentation
- **Code Comments**: Inline code documentation
- **Examples**: Usage examples and samples

### Troubleshooting
- **Common Issues**: Known issues and solutions
- **Debug Mode**: Debug logging and diagnostics
- **Test Script**: Automated testing functionality

---

**🎯 این کراولر برای استخراج آگهی‌های املاک از دیوار طراحی شده و قابلیت کراول کردن آگهی‌های فروش و اجاره برای شهرهای تهران و کرج را دارد.** 