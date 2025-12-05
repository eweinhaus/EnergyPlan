# Tech Context: Technologies & Development Setup

## Technology Stack

### Frontend
- **Framework**: Next.js 14.2+ with App Router
- **Language**: TypeScript 5.5+
- **UI Library**: React 18.3+
- **Styling**: Tailwind CSS 3.4+
- **Build Tool**: Next.js built-in (Webpack/Turbopack)

### Backend
- **Runtime**: Node.js 18.17+ (LTS) - tested with Node.js 25.1.0
- **Framework**: Next.js API Routes
- **Processing**: In-memory Node.js processing
- **No Database**: MVP uses in-memory data only

### XML Processing
- **Library**: fast-xml-parser 5.3.2
- **Format**: Green Button ESPI (Energy Services Provider Interface)
- **Parsing**: Handles both namespaced and non-namespaced XML structures

### Development Tools
- **Package Manager**: npm
- **Type Checking**: TypeScript compiler (strict mode)
- **Linting**: ESLint with Next.js config
- **CSS Processing**: PostCSS with Autoprefixer

## Development Environment Setup

### Prerequisites
- Node.js 18.17+ installed (tested with 25.1.0)
- npm package manager
- Git for version control

### Installation Steps
```bash
# Clone repository
git clone <repository-url>
cd EnergyPlan

# Install dependencies
npm install

# Setup environment variables
cp .env.local.example .env.local
# Edit .env.local with API keys (optional for MVP - uses mock data)

# Run development server
npm run dev
```

### Environment Variables
```env
# .env.local
NEXT_PUBLIC_APP_URL=http://localhost:3000
EIA_API_KEY=your_eia_api_key_here  # EIA Open Data API key (get from https://www.eia.gov/opendata/register.php)
# Legacy support: UTILITY_API_KEY can be used as fallback if EIA_API_KEY is not set
```

**Note**: 
- EIA API provides statistical energy data (not retail supplier/plan catalogs)
- Supplier and plan data are currently static/mock data
- For MVP testing, the application uses mock data if API keys are not provided

## Project Structure

```
EnergyPlan/
├── app/
│   ├── api/
│   │   └── process-data/
│   │       └── route.ts          # API endpoint for processing
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main page with form flow
├── components/
│   ├── form/                     # Form step components
│   │   ├── Step1Welcome.tsx
│   │   ├── Step2CurrentPlan.tsx
│   │   ├── Step3FileUpload.tsx
│   │   ├── Step4Preferences.tsx
│   │   └── Step5Review.tsx
│   ├── recommendations/          # Results display
│   │   ├── RecommendationCard.tsx
│   │   └── RecommendationList.tsx
│   └── ui/                       # Reusable UI components
│       ├── Alert.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       └── ProgressBar.tsx
├── lib/
│   ├── apiClients.ts             # API integration clients
│   ├── dataValidation.ts         # Data validation utilities
│   ├── recommendationEngine.ts   # Recommendation algorithm
│   ├── types.ts                  # TypeScript type definitions
│   └── xmlParser.ts              # Green Button XML parser
├── memory-bank/                  # Project documentation (ignored by git)
├── planning/                     # Planning documents (ignored by git)
├── samples/                      # Sample XML files for testing
├── monitor-deployment.js         # Render MCP monitoring script
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── render.yaml                   # Render deployment config
├── DEPLOYMENT.md                 # Deployment guide
└── README.md                     # Main documentation (tracked by git)
```

## Deployment Monitoring

### Render MCP Monitoring Script
- **monitor-deployment.js**: Automated deployment monitoring and management
- **Purpose**: Provides programmatic access to Render deployment status, logs, and metrics
- **Commands**: status, logs, metrics, deploy
- **Integration**: Uses Render MCP tools for automated monitoring
- **Service ID**: Configured for production deployment monitoring

### .gitignore Configuration
- **Documentation Exclusion**: planning/ and memory-bank/ directories excluded from version control
- **Rationale**: Documentation files are version-controlled separately or not needed in repo
- **Exception**: README.md is tracked as main project documentation

### Production Dependencies
```json
{
  "fast-xml-parser": "^5.3.2",
  "next": "^14.2.0",
  "react": "^18.3.1",
  "react-dom": "^18.3.1"
}
```

### Development Dependencies
```json
{
  "@types/node": "^20.14.0",
  "@types/react": "^18.3.0",
  "@types/react-dom": "^18.3.0",
  "autoprefixer": "^10.4.0",
  "eslint": "^8.57.0",
  "eslint-config-next": "^14.2.0",
  "postcss": "^8.4.0",
  "tailwindcss": "^3.4.0",
  "typescript": "^5.5.0"
}
```

## Technical Constraints

### Runtime Constraints
- **Node.js Version**: Must be 18.17+ (LTS) - tested with 25.1.0
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **File Size Limits**: Maximum 10MB XML files
- **Memory**: Efficient processing for large XML files (<50MB estimated)

### API Constraints
- **Rate Limits**: EIA API rate limits (handled with caching and retry logic)
- **Timeout**: API calls timeout after reasonable duration
- **Fallback**: Mock data used if APIs unavailable (MVP default)
- **EIA API**: Provides statistical data only, not retail supplier/plan catalogs

### Data Constraints
- **Minimum Data**: 6 months of usage data required
- **Format**: Green Button ESPI format XML only
- **Validation**: Comprehensive validation prevents invalid data processing

## Development Workflow

### Local Development
```bash
# Start development server
npm run dev
# Server runs on http://localhost:3000

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Testing Scripts
```bash
# Integration tests
node test-integration.js

# Performance tests
node test-performance.js

# Accessibility validation
node test-accessibility.js

# Deployment monitoring
node monitor-deployment.js [command]
```

### Code Organization
- **Components**: Organized by feature (form, recommendations, ui)
- **Lib Utilities**: Shared business logic and utilities
- **API Routes**: Next.js API route handlers
- **Types**: Centralized TypeScript definitions

## External Integrations

### EIA Open Data API
- **Purpose**: U.S. Energy Information Administration statistical energy data
- **Authentication**: API key via environment variable (`EIA_API_KEY`)
- **Base URL**: `https://api.eia.gov/v2`
- **Documentation**: https://www.eia.gov/opendata/
- **Registration**: https://www.eia.gov/opendata/register.php
- **Status**: ✅ Integrated and tested (December 2025)
- **Note**: EIA provides aggregate statistical data, not retail supplier/plan catalogs
- **Implementation**: `lib/apiClients.ts` includes `fetchEIAWithRetry()` and `getTexasAverageElectricityPrice()` functions

### Supplier & Plan Data
- **Current Status**: Static/mock data (EIA doesn't provide retail supplier catalogs)
- **Location**: Defined in `lib/apiClients.ts`
- **Rationale**: EIA API provides statistical data, not individual retail energy supplier/plan information
- **Future**: Could be replaced with retail supplier API or database in Phase 2

### Mock Data
- **Fallback**: Used when APIs unavailable or for testing
- **Format**: Matches real API response structure
- **Location**: Defined in `lib/apiClients.ts`
- **Status**: Fully functional for MVP testing

## Deployment

### Hosting Platform
- **Platform**: Render web service
- **Deployment**: Successfully deployed and live in production
- **Configuration**: `render.yaml` file included
- **Environment**: Production environment variables configured and active

### Build Configuration
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Node Version**: 18.x (or higher)
- **Environment Variables**: Set in Render dashboard

### Deployment Process
1. Push code to GitHub main branch
2. Render automatically builds and deploys
3. Environment variables configured in Render dashboard
4. Application available at Render-provided URL

### Deployment Files
- **render.yaml**: Render service configuration
- **DEPLOYMENT.md**: Complete deployment guide
- **monitor-deployment.js**: Render MCP monitoring script
- **.env.local.example**: Environment variable template

## Development Best Practices

### TypeScript
- **Strict Mode**: Enabled for type safety
- **Type Definitions**: Comprehensive interfaces for all data structures
- **No `any` Types**: Avoid `any` unless absolutely necessary
- **Type Naming**: EnergyPlanFormData (not FormData to avoid conflicts)

### Code Style
- **ESLint**: Next.js recommended rules
- **Formatting**: Consistent code formatting
- **Comments**: Clear documentation for complex logic
- **File Organization**: Logical grouping by feature

### Testing Approach
- **Integration Tests**: Node.js scripts for core functionality
- **Performance Tests**: Validation scripts for benchmarks
- **Accessibility Tests**: Automated validation scripts
- **Manual Testing**: Browser testing with Cursor browser tools
- **Type Checking**: TypeScript compiler validation
- **Build Validation**: Ensure production builds succeed

## Performance Considerations

### Optimization Strategies
- **Code Splitting**: Automatic with Next.js
- **Bundle Size**: Optimized for fast initial load
- **Lazy Loading**: Components loaded as needed
- **Efficient Parsing**: fast-xml-parser for XML processing
- **Caching**: In-memory cache for supplier data

### Performance Targets (All Met ✅)
- **Page Load**: <3 seconds (target met)
- **Processing**: <10 seconds for recommendation generation (target met)
- **File Upload**: Support up to 10MB XML files
- **Memory**: Efficient processing (<50MB estimated)

### Monitoring
- **Error Tracking**: Basic error logging (future: Sentry)
- **Performance**: Monitor response times and processing duration
- **User Analytics**: Track form completion and drop-off points

## Future Technical Enhancements

### Phase 2 (Post-MVP)
- **Database**: PostgreSQL + TimescaleDB for persistence
- **Caching**: Redis for frequently accessed data
- **Background Jobs**: Queue-based processing (Bull/BullMQ)
- **Testing**: Jest unit tests, Playwright E2E tests
- **Retail Supplier API**: Replace static supplier/plan data with real retail energy supplier API
- **EIA Integration Enhancement**: Expand EIA API usage for market statistics and validation

### Phase 3 (Advanced)
- **Microservices**: Separate services for processing
- **ML Integration**: Machine learning for recommendations
- **Real-Time**: WebSocket support for live updates
- **Monitoring**: Comprehensive observability (DataDog/New Relic)

## Key Technical Decisions

### XML Parsing
- **Library Choice**: fast-xml-parser (not DOMParser) for Node.js compatibility
- **Rationale**: DOMParser not available in Node.js server environment
- **Implementation**: Handles both namespaced (`espi:`) and non-namespaced elements

### Type Safety
- **FormData Conflict**: Renamed to EnergyPlanFormData to avoid browser FormData conflict
- **Strict TypeScript**: All types properly defined
- **No `any` Types**: Comprehensive type coverage

### State Management
- **React Hooks**: useState for form state
- **localStorage**: Session persistence (cleared on browser close)
- **No External Libraries**: Pure React state management
