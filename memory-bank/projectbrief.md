# Project Brief: AI Energy Plan Recommendation Agent MVP

## Project Overview

The **AI Energy Plan Recommendation Agent MVP** is a single-page web application that processes Green Button XML usage data to recommend optimal fixed-rate energy plans for Texas residential customers. The MVP validates the core recommendation algorithm and user experience, providing a foundation for future expansion to additional markets and rate structures.

## Core Requirements

### Primary Goals
- **Validate Core Algorithm**: Demonstrate that usage-based recommendations produce accurate cost savings estimates (>95% accuracy)
- **Prove Technical Feasibility**: Build working XML processing and API integrations
- **Establish User Value**: Create a functional tool that customers can use to compare plans

### Target Users
**Texas Residential Energy Consumers** who:
- Have access to Green Button XML usage data
- Are considering switching energy suppliers
- Want to understand cost savings potential
- Prefer simple, focused recommendations over complex analysis

### Key Features (MVP Scope)
1. **5-Step Progressive Form**: Collects current plan details, usage data, and preferences
2. **Green Button XML Processing**: Parses ESPI format XML files to extract usage data
3. **Personalized Recommendations**: Generates top 3 energy plan recommendations based on usage patterns and preferences
4. **Cost Calculations**: Accurate annual cost projections with savings estimates
5. **Mobile Responsive**: Works seamlessly on mobile, tablet, and desktop devices

## Success Criteria

### Technical Validation
- >95% accuracy against manual calculations
- End-to-end flow works without major bugs
- Processing time <10 seconds for recommendation generation
- Page load <3 seconds

### User Experience
- >80% form completion rate
- Clear, understandable recommendations
- Mobile-responsive design works correctly

### Go/No-Go Criteria
- XML processing handles real Green Button files reliably
- API integration provides current Texas supplier data
- Recommendation engine produces valid cost projections
- End-to-end user flow works without critical errors

## Scope Boundaries

### In Scope (MVP)
- Texas market only
- Fixed-rate plans only
- Single-session webapp (no authentication or persistence)
- Green Button XML file processing
- Mock API data for testing (with real API integration capability)
- 5-step progressive form with validation

### Out of Scope (MVP)
- User accounts and authentication
- Data persistence across sessions
- Multi-state support (NY, IL, PA, etc.)
- Complex rate structures (tiered, TOU, variable rates)
- Advanced preferences and usage pattern analysis
- Database persistence
- Real-time data synchronization

## Project Timeline

**Total Duration**: 6 weeks (MVP implementation) - ✅ COMPLETE AND DEPLOYED (December 2025)

- **Phase 1 (Weeks 1-2)**: Foundation Setup - ✅ COMPLETE
- **Phase 2 (Week 3)**: Data Processing - ✅ COMPLETE
- **Phase 3 (Week 4)**: Recommendation Engine - ✅ COMPLETE
- **Phase 4 (Weeks 5-6)**: Validation & Deployment - ✅ COMPLETE
- **Phase 5**: Production Deployment - ✅ COMPLETE

**Status**: MVP successfully completed, deployed to production on Render, and live for user testing (as of December 2025).

## Key Constraints

- **Technology**: Next.js 14+ with App Router, TypeScript, Tailwind CSS
- **Runtime**: Node.js 18.17+
- **Hosting**: Vercel (migrated from Render - $7/month → $0/month cost savings)
- **File Size**: Maximum 10MB XML files
- **Data Requirements**: Minimum 6 months of usage data required
- **API Dependencies**: EIA Open Data API (integrated December 2025), static supplier/plan data (EIA doesn't provide retail catalogs)

## Future Roadmap

Post-MVP enhancements include:
- User accounts and data persistence (Firebase Auth + Firestore)
- Firebase Hosting migration with Cloud Functions
- GDPR-compliant data management and audit logging
- Multi-state support (NY, IL, PA)
- Advanced rate structures (tiered, TOU)
- ML-enhanced recommendation engine
- Mobile app (PWA)
- Enterprise features and white-label options

