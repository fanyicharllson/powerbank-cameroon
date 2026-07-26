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
- **Next.js 16**: React framework with App Router
- **React 19**: Latest React features and optimizations
- **TypeScript**: Type-safe development
- **Tailwind CSS v4**: Utility-first CSS styling
- **Framer Motion**: Smooth animations and transitions
- **Lucide React**: Beautiful icon library

### State Management & Data Fetching
- **Zustand**: Lightweight state management for cart
- **React Query**: Server state management (installed, ready for API integration)

### Development Tools
- **Vercel**: Deployment platform
- **pnpm**: Fast package manager

## Project Structure

```
.
├── app/
│   ├── layout.tsx              # Root layout with metadata
│   ├── page.tsx                # Homepage with hero and products
│   ├── globals.css             # Global styles and design tokens
│   ├── checkout/
│   │   └── page.tsx            # 4-step checkout flow
│   ├── products/
│   │   └── page.tsx            # Products page with search & filter
│   └── contact/
│       └── page.tsx            # Contact form page
├── components/
│   ├── header.tsx              # Navigation header
│   ├── footer.tsx              # Footer with links
│   ├── hero.tsx                # Hero section
│   ├── product-card.tsx        # Product card component
│   ├── products-section.tsx    # Products grid section
│   └── faq-section.tsx         # FAQ section (removed from nav)
├── lib/
│   ├── store.ts                # Zustand cart store
│   ├── products.ts             # Product data
│   └── api.ts                  # API utilities
├── hooks/
│   └── use-scroll-animation.ts # Scroll animation hook
└── public/                     # Static assets

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

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Run the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

```bash
# Development server
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint

# Format code
pnpm format
```

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
1. Click "Continue" to proceed to customer information
2. Enter your full name and phone number
3. Provide delivery details (region, city, address)
4. Select your preferred payment method
5. Review order summary and place order
6. Receive WhatsApp confirmation with order details

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
- [ ] User accounts and order history
- [ ] Inventory management dashboard
- [ ] Email notifications
- [ ] Promo codes and discounts
- [ ] Multiple language support

## Known Issues & Limitations

- Demo uses mock WhatsApp numbers for testing
- Orders are stored in localStorage (demo only - production will use database)
- Payment processing is demo-only (integration needed)

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
