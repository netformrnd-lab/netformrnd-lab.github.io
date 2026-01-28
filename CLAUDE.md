# CLAUDE.md - AI Assistant Guide for Moyeora Deal Platform

This document provides guidance for AI assistants working with the 모여라딜 (Moyeora Deal) codebase.

## Project Overview

**모여라딜 (Moyeora Deal)** is a multi-platform media commerce platform for managing group buying deals, cashback/referral systems, and partner relationships.

- **Domain**: partner-moyeoradeal.kr, moyeoradeal.shop
- **Firebase Project**: `moyeora-deal-manager`
- **E-commerce Backend**: Cafe24 (`moyeora02.cafe24.com`)

### Business Context
- Group buying (공구) deals with sellers/influencers
- Cashback and referral reward system
- B2B supplier/partner onboarding
- Internal OKR/KPI tracking and CRM tools

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Firebase Hosting                         │
│  (Static HTML/JS/CSS - No build step required)              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   /admin/        - Internal admin dashboard                  │
│   /consumer/     - Consumer-facing deal pages                │
│   /supplier/     - Supplier/partner portal                   │
│   /seller/       - Seller management                         │
│   /shop/         - E-commerce shop interface                 │
│   /growthboard/  - Growth metrics & presentations            │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  Cloud Run (functions/)  │  Firebase Firestore  │  Cafe24   │
│  - Cafe24 OAuth Proxy    │  - Real-time DB      │  - Orders │
│  - Express.js 4.x        │  - User data         │  - Payments│
│  - Node.js 18            │  - Deals/Products    │  - Products│
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend (No Build Tools)
- **HTML5** + **Vanilla JavaScript (ES6+)** + **CSS3**
- **Firebase SDK v9.22.0** (compat mode)
  - `firebase-app-compat`
  - `firebase-firestore-compat`
  - `firebase-storage-compat`
- **Kakao SDK** for social sharing
- **PPTXGenJS** for presentation generation
- No webpack/vite/npm - direct file serving

### Backend
- **Node.js 18** with Express.js 4.18 (Cloud Run)
- **Firebase Firestore** - primary database
- **Firebase Storage** - media files
- **Cafe24 API** - e-commerce integration

### Hosting
- **Firebase Hosting** - static files
- **GitHub Pages** - secondary/backup
- **Google Cloud Run** - serverless functions

## Directory Structure

```
/
├── admin/                    # Admin dashboard (largest section)
│   ├── index.html           # Main admin hub
│   ├── strategy/            # OKR/KPI tracking, meetings, worklog
│   │   ├── index.html       # Strategy center (22K+ lines)
│   │   ├── meeting-history.html
│   │   └── kpi-meeting-view.html
│   └── crm/                 # CRM center, contracts
│
├── admin2/                   # Alternative admin (PWA-enabled)
│   ├── sw.js                # Service worker
│   └── manifest.json        # PWA manifest
│
├── consumer/                 # Consumer pages
│   ├── product/             # Deal product pages
│   ├── events/              # Event participation
│   ├── my-cashback/         # Cashback lookup
│   └── secret-seller/       # VIP seller pages
│
├── supplier/                 # Supplier portal
│   ├── apply/               # Application forms
│   ├── proposal/            # Proposal management
│   └── category/            # Category selection
│
├── seller/                   # Seller management
│   ├── apply/               # Seller applications
│   └── call-script/         # Sales scripts
│
├── shop/                     # E-commerce shop
│   ├── product.html
│   ├── cart.html
│   ├── checkout.html
│   └── mypage/
│
├── growthboard/             # Growth metrics
│   └── songhee/             # Individual presentations
│
├── functions/               # Cloud Run backend
│   ├── index.js             # Cafe24 OAuth proxy
│   └── package.json
│
├── assets/                  # Static assets (images)
├── docs/                    # Technical documentation
├── ppt/                     # Presentation materials
├── test/                    # Test pages
│
├── firebase.json            # Firebase config
├── firestore.rules          # Security rules
├── firestore.indexes.json   # DB indexes
├── .firebaserc              # Firebase project reference
├── CNAME                    # Custom domain
│
└── Documentation files
    ├── CLAUDE.md            # This file
    ├── CHANGELOG.md         # Change history
    ├── CONSUMER_PAGES_GUIDE.md
    ├── REFERRAL_CASHBACK_DESIGN.md
    └── INTEGRATION_SUMMARY.md
```

## Key Firestore Collections

| Collection | Purpose |
|------------|---------|
| `deals` | Product/deal information |
| `cafe24_orders` | Synced Cafe24 orders |
| `referrals` | Referral links & tracking |
| `cashbacks` | Cashback ledger |
| `reviews` | Product reviews |
| `notifications` | Alert subscriptions |
| `flashSaleParticipants` | Flash sale entries |
| `sellers` | Seller profiles |
| `okr_meetings` | Meeting records |
| `okr_totalMetrics` | KPI total metrics |
| `okr_subIndicators` | KPI sub-indicators |
| `worklog` | Work tracking/daily logs |
| `sellerProposals` | Supplier proposals |

## Development Workflow

### No Build Step Required
Pages are served directly from Firebase Hosting. Edit HTML files and deploy.

### Local Development
```bash
# Preview with Firebase emulator (optional)
firebase serve

# Or simply open HTML files in browser
# Most pages work with live Firestore connection
```

### Deployment
```bash
# Deploy to Firebase Hosting
firebase deploy --only hosting

# Deploy Cloud Functions
firebase deploy --only functions

# Deploy everything
firebase deploy
```

### Git Workflow
- PR-based development
- Branch naming: `claude/feature-name-xxxxx` for AI-assisted changes
- Commit in Korean for feature descriptions when appropriate
- Recent commits follow pattern: `feat:`, `fix:`, `refactor:`

## Code Conventions

### File Structure
- Single-file HTML pages with embedded CSS/JS
- Large pages (admin/strategy) can exceed 20K lines
- No external CSS frameworks - custom CSS variables

### CSS Variables
```css
--primary: #fc9600;        /* Orange - brand color */
--primary-light: #fff4e6;
--gray-900: #1a1a1a;
--gray-800: #333;
/* ... */
```

### Firebase Usage Pattern
```javascript
// Initialize (compat mode)
const firebaseConfig = {
    apiKey: "...",
    authDomain: "moyeora-deal-manager.firebaseapp.com",
    projectId: "moyeora-deal-manager",
    storageBucket: "moyeora-deal-manager.firebasestorage.app",
    // ...
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// Real-time listener pattern
db.collection('deals').onSnapshot(snapshot => {
    snapshot.forEach(doc => {
        // Handle data
    });
});

// Timestamps
firebase.firestore.FieldValue.serverTimestamp()
```

### Naming Conventions
- **UI Text**: Korean (한국어)
- **Variable/Function names**: English camelCase
- **Collection names**: camelCase (`cafe24_orders`, `okr_meetings`)
- **CSS classes**: kebab-case

### Responsive Breakpoints
```css
@media (max-width: 480px) { /* Small mobile */ }
@media (max-width: 768px) { /* Mobile/Tablet */ }
@media (max-width: 1200px) { /* Tablet/Desktop */ }
```

## Key Integrations

### Cafe24 E-commerce
- OAuth proxy at `/functions/index.js`
- Order sync to Firestore `cafe24_orders`
- Product links: `moyeora02.cafe24.com`

### Kakao SDK
```javascript
Kakao.init('YOUR_KAKAO_JS_KEY');
// Used for social sharing, login
```

### Firebase Storage
- Bucket: `moyeora-deal-manager.firebasestorage.app`
- Used for images, review media uploads

## Important Files to Know

### Strategy Center (admin/strategy/index.html)
- **Largest file** (~22K lines)
- Contains: OKR tracking, KPI management, worklog, meeting integration
- Tab-based navigation
- Real-time Firestore sync

### Admin Dashboard (admin/index.html)
- Order management, deal management
- Seller/supplier management
- Notification system
- Settlement tracking

### Consumer Product Page (consumer/product/index.html)
- Deal display with image slider
- Referral link generation
- Flash sale countdown
- Cafe24 purchase redirect

## Common Tasks

### Adding a New Admin Feature
1. Edit `admin/strategy/index.html` or create new HTML in `/admin/`
2. Add tab navigation if needed
3. Create Firestore collection/queries
4. Add to PWA manifest shortcuts if important

### Adding a Consumer Page
1. Create folder in `/consumer/new-page/`
2. Add `index.html` with Firebase SDK initialization
3. Follow template in `CONSUMER_PAGES_GUIDE.md`

### Modifying Firestore Data
1. Check existing collection structure in code
2. Update indexes in `firestore.indexes.json` if needed
3. Update security rules in `firestore.rules`

## Security Notes

- Firebase API keys are public (client-side)
- Firestore rules control actual access
- Cafe24 OAuth tokens handled server-side only
- Never expose Cafe24 client secrets in frontend

## Testing

- No automated test suite
- Manual testing via `/test/` directory pages
- Browser console for debugging
- Firebase emulator for local testing

## Documentation

| File | Description |
|------|-------------|
| `CHANGELOG.md` | Recent changes with PR references |
| `CONSUMER_PAGES_GUIDE.md` | Consumer page API & structure |
| `REFERRAL_CASHBACK_DESIGN.md` | Referral system design |
| `INTEGRATION_SUMMARY.md` | System integration details |
| `STRATEGY_CENTER_ANALYSIS.md` | Strategy center functionality |
| `docs/CAFE24_REFERRAL_INTEGRATION.md` | Cafe24 integration guide |
| `docs/DOMAIN_STRATEGY.md` | Domain configuration |

## Quick Reference

### Firebase Project
- Project ID: `moyeora-deal-manager`
- Region: Default (us-central1 for functions)

### Key URLs
- Admin: `/admin/` or `/admin2/`
- Strategy Center: `/admin/strategy/`
- Consumer: `/consumer/product/?id={dealId}`
- Supplier Portal: `/supplier/`

### Color Scheme
- Primary (Orange): `#fc9600`
- Background: `#000` (dark theme) or `#fff` (light)
- Success: `#10b981`
- Warning: `#f59e0b`
- Error: `#ef4444`

## When Making Changes

1. **Read existing code first** - Pages can be large with interconnected functions
2. **Preserve Korean text** - UI is in Korean for Korean market
3. **Test responsive layouts** - Mobile-first is critical
4. **Check Firestore queries** - Ensure indexes exist for new queries
5. **Update CHANGELOG.md** - Document significant changes
6. **No build step** - Changes are live immediately after deploy

## Common Pitfalls

- Large HTML files - use search to find relevant sections
- Firebase compat mode - don't mix with modular imports
- Firestore indexes - new compound queries may need index creation
- PWA caching - clear service worker cache after updates
- Cafe24 CORS - use the Cloud Run proxy for API calls
