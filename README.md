# One Single View - Insurance Policy Management Dashboard

A comprehensive insurance policy management and analytics dashboard built with Next.js, TypeScript, Firebase, and Tailwind CSS.

## 🚀 Features

### User Roles
- **Individual Customers**: Personal policy management
- **Corporate Customers**: Business policy dashboard
- **Admins**: Full system oversight and management
- **Relationship Managers**: Customer support and management

### Core Modules
- ✅ **Motor/Vehicle Policies**: Manage car, bike, bus, and GCV policies
- ✅ **GMC (Group Medical Cover)**: Corporate health insurance tracking
- ✅ **Commercial Policies**: GPA, Fire, and other business policies
- ✅ **Claims Management**: Register and track claim status
- ✅ **Document Management**: Centralized storage for RCs, policies, DLs
- ✅ **Expiry Alerts**: Configurable reminders for policy renewals
- ✅ **FY-wise History**: Financial year grouping and historical views
- ✅ **Quote Requests**: Request new quotes or submit better quotes
- ✅ **Referrals**: Refer friends and family

### Dashboard Features
- Portfolio pie chart showing premium distribution by LOB
- Real-time policy status calculation (Active/Expiring Soon/Expired)
- Summary cards with total policies, premium, and expiring count
- WhatsApp integration placeholder
- Garage finder
- Admin duplicate detection

## 📋 Prerequisites

- Node.js 18+ and npm
- Firebase project (for auth, Firestore, and Storage)

## 🛠️ Installation

### 1. Clone and Install Dependencies

```bash
cd /Users/apple/OneSingleView
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable the following services:
   - **Authentication** → Email/Password provider
   - **Firestore Database** → Start in production mode
   - **Storage** → Start in production mode

4. Get your Firebase config:
   - Go to Project Settings → General
   - Scroll to "Your apps" → Web app
   - Copy the Firebase SDK configuration

5. Create `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

6. Edit `.env.local` and replace with your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id-here
```

### 3. Firestore Security Rules

Set up Firestore security rules to protect user data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /motor_policies/{policyId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.user_id || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    match /gmc_policies/{policyId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.user_id || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    match /commercial_policies/{policyId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.user_id || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    match /claims/{claimId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.user_id || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Admin-only collections
    match /user_audit_log/{logId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Public read for garages
    match /garages/{garageId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### 4. Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## 📱 User Flows

### 1. Sign Up
1. Go to landing page
2. Click "Get Started" or "Sign Up"
3. Select Individual or Corporate account type
4. Fill in details (Name, Email, Mobile, Password)
5. Submit to create account

### 2. Login
1. Click "Login" from landing page
2. Select Individual or Corporate login
3. Enter email and password
4. Redirected to dashboard (or admin area if admin role)

### 3. Add a Motor Policy
1. Login to dashboard
2. Navigate to "Motor Policies" from sidebar
3. Click "+ Add Vehicle Policy"
4. Fill in vehicle details, upload RC and policy docs
5. Submit to save policy

### 4. View Dashboard
- See portfolio pie chart showing premium by LOB
- View summary cards (total policies, premium, expiring soon)
- Check expiry alerts section
- Use quick actions for common tasks

### 5. Admin Features
- Login with admin role
- View all users with change tracking
- Access policy sheets by LOB
- Check duplicate detection
- Review claims and quote requests

## 🗂️ Project Structure

```
one-single-view/
├── app/
│   ├── (auth)/
│   │   ├── login/         # Login page
│   │   └── signup/        # Signup page
│   ├── (customer)/
│   │   ├── dashboard/     # Main dashboard
│   │   ├── motor/         # Motor policies
│   │   ├── gmc/           # GMC policies
│   │   ├── commercial/    # Commercial policies
│   │   ├── history/       # FY-wise history
│   │   ├── documents/     # Document manager
│   │   ├── referrals/     # Referral system
│   │   ├── claims/        # Claims management
│   │   └── layout.tsx     # Customer layout with auth
│   ├── (admin)/
│   │   └── admin/         # Admin area
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/
│   ├── dashboard/         # Dashboard components
│   ├── forms/             # Form components
│   ├── layout/            # Sidebar, Header
│   └── ui/                # Reusable UI components
├── lib/
│   ├── firebase.ts        # Firebase initialization
│   ├── auth.ts            # Auth utilities
│   ├── db.ts              # Firestore helpers
│   ├── storage.ts         # File upload helpers
│   └── utils.ts           # Utility functions
├── types/
│   └── index.ts           # TypeScript types
└── README.md              # This file
```

## 🎨 Design System

### Colors
- **Primary**: Indigo (`#6366f1`)
- **Secondary**: Purple (`#8b5cf6`)
- **Accent**: Cyan (`#06b6d4`)
- **Success**: Green (`#10b981`)
- **Warning**: Orange (`#f59e0b`)
- **Error**: Red (`#ef4444`)

### Components
- **Buttons**: `.btn-primary`, `.btn-secondary`, `.btn-outline`, `.btn-ghost`
- **Cards**: `.card`, `.card-compact`
- **Inputs**: `.input`, `.label`
- **Badges**: `.badge-success`, `.badge-warning`, `.badge-error`
- **Tables**: `.table`, `.table-row`, `.table-cell`

## 🔒 Security Features

- Role-based access control (RBAC)
- Firestore security rules for data isolation
- Audit logging for email/mobile changes
- Secure file uploads with Firebase Storage
- Environment variable protection

## 🚧 TODO / Future Enhancements

### Immediate (MVP Completion)
- [ ] Complete all form implementations (Motor, GMC, Commercial, Claims)
- [ ] Implement edit and delete functionality for policies
- [ ] Build admin dashboard pages
- [ ] Add FY history views with grouping
- [ ] Create documents page with file organization
- [ ] Build garage list page with filters

### Short-term
- [ ] WhatsApp Bot integration (Twilio API)
- [ ] Email notifications for expiry reminders
- [ ] CSV export functionality for admin
- [ ] Advanced filtering and sorting for tables
- [ ] Mobile responsive improvements
- [ ] Pagination for large data sets

### Long-term
- [ ] Payment gateway integration (Razorpay/Stripe)
- [ ] Insurer API integrations
- [ ] AI-powered policy recommendations
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Advanced analytics and reporting

## 📊 Database Schema

### Collections

#### `users`
- uid, email, mobile, name, company_name, role, created_at, updated_at, rm_id

#### `motor_policies`
- id, user_id, policy_number, vehicle_number, vehicle_type, manufacturer, model, fuel_type, manufacturing_year, number_plate_type, insurer_name, premium_amount, policy_start_date, policy_end_date, status, rc_docs[], previous_policy_docs[], dl_docs[], created_at, updated_at

#### `gmc_policies`
- id, user_id, company_name, policy_number, insurer_name, sum_insured, premium_amount, expiry_date, policy_docs[], no_of_lives, status, created_at, updated_at

#### `commercial_policies`
- id, user_id, lob_type, company_name, policy_holder_name, policy_number, insurer_name, premium_amount, sum_insured, expiry_date, policy_docs[], status, created_at, updated_at

#### `claims`
- id, user_id, policy_id, lob_type, claim_type, incident_date, description, supporting_docs[], status, created_at, updated_at

#### `quote_requests`
- id, user_id, lob_type, details, uploaded_quote, has_better_quote, status, created_at

#### `referrals`
- id, user_id, friend_name, friend_mobile, friend_email, notes, created_at

#### `garages`
- id, name, insurer, city, pincode, address, contact_number

#### `user_audit_log`
- id, user_id, field_changed, old_value, new_value, changed_at

#### `settings`
- key, value, updated_at

## 🤝 Contributing

This is an MVP implementation. Contributions are welcome for:
- Bug fixes
- UI/UX improvements
- Additional features
- Documentation improvements

## 📝 License

MIT License - feel free to use this project for your own purposes.

## 💬 Support

For issues or questions:
- Open a GitHub issue
- Contact the development team
- Check the documentation

---

**Built with ❤️ using Next.js, TypeScript, Firebase, and Tailwind CSS**
