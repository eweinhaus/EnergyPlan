# User Input Collection Guide

## Data Collection Overview

The system requires two primary user inputs to generate recommendations:
1. **Current Plan Information** - Details about existing energy contract
2. **User Preferences** - Priorities for cost, flexibility, and sustainability

## Collection Format: Progressive Web Form

**Recommended Approach**: Multi-step web form with progressive disclosure and validation

### Why This Format?
- **User-Friendly**: Breaks complex information into digestible steps
- **Validation**: Real-time validation prevents errors
- **Conditional Logic**: Shows relevant fields based on previous answers
- **Mobile-Optimized**: Responsive design for all devices
- **Save/Resume**: Allows users to complete partially and return

## Step 1: Current Plan Information

### Required Fields

#### Basic Plan Details
```javascript
{
  supplierName: "string",        // e.g., "ConEd", "Texas Power Co"
  planName: "string",           // e.g., "Budget Saver Plus"
  contractStartDate: "date",    // When plan began
  contractEndDate: "date",      // When current contract expires
  autoRenewal: "boolean",       // Does it auto-renew?
  earlyTerminationFee: "number" // $ amount for breaking contract
}
```

#### Rate Structure Information
```javascript
{
  rateStructure: "enum",        // "fixed", "variable", "tiered", "timeOfUse"
  currentRate: "number",        // Current $/kWh rate
  rateUnit: "string",          // "kWh", "month"

  // For tiered rates
  tiers: [{
    minUsage: "number",        // kWh threshold
    maxUsage: "number",        // kWh threshold
    rate: "number"            // $/kWh for this tier
  }],

  // For time-of-use rates
  timeOfUseRates: {
    offPeak: "number",         // $/kWh
    peak: "number",           // $/kWh
    superPeak: "number",      // $/kWh (optional)
    peakHours: "string"       // e.g., "2-6 PM weekdays"
  }
}
```

#### Additional Costs
```javascript
{
  monthlyBaseFee: "number",    // Fixed monthly charge
  demandCharges: "number",     // $/kW for peak demand
  taxesAndFees: "number",      // Additional monthly costs
  renewablePercentage: "number" // Current plan's renewable %
}
```

### Collection UI Design

**Step 1.1: Basic Information**
```
┌─ Current Plan Details ──────────────────────────┐
│ Supplier: [ConEd ▼]                           │
│ Plan Name: [Budget Saver Plus]               │
│ Contract Start: [01/15/2024]                 │
│ Contract End: [01/15/2025]                   │
│ ☐ Auto-renews                                │
│ Early Termination Fee: [$150]                │
└───────────────────────────────────────────────┘
```

**Step 1.2: Rate Structure**
```
┌─ Rate Structure ───────────────────────────────┐
│ How is your rate calculated?                  │
│ ○ Fixed rate                                 │
│ ○ Variable (changes monthly)                 │
│ ○ Tiered (different rates for usage levels)  │
│ ○ Time-of-use (peak/off-peak)                │
│                                             │
│ Current Rate: [$0.18] per kWh               │
└───────────────────────────────────────────────┘
```

## Step 2: User Preferences

### Required Fields

#### Cost Savings Priority
```javascript
{
  costPriority: "enum",         // "high", "medium", "low"
  monthlyBudget: "number",      // Max monthly spend (optional)
  savingsTarget: "number"       // Minimum annual savings desired
}
```

#### Flexibility Preferences
```javascript
{
  contractLength: "enum",       // "month-to-month", "6-months", "12-months", "24-months"
  switchingWillingness: "enum", // "very-open", "somewhat-open", "prefer-stability"
  noticePeriod: "number"        // Days needed to switch
}
```

#### Renewable Energy Preferences
```javascript
{
  renewablePriority: "enum",    // "essential", "important", "neutral", "not-important"
  minimumRenewable: "number",   // Minimum % renewable energy (0-100)
  carbonNeutral: "boolean",     // Prefer carbon neutral plans
  localGreen: "boolean"         // Prefer locally generated green energy
}
```

#### Usage Pattern Insights (Optional)
```javascript
{
  seasonalUsage: "enum",        // "summer-heavy", "winter-heavy", "consistent"
  peakUsageTimes: "array",      // ["evening", "morning", "weekends"]
  energyEfficiency: "boolean"   // Currently using energy efficiency programs
}
```

### Collection UI Design

**Step 2.1: Cost Priorities**
```
┌─ Cost Savings ────────────────────────────────┐
│ How important are cost savings to you?       │
│ ○ Very important (maximize savings)         │
│ ○ Somewhat important (balance cost/value)   │
│ ○ Not very important (other factors matter) │
│                                             │
│ Target Annual Savings: [$200]               │
└───────────────────────────────────────────────┘
```

**Step 2.2: Flexibility Needs**
```
┌─ Contract Flexibility ───────────────────────┐
│ Preferred contract length:                   │
│ ○ Month-to-month (most flexible)            │
│ ○ 6-12 months (balanced)                    │
│ ○ 12-24 months (stability with savings)     │
│                                             │
│ How open are you to switching suppliers?    │
│ ○ Very open (happy to switch for savings)   │
│ ○ Somewhat open (if savings are significant)│
│ ○ Prefer stability (only switch if needed)  │
└───────────────────────────────────────────────┘
```

**Step 2.3: Environmental Preferences**
```
┌─ Renewable Energy ───────────────────────────┐
│ How important is renewable energy?           │
│ ○ Essential (100% renewable only)           │
│ ○ Important (at least 50% renewable)        │
│ ○ Neutral (don't care either way)           │
│ ○ Not important (cost matters more)         │
│                                             │
│ Minimum renewable percentage: [50%]         │
│ ☐ Prefer carbon neutral plans               │
└───────────────────────────────────────────────┘
```

## Data Validation & Processing

### Client-Side Validation
- Required field checking
- Date format validation
- Numeric range validation
- Logical consistency checks

### Server-Side Processing
```javascript
// Example validation logic
function validatePlanData(planData) {
  // Check contract dates
  if (planData.contractEndDate <= planData.contractStartDate) {
    throw new Error("Contract end date must be after start date");
  }

  // Validate rate structure
  if (planData.rateStructure === 'tiered' && !planData.tiers.length) {
    throw new Error("Tiered rates require tier definitions");
  }

  // Check renewable percentage
  if (planData.renewablePercentage < 0 || planData.renewablePercentage > 100) {
    throw new Error("Renewable percentage must be 0-100");
  }
}
```

### Data Storage Schema
```sql
-- User input tables
CREATE TABLE user_current_plans (
  user_id UUID PRIMARY KEY,
  supplier_name VARCHAR(255),
  plan_name VARCHAR(255),
  contract_start DATE,
  contract_end DATE,
  auto_renewal BOOLEAN,
  termination_fee DECIMAL(10,2),
  rate_structure VARCHAR(50),
  current_rate DECIMAL(10,4),
  -- Additional fields...
);

CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY,
  cost_priority VARCHAR(20),
  savings_target DECIMAL(10,2),
  contract_preference VARCHAR(20),
  switching_willingness VARCHAR(20),
  renewable_priority VARCHAR(20),
  min_renewable_pct INTEGER,
  -- Additional fields...
);
```

## Alternative Collection Methods

### Option 1: Utility Bill Upload
- Users upload PDF/image of current bill
- OCR + AI extraction of plan details
- Reduces manual data entry
- **Pros**: Accurate, less typing
- **Cons**: Privacy concerns, OCR accuracy

### Option 2: API Integration
- Connect directly to utility accounts
- Automated data extraction
- **Pros**: Most accurate, seamless
- **Cons**: Requires user authorization, limited utility support

### Option 3: Guided Interview
- Conversational AI chatbot
- Natural language questions
- **Pros**: User-friendly, adaptive
- **Cons**: Complex implementation, potential misunderstandings

## Recommended Implementation Order

1. **Phase 1**: Basic web form with core fields
2. **Phase 2**: Add conditional logic and validation
3. **Phase 3**: Implement bill upload feature
4. **Phase 4**: Add API integrations for seamless data flow

## Success Metrics

- **Completion Rate**: >80% of users complete full form
- **Data Accuracy**: >95% of entered data validates correctly
- **Time to Complete**: <5 minutes average
- **User Satisfaction**: >4.0/5 rating for input process
