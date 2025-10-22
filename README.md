# 🌱 EcoFin Carbon - Premium Sustainable Finance Platform

**Built for Capital One Hackathon** | **HackTX 2025**

EcoFin Carbon is a comprehensive web application that estimates the CO₂ footprint of each user transaction and turns it into actionable, eco-friendly finance insights. Built with Capital One's Nessie API, Auth0 authentication, MongoDB Atlas, and a hybrid emissions engine.

## ✨ **Product Pitch**

EcoFin Carbon helps people see the environmental impact of their spending and learn to finance life more sustainably. It analyzes transactions, estimates kgCO₂e, and surfaces smart suggestions and rewards to nudge greener choices without losing sight of budgets and goals.

## 🏆 **Key Features**

### **🔐 Authentication & Security**
- **Auth0 SPA Integration** with JWT tokens
- **Protected routes** with role-based access
- **Enterprise-grade security** with helmet, CORS, and rate limiting

### **💳 Capital One Integration**
- **Nessie API** for real transaction data
- **Automatic sync** of purchase history
- **Merchant normalization** and categorization

### **🌍 Hybrid Carbon Estimation Engine**
- **Unit-based calculations** (gallons, kWh, passenger-miles)
- **Spend-based calculations** (category averages)
- **Specialized logic** for airlines, gas stations, utilities
- **Confidence scoring** (high/medium/low)

### **🤖 AI-Powered Eco Coach**
- **Google Gemini** integration for personalized recommendations
- **Context-aware responses** based on spending patterns
- **Actionable suggestions** with impact estimates
- **Chat history** and conversation management

### **📊 Premium Analytics Dashboard**
- **CarbonOrbit chart** - circular visualization of emissions by category
- **Real-time metrics** with animated counters
- **Trend analysis** and progress tracking
- **Eco Score** calculation (A-F grading system)

### **🎨 Portfolio-Inspired UI/UX**
- **Framer Motion animations** with magnetic buttons and tilt cards
- **Parallax hero** with floating particles
- **Glass morphism** design language
- **Responsive design** across all devices

## 🧱 **Tech Stack**

### **Frontend**
- **React 18** + **Vite** + **TypeScript**
- **Tailwind CSS** with custom eco-friendly theme
- **shadcn/ui** components with Radix primitives
- **Framer Motion** for premium animations
- **Recharts** for data visualization
- **Zustand** for state management

### **Backend**
- **Node.js** + **Express** + **TypeScript**
- **MongoDB Atlas** with Mongoose ODM
- **Auth0 JWT** verification middleware
- **Capital One Nessie API** integration
- **Google Gemini** AI integration

### **Database Models**
- **User** - Auth0 profiles and preferences
- **Transaction** - Nessie transaction data
- **Emission** - Carbon footprint calculations
- **Chat** - AI Coach conversation history

## 🚀 **Getting Started**

### **1. Prerequisites**
- Node.js 18+ and npm
- MongoDB Atlas account
- Auth0 account
- Capital One Nessie API key
- Google Gemini API key

### **2. Installation**
```bash
# Clone the repository
git clone <repository-url>
cd hacktx

# Install all dependencies (workspace setup)
npm run install:all
```

### **3. Auth0 Setup**

#### **3.1 Create Auth0 Application**
1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Create a new **Single Page Application**
3. Configure the following settings:
   - **Allowed Callback URLs**: `http://localhost:3000`
   - **Allowed Logout URLs**: `http://localhost:3000`
   - **Allowed Web Origins**: `http://localhost:3000`
4. Save the **Domain** and **Client ID**

#### **3.2 Create Auth0 API**
1. In Auth0 Dashboard, go to **APIs** → **Create API**
2. Set **Identifier**: `https://ecofin-carbon-api`
3. Add optional scopes: `read:transactions`, `write:transactions`
4. Save the **Identifier** (this becomes your audience)

### **4. Environment Setup**
```bash
# Copy environment template
cp env.example .env

# Edit .env with your credentials:
# Frontend variables:
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=https://ecofin-carbon-api
VITE_API_BASE=/api

# Backend variables:
AUTH0_DOMAIN=your-domain.auth0.com
JWT_AUDIENCE=https://ecofin-carbon-api
JWT_ISSUER=https://your-domain.auth0.com/
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecofin-carbon
NESSIE_API_KEY=your-capital-one-nessie-api-key
LLM_API_KEY=your-google-gemini-api-key
PORT=3003
```

### **5. Run the Application**
```bash
# Start both frontend and backend
npm run dev

# Or run separately:
# Frontend: cd src && npm run dev
# Backend: cd server && npm run dev
```

### **6. Access the Application**
- **Frontend**: http://localhost:3000 (Vite dev server)
- **Backend API**: http://localhost:3003
- **Health Check**: http://localhost:3003/health

### **7. Quick Local Verification**
1. Visit http://localhost:3000
2. Click **"Sign In"** button → Auth0 hosted page should appear
3. Authenticate → redirect back to app with user data
4. Navigate to protected routes (Dashboard, Transactions, etc.)
5. Test API calls → server should accept JWT tokens and return data
6. If token invalid, check environment variables in `.env`

### **8. Auth0 Setup (seamless return-to)**
1. In Auth0 create:
   - **Application** type: Single Page App
   - **API**: create identifier (e.g. https://ecofin-carbon-api)
2. Allowed Callback URLs: `http://localhost:3000`
   Allowed Logout URLs: `http://localhost:3000`
   Allowed Web Origins: `http://localhost:3000`
3. Populate `.env`:
   - `VITE_AUTH0_DOMAIN=your-domain.auth0.com`
   - `VITE_AUTH0_CLIENT_ID=...`
   - `VITE_AUTH0_AUDIENCE=https://ecofin-carbon-api`
4. Start app. Clicking **Login** returns you to the same page you started from.
   Clicking **Logout** also returns you to the page where you clicked logout.

## 📋 **API Endpoints**

### **Authentication**
- `GET /api/users/profile` - Get user profile
- `POST /api/users/profile` - Create/update profile
- `PUT /api/users/preferences` - Update preferences

### **Transactions**
- `GET /api/transactions/sync` - Sync from Nessie API
- `GET /api/transactions` - Get user transactions
- `GET /api/transactions/:id` - Get specific transaction

### **Carbon Emissions**
- `POST /api/emissions/calc` - Calculate emissions
- `GET /api/emissions/summary` - Get emissions summary

### **AI Coach**
- `POST /api/coach` - Ask EcoCoach a question
- `GET /api/coach/history` - Get chat history

## 🧮 **Carbon Calculation Methods**

### **1. Spend-Based Estimation (Primary Method)**
- **Category mapping**: Automatic merchant classification via MCC codes
- **Emission factors**: kgCO₂e per dollar spent by category
- **Dollar amount × category factor**: Pragmatic estimation approach
- **Confidence scoring**: Based on category specificity and data quality

### **2. Category-Specific Factors**
- **Restaurant**: 0.80 kgCO₂e per $ (food service & dining)
- **Grocery**: 0.45 kgCO₂e per $ (supermarkets & food stores)
- **Fashion**: 1.60 kgCO₂e per $ (clothing & apparel)
- **Electronics**: 0.70 kgCO₂e per $ (tech & gadgets)
- **Transport**: 2.50 kgCO₂e per $ (gas, rideshare, transit)
- **Travel**: 3.20 kgCO₂e per $ (flights, hotels, tourism)
- **Entertainment**: 0.55 kgCO₂e per $ (movies, events, games)
- **Utilities**: 0.30 kgCO₂e per $ (electricity, water, gas)
- **General**: 0.35 kgCO₂e per $ (default for unknown categories)

### **3. MCC Code Mapping**
- **5812**: Restaurant (eating places and restaurants)
- **5411**: Grocery (grocery stores, supermarkets)
- **5651**: Fashion (clothing stores)
- **5732**: Electronics (electronics stores)
- **4111**: Transport (transportation services)
- **4511**: Travel (airlines, air carriers)
- **7999**: Entertainment (recreation services)
- **4900**: Utilities (utilities)

## 🎨 **Design System**

### **Color Palette**
- **Primary**: Eco green (#22c55e)
- **Secondary**: Carbon gray (#64748b)
- **Accent**: Blue, purple, amber variants
- **Glass**: White/10 backdrop blur

### **Typography**
- **Primary**: Inter (clean, modern)
- **Monospace**: JetBrains Mono (data)

### **Animations**
- **Magnetic buttons**: Cursor-following spring physics
- **Tilt cards**: 3D perspective transforms
- **Parallax scrolling**: Multi-layer depth
- **Particle effects**: Floating eco-themed elements

## 🔒 **Security Features**

- **JWT token verification** with Auth0
- **Rate limiting** (100 requests/15min)
- **CORS protection** with whitelist
- **Helmet security headers**
- **Input validation** and sanitization
- **Error handling** with fallbacks

## 📊 **Demo Workflow**

1. **Landing Page** → Beautiful parallax hero with animations
2. **Auth0 Login** → Secure authentication flow
3. **Dashboard** → Real-time carbon metrics and CarbonOrbit chart
4. **Import Transactions** → Sync with Capital One Nessie API
5. **Calculate Emissions** → Spend-based estimation engine
6. **AI Coach** → Ask questions and get personalized recommendations
7. **Insights** → Detailed analytics and trend analysis
8. **Methodology** → Transparent explanation of carbon calculation methods

## 🏁 **Hackathon Success Criteria**

### **✅ Innovation**
- Spend-based carbon estimation engine
- AI-powered sustainability coaching
- Capital One Nessie API integration
- Portfolio-inspired animations

### **✅ Impact**
- Clear actions to reduce weekly emissions
- Budget-conscious recommendations
- Community-driven insights

### **✅ UX Excellence**
- Fast, beautiful, accessible interface
- Confident storytelling in 2-3 min demo
- Smooth animations and interactions

### **✅ Technical Excellence**
- Secure authentication and API design
- Modular, scalable architecture
- Real data flow with error handling
- Clean, maintainable code

## 🚀 **Deployment**

### **Frontend (Vercel)**
```bash
cd src
npm run build
# Deploy to Vercel
```

### **Backend (Render/Railway)**
```bash
cd server
npm run build
# Deploy to Render or Railway
```

## 📈 **Future Enhancements**

- **Real-time notifications** for high-emission purchases
- **Carbon offset marketplace** integration
- **Social features** and community challenges
- **Mobile app** development
- **Advanced ML** for better predictions
- **Multi-currency** and international support

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License.

## 🙏 **Acknowledgments**

- **Capital One** for the Nessie API
- **Auth0** for authentication services
- **Google** for Gemini AI integration
- **MongoDB** for database hosting
- **HackTX** for the hackathon platform

---

**Built with ❤️ for a sustainable future** 🌱

