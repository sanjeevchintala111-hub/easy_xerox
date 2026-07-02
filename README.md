# College Xerox Order Management Website

A complete beginner-friendly full-stack website for a college Xerox/printing service. Students can upload PDFs/images/documents, get automatic PDF page count, see Xerox cost, pay using a UPI demo QR/link, submit orders, and contact admin through WhatsApp. Admin can login, manage orders, download uploaded files, update order status, and change pricing/settings.

## Why this stack?

This project uses **Node.js + Express + MongoDB + EJS + CSS + JavaScript**.

It is beginner-friendly because:

- You can understand the complete flow without React complexity.
- Express handles routes, file uploads, sessions, and admin login clearly.
- MongoDB stores orders and settings simply.
- EJS creates dynamic pages from backend data.
- This is strong enough for a GitHub portfolio project.

## Main Features

### Customer Side

- Home page with hero section, pricing, process, support, and footer
- Upload page with helper text under every input
- Multiple file upload
- Supported file types: PDF, JPG, JPEG, PNG, DOC, DOCX
- PDF page counting using `pdf-lib`
- Images counted as 1 page each
- DOC/DOCX accepted, but page count is demo estimate only
- Xerox options:
  - Single side Xerox
  - Double side Xerox
  - 4 pages in 1 sheet
  - Black & white
  - Color print
  - Number of copies
- Automatic cost calculation
- Automatic discount rule
- UPI payment link and QR code demo
- Order confirmation page
- WhatsApp support button with auto-filled order message

### Admin Side

- Admin login with backend password check
- Dashboard stats:
  - Total orders
  - Pending orders
  - Paid orders
  - Completed orders
  - Today's orders
  - Total revenue
- Recent orders table
- All orders page with filters
- Order details page
- Download uploaded files
- Update payment status
- Update order status:
  - Pending
  - Paid
  - Printing
  - Ready for Pickup
  - Delivered
  - Cancelled
- Add admin note
- WhatsApp contact customer button
- Pricing settings page
- Update UPI ID, WhatsApp number, shop name, prices, discount rule

## Project Folder Structure

```text
college-xerox-management/
├── config/
│   └── db.js
├── middleware/
│   ├── auth.js
│   └── upload.js
├── models/
│   ├── Order.js
│   └── Settings.js
├── public/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── main.js
│       └── upload.js
├── routes/
│   ├── adminRoutes.js
│   └── customerRoutes.js
├── scripts/
│   └── hash-password.js
├── uploads/
│   └── .gitkeep
├── utils/
│   ├── fileAnalyzer.js
│   ├── payment.js
│   ├── pricing.js
│   └── settings.js
├── views/
│   ├── admin/
│   │   ├── dashboard.ejs
│   │   ├── login.ejs
│   │   ├── order-detail.ejs
│   │   ├── orders.ejs
│   │   └── settings.ejs
│   ├── partials/
│   │   ├── footer.ejs
│   │   └── header.ejs
│   ├── confirmation.ejs
│   ├── error.ejs
│   ├── index.ejs
│   ├── preview.ejs
│   └── upload.ejs
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## Installation Steps

### 1. Install Node.js

Install Node.js LTS version from the official Node.js website.

Check installation:

```bash
node -v
npm -v
```

### 2. Install MongoDB

You can use either:

- Local MongoDB Community Server, or
- MongoDB Atlas free cloud database

For local MongoDB, default URL is:

```text
mongodb://127.0.0.1:27017/college-xerox
```

### 3. Install dependencies

Open this project folder in VS Code terminal and run:

```bash
npm install
```

### 4. Create `.env` file

Copy `.env.example` to `.env`:

```bash
copy .env.example .env
```

On Mac/Linux:

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/college-xerox
SESSION_SECRET=replace_with_a_long_random_secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
MAX_FILE_SIZE_MB=20
```

## Secure Admin Password Option

For production, do not use plain `ADMIN_PASSWORD`. Generate password hash:

```bash
npm run hash:password -- yourStrongPassword
```

Copy the output and use:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=your_generated_hash_here
```

Then remove or ignore `ADMIN_PASSWORD`.

## How to Run Locally

Development mode:

```bash
npm run dev
```

Normal mode:

```bash
npm start
```

Open:

```text
http://localhost:3000
```

Admin panel:

```text
http://localhost:3000/admin/login
```

Default demo login:

```text
Username: admin
Password: admin123
```

## How to Test the Website

1. Open home page.
2. Click **Upload Documents**.
3. Enter student details.
4. Upload one or more PDFs/images.
5. Select Xerox type, color option, and copies.
6. Click **Analyze Files & Continue**.
7. Check page count and total amount.
8. Scan UPI demo QR or click UPI link.
9. Submit order.
10. Copy order ID.
11. Login as admin.
12. Open the order.
13. Download files.
14. Update payment status to Paid.
15. Update order status to Printing / Ready for Pickup / Delivered.

## Database Collections

### `orders`

Stores:

- Order ID
- Customer details
- Uploaded file metadata
- Xerox options
- Total pages
- Cost summary
- Payment status
- Order status
- Admin note
- UPI link
- Created/updated time

### `settings`

Stores:

- Shop/admin name
- WhatsApp support number
- UPI ID
- Single side price
- Double side price
- 4-in-1 price
- Color print price
- Minimum order amount
- Discount percentage
- Discount rule

## API / Route Summary

### Customer Routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/` | Home page |
| GET | `/upload` | Customer upload form |
| POST | `/orders/preview` | Upload files, analyze pages, calculate price |
| POST | `/orders/confirm` | Create order in database |
| GET | `/order/:orderId` | Customer confirmation page |

### Admin Routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/admin/login` | Admin login page |
| POST | `/admin/login` | Admin authentication |
| POST | `/admin/logout` | Logout |
| GET | `/admin/dashboard` | Dashboard stats |
| GET | `/admin/orders` | View all orders |
| GET | `/admin/orders/:orderId` | View order details |
| POST | `/admin/orders/:orderId/update` | Update status/payment/admin note |
| GET | `/admin/orders/:orderId/download/:fileIndex` | Download uploaded file |
| GET | `/admin/settings` | Settings page |
| POST | `/admin/settings` | Update pricing/settings |

## Demo Version Notes

This MVP has safe demo payment behavior:

- It generates a UPI payment string and QR code.
- It does not verify bank transaction automatically.
- Payment status remains `Pending` until admin manually verifies and marks `Paid`.
- It does not store debit card, bank account, OTP, UPI PIN, or sensitive payment credentials.

## What is Needed for Real Payment Gateway Integration

For real production payment confirmation, integrate one of these:

- Razorpay
- PhonePe Payment Gateway
- Cashfree
- PayU

Production payment flow should include:

- Create payment order from backend
- Redirect/open payment page
- Verify payment signature on backend
- Use webhook to update payment status automatically
- Store only transaction ID and status, not sensitive payment data

## Deployment

### Option 1: Render + MongoDB Atlas

1. Push project to GitHub.
2. Create MongoDB Atlas database.
3. Create Render Web Service.
4. Add environment variables in Render dashboard.
5. Build command:

```bash
npm install
```

6. Start command:

```bash
npm start
```

### Option 2: Railway

1. Push project to GitHub.
2. Create Railway project.
3. Add MongoDB service or use MongoDB Atlas.
4. Add environment variables.
5. Deploy.

## Production Security Improvements

Before using for real college orders:

- Use HTTPS only.
- Use MongoDB session store instead of memory session.
- Store uploaded files in cloud storage such as AWS S3 or Cloudinary private storage.
- Add file virus scanning.
- Add rate limiting for upload route.
- Use real payment gateway verification.
- Add student login or OTP verification.
- Add stronger admin password and two-factor authentication.
- Add backup and file retention policy.

## Advanced Improvements

- Razorpay / PhonePe real payment integration
- WhatsApp/SMS notifications for order updates
- PDF preview before payment
- Print queue management
- Delivery or pickup tracking
- Student login and order history
- Admin analytics charts
- Auto invoice generation
- Multiple admins
- Department-wise order reports

## Important Note About API Keys

This project does not include real API keys. API keys are private and must never be written directly inside frontend code or pushed to GitHub. Use `.env` variables for secrets.

For this MVP, no external API key is required.
