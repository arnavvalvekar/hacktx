# 🌱 EcoFin Carbon - Premium Sustainable Finance Platform

**Built for Capital One Hackathon** | **HackTX 2024**

EcoFin Carbon is a comprehensive web application that estimates the CO₂ footprint of each user transaction and turns it into actionable, eco-friendly finance insights. Built with Capital One's Nessie API, Auth0 authentication, MongoDB Atlas, and a hybrid emissions engine.

## ✨ **Product Pitch**

EcoFin Carbon helps people see the environmental impact of their spending and learn to finance life more sustainably. It analyzes transactions, estimates kgCO₂e, and surfaces smart suggestions and rewards to nudge greener choices—without losing sight of budgets and goals.

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
- **Claude 3 Sonnet** integration for personalized recommendations
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
- **Anthropic Claude** AI integration

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
- Anthropic API key

### **2. Installation**
```bash
# Clone the repository
git clone <repository-url>
cd ecofin-carbon

# Install dependencies
npm install
cd src && npm install
cd ../server && npm install
cd ..
```

### **3. Environment Setup**
```bash
# Copy environment template
cp env.example .env

# Edit .env with your credentials:
# - Auth0 domain, client ID, audience
# - MongoDB Atlas connection string
# - Capital One Nessie API key
# - Anthropic API key
```

### **4. Run the Application**
```bash
# Start both frontend and backend
npm run dev

# Or run separately:
# Frontend: cd src && npm run dev
# Backend: cd server && npm run dev
```

### **5. Access the Application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Health Check**: http://localhost:8080/health

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

### **1. Unit-Based (High Confidence)**
- **Fuel**: Gallons × EPA emission factors
- **Electricity**: kWh × regional grid intensity
- **Air Travel**: Passenger-miles × ICAO factors
- **Food**: Kilograms × lifecycle study factors

### **2. Spend-Based (Medium Confidence)**
- **Category mapping**: Automatic merchant classification
- **Lifecycle factors**: EXIOBASE economic data
- **Dollar amount × category factor**: Pragmatic estimation

### **3. Specialized Logic (Variable Confidence)**
- **Gas stations**: Estimate gallons from amount
- **Airlines**: Estimate passenger-miles from amount
- **Utilities**: Direct energy consumption mapping

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
5. **Calculate Emissions** → Hybrid estimation engine
6. **AI Coach** → Ask questions and get personalized recommendations
7. **Insights** → Detailed analytics and trend analysis

## 🏁 **Hackathon Success Criteria**

### **✅ Innovation**
- Hybrid carbon estimation engine
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
- **Anthropic** for Claude AI integration
- **MongoDB** for database hosting
- **HackTX** for the hackathon platform

---

**Built with ❤️ for a sustainable future** 🌱

