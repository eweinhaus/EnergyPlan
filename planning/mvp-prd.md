# AI Energy Plan Recommendation Agent - MVP PRD

**Organization:** Arbor
**Project ID:** 85twgWvlJ3Z1g6dpiGy5_1762214728178
**Version:** MVP v1.0
**Date:** December 2025

---

# Product Requirements Document (MVP)

## 1. Executive Summary

The **AI Energy Plan Recommendation Agent MVP** is a single-page web application that demonstrates the core value proposition of personalized energy plan recommendations. This MVP focuses on Texas residential customers, analyzing their Green Button XML usage data and basic preferences to recommend the top three optimal fixed-rate energy plans from available suppliers.

The MVP aims to validate the core recommendation algorithm and user experience, providing a foundation for future expansion to additional markets and rate structures.

## 2. Problem Statement

Texas residential energy consumers face overwhelming choices in the deregulated energy market, with dozens of suppliers offering complex fixed-rate plans. Without tools to compare options systematically, customers struggle to identify plans that match their usage patterns and preferences, often leading to suboptimal choices or decision paralysis.

The MVP addresses this by providing a simple, focused tool that processes real usage data and generates personalized recommendations, validating whether this approach can effectively guide customers to better energy plan decisions.

## 3. Goals & Success Metrics

### Primary Goals
- **Validate Core Algorithm**: Demonstrate that usage-based recommendations produce accurate cost savings estimates
- **Prove Technical Feasibility**: Build working XML processing and API integrations
- **Establish User Value**: Create a functional tool that customers can use to compare plans

### Success Metrics (MVP)
- **Technical Validation**: >95% accuracy against manual calculations
- **Functional Completeness**: End-to-end flow works without major bugs for test scenarios
- **Performance**: <10 seconds for recommendation generation, <3 seconds page load
- **User Experience**: >80% form completion rate, clear recommendation display

### Go/No-Go Criteria
- XML processing handles real Green Button files reliably
- API integration provides current Texas supplier data
- Recommendation engine produces valid cost projections
- End-to-end user flow works without critical errors

## 4. Target Users & Personas

### Primary MVP Users
**Texas Residential Energy Consumers** who:
- Have access to Green Button XML usage data
- Are considering switching energy suppliers
- Want to understand cost savings potential
- Prefer simple, focused recommendations over complex analysis

### User Pain Points Addressed
- Difficulty comparing multiple supplier options manually
- Uncertainty about which plans match their usage patterns
- Lack of tools to calculate realistic cost savings
- Information overload from supplier websites

## 5. User Stories

### Core MVP Stories
1. **As a Texas homeowner**, I want to upload my Green Button XML file so that the system can analyze my actual usage patterns.

2. **As a customer comparing plans**, I want to enter my current plan details so that the system can calculate potential savings.

3. **As someone with cost priorities**, I want to specify my preferences for cost savings and renewable energy so that recommendations match my priorities.

4. **As a user seeking recommendations**, I want to see 3 clear plan options with cost savings estimates so that I can make an informed decision.

## 6. Functional Requirements

### P0: Must-have (MVP Core Features)

#### Input Collection (Single Page Form)
- **5-Step Progressive Form**:
  - Step 1: Welcome & privacy consent
  - Step 2: Current plan details (supplier, rate, contract info)
  - Step 3: Green Button XML file upload with validation
  - Step 4: Basic preferences (cost priority, renewable preference)
  - Step 5: Review & submit

- **Form Validation**:
  - Required field validation
  - File format validation (XML only)
  - Data range validation
  - Business logic validation

#### Data Processing
- **XML Parsing**: Robust Green Button ESPI format parsing with error handling
- **Usage Aggregation**: Convert hourly data to monthly totals with validation
- **Supplier Data Integration**: Real-time API fetching (UtilityAPI + Arcadia) for Texas market
- **Recommendation Engine**: Rules-based scoring with fixed-rate calculations

#### Recommendation Output
- **Top 3 Recommendations**: Diverse options (budget, balanced, premium)
- **Cost Projections**: Accurate annual cost calculations with savings estimates
- **Plan Details**: Supplier name, plan name, rate, renewable percentage
- **Clear Explanations**: Simple language describing why each plan was recommended

### P1: Should-have (Enhanced UX)
- **Progress Indicators**: Visual feedback during processing
- **Error Recovery**: Clear error messages with actionable guidance
- **Mobile Responsive**: Works on phones and tablets
- **Data Validation Feedback**: Real-time validation during form completion

### P2: Nice-to-have (Future Enhancement)
- **Recommendation Export**: Save/share recommendations
- **Detailed Cost Breakdown**: Show calculation components

## 7. Non-Functional Requirements

### Performance
- **Page Load**: <3 seconds initial load
- **Processing Time**: <10 seconds for recommendation generation
- **File Upload**: Support up to 10MB XML files
- **Memory Usage**: Efficient processing without excessive memory consumption


### Reliability
- **Error Handling**: Graceful failure with clear user messaging
- **Data Validation**: Rigorous checks prevent processing invalid data
- **API Resilience**: Fallback handling for API failures

## 8. User Experience & Design Considerations

### Interface Design
- **Single Page Application**: No routing, progressive form steps
- **Clean, Simple UI**: Focus on essential information without clutter
- **Mobile-First**: Responsive design for mobile devices
- **Clear Visual Hierarchy**: Easy to scan and understand

### User Flow
1. **Welcome**: Clear value proposition and privacy consent
2. **Current Plan**: Simple form for existing plan details
3. **Usage Upload**: Drag-and-drop XML file upload with validation
4. **Preferences**: Minimal preference selection (cost + renewable)
5. **Processing**: Progress indicator during data processing
6. **Results**: Clear recommendation cards with key metrics

### Accessibility
- **WCAG 2.1 AA Compliance**: Basic accessibility standards
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Sufficient contrast for readability

## 9. Technical Requirements

### Frontend (Next.js)
- **Framework**: Next.js 14+ with React 18+
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React state (no external state libraries)
- **File Upload**: Client-side file handling with validation

### Backend (Next.js API Routes)
- **API Endpoints**:
  - `POST /api/process-data` - Process form and XML data
  - `GET /api/recommendations` - Return top 3 recommendations
- **Data Processing**: In-memory processing
- **External APIs**: UtilityAPI and Arcadia integration

### Data Processing (Node.js)
- **XML Parsing**: Robust ESPI format parsing with error recovery
- **Validation**: Comprehensive data quality checks
- **Cost Calculations**: Fixed-rate projections with all fee components
- **Recommendation Logic**: Weighted scoring algorithm

### Infrastructure
- **Hosting**: Render web service
- **Deployment**: Automated deployment with background data sync
- **Monitoring**: Basic error tracking and performance monitoring

## 10. Implementation Details

### Development Environment Setup
- **Node.js**: 18.17+ (LTS)
- **Package Manager**: npm (not yarn)
- **Next.js**: 14.0+
- **TypeScript**: Enabled
- **Tailwind CSS**: 3.3+

### Initial Setup Commands
```bash
npx create-next-app@latest energy-plan-mvp --typescript --tailwind --app
cd energy-plan-mvp
npm install
npm run dev
```

### Project Structure & File Organization
```
/app
  /page.tsx                    # Main page (single page app)
/components
  /form
    /Step1Welcome.tsx          # Welcome screen
    /Step2CurrentPlan.tsx      # Current plan form
    /Step3FileUpload.tsx       # File upload component
    /Step4Preferences.tsx      # User preferences
    /Step5Review.tsx           # Review & submit
  /recommendations
    /RecommendationCard.tsx    # Individual recommendation
    /RecommendationList.tsx    # List of 3 recommendations
  /ui
    /Button.tsx               # Reusable button component
    /ProgressBar.tsx          # Form progress indicator
/app/api
  /process-data/route.ts       # POST endpoint
  /recommendations/[id]/route.ts # GET endpoint
/lib
  /xmlParser.ts               # XML processing utilities
  /recommendationEngine.ts     # Recommendation logic
  /types.ts                   # TypeScript interfaces
```

### Form Implementation Details
- **Single page** with 5 steps, no routing
- **State Management**: React useState for current step and form data
- **Data Persistence**: localStorage for session data (cleared on browser close)
- **Validation**: Step-by-step validation before allowing progression

### File Upload Implementation
- **HTML5 File API** (no external libraries)
- **Accept only**: .xml files
- **Max size**: 10MB
- **UI**: Drag & drop + click to select
- **Progress**: Upload progress indicator

### XML Parsing Details
- **Format**: ESPI v1.1+ Green Button XML
- **Extraction**: Hourly usage data (kWh readings)
- **Output**: Monthly totals with data quality assessment
- **Library**: Built-in DOMParser (no external XML libraries)

### Expected XML Parser Output Structure
```typescript
interface ParsedUsageData {
  monthlyTotals: Array<{
    month: string; // '2024-01'
    totalKwh: number;
    daysWithData: number;
    averageDaily: number;
  }>;
  dataQuality: 'good' | 'fair' | 'poor'; // Based on completeness
  dateRange: {
    start: string;
    end: string;
  };
}
```

### API Integration Details
- **UtilityAPI**: GET /api/utility-data/texas-suppliers
- **Arcadia**: GET /api/arcadia/plans
- **Error Handling**: Retry 3 times, fallback to static data
- **Authentication**: API keys via environment variables

### API Response Formats
```typescript
// UtilityAPI Response
{
  suppliers: [
    {
      id: string;
      name: string;
      rating: number; // 1-5
    }
  ]
}

// Arcadia Response
{
  plans: [
    {
      id: string;
      supplierId: string;
      name: string;
      rate: number; // cents per kWh
      renewablePercentage: number; // 0-100
      fees: {
        delivery: number;
        admin: number;
      };
    }
  ]
}
```

### Recommendation Algorithm Implementation
```javascript
function generateRecommendations(currentPlan, usageData, preferences, allPlans) {
  // Step 1: Calculate annual cost for each plan
  const plansWithCosts = allPlans.map(plan => ({
    ...plan,
    annualCost: calculateAnnualCost(plan, usageData),
    savings: calculateSavings(currentPlan, plan, usageData)
  }));

  // Step 2: Score each plan
  const scoredPlans = plansWithCosts.map(plan => ({
    ...plan,
    score: calculateScore(plan, preferences)
  }));

  // Step 3: Select diverse top 3
  return selectDiverseRecommendations(scoredPlans);
}

function calculateScore(plan, preferences) {
  const costWeight = preferences.costPriority / 100; // 0-1
  const renewableWeight = preferences.renewablePriority / 100; // 0-1

  // Normalize values to 0-1 scale
  const normalizedSavings = Math.min(plan.savings / 500, 1); // Cap at $500 savings
  const normalizedRenewable = plan.renewablePercentage / 100;

  return (costWeight * normalizedSavings) + (renewableWeight * normalizedRenewable);
}
```

### UI Component Requirements
- **Styling**: Tailwind CSS only (no external UI libraries)
- **Responsive**: Mobile-first approach
- **Color scheme**: Blue (#3B82F6) primary, neutral grays
- **Components**: Button, Input, Card, ProgressBar, Alert

### Mobile Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Data Validation Rules
- **Current Plan**: Rate 5-50 cents/kWh, optional contract details
- **Preferences**: Cost + Renewable priorities must sum to 100%
- **File Upload**: .xml only, ≤10MB, valid Green Button format
- **Usage Data**: At least 6 months of data required

### Error Messages & User Feedback
- **File Errors**: "Please select an XML file", "File too large (10MB max)"
- **Processing Errors**: "Unable to process file", "Service unavailable"
- **Validation**: Clear field-specific error messages
- **API Errors**: "Service temporarily unavailable, please try again"

### Testing Requirements
- **Unit Tests**: Jest for utilities and components
- **Integration**: API endpoints and data processing
- **Manual Testing**: End-to-end user flows
- **Test Data**: Sample XML files and mock API responses

### Deployment & Environment Variables
```bash
# .env.local
NEXT_PUBLIC_APP_URL=http://localhost:3000
UTILITY_API_KEY=your_key_here
ARCADIA_API_KEY=your_key_here
```

- **Render Deployment**: Connect GitHub repo, set env vars, deploy from main
- **Build**: npm run build
- **Start**: npm start
- **Node Version**: 18.x

## 11. Dependencies & Assumptions

### Technical Dependencies
- **UtilityAPI Access**: Valid API credentials for Texas supplier data
- **Arcadia API Access**: Valid API credentials for plan catalog
- **Render Account**: Hosting platform with web service support
- **Node.js 18+**: Runtime environment compatibility

### Data Assumptions
- **Green Button XML**: Users can obtain valid XML files from utilities
- **Texas Market Only**: Focus on ERCOT deregulated market
- **Fixed Rates Only**: Simplest rate structure for MVP validation
- **Current Data**: Supplier APIs provide up-to-date plan information

### Business Assumptions
- **API Availability**: Third-party APIs remain stable during MVP development
- **Data Quality**: XML files contain sufficient usage history (12+ months)
- **Market Stability**: Texas energy market structure remains consistent

## 12. Out of Scope (MVP)

### User Management
- User accounts and authentication
- Data persistence across sessions
- User profile management

### Advanced Features
- Multi-state support (NY, IL, PA, etc.)
- Complex rate structures (tiered, TOU, variable rates)
- Advanced preferences and usage pattern analysis
- Recommendation explanation improvements

### Business Features
- Billing and payment processing
- Customer support integration
- Analytics and reporting
- A/B testing framework

### Technical Features
- Database persistence
- Advanced caching (Redis)
- Microservices architecture
- Real-time data synchronization
- Security features (authentication, encryption, data privacy)

## 13. Implementation Plan

### Phase 1: Foundation (Weeks 1-2)
- Set up Next.js project with single-page form UI
- Implement 5-step progressive form with validation
- Basic file upload with XML validation
- In-memory data structures for processing

### Phase 2: Data Processing (Week 3)
- Robust Green Button XML parser with error handling
- Usage data aggregation and validation
- Supplier API integration (UtilityAPI + Arcadia)
- Comprehensive data validation pipeline

### Phase 3: Recommendations (Week 4)
- Scoring algorithm with diversity constraints
- Fixed-rate cost calculation engine
- Recommendation generation with explanations
- Results display with detailed metrics

### Phase 4: Validation & Deployment (Weeks 5-6)
- Rigorous validation and error handling
- Testing with real data scenarios
- Deploy to Render with background sync
- Performance optimization and final polishing

## 14. Risk Mitigation

### Technical Risks
- **XML Parsing Complexity**: Robust error handling and validation
- **API Integration Issues**: Background fetching with caching and fallbacks
- **Data Accuracy**: Rigorous validation against manual calculations
- **Performance**: Memory-efficient processing and monitoring

### Business Risks
- **Data Availability**: Comprehensive input validation prevents bad data
- **API Stability**: Error recovery and alternative data sources
- **Market Changes**: Texas market focus minimizes external dependencies

## 15. Success Criteria & Validation

### Technical Validation
- [ ] Webapp loads and allows file upload + form input
- [ ] System processes Green Button XML and generates recommendations
- [ ] 3 plan recommendations display with cost savings estimates
- [ ] Recommendations validated against manual calculations (>95% accuracy)
- [ ] End-to-end flow works without major bugs

### User Experience Validation
- [ ] Form completion rate >80%
- [ ] Processing time <10 seconds
- [ ] Clear, understandable recommendations
- [ ] Mobile-responsive design works correctly

### Business Validation
- [ ] Demonstrates clear value for energy plan comparison
- [ ] Provides foundation for future feature expansion
- [ ] Validates technical approach for supplier data integration

This MVP PRD provides a focused, achievable scope for validating the core energy plan recommendation concept. Success with this MVP will establish technical feasibility and user value, creating a strong foundation for future development.
