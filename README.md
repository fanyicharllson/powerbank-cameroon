# Powerbank Cameroon - E-Commerce Platform

A modern, feature-rich e-commerce platform for selling premium powerbanks across Cameroon. Built with cutting-edge web technologies to provide an exceptional user experience with fast delivery and secure payment processing.

## Live Demo

Visit the live application at: [Powerbank Cameroon](https://vm-stael-shop.usercontent.net)

## Features

### Core Features
- **Product Browsing**: View all powerbank models with detailed specifications
- **Advanced Search & Filtering**: Find powerbanks by capacity (10K, 20K, 30K, 65W)
- **Shopping Cart**: Add/remove products with real-time updates
- **Multi-Step Checkout**: Streamlined 4-step checkout process
  - Cart Review
  - Customer Information
  - Delivery Information
  - Payment Method Selection
- **Payment Methods**: Support for MTN Mobile Money, Orange Money, and Cash on Delivery
- **Order Notifications**: Automatic WhatsApp notifications with order details
- **Contact Form**: Get in touch with customer support team

### Premium Features
- **Skeleton Loaders**: Beautiful loading states for better UX
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Smooth Animations**: Framer Motion animations throughout the app
- **Real-Time State Management**: Zustand for efficient cart management
- **Search Functionality**: Quick search across all products
- **Trust Indicators**: Genuine products, fast delivery, and 24/7 support badges

### Product Catalog
- **PB Mini 10K**: 10,000mAh compact powerbank - 12,000 FCFA
- **PB Pro 20K**: 20,000mAh with fast charging - 25,000 FCFA
- **PB Ultra 30K**: 30,000mAh with dual USB output - 35,000 FCFA
- **PB Laptop 65W**: 65W high-capacity laptop charger - 65,000 FCFA

## Technology Stack

### Frontend
- **Next.js 16**: React framework with App Router (storefront + admin apps)
- **React 19**: Latest React features and optimizations
- **TypeScript**: Type-safe development
- **Tailwind CSS v4**: Utility-first CSS styling
- **Framer Motion**: Smooth animations and transitions (storefront)
- **Recharts**: Admin dashboard charts
- **Lucide React**: Beautiful icon library

### State Management & Data Fetching
- **Zustand**: Lightweight state management for cart
- **React Query**: Server state for orders and admin dashboard

### Backend / Data
- **PostgreSQL + Prisma**: Shared `@stael/db` package
- **pnpm workspaces**: Monorepo with separately hosted apps

### Development Tools
- **Vercel**: Deploy storefront and admin as two projects
- **pnpm**: Fast package manager

## Project Structure

```
.
├── apps/
│   ├── storefront/             # Public website (port 3000)
│   └── admin/                  # Admin dashboard (port 3001)
├── packages/
│   └── db/                     # Shared Prisma schema, client, seed
├── pnpm-workspace.yaml
└── .env.example
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (or npm/yarn)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/fanyicharllson/powerbank-cameroon.git
cd powerbank-cameroon
```

2. Install dependencies (shared workspace `node_modules`):
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Set at least:
- `DATABASE_URL`
- `ADMIN_SESSION_SECRET` (long random string)
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` (seeded admin login)

Then prepare the database:
```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

4. Run apps:
```bash
pnpm dev:storefront   # http://localhost:3000
pnpm dev:admin        # http://localhost:3001
```

## Available Scripts

```bash
# Storefront
pnpm dev:storefront
pnpm build:storefront
pnpm start:storefront

# Admin dashboard
pnpm dev:admin
pnpm build:admin
pnpm start:admin

# Database (packages/db)
pnpm db:generate
pnpm db:migrate
pnpm db:deploy
pnpm db:seed

# Verify storefront order API
pnpm verify:orders
```

## Admin Dashboard

- Separate Next.js app with Teknova-style responsive sidebar
- Simple email/password admin auth (HttpOnly session cookie)
- Overview KPIs, revenue chart, collection gauge, recent transactions
- Orders list/detail with manual installment “mark paid”
- Customer insights aggregated by phone
- Customer storefront auth remains optional / out of scope

### Separate hosting
Create two Vercel (or similar) projects from this repo:
- Storefront: root directory `apps/storefront`
- Admin: root directory `apps/admin`

Both need `DATABASE_URL`. Admin also needs `ADMIN_SESSION_SECRET`. Run `pnpm db:deploy` and `pnpm db:seed` against production once.

## Usage

### Browsing Products
1. Visit the homepage to see featured products
2. Click "SEE ALL PRODUCTS" to view all available powerbanks
3. Use the search bar to find specific models
4. Filter by capacity using the filter buttons

### Adding to Cart
1. Click "BUY NOW" on any product
2. View your cart by clicking the cart icon in the header
3. Adjust quantities or remove items as needed

### Checkout Process
1. Select a 2, 3, 4, or 6-month installment plan
2. Enter customer and delivery details
3. Select a preferred future payment method
4. Click "Save order & continue"
5. The REST API validates current database prices and stores the order, item snapshots, and full pending installment schedule atomically
6. Review the database-backed confirmation and order number

Order creation uses an idempotency key, so safely retrying a failed request cannot create duplicate orders.

### Tracking Orders
1. After saving an order, use “Track this order” for its detailed installment timeline
2. Use “My Orders” in the navigation to view every order placed from the current browser
3. The navigation button appears automatically when this device owns at least one order
4. Order history includes payment progress, next installment, products, customer details, and delivery status

Order history is account-free and protected by a random HttpOnly device cookie. The database stores only a SHA-256 hash of that token.

### Contact & Support
1. Click "CONTACT" in the header or footer
2. Fill out the contact form with your inquiry
3. Customer support team will respond via email or WhatsApp

## Delivery Areas

We deliver across Cameroon including:
- Yaoundé
- Douala
- Bafoussam
- Garoua
- Buea
- Limbe
- And all other regions across Cameroon

Delivery Fee: 2,000 FCFA

## Payment Methods

- **MTN Mobile Money**: Direct mobile payment
- **Orange Money**: Direct mobile payment
- **Cash on Delivery**: Pay when order arrives

## Design System

### Colors
- **Primary Green**: #059669 (Navigation, buttons)
- **Primary Yellow**: #fbbf24 (Accents, highlights)
- **Background**: #f5f5f5
- **Text**: #1a1a1a (Dark)

### Typography
- **Headings**: Bold, large sizes for hierarchy
- **Body Text**: Clear, readable 14px+
- **Maximum 2 font families**: Sans-serif for consistency

## Features in Development

- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Optional customer accounts (client preference: keep guest checkout)
- [ ] Email notifications
- [ ] Promo codes and discounts
- [ ] Multiple language support
- [ ] Mobile Money payment capture + auto installment reconciliation

## Known Issues & Limitations

- Demo uses mock WhatsApp numbers for testing
- Installment orders and schedules are persisted in PostgreSQL
- Actual MTN Mobile Money, Orange Money, and cash collection are not yet integrated; new orders remain in `PENDING_PAYMENT`
- Admins can manually mark installments as paid in the admin dashboard
- Payment-provider callbacks, reconciliation, and automatic status updates are intentionally marked as TODO
- Customer order history is currently bound to the browser/device that placed the order
- Clearing site cookies or switching devices removes customer order access until optional customer auth is added

## Production Database Deployment

Committed Prisma migrations must be applied before starting a new production release:

```bash
pnpm db:deploy
pnpm db:seed
pnpm start:storefront
# and/or
pnpm start:admin
```

The seed command upserts products and the admin user from `ADMIN_EMAIL` / `ADMIN_PASSWORD`. Keep secrets in the deployment platform's secret manager.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

**Fanyi Charlson**
- GitHub: [@fanyicharllson](https://github.com/fanyicharllson)
- Email: support@powerbankcameroon.com
- WhatsApp: +237 678 123 456

## Support

For support, email us at support@powerbankcameroon.com or contact us via WhatsApp at +237 678 123 456.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Animations powered by [Framer Motion](https://www.framer.com/motion/)
- Icons from [Lucide React](https://lucide.dev/)
- State management with [Zustand](https://github.com/pmndrs/zustand)

## Changelog

### Version 1.0.0 (Current)
- Initial launch with core e-commerce features
- 4-product catalog with search and filtering
- Multi-step checkout process
- WhatsApp order notifications
- Contact form
- Responsive design with smooth animations

---

**Powerbank Cameroon** - Never Run Out Of Power. Reliable power solutions delivered fast across Cameroon.
