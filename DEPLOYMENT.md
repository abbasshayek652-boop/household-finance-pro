# Deployment Guide - Household Finance Pro

## Quick Start (5 Minutes)

### Step 1: Create Google Apps Script Project
1. Go to [script.google.com](https://script.google.com)
2. Click **+ New project**
3. Name it: `Household Finance Pro`

### Step 2: Copy Source Files
1. In the left sidebar, you should see `Code.gs` (default file)
2. Replace `Code.gs` with the contents from this project's `Code.gs`
3. Add new files by clicking **+ File → Script**:
   - Create: `Config.gs`, `Database.gs`, `Finance.gs`, `Rental.gs`, `Reports.gs`, `Utils.gs`, `Validation.gs`, `Audit.gs`, `Tests.gs`
   - Paste contents of each file into corresponding Apps Script file

### Step 3: Add HTML Frontend
1. In the left sidebar, click **+ File → HTML**
2. Name it: `Index` (exactly)
3. Replace all content with `Index.html` from this project

### Step 4: Update Manifest
1. In the left sidebar, click the gear icon ⚙️
2. Click **Project settings**
3. Check **Show "appsscript.json" manifest file in editor**
4. Open the `appsscript.json` file that appears
5. Replace with contents from this project's `appsscript.json`

### Step 5: Initialize Database
1. In the editor, find the function dropdown (top center)
2. Select `initializeApp`
3. Click the **▶ Run** button
4. Click **Review permissions** if prompted
5. Click your account
6. Click **Allow**

Wait for "Execution completed successfully" message.

### Step 6: Deploy as Web App
1. Click **Deploy → New deployment** (top right)
2. Click the gear icon, select **Web app**
3. Fill in:
   - **Execute as**: Your email/account
   - **Who has access**: Anyone (or restrict to your organization)
4. Click **Deploy**
5. Copy the deployment URL (the long link starting with `https://script.google.com/...`)
6. **Keep this URL safe** - it's your application URL

### Step 7: Open Application
1. Open the deployment URL in a browser
2. Click **Allow** if prompted for permissions
3. Application loads with empty data
4. Go to **Accounts** and **Categories** to set up base data
5. Start entering transactions

---

## Detailed Setup Instructions

### Creating Source Files

Each `.gs` file should be created as a new Script file in your Apps Script project:

**File → Create Script File → [Name]**

Files to create (in any order):
1. `Config.gs` - Configuration and constants
2. `Database.gs` - Database operations
3. `Finance.gs` - Financial CRUD and calculations
4. `Rental.gs` - Rental operations
5. `Reports.gs` - Report generation
6. `Utils.gs` - Utility functions
7. `Validation.gs` - Validation logic
8. `Audit.gs` - Audit logging
9. `Tests.gs` - Test suite

Replace the default `Code.gs` with the main entry point file.

### Permissions Required

The script requests these permissions:
- **View and manage your spreadsheets** - Required for all data operations
- **View your Google Drive files** - Required to access spreadsheet
- **Send emails** - Not used currently (safe to allow)
- **See your basic profile info** - Not used currently (safe to allow)

These are minimal and necessary for the application to function.

### Google Sheet Structure

After running `initializeApp()`, your linked spreadsheet will have these sheets:
- **Accounts** - Bank accounts and financial accounts
- **Categories** - Income, expense, and savings categories
- **Transactions** - All financial transactions
- **Budgets** - Monthly budgets by category
- **SavingsGoals** - Savings goals with targets
- **Recurring** - Recurring transactions (monthly bills, etc.)
- **Properties** - Rental properties
- **Rooms** - Rental rooms
- **Bookings** - Guest bookings
- **AuditLog** - All changes to the system
- **Meta** - Configuration metadata

**Do NOT manually delete these sheets.** If you need to reset:
1. Delete all rows from all sheets (keep headers)
2. Run `initializeApp()` again

---

## Database Initialization

### First Time Setup

Run `initializeApp()` from the Apps Script editor:

```
1. Go to script.google.com
2. Open your project
3. Click the function dropdown (top center)
4. Select "initializeApp"
5. Click the ▶ Run button
6. Wait for "Execution completed successfully"
```

This will:
- Create all required sheets
- Add column headers
- Initialize metadata
- Create an audit log entry

### Resetting the Database

To reset all data but keep the structure:

```javascript
// In Apps Script editor console:
// 1. Remove all data rows (keep headers)
// 2. Run:
setupDatabase_()
```

To completely remove the application:
1. Go to Google Drive
2. Find the linked Spreadsheet
3. Delete it
4. Deploy a new version of the Apps Script

---

## Running Tests

To verify everything is working:

1. Go to the Apps Script editor
2. Click the function dropdown (top center)
3. Select `runAllTests`
4. Click the **▶ Run** button
5. Watch the execution log at the bottom

Output will show:
- ✓ for passing tests
- ❌ for failing tests

**Critical Test**: "Testing Rental Separation from Household Finance"
- This verifies that bookings don't affect household finances
- Must pass for application integrity

---

## Troubleshooting Deployment

### Issue: "Execution failed" when running initializeApp()

**Solution:**
1. Check that you're logged into the correct Google Account
2. Verify the script has access to your Google Drive
3. Check if a spreadsheet was created in your Drive
4. If not, manually create a Google Sheet and link it:
   - In Apps Script: **Project settings → Add resource → Google Sheet**
   - Select your newly created sheet
   - Try running `initializeApp()` again

### Issue: Application URL doesn't work

**Solution:**
1. Make sure deployment is set to "Web app"
2. Verify "Execute as" is your account
3. Verify "Who has access" includes your account
4. Try creating a new deployment:
   - Click **Deploy → New deployment**
   - Select Web app again
   - Get new URL

### Issue: "404 Not Found" when opening URL

**Solution:**
1. Copy the exact URL from the deployment
2. Add `/usercodeappsproxy` to the end if needed
3. Check that the deployment is still active
4. Create a new deployment if necessary

### Issue: Permission denied errors

**Solution:**
1. Go back to the Apps Script editor
2. Click **Review permissions**
3. Select your Google Account
4. Click **Allow**
5. Try the application URL again

### Issue: Data not appearing in application

**Solution:**
1. Check that `initializeApp()` completed successfully
2. Go to Google Drive and find the linked Spreadsheet
3. Verify all sheets exist with headers
4. Try manually adding data to a sheet
5. Refresh the application URL in browser

### Issue: "Cannot read property 'getValues'" errors

**Solution:**
1. This means sheets weren't created properly
2. Run `setupDatabase_()` again from the editor
3. Check Google Drive for the spreadsheet
4. Verify sheets have headers

---

## Performance Optimization

### Initial Load Times
- First load: 2-3 seconds (data caching)
- Subsequent loads: <1 second
- Dashboard renders instantly from cache

### Reducing Load Times
1. **Archive old data** - Don't permanently delete, archive instead
2. **Limit transactions** - Keep active transactions < 1000 rows
3. **Clear filters** - Reload with no filters selected
4. **Restart browser** - Clear browser cache periodically

### Server-Side Optimization
- Writes use batch operations (faster than row-by-row)
- Reads cache for 5 minutes
- Locks prevent concurrent conflicts
- Minimal formula evaluation

---

## Upgrading the Application

### From Older Versions

If upgrading from a previous version:

1. **Backup current data:**
   - Download current Google Sheet as CSV
   - Store backup safely

2. **Update source files:**
   - Copy new versions into Apps Script
   - Make sure all new files are added

3. **Run setup:**
   ```javascript
   setupDatabase_()
   ```

4. **Test thoroughly:**
   ```javascript
   runAllTests()
   ```

5. **Create new deployment:**
   - Don't update old deployment
   - Create brand new Web app deployment

### Database Migration

If schema changes between versions:

1. Backup current data
2. Export sheets as CSV
3. Clear all sheets
4. Run `setupDatabase_()`
5. Manually re-import data if needed

---

## Security Considerations

### Data Access
- All data stored in **your** Google Drive
- Only accessible with your Google Account
- Script runs under your account permissions
- No third-party access to data

### Sharing the Application
To share with others:

1. Create a new Google Account for the shared instance
2. Deploy Apps Script under that account
3. Share the deployment URL
4. They'll see their own data in their own Google Sheet

**Note:** Apps Script doesn't support multi-user access within one application. Each user needs their own instance.

### Backing Up Data

1. Go to Google Drive
2. Find the linked Spreadsheet
3. Download as Excel/CSV
4. Store backup files safely
5. Back up regularly (weekly recommended)

---

## Maintenance Tasks

### Weekly
- Check Audit Log for unexpected changes
- Verify dashboard calculations
- Archive old completed bookings

### Monthly
- Review and adjust budgets
- Update exchange rates if using multiple currencies
- Archive closed rental bookings
- Back up data

### Quarterly
- Run full test suite
- Review all accounts for accuracy
- Archive inactive properties/rooms
- Optimize database size

---

## Getting Help

### Check Logs
1. Open Apps Script editor
2. Click **Execution log** (bottom)
3. Look for error messages
4. Copy error text

### Test Individual Functions
```javascript
// In Apps Script console, test specific functions:
getFinancialState_()  // Get current state
getAuditLog_(10)      // View recent changes
getSheet_('Accounts') // Check specific sheet
```

### Verify Data Integrity
```javascript
runAllTests()  // Run full test suite
```

### Check Database
1. Go to Google Drive
2. Open the linked Spreadsheet
3. Review data in each sheet
4. Check for missing headers

---

## Advanced Customization

### Changing Base Currency
```javascript
setBaseCurrency_('USD')  // Change from EUR to USD
```

### Setting Exchange Rates
```javascript
setExchangeRate_('USD', 1.10)  // 1 EUR = 1.10 USD
setExchangeRate_('LBP', 89500) // 1 EUR = 89,500 LBP
```

### Modifying Account Types
Edit `CONFIG.ACCOUNT_TYPES` in `Config.gs`

### Changing Category Types
Edit `CONFIG.CATEGORY_TYPES` in `Config.gs`

### Adjusting Cache Times
Edit `CONFIG.CACHE` in `Config.gs`

---

## Support & Troubleshooting Checklist

Before reporting issues:

- [ ] Ran `initializeApp()` successfully
- [ ] Ran `runAllTests()` with all passing
- [ ] Checked Google Drive for linked Spreadsheet
- [ ] Verified all sheets exist with headers
- [ ] Cleared browser cache and refreshed
- [ ] Created new deployment URL
- [ ] Checked Audit Log for errors
- [ ] Tried adding test data manually
- [ ] Reviewed Apps Script execution log

---

## Version Information

**Current Version:** 1.0.0  
**Runtime:** Google Apps Script V8  
**Database:** Google Sheets  
**Frontend:** HTML5 + Vanilla JavaScript  
**Last Updated:** 2026-09-25

---

**For detailed documentation, see README.md**
