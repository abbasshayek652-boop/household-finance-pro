# GETTING STARTED - Quick Reference

## ⚡ 5-Minute Quick Start

### What You Just Got
A complete, production-ready personal finance + rental management web application built on Google Apps Script.

### Files You Have
```
Code.gs                 - Main entry point
Config.gs               - Constants & configuration
Database.gs             - Database operations
Finance.gs              - Financial operations (accounts, categories, transactions, budgets, etc.)
Rental.gs               - Rental operations (properties, rooms, bookings) - COMPLETELY SEPARATE
Reports.gs              - Financial reports and analysis
Utils.gs                - Helper functions
Validation.gs           - Input validation
Audit.gs                - Change tracking
Tests.gs                - Test suite
Index.html              - Web interface
appsscript.json         - Manifest
```

### Step 1: Create Google Apps Script Project
1. Go to https://script.google.com
2. Click "New project"
3. Name it "Household Finance Pro"

### Step 2: Add Files
1. Copy each `.gs` file into the editor
2. Click "+ File → Script" for each new file
3. Replace `Code.gs` with the provided Code.gs

### Step 3: Add HTML
1. Click "+ File → HTML"
2. Name it exactly: `Index`
3. Paste entire Index.html content

### Step 4: Update Manifest
1. Click ⚙️ icon → Project settings
2. Enable "Show appsscript.json manifest file in editor"
3. Replace manifest with provided appsscript.json

### Step 5: Initialize Database
1. Function dropdown (top center) → Select `initializeApp`
2. Click ▶️ Run
3. Authorize when prompted
4. Wait for "Execution completed successfully"

### Step 6: Deploy
1. Click Deploy → New deployment
2. Type: Web app
3. Execute as: Your email
4. Access: Anyone
5. Click Deploy
6. Copy URL and open in browser

### Step 7: Use It!
- Application loads
- Go to **Accounts** and **Categories** to set up
- Start adding transactions
- View in Dashboard and Ledger

---

## 🎯 Core Concepts

### Household Finance Module
- **Dashboard**: Real-time financial overview
- **Ledger**: All transactions with filtering
- **Accounts**: Bank accounts, savings, investments
- **Categories**: Organize by income/expense/savings
- **Transactions**: Record money movement
- **Budgets**: Track spending limits
- **Savings Goals**: Track financial targets
- **Recurring**: Automate regular transactions
- **Reports**: Analysis and insights

### Rental Module (COMPLETELY SEPARATE)
- **Properties**: Manage rental properties
- **Rooms**: Define rooms in properties
- **Bookings**: Record guest stays
- **Key Point**: Booking amount is ONLY tracked for occupancy
  - Does NOT create household income transaction
  - Does NOT affect household financial calculations
  - Rental metrics separate from household metrics

### Example: Rental Separation
```
You receive €5,000 from a guest booking.

❌ WRONG: This is NOT automatically recorded as household income
✓ CORRECT: You record it manually as a household transaction IF you want

If you DON'T record it manually:
- Household finances: unchanged
- Rental summary: €5,000 recorded
- Dashboard income: €0 (from this booking)
```

---

## 📊 Data Flow

### Adding a Transaction
```
User Input (Form)
    ↓
Client Validation (Index.html)
    ↓
Server API Call (Code.gs)
    ↓
Server Validation (Validation.gs)
    ↓
Database Write (Database.gs)
    ↓
Audit Log Entry (Audit.gs)
    ↓
Cache Invalidation
    ↓
Client State Update
    ↓
UI Re-renders
```

### Adding a Rental Booking
```
User Input (Form)
    ↓
Client Validation (Index.html)
    ↓
Server API Call (Code.gs)
    ↓
Server Validation (Validation.gs)
    ↓
Booking Database Write
    ↓
Audit Log Entry (Audit.gs)
    ↓
Cache Invalidation (Rental Cache ONLY)
    ↓
Financial Cache: UNCHANGED
    ↓
Client State Update
    ↓
UI Re-renders
```

---

## 🔍 Key Files Explained

### Config.gs
Contains all constants:
- Sheet names
- Column headers
- Supported types (currencies, account types, etc.)
- Cache settings
- Default values

**Modify this to:**
- Add new currency
- Add new account type
- Change cache duration
- Add new category type

### Database.gs
Handles all spreadsheet operations:
- Reading sheets
- Writing data
- Creating/updating/deleting records
- Database snapshots
- Caching

**Don't modify this** unless you know what you're doing.

### Finance.gs
Business logic for household finances:
- Account CRUD (Create, Read, Update, Archive, Delete)
- Category management
- Transaction recording
- Budget management
- Savings goal tracking
- Recurring transaction handling
- Financial calculations

**Extend this to:**
- Add new calculation types
- Add new validations
- Add new reports

### Rental.gs
Business logic for rental management:
- Property CRUD
- Room management
- Booking management
- **IMPORTANT: Does NOT create household transactions**
- **IMPORTANT: Separate calculations from Finance.gs**

**DO NOT modify this to add booking → transaction links**

### Reports.gs
Financial analysis and reporting:
- Budget analysis
- Monthly cash flow
- Expense breakdown
- Income sources
- Net worth calculation
- Savings progress

**Extend this to:**
- Add new report types
- Add new charts/visualizations
- Add export formats

### Tests.gs
Comprehensive test suite:
- Database setup verification
- CRUD operation tests
- Calculation verification
- **Critical test**: Rental separation
- Validation tests

**Run before any changes to verify nothing broke**

### Index.html
The web interface:
- Sidebar navigation
- Dashboard view
- Ledger view
- Forms for adding data
- Modal dialogs
- Real-time state management

**Customize to:**
- Change colors/branding
- Add new sections
- Modify form layouts
- Add new visualizations

---

## 🚀 First Tasks

### 1. Set Up Base Data (10 minutes)
1. Go to **Accounts** section
2. Add your accounts:
   - Checking account
   - Savings account
   - Credit card (as liability)
   - Any others you track
3. Go to **Categories** section
4. Add your categories:
   - Income: Salary, Investment Returns, etc.
   - Expenses: Groceries, Utilities, Transport, etc.
   - Savings: Emergency Fund, Investments, etc.

### 2. Record Starting Balance (5 minutes)
1. Go to **Ledger**
2. For each account, add a transaction:
   - Type: Income
   - Entity: "Opening Balance"
   - Category: Choose appropriate
   - Amount: Your current balance
   - Date: Today or account start date

### 3. Add Recent Transactions (10 minutes)
1. Gather last month of transactions
2. Add to ledger:
   - Paychecks (Income)
   - Expenses (Groceries, Gas, Bills, etc.)
   - Transfers between accounts (Special handling)

### 4. Set Up Budgets (5 minutes)
1. Go to **Planning**
2. Add budgets for each expense category
3. Enter amounts for current month
4. View progress as you add expenses

### 5. Test Rental Module (Optional - 5 minutes)
1. Go to **Rental → Properties**
2. Add a test property
3. Go to **Rooms** → Add a test room
4. Go to **Bookings** → Add a test booking
5. Verify dashboard unchanged

---

## 🧪 Verification Checklist

After deployment:
- [ ] Application URL opens without errors
- [ ] Can navigate between sections
- [ ] Can add a test account
- [ ] Can add a test category
- [ ] Can add a test transaction
- [ ] Transaction appears in ledger
- [ ] Dashboard updates
- [ ] Can view audit log
- [ ] Run `runAllTests()` - all pass

---

## 💡 Pro Tips

### Performance
- Archive old data (don't delete)
- Keep active transactions < 1000 rows
- Clear all filters before heavy operations
- Restart app if slow

### Accuracy
- Always double-check amounts
- Use consistent entity names
- Review transactions weekly
- Check Audit Log monthly

### Organization
- Create consistent naming conventions
- Use parent categories for similar items
- Archive completed goals and properties
- Keep exchange rates updated

### Backups
- Download spreadsheet as CSV monthly
- Export key reports quarterly
- Keep 3 months of backups
- Test restore procedure once

---

## ⚠️ Important Notes

### Rental & Finance Separation
The rental module is **completely separate** from household finances:
- Booking amounts do NOT create household income
- Rental occupancy does NOT affect budgets
- Room rates are informational only
- To include rental income in finances, manually add a household transaction

This separation is **intentional and enforced** to prevent mixing concerns.

### Data Deletion
- Deleting records is permanent (but can be undone via backup)
- Archive instead of delete to keep history
- Check Audit Log before deleting
- The system prevents deletion if references exist

### Multi-User Access
- Each user needs their own Apps Script deployment
- Each gets their own Google Sheet
- Share URLs and data separately
- No built-in multi-user support (by design)

### Currencies
- All calculations done in base currency (default EUR)
- Exchange rates must be manually set
- No automatic rate updates
- System won't silently convert - warns if rate missing

---

## 🐛 Troubleshooting Quick Guide

### "Application won't load"
1. Check deployment URL is correct
2. Try creating new deployment
3. Check browser console for errors
4. Verify permissions granted

### "Sheet not found" error
1. Run `setupDatabase_()` in Apps Script
2. Check Google Drive for linked spreadsheet
3. Verify all sheets exist
4. Create new deployment if needed

### "Tests failing"
1. Run `setupDatabase_()` to recreate sheets
2. Clear all data from sheets (keep headers)
3. Run tests again
4. If "Rental Separation" fails, contact support

### "Calculations wrong"
1. Check Audit Log for unexpected changes
2. Verify no hidden rows in sheets
3. Check all transactions have amounts
4. Manually verify math on paper

### "Very slow performance"
1. Archive old transactions
2. Delete old completed bookings
3. Clear all filters and refresh
4. Check if > 1000 active transactions

---

## 📚 Documentation Map

| Document | Purpose | Read When |
|----------|---------|-----------|
| README.md | Feature guide and API | Learning the system |
| DEPLOYMENT.md | Setup and troubleshooting | Deploying or fixing issues |
| PROJECT_SUMMARY.md | Complete project overview | Understanding scope |
| GETTING_STARTED.md (this) | Quick reference | Day-to-day use |

---

## 🎓 Learning Path

### Day 1: Setup & Basic Use
1. Deploy application (30 min)
2. Add your accounts (10 min)
3. Add your categories (10 min)
4. Add opening balances (10 min)
5. Add current month transactions (20 min)
6. Total: ~1.5 hours

### Week 1: Establish Routine
1. Add daily transactions (2 min/day)
2. Review Dashboard weekly
3. Check Ledger weekly
4. Understand budget tracking

### Month 1: Optimize
1. Review Audit Log
2. Adjust budgets based on actuals
3. Archive old data
4. Set up savings goals
5. Review reports

### Ongoing: Maintain
1. Add transactions weekly
2. Review dashboard monthly
3. Back up data monthly
4. Update exchange rates as needed
5. Archive completed items

---

## 🔗 Useful Links

- **Google Apps Script Editor**: https://script.google.com
- **Google Sheets**: https://sheets.google.com
- **Google Drive**: https://drive.google.com
- **Apps Script Documentation**: https://developers.google.com/apps-script

---

## ✅ You're Ready!

You now have everything needed to:
- ✅ Track household finances
- ✅ Manage budgets
- ✅ Track rental bookings
- ✅ Generate financial reports
- ✅ Maintain an audit trail
- ✅ Share with your team

**Next Step**: Open Google Apps Script and deploy!

---

**Need Help?**
1. Check README.md for feature questions
2. Check DEPLOYMENT.md for setup issues
3. Run `runAllTests()` to verify integrity
4. Check Audit Log for what changed

**Happy budgeting! 💰**

---

*Household Finance Pro v1.0.0*  
*Production Ready - Launch Today*
