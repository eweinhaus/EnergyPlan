# MVP Planning - Energy Plan Recommendation Agent

## Overview
**Goal**: Build a working web application that demonstrates the core value proposition - energy plan recommendations based on usage data and preferences.

**Scope**: Single-page webapp, no user accounts/authentication, Texas market only, fixed-rate plans only, real-time supplier data via APIs.

**Timeline**: 4-6 weeks development

## MVP Success Criteria
- [ ] Webapp loads and allows file upload + form input
- [ ] System processes Green Button XML and generates recommendations
- [ ] 3 plan recommendations display with cost savings estimates
- [ ] Recommendations are validated against manual calculations
- [ ] End-to-end flow works without major bugs
- [ ] Deployed and accessible via URL

## Technical Scope

### Frontend (Next.js)
- **Single Page**: Progressive web form with 5 steps (no routing needed)
- **Form**: Input collection (current plan, preferences, usage upload)
- **File Upload**: Green Button XML with rigorous validation
- **Results**: Display 3 recommendation cards with detailed metrics
- **Styling**: Tailwind CSS, mobile-responsive, clean UX

### Backend (Next.js API Routes)
- **API Endpoints**: 3 core endpoints (process-data, get-recommendations)
- **Data Validation**: Rigorous input validation and business logic checks
- **File Processing**: Parse and validate XML, temporary in-memory storage
- **Orchestration**: Direct processing without separate Python service

### Data Processing (Node.js)
- **XML Parsing**: Robust Green Button ESPI format parsing with error handling
- **Aggregation**: Convert hourly data to monthly totals with validation
- **Supplier Data**: Real-time API fetching (UtilityAPI/Arcadia) on app startup
- **Recommendation Logic**: Rules-based scoring with diversity constraints
- **Cost Calculation**: Accurate fixed-rate projections with all components

### Database (Simplified)
- **In-Memory**: Temporary storage for processing (no persistence)
- **Background Sync**: Supplier data cached in memory, refreshed periodically

## MVP Features (Simplified)

### Input Collection (Single Session)
- **Current Plan**: Supplier name, current fixed rate, contract details
- **Preferences**: Cost priority (high/medium/low), renewable preference (yes/no)
- **Usage Data**: Green Button XML upload with rigorous validation

### Recommendation Engine
- **Scoring**: Weighted formula with diversity constraints
  ```
  Score = (0.5 × Cost Savings %) + (0.3 × Renewable Match) + (0.2 × Flexibility Score)
  ```
- **Cost Projection**: Accurate annual cost calculations for fixed rates
- **Top 3**: Diverse recommendations (budget, balanced, premium options)
- **Output**: Plan details, savings estimates, explanations

### Data Sources
- **Supplier Catalog**: Real-time API data (UtilityAPI + Arcadia) loaded on startup
- **Usage Processing**: Robust XML parsing with validation and aggregation
- **Rate Structures**: Fixed rates only (delivery charges, taxes included)

## Implementation Plan

### Phase 1: Foundation (Week 1-2)
1. Set up Next.js project with single-page form UI
2. Implement 5-step progressive form (no routing)
3. Set up file upload with basic XML validation
4. Create in-memory data structures for processing

### Phase 2: Data Processing (Week 3)
1. Build robust Green Button XML parser with error handling
2. Implement usage data aggregation and validation
3. Integrate supplier APIs (UtilityAPI/Arcadia) with background fetching
4. Develop comprehensive data validation pipeline

### Phase 3: Recommendations (Week 4)
1. Implement scoring algorithm with diversity constraints
2. Build cost calculation engine for fixed rates
3. Create recommendation generation with explanations
4. Develop results display with detailed metrics

### Phase 4: Validation & Deployment (Week 5-6)
1. Implement rigorous validation and error handling
2. Add comprehensive testing with real data
3. Deploy to Render with background data sync
4. Performance optimization and final polishing

## MVP Limitations (Intentional)
- **No User Accounts**: Single-session webapp, no persistence
- **Single State**: Texas market only
- **Fixed Rates Only**: No tiered, TOU, or variable rate structures
- **Limited Preferences**: Cost priority and renewable preference only
- **In-Memory Processing**: No long-term data storage
- **API Dependent**: Real-time supplier data fetching
- **Rigorous Validation**: Comprehensive input and data quality checks

## Risk Mitigation
- **Technical Risks**: Robust XML parsing with comprehensive error handling
- **API Risks**: Background data fetching with caching and error recovery
- **Data Accuracy**: Rigorous validation against manual calculations and real bills
- **Performance**: Optimize processing pipeline, monitor memory usage
- **Validation**: Comprehensive input validation prevents bad data scenarios

## Success Metrics (MVP)
- **Technical**: App loads, processes XML, generates recommendations in <10 seconds
- **Functional**: End-to-end flow works without errors for test scenarios
- **Accuracy**: >95% of recommendations match manual calculations
- **Performance**: <3 second page loads, <10 second processing time
- **Validation**: All input validation passes, error handling works correctly

## Go/No-Go Decision
After MVP completion, evaluate:
- Does the recommendation engine produce accurate cost savings estimates?
- Does the XML processing handle real Green Button files reliably?
- Does the API integration provide current supplier data?
- Is the validation comprehensive enough to prevent errors?
- Does the concept demonstrate clear value for energy plan comparison?

## Future MVP Extensions (If Successful)
- Add user accounts and data persistence
- Expand to additional states (NY, IL, PA)
- Support tiered and time-of-use rate structures
- Add advanced preferences and usage pattern analysis
- Implement recommendation explanation improvements
