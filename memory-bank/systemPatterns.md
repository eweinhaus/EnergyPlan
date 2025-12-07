# System Patterns: Architecture & Design Decisions

## System Architecture

### High-Level Architecture
```
Current (MVP): User Browser → Next.js Frontend → Next.js API Routes → In-Memory Processing
                                                      ↓
                                    XML Parser (fast-xml-parser) → Recommendation Engine
                                                      ↓
                                    Background Sync → EIA Open Data API (Statistical Data)
                                                      ↓
                                    Static Supplier/Plan Data (EIA doesn't provide retail catalogs)

Future (Phase 2): User Browser → Firebase Hosting → Firebase Functions (Next.js SSR)
                                                      ↓
                                    Firebase Auth → Firestore Database → User Data Persistence
                                                      ↓
                                    XML Parser (fast-xml-parser) → Recommendation Engine
                                                      ↓
                                    EIA Open Data API + Real Retail Supplier APIs
```

### Component Structure
- **Frontend**: Single-page React application with progressive form steps (5 steps)
- **Backend**: Next.js API routes for data processing with scenario calculations
- **Processing**: In-memory Node.js processing with contract timing analysis
- **Authentication**: Firebase Auth for user accounts (Phase 2 - implemented, optional)
- **Database**: Firestore for user data, recommendations, and audit logs (Phase 2 - implemented, optional)
- **External APIs**: EIA Open Data API for energy statistics, Genability API support (integrated December 2025)
- **Supplier/Plan Data**: Static/mock data (MVP), Genability API support (requires Arcadia subscription)
- **Scenario Engine**: Cost analysis with Stay Current, Switch Now, Wait & Switch calculations

## Key Technical Decisions

### Monolithic Architecture (MVP)
- **Single Next.js App**: Frontend, API, and processing in one application
- **Rationale**: Simplifies MVP development, easier deployment, sufficient for validation
- **Future**: Will separate into services as scale increases

### In-Memory Processing
- **No Database**: All data processed in memory during session
- **Background Cache**: Supplier data cached in memory with periodic refresh
- **Rationale**: MVP doesn't require persistence, simplifies architecture
- **Future**: PostgreSQL + TimescaleDB for production

### Single-Session Webapp
- **No Authentication**: Users don't need accounts
- **localStorage Persistence**: Form data saved during session only (cleared on browser close)
- **Rationale**: Reduces complexity, focuses on core recommendation value
- **Future**: User accounts and data persistence in Phase 2

### Fixed-Rate Plans Only
- **Simplest Rate Structure**: Focus on basic fixed-rate calculations
- **Rationale**: Validates core algorithm without complexity
- **Future**: Tiered, TOU, and variable rates in Phase 2

### XML Parser Choice
- **fast-xml-parser**: Used instead of DOMParser for Node.js compatibility
- **Rationale**: DOMParser not available in Node.js server environment
- **Implementation**: Handles both namespaced (`espi:`) and non-namespaced XML elements

## Design Patterns

### Form State Management
- **React useState**: Single state object for all form data (`EnergyPlanFormData`)
- **Step-Based Navigation**: Controlled step progression with validation (5 steps + results view)
- **localStorage Backup**: Auto-save form progress during session (cleared on close)
- **Consent Management**: ConsentBanner manages GDPR consent preferences with localStorage persistence
- **Data Transparency**: DataProcessingTransparency component shows data collection details at each step

### Data Processing Pipeline
```
XML File → Parse (fast-xml-parser) → Validate → Aggregate → Calculate Costs → Score Plans → Select Top 3
```

### Enhanced Recommendation Algorithm Pattern
1. **Cost Calculation**: Annual cost for each plan based on usage
   ```typescript
   annualCost = sum(monthlyUsage × rate + deliveryFees + adminFees)
   ```
2. **Contract Analysis**: Process optional contract terms (fee + end date)
   ```typescript
   contractTerms = { earlyTerminationFee, contractEndDate }
   ```
3. **Scenario Calculation**: Generate three cost scenarios for each plan
   ```typescript
   scenarios = calculateCostScenarios(plan, currentPlanCost, contractTerms)
   // Stay Current, Switch Now (+fee), Wait & Switch (prorated)
   ```
4. **Scoring**: Weighted score based on preferences (cost + renewable + additional criteria)
   ```typescript
   score = (costWeight × normalizedSavings) + (renewableWeight × normalizedRenewable) + additionalPreferences
   ```
5. **Top Selection**: Select top 3 highest-scoring plans (pure preference-based)
6. **Scenario Enhancement**: Add scenario data to recommendations
   ```typescript
   planWithScenarios = createPlanWithScenarios(plan, currentPlanCost, contractTerms)
   ```
7. **Explanation Generation**: Context-aware explanations including scenario recommendations

### Error Handling Pattern
- **Validation at Each Step**: Prevent invalid data progression
- **Graceful Degradation**: Fallback to mock data if APIs fail
- **Clear User Feedback**: Actionable error messages with recovery paths
- **Data Quality Indicators**: Show confidence levels based on data completeness

## Component Relationships

### Frontend Components
```
page.tsx (Main)
├── ProgressBar
├── ConsentBanner (GDPR consent management)
├── DataProcessingTransparency (shows at each step)
├── Step1Welcome
├── Step2CurrentPlan (includes contract details: earlyTerminationFee, contractEndDate)
├── Step3FileUpload
├── Step4Preferences
├── Step4Review (Step 5 - final review)
└── RecommendationList (after processing, Step 6)
    └── RecommendationCard (×3)
```

### Backend Processing
```
/api/process-data/route.ts
├── xmlParser.ts (Parse Green Button XML with fast-xml-parser)
├── dataValidation.ts (Validate inputs and usage data)
├── apiClients.ts (Fetch supplier data - mock for MVP)
└── recommendationEngine.ts (Generate recommendations)
```

### Data Flow
```
Form Data + XML File + Contract Terms (optional)
    ↓
API Route (/api/process-data)
    ↓
XML Parser (fast-xml-parser) → ParsedUsageData
    ↓
Data Validation → Validated Data
    ↓
API Clients → Supplier & Plan Data (mock for MVP)
    ↓
Recommendation Engine → Cost Calculations → Scenario Analysis → Top 3 Enhanced Recommendations
    ↓
Results Display (RecommendationList + RecommendationCard with Scenario Comparison)
```

## Key Implementation Patterns

### XML Parsing Pattern
- **fast-xml-parser**: Library for Node.js XML parsing
- **Error Recovery**: Handle malformed XML gracefully
- **Data Extraction**: Hourly readings → monthly aggregates
- **Quality Assessment**: Evaluate data completeness and reliability
- **Namespace Handling**: Supports both `espi:` namespaced and non-namespaced elements

### Cost Calculation Pattern
```typescript
for each month in usageData.monthlyTotals:
  energyCost = (plan.rate / 100) * month.totalKwh  // Convert cents to dollars
  fixedFees = plan.fees.delivery + plan.fees.admin
  monthlyCost = energyCost + fixedFees
  totalCost += monthlyCost

annualCost = totalCost
savings = currentPlanAnnualCost - recommendedPlanAnnualCost
```

### Scoring Pattern
```typescript
// Normalize values to 0-1 scale
normalizedSavings = Math.min(Math.max(savings / 500, 0), 1)  // Cap at $500
normalizedRenewable = renewablePercentage / 100
supplierRating = supplier.rating / 5  // Normalize 1-5 to 0-1

// Weighted score
costScore = costWeight * normalizedSavings
renewableScore = renewableWeight * normalizedRenewable
supplierScore = 0.1 * supplierRating  // 10% weight

score = costScore + renewableScore + supplierScore
```

### API Integration Pattern
- **EIA API Integration**: ✅ Implemented with retry logic and error handling
- **Retry Logic**: 3 attempts with exponential backoff
- **Caching**: Background sync with in-memory cache (1 hour duration)
- **Fallback**: Mock/static data if APIs unavailable (MVP default)
- **Error Handling**: Clear error messages for users
- **Data Source**: EIA provides statistical data; supplier/plan data is static

### Top Selection Pattern
```typescript
1. Sort plans by score (highest first)
2. Select top 3 highest-scoring plans
3. No forced diversity constraints - pure preference-based selection
4. User preferences for supplier variety handled through scoring weights
```

## Scalability Considerations

### Current (MVP) Limitations
- Single server instance
- In-memory processing (no persistence)
- Synchronous processing
- Limited concurrent users
- Static supplier/plan data (EIA doesn't provide retail catalogs)
- EIA API integrated but used for statistical data only

### Future Architecture (Post-MVP)
- **Service Separation**: Background workers for heavy processing
- **Database Layer**: PostgreSQL for persistence, TimescaleDB for time-series
- **Caching**: Redis for frequently accessed data
- **Async Processing**: Queue-based job processing
- **Horizontal Scaling**: Multiple server instances with load balancing
- **Retail Supplier API**: Replace static supplier/plan data with real retail energy supplier API
- **EIA Integration Enhancement**: Expand EIA API usage for market context and validation

## Security & Privacy Patterns

### Data Handling
- **No Persistence**: Data cleared after session (MVP)
- **TLS Encryption**: All external communications encrypted
- **Input Sanitization**: Validate and sanitize all user inputs
- **API Key Security**: Environment variables for sensitive credentials
- **File Validation**: XML format and size validation before processing

### Privacy Compliance
- **Consent Management**: ConsentBanner component for GDPR-compliant consent with granular options (necessary, analytics, data processing, marketing)
- **Data Transparency**: DataProcessingTransparency component shows what data is collected, how it's processed, legal basis, and retention at each step
- **Data Minimization**: Only collect necessary data
- **Transparency**: Clear data usage explanations at each form step
- **Session-Only**: Data cleared when browser closes
- **Consent Storage**: Consent preferences stored in localStorage with versioning

## Performance Patterns

### Optimization Strategies
- **Lazy Loading**: Load components and data as needed
- **Efficient Parsing**: fast-xml-parser for large XML files
- **Caching**: Cache supplier data to reduce API calls
- **Code Splitting**: Automatic with Next.js
- **Bundle Optimization**: Minimize initial bundle size

### Performance Targets (All Met ✅)
- **Page Load**: <3 seconds initial, <1 second subsequent ✅
- **Processing**: <10 seconds for recommendation generation ✅
- **File Upload**: Support up to 10MB XML files ✅
- **Memory**: Efficient processing without excessive memory use (<50MB) ✅

## Type Safety Patterns

### Type Naming
- **EnergyPlanFormData**: Form data type (not `FormData` to avoid browser conflict)
- **ParsedUsageData**: Processed XML usage data
- **Recommendation**: Final recommendation with plan and explanation
- **PlanWithCosts**: Plan with calculated annual cost and savings

### Type Organization
- **Centralized Types**: All types in `lib/types.ts`
- **Strict TypeScript**: No `any` types, comprehensive interfaces
- **Type Safety**: Full type coverage for all data structures

## Testing Patterns

### Integration Testing
- **Node.js Scripts**: Simple test scripts for core functionality
- **Mock Data**: Test with sample XML files and mock API responses
- **Validation**: Verify calculations and data processing

### Performance Testing
- **Benchmark Scripts**: Measure processing times and memory usage
- **Target Validation**: Ensure performance targets are met
- **Load Testing**: Test with various file sizes and data volumes

### Accessibility Testing
- **Automated Validation**: Scripts to check ARIA labels and semantic HTML
- **Manual Testing**: Browser testing with accessibility tools
- **WCAG Compliance**: Basic compliance (MVP level)

## Error Recovery Patterns

### XML Parsing Errors
- **Format Validation**: Check XML structure before parsing
- **Graceful Failure**: Clear error messages for invalid XML
- **Partial Data**: Handle incomplete XML files when possible

### API Errors
- **Retry Logic**: 3 attempts with exponential backoff
- **Fallback**: Mock data if APIs unavailable
- **User Feedback**: Clear messages about API issues

### Validation Errors
- **Step-by-Step**: Validate at each form step
- **Clear Messages**: Specific error messages for each field
- **Recovery**: Allow users to fix errors and continue
