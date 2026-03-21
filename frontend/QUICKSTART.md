# Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Open Browser
Navigate to `http://localhost:3000`

## 📋 Prerequisites

1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **Backend Running** - Ensure API Gateway is running on `http://localhost:8080`

## 🔧 Configuration

The frontend is pre-configured to connect to:
- API Gateway: `http://localhost:8080`
- Development Port: `3000`

To change these settings, create a `.env.development` file:
```env
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_NAME=Stock Management System
VITE_APP_VERSION=1.0.0
```

## 🎯 First Login

1. If you don't have an account, click "Sign up" to register
2. Use your credentials to login
3. You'll be redirected to the Dashboard

## 📁 Project Structure Overview

```
frontend/
├── src/
│   ├── components/     # UI components
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── store/          # Redux store
│   ├── hooks/          # Custom hooks
│   ├── utils/          # Utilities
│   └── types/          # TypeScript types
```

## 🛠️ Available Commands

- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run linter
- `npm run type-check` - Type check

## 🐛 Troubleshooting

### Port Already in Use
If port 3000 is busy, Vite will automatically use the next available port.

### CORS Errors
Ensure your backend API Gateway has CORS enabled for `http://localhost:3000`

### Authentication Issues
- Clear browser localStorage
- Check backend is running
- Verify JWT configuration

## 📚 Next Steps

1. Explore the Dashboard
2. Add Products
3. Manage Inventory
4. Create Movements
5. Set up Locations
6. Configure Quality Controls
7. Set up Alerts

## 💡 Tips

- All API calls go through the API Gateway
- Authentication tokens are stored in localStorage
- Protected routes require login
- Toast notifications show success/error messages

Happy coding! 🎉

