# Stock Management System - Frontend

A modern, professional React frontend application for the Stock Management System built with TypeScript, Vite, Redux Toolkit, and Tailwind CSS.

## Features

- 🔐 **Authentication & Authorization** - Complete login, register, password reset flow with JWT token management
- 📦 **Product Management** - Manage products, categories, and item variants
- 📊 **Inventory Management** - Track inventory levels, lots, and serial numbers
- 🔄 **Movement Management** - Handle stock movements and transfers
- 📍 **Location Management** - Manage sites, warehouses, and locations
- ✅ **Quality Control** - Quality control records and quarantine management
- 🔔 **Alerts & Notifications** - System alerts and notification management
- 📱 **Responsive Design** - Mobile-friendly UI with Tailwind CSS
- 🎨 **Modern UI** - Clean, professional interface with reusable components

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **React Router v6** - Routing
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **Tailwind CSS** - Styling
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

## Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Layout/        # Layout components (Header, Sidebar)
│   │   └── ui/            # Base UI components (Button, Input, Card, etc.)
│   ├── pages/             # Page components
│   │   └── auth/          # Authentication pages
│   ├── services/          # API service layer
│   ├── store/              # Redux store and slices
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript types/interfaces
│   ├── config/             # Configuration files
│   ├── App.tsx             # Main App component
│   └── main.tsx            # Entry point
├── public/                 # Static assets
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Backend services running (API Gateway on port 8080)

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Create environment file (optional, defaults are set):
```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_NAME=Stock Management System
VITE_APP_VERSION=1.0.0
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

The production build will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
# or
yarn preview
# or
pnpm preview
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## API Integration

The frontend communicates with the backend through the API Gateway at `http://localhost:8080` (configurable via environment variables).

### Authentication Flow

1. User logs in via `/api/auth/login`
2. Access token and refresh token are stored in localStorage
3. Access token is automatically attached to all API requests
4. On 401 response, refresh token is used to get a new access token
5. On refresh failure, user is logged out and redirected to login

### Service Modules

- `auth.service.ts` - Authentication endpoints
- `product.service.ts` - Product management endpoints
- `inventory.service.ts` - Inventory management endpoints
- `movement.service.ts` - Movement management endpoints
- `location.service.ts` - Location management endpoints
- `quality.service.ts` - Quality control endpoints
- `alert.service.ts` - Alert and notification endpoints

## State Management

Redux Toolkit is used for global state management:

- **Auth Slice** - User authentication state and user data

## Routing

Protected routes require authentication. Unauthenticated users are redirected to the login page.

### Routes

- `/login` - Login page
- `/register` - Registration page
- `/forgot-password` - Password reset request
- `/dashboard` - Main dashboard (protected)
- `/products` - Product management (protected)
- `/inventory` - Inventory management (protected)
- `/movements` - Movement management (protected)
- `/locations` - Location management (protected)
- `/quality` - Quality control (protected)
- `/alerts` - Alerts management (protected)

## Components

### Layout Components

- `Layout` - Main application layout with header and sidebar
- `Header` - Top navigation bar
- `Sidebar` - Side navigation menu

### UI Components

- `Button` - Button component with variants and sizes
- `Input` - Form input with label and error handling
- `Card` - Card container component
- `Table` - Table components (Table, TableHead, TableBody, etc.)
- `Modal` - Modal dialog component
- `Loading` - Loading spinner component

## Styling

Tailwind CSS is used for styling. The design system includes:

- Primary color scheme (blue)
- Responsive breakpoints
- Consistent spacing and typography
- Reusable utility classes

## Error Handling

- Global error handling via Axios interceptors
- Toast notifications for user feedback
- Automatic token refresh on 401 errors
- Network error handling

## Development

### Code Style

- TypeScript strict mode enabled
- ESLint for code linting
- Prettier (recommended) for code formatting

### Adding New Features

1. Create types in `src/types/`
2. Add service methods in `src/services/`
3. Create components in `src/components/`
4. Create pages in `src/pages/`
5. Add routes in `src/App.tsx`

## Troubleshooting

### CORS Issues

Ensure the backend API Gateway has CORS configured for `http://localhost:3000`.

### Authentication Issues

- Check that tokens are being stored in localStorage
- Verify API Gateway JWT configuration
- Check browser console for errors

### Build Issues

- Clear `node_modules` and reinstall dependencies
- Check Node.js version (18+ required)
- Verify TypeScript configuration

## License

This project is part of the Stock Management System monorepo.

