# One Single View - Quick Start & Testing Guide

## 🚀 Quick 5-Minute Setup

### Step 1: Install Dependencies (if not already done)
```bash
cd /Users/apple/OneSingleView
npm install
```

### Step 2: Set Up Firebase

**Option A: Use Test/Demo Firebase Project**
```bash
# Copy example env file
cp .env.example .env.local

# Edit .env.local and add your Firebase credentials
# Get these from: https://console.firebase.google.com/ > Project Settings
```

**Option B: Quick Firebase Setup**
1. Go to https://console.firebase.google.com/
2. Click "Add project" → Enter "onesingleview-test" → Continue
3. Disable Google Analytics (optional) → Create project
4. Enable Email/Password Authentication:
   - Build → Authentication → Get Started
   - Sign-in method → Email/Password → Enable → Save
5. Create Firestore Database:
   - Build → Firestore Database → Create database
   - Start in production mode → Next → Choose location → Enable
6. Enable Storage:
   - Build → Storage → Get Started → Start in production mode
7. Get your config:
   - Project Settings (gear icon) → General
   - Scroll to "Your apps" → Click Web (`</>` icon)
   - Register app with name "onesingleview"
   - Copy the firebaseConfig object

8. Add to `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=onesingleview-test.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=onesingleview-test
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=onesingleview-test.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Step 3: Start Development Server
```bash
npm run dev
```

Open http://localhost:3000 🎉

---

## 🧪 Testing User Flows

### Test Flow 1: Individual User Signup → Dashboard
1. **Navigate to Landing Page**
   - Go to http://localhost:3000
   - Verify: Hero section, benefits, client logos, footer

2. **Sign Up as Individual**
   - Click "Get Started" or "Sign Up"
   - Select "Individual"
   - Fill in:
     - Name: "John Doe"
     - Email: "john@test.com"
     - Mobile: "+91 9876543210"
     - Password: "test123"
   - Click "Create Account"

3. **View Dashboard**
   - Verify: Greeting message with user name
   - Check: 3 summary cards (should show 0 policies initially)
   - Check: Portfolio pie chart (should show "No data" message)
   - Check: Expiry alerts (should show green "All up to date")
   - Check: Quick actions section with 5 buttons

4. **Navigate Sidebar**
   - Click each menu item:
     - Dashboard ✓
     - Motor Policies
     - GMC Policies
     - Commercial
     - History
     - Documents
     - Referrals
     - Claims

5. **Sign Out**
   - Click "Sign out" in header
   - Verify: Redirected to login page

### Test Flow 2: Corporate User Signup → Motor Policy
1. **Sign Up as Corporate**
   - Go to http://localhost:3000/signup
   - Select "Corporate"
   - Fill in:
     - Name: "Jane Smith"
     - Company: "Acme Corp"
     - Email: "jane@acme.com"
     - Mobile: "+91 8765432109"
     - Password: "test123"
   - Submit

2. **Add Motor Policy** (Form will be placeholder for now)
   - Go to "Motor Policies" from sidebar
   - Click "+ Add Vehicle Policy"
   - Verify: Modal/form appears (placeholder in MVP)
   - Close form

3. **Check Empty State**
   - Verify: "No motor policies yet" message
   - Verify: "Add Your First Policy" button

### Test Flow 3: Login Flow
1. **Login as Individual**
   - Go to http://localhost:3000/login
   - Select "Individual" tab
   - Enter email: john@test.com
   - Enter password: test123
   - Click "Sign In"
   - Verify: Redirected to /dashboard

2. **Login as Corporate**
   - Sign out
   - Go to login page with `?type=corporate`
   - Verify: "Corporate Login" header
   - Enter corporate credentials
   - Sign in

### Test Flow 4: Responsive Design
1. **Desktop** (1920x1080)
   - Verify: Sidebar visible on left
   - Check: All dashboard cards in 3-column grid
   - Check: Table displays properly

2. **Mobile** (375x667)
   - Verify: Hamburger menu appears
   - Check: Cards stack vertically
   - Check: Table scrolls horizontally
   - Check: All buttons are tappable

---

## 📊 Manual Data Testing

### Add Test Data via Firebase Console

Since forms are placeholders in MVP, add test data directly via Firebase Console:

1. **Add Motor Policy**
   - Go to Firestore → motor_policies collection → Add document
   ```json
   {
     "user_id": "YOUR_USER_UID",
     "policy_number": "MP-2024-001",
     "vehicle_number": "MH-12-AB-1234",
     "vehicle_type": "Car",
     "manufacturer": "Honda",
     "model": "City",
     "fuel_type": "Petrol",
     "manufacturing_year": 2020,
     "number_plate_type": "White",
     "insurer_name": "HDFC ERGO",
     "premium_amount": 25000,
     "policy_start_date": "2024-04-01",
     "policy_end_date": "2025-03-31",
     "rc_docs": [],
     "previous_policy_docs": [],
     "created_at": "2024-11-22T00:00:00Z",
     "updated_at": "2024-11-22T00:00:00Z"
   }
   ```

2. **Add Expiring Policy** (for testing alerts)
   - Set `policy_end_date` to 10 days from today
   - Refresh dashboard
   - Check: Expiry alerts should show this policy

3. **Add GMC Policy**
   - Firestore → gmc_policies collection → Add document
   ```json
   {
     "user_id": "YOUR_USER UIL",
     "company_name": "Acme Corp",
     "policy_number": "GMC-2024-001",
     "insurer_name": "Star Health",
     "premium_amount": 150000,
     "expiry_date": "2025-06-30",
     "policy_docs": [],
     "no_of_lives": 50,
     "created_at": "2024-11-22T00:00:00Z",
     "updated_at": "2024-11-22T00:00:00Z"
   }
   ```

4. **Refresh Dashboard**
   - Check: Summary cards update
   - Check: Pie chart shows distribution
   - Check: Tables show new policies

---

## 🐛 Known MVP Limitations (Expected)

### Forms Not Yet Implemented
- ✗ Add Motor Policy form (placeholder shown)
- ✗ Add GMC Policy form
- ✗ Add Commercial Policy form
- ✗ Register Claim form
- ✗ Request Quote form
- ✗ Add Referral form
- ✗ Edit/Delete policy actions

**Workaround**: Add data via Firebase Console (see above)

### Pages Not Yet Built
- ✗ GMC Policies page
- ✗ Commercial Policies page
- ✗ FY History page
- ✗ Documents page
- ✗ Referrals page
- ✗ Claims page
- ✗ Admin area
- ✗ Garage list page
- ✗ WhatsApp page

**Note**: These will return 404. Focus testing on:
- ✓ Landing page
- ✓ Login/Signup
- ✓ Dashboard
- ✓ Motor Policies page

### What IS Working in MVP
✓ Landing page with beautiful design
✓ Login/Signup with role selection
✓ Authentication and session management
✓ Dashboard with real-time stats
✓ Portfolio pie chart (when data added)
✓ Expiry alerts with countdown
✓ Motor policies table view
✓ Responsive design
✓ Sidebar navigation
✓ Header with search and sign out
✓ Role-based access control

---

## 🔍 Testing Checklist

### Visual/UI Testing
- [ ] Landing page loads with gradient background
- [ ] Hero section displays properly
- [ ] Client logos grid shows 8 logos
- [ ] Benefits section shows 6 cards with icons
- [ ] Login form has email and password fields
- [ ] Signup form shows/hides company field based on role
- [ ] Dashboard greeting shows correct time of day
- [ ] Summary cards have gradient backgrounds
- [ ] Pie chart renders when data exists
- [ ] Table displays policy data correctly
- [ ] Status badges show correct colors (green/orange/red)
- [ ] Sidebar highlights active route
- [ ] Header search bar is visible
- [ ] Mobile menu button appears on small screens

### Functional Testing
- [ ] Can create new user account
- [ ] Can login with created account
- [ ] Dashboard loads user data
- [ ] Can navigate between pages via sidebar
- [ ] Can sign out successfully
- [ ] Expiry calculation works correctly
- [ ] Policy status updates based on dates
- [ ] Pie chart shows correct distribution
- [ ] Summary cards calculate totals correctly

### Authentication Testing
- [ ] Cannot access /dashboard without login
- [ ] Login redirects to correct page based on role
- [ ] Session persists on page refresh
- [ ] Sign out clears session
- [ ] Invalid credentials show error message
- [ ] Password validation works (min 6 chars)
- [ ] Email validation works

### Browser Testing
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works in Edge

---

## 🚨 Troubleshooting

### "Cannot find module '@/...'" errors
**Solution**: TypeScript will show these errors in IDE but app will work when running. These are expected during development.

### Firebase auth not working
**Solution**: 
1. Check .env.local has correct values
2. Verify Email/Password is enabled in Firebase Console
3. Check browser console for specific Firebase errors

### Data not showing on dashboard
**Solution**:
1. Check Firestore has data with correct `user_id`
2. Verify user is authenticated (check browser dev tools → Application → Local Storage)
3. Check browser console for Firestore permission errors
4. Add test data via Firebase Console (see "Manual Data Testing")

### Page shows white screen
**Solution**:
1. Check browser console for errors
2. Verify `npm run dev` is running
3. Hard refresh browser (Cmd+Shift+R)
4. Clear browser cache

### Pie chart not showing
**Solution**: Normal if no policies exist. Add test policies via Firebase Console.

---

## ✅ Next Steps After MVP Testing

1. **Implement Remaining Forms**
   - Motor policy form with file uploads
   - GMC policy form
   - Commercial policy form
   - Claims registration form

2. **Build Remaining Pages**
   - GMC dashboard
   - Commercial policies dashboard
   - FY history with grouping
   - Documents manager
   - Garage finder
   - Admin area

3. **Add More Features**
   - Edit/Delete functionality
   - Advanced filtering
   - CSV export
   - Email notifications
   - WhatsApp integration

---

**Happy Testing! 🎉**

For questions or issues, check the main README.md or open an issue.
