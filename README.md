# Carbon Footprint Tracker 🌱

A modern web application that helps users understand the environmental impact of their everyday spending by estimating CO₂ emissions tied to each transaction. Built with inspiration from successful HackTX projects like [wampusfyi](https://github.com/siddharth-iyer1/wampusfyi) and [AIAIO](https://github.com/lryanle/aiaio).

## Inspiration

Understanding your carbon footprint through financial transactions can be challenging, especially with limited access to comprehensive emission data for everyday purchases. Popular financial platforms often fall short in providing environmental insights that users need. Driven by the success of crowdsourced data approaches like wampusfyi, we decided to address this challenge directly by creating a collaborative platform for carbon footprint tracking.

## What it does

Our platform encourages users to share their transaction data, creating a collaborative space where users can access comprehensive information about carbon emissions, spending patterns, and environmental impact. By consolidating this data, we build a robust dataset that provides insights typically unavailable to individual users.

### Key Features:

* **Real-time Carbon Tracking**: Calculate CO₂ emissions for financial transactions
* **Crowdsourced Data Collection**: Users contribute transaction data to improve accuracy
* **Multiple Calculation Methods**: Unit-based, spend-based, and hybrid approaches
* **Data Quality Metrics**: Verification system ensures reliable information
* **Interactive Analytics**: Comprehensive dashboards with trends and insights
* **Location-based Insights**: Geographic context for better understanding

## How we built it

### Frontend Development (Inspired by AIAIO):
We built a modern React application using Next.js 14 with TypeScript, following the successful patterns from the AIAIO project. The frontend features:
- **Tailwind CSS** for responsive, modern styling
- **Recharts** for interactive data visualizations
- **Lucide React** for consistent iconography
- **Component-based architecture** for maintainability

### Data Collection System (Inspired by wampusfyi):
Following wampusfyi's crowdsourced approach, we implemented:
- **User-submitted transaction data** with verification processes
- **Merchant categorization** and automatic classification
- **Data quality scoring** to ensure reliability
- **Community-driven insights** based on aggregated data

### Carbon Calculation Engine:
We developed a sophisticated calculation system with:
- **Unit-based factors**: EPA, ICAO, and lifecycle study data
- **Spend-based factors**: Economic input-output multipliers
- **Hybrid approach**: Combines both methods with confidence scoring
- **Merchant mapping**: 50+ common businesses with category classification

### Technology Stack:
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom eco-friendly theme
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **State Management**: React hooks and context

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles with eco-friendly theme
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Main page with tab navigation
├── components/            # React components
│   ├── Dashboard.tsx      # Main dashboard with metrics
│   ├── TransactionList.tsx # Transaction history with filtering
│   ├── CarbonInsights.tsx  # Analytics and trend analysis
│   ├── DataCollection.tsx  # Crowdsourced data submission
│   └── Navigation.tsx      # Navigation component
├── types/                 # TypeScript type definitions
│   └── index.ts          # Enhanced type definitions
├── utils/                 # Utility functions
│   └── carbonCalculator.ts # Carbon calculation logic
└── package.json          # Dependencies and scripts
```

## Carbon Calculation Methods

### 1. Unit-Based Calculation (High Confidence)
Used when transaction includes clear physical units:
- **Fuel purchases**: Gallons × EPA emission factors
- **Airline tickets**: Passenger-miles × ICAO factors
- **Utility bills**: kWh × regional electricity factors
- **Food items**: Kilograms × lifecycle study factors

### 2. Spend-Based Calculation (Medium Confidence)
Used for most retail transactions:
- **Merchant category mapping**: Automatic classification
- **Lifecycle emission factors**: EXIOBASE and economic data
- **Dollar amount × category factor**: Pragmatic estimation

### 3. Hybrid Approach (Variable Confidence)
Combines both methods with intelligent fallback:
- **Prefers unit-based** when physical data available
- **Falls back to spend-based** for retail transactions
- **Confidence scoring** based on data quality and method

## Data Sources & Quality

The application uses emission factors from authoritative sources:
- **EPA**: Fuel and utility emissions
- **ICAO**: Aviation emissions and passenger-mile data
- **EXIOBASE**: Economic input-output multipliers
- **Lifecycle Studies**: Food and product emissions
- **Crowdsourced Data**: User-submitted transaction verification

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

4. **Explore Features**
   - View your carbon footprint dashboard
   - Browse transaction history
   - Analyze insights and trends
   - Contribute to our crowdsourced database

## What's next for Carbon Footprint Tracker

### Phase 1: Beta Testing and Data Collection
Our immediate focus is on expanding our crowdsourced dataset through beta testing. We're concentrating on accumulating transaction data for common spending categories, ensuring users can access relevant and accurate carbon footprint information.

### Phase 2: Capital One API Integration
Post-beta, we plan to integrate with the Capital One API for real-time transaction processing, automating carbon footprint calculations and providing seamless user experiences.

### Phase 3: Enhanced Analytics and Recommendations
Our long-term vision includes implementing AI-powered recommendations for reducing carbon footprints, analyzing spending patterns, and forecasting environmental impact trends.

### Phase 4: Community Building and Expansion
As our platform grows, we aim to foster a community of environmentally conscious users who actively contribute to our carbon footprint database, creating a self-sustaining ecosystem of environmental awareness.

## Contributing

We welcome contributions from the community! Inspired by the collaborative spirit of HackTX projects:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Acknowledgments

This project draws inspiration from successful HackTX projects:
- [wampusfyi](https://github.com/siddharth-iyer1/wampusfyi) - For crowdsourced data collection approach
- [AIAIO](https://github.com/lryanle/aiaio) - For modern React/TypeScript architecture

## License

This project is licensed under the MIT License.
