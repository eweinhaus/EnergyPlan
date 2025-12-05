# Progressive Web Form Implementation Guide

## Overview
Complete implementation guide for collecting user energy plan data and preferences through a multi-step progressive web form.

## Form Architecture

### 5-Step Flow
1. **Welcome & Consent** - Privacy notice and agreement
2. **Current Plan** - Supplier details, rates, contract info
3. **Usage Data** - Upload Green Button XML or manual entry
4. **Preferences** - Cost, flexibility, renewable energy priorities
5. **Review & Submit** - Summary and final submission

### Technical Stack
- **Frontend**: React 18+, React Hook Form, Zod validation, Tailwind CSS
- **State**: Zustand for form state management
- **Backend**: REST API endpoints for data submission

### API Endpoints Required
```javascript
POST /api/users/{userId}/current-plan
POST /api/users/{userId}/preferences
POST /api/users/{userId}/usage-data
GET  /api/users/{userId}/recommendations
```

## Form Steps & Data Collection

### Step 1: Welcome & Consent
- **Purpose**: Privacy agreement and user onboarding
- **Key Elements**:
  - Clear value proposition
  - Privacy policy agreement
  - GDPR/CCPA compliance checkbox
  - Progress indicator introduction

### Step 2: Current Plan Information

#### Required Fields
- **Basic Info**: Supplier name, plan name, contract dates
- **Rate Structure**: Fixed, variable, tiered, or time-of-use
- **Costs**: Current rate ($/kWh), monthly fees, termination fees
- **Additional**: Renewable percentage, auto-renewal status

#### Validation Rules (Zod Schema)
```javascript
const currentPlanSchema = z.object({
  supplierName: z.string().min(1, "Required"),
  planName: z.string().min(1, "Required"),
  contractStartDate: z.date(),
  contractEndDate: z.date().min(new Date(), "Must be future date"),
  rateStructure: z.enum(['fixed', 'variable', 'tiered', 'timeOfUse']),
  currentRate: z.number().min(0.01, "Must be > 0"),
  renewablePercentage: z.number().min(0).max(100).optional()
});
```

#### Conditional Logic
- **Rate Structure Selection**: Show different fields based on selection
  - Fixed: Just current rate field
  - Variable: Current rate + note about changes
  - Tiered: Multiple rate tiers with usage thresholds
  - Time-of-Use: Peak/off-peak rates + time definitions

#### UI Best Practices
- **Card Layout**: Group related fields in cards
- **Progressive Disclosure**: Show advanced options only when needed
- **Smart Defaults**: Pre-fill common values where possible
- **Help Text**: Contextual tooltips and descriptions

### Step 3: Usage Data Upload

#### File Upload Requirements
- **Format**: Green Button XML (.xml) or (.greenbutton)
- **Size Limit**: 10MB maximum
- **Validation**: Parse and validate XML structure
- **Fallback**: Manual entry option for users without data files

#### Key Features
- **Drag & Drop**: Intuitive file upload interface
- **Progress Feedback**: Real-time upload status
- **Data Preview**: Show parsed data summary
- **Error Handling**: Clear messages for invalid files

### Step 4: User Preferences

#### Cost Preferences
- **Priority Levels**: High/Medium/Low importance
- **Savings Target**: Minimum annual savings desired
- **Budget Constraints**: Maximum monthly spend

#### Flexibility Preferences
- **Contract Length**: Month-to-month to 24-month options
- **Switching Willingness**: Openness to changing suppliers
- **Notice Period**: Days needed to switch plans

#### Environmental Preferences
- **Renewable Priority**: Essential/Important/Neutral/Not important
- **Minimum Renewable %**: Slider 0-100%
- **Carbon Neutral**: Preference checkbox
- **Local Green**: Prefer locally generated renewable energy

#### Usage Insights (Optional)
- **Seasonal Patterns**: Summer/winter/consistent usage
- **Peak Times**: When energy use is highest
- **Efficiency**: Current efficiency program participation

#### UI Design Principles
- **Visual Hierarchy**: Use cards, icons, and clear headings
- **Progressive Disclosure**: Show options based on selections
- **User-Friendly Language**: Avoid jargon, use plain English
- **Mobile-First**: Ensure all elements work on small screens

### Step 5: Review & Submit

#### Summary Display
- **Current Plan**: Supplier, plan name, rate, contract info
- **Preferences**: Cost priority, contract length, renewable requirements
- **Usage Data**: Date range, number of readings, data completeness
- **Edit Capability**: Allow users to go back and modify any step

#### Final Submission
- **Validation**: Ensure all required data is present
- **API Submission**: Send data to recommendation engine
- **Loading State**: Clear progress indication during processing
- **Error Handling**: Graceful failure with retry options

## State Management

### Store Structure
- **Global State**: Current step, form data, validation errors
- **Actions**: Update data, navigate steps, validate, submit
- **Persistence**: Save progress to localStorage for resume capability

### Key State Properties
- `currentStep`: Current form step (1-5)
- `formData`: Object containing currentPlan, preferences, usageData
- `errors`: Validation errors per step
- `isSubmitting`: Loading state during submission

## Data Validation & Error Handling

### Validation Strategy
- **Client-Side**: Immediate feedback using Zod schemas
- **Server-Side**: Additional validation before processing
- **Progressive**: Validate each step before allowing progression

### Common Validation Rules
- **Required Fields**: Supplier name, plan name, contract dates
- **Date Logic**: End date must be after start date
- **Numeric Ranges**: Rates > 0, percentages 0-100
- **File Validation**: XML format, size limits, data completeness

## Accessibility & UX Features

### Keyboard Navigation
- Tab order follows logical flow
- Radio groups work with arrow keys
- File upload accessible with Enter/Space
- Progress indicators show current step

### Screen Reader Support
- ARIA labels and descriptions for all form elements
- Clear form instructions and error messages
- Semantic HTML structure

### Loading States & Feedback
- Progress indicators for multi-step forms
- Loading spinners during processing
- Success/error toast notifications
- Real-time validation feedback

## Backend Integration

### API Endpoints Required
```javascript
POST /api/users/{userId}/current-plan    // Plan details
POST /api/users/{userId}/preferences     // User priorities
POST /api/users/{userId}/usage-data      // Energy usage XML
GET  /api/users/{userId}/recommendations // Get results
```

### Request/Response Format
- **Content-Type**: `application/json` for structured data
- **File Upload**: `multipart/form-data` for XML files
- **Authentication**: JWT tokens or API keys
- **Rate Limiting**: Handle 429 responses gracefully

### Error Handling
- **400**: Validation errors - show field-specific messages
- **413**: File too large - prompt for smaller file
- **422**: Business logic errors - explain requirements
- **500**: Server errors - offer retry with exponential backoff

## Testing Strategy

### Unit Tests
- Form validation schemas with Zod
- Component rendering and interactions
- State management logic
- Error handling edge cases

### Integration Tests
- API endpoint communication
- File upload and parsing
- Form submission workflows
- Cross-step data flow

### E2E Tests
- Complete user journey from start to finish
- Mobile responsiveness
- Accessibility compliance
- Error recovery flows

## Performance Optimization

### Code Splitting
- Lazy load form steps to reduce initial bundle size
- Dynamic imports for conditional components
- Route-based code splitting for different form sections

### Bundle Analysis
- Use webpack bundle analyzer to identify large dependencies
- Optimize component imports and tree shaking
- Compress assets and enable gzip

## Deployment Considerations

### Progressive Web App Features
- Service worker for offline capability
- Web app manifest for mobile installation
- Responsive design for all screen sizes
- Fast loading and smooth animations

### CDN & Asset Optimization
- Image optimization and lazy loading
- Font subsetting and caching
- CDN delivery for static assets
- Compression and minification

## Monitoring & Analytics

### Form Analytics
- Track completion rates by step
- Monitor user drop-off points
- Measure time spent on each section
- A/B test different form variations

### Error Tracking
- Sentry or similar for error monitoring
- User journey analytics
- Performance metrics and core web vitals
- Conversion funnel analysis

This guide provides everything you need to implement a comprehensive progressive web form for collecting energy plan data and user preferences.
