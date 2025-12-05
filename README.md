# AI Energy Plan Recommendation Agent - MVP

A single-page web application that processes Green Button XML usage data to recommend optimal fixed-rate energy plans for Texas residential customers.

## Features

- **5-Step Progressive Form**: Collects current plan details, usage data, and preferences
- **Green Button XML Processing**: Parses ESPI format XML files to extract usage data
- **Personalized Recommendations**: Generates top 3 energy plan recommendations based on usage patterns and preferences
- **Cost Calculations**: Accurate annual cost projections with savings estimates
- **Mobile Responsive**: Works seamlessly on mobile, tablet, and desktop devices

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Runtime**: Node.js 18.17+

## Getting Started

### Prerequisites

- Node.js 18.17+ installed
- npm package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd EnergyPlan
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
UTILITY_API_KEY=your_utility_api_key_here
ARCADIA_API_KEY=your_arcadia_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Note**: For MVP testing, the application uses mock data if API keys are not provided.

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

Build the application:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## Project Structure

```
/app
  /api
    /process-data/route.ts    # API endpoint for processing form and XML data
  /page.tsx                   # Main page with form flow
  /layout.tsx                 # Root layout
  /globals.css                # Global styles
/components
  /form                       # Form step components
    /Step1Welcome.tsx
    /Step2CurrentPlan.tsx
    /Step3FileUpload.tsx
    /Step4Preferences.tsx
    /Step5Review.tsx
  /recommendations            # Results display components
    /RecommendationCard.tsx
    /RecommendationList.tsx
  /ui                         # Reusable UI components
    /Button.tsx
    /Input.tsx
    /Card.tsx
    /ProgressBar.tsx
    /Alert.tsx
/lib
  /types.ts                   # TypeScript type definitions
  /xmlParser.ts               # Green Button XML parser
  /dataValidation.ts          # Data validation utilities
  /apiClients.ts              # API integration clients
  /recommendationEngine.ts     # Recommendation algorithm
```

## Usage

1. **Welcome Screen**: Review the value proposition and provide privacy consent
2. **Current Plan**: Enter your current energy supplier, rate, and contract details
3. **Upload XML**: Upload your Green Button XML file (max 10MB)
4. **Preferences**: Set your priorities for cost savings vs renewable energy (must sum to 100%)
5. **Review**: Review your information and submit
6. **Results**: View your top 3 personalized recommendations with cost savings estimates

## API Integration

The application integrates with:
- **UtilityAPI**: For Texas supplier data
- **Arcadia API**: For plan catalog data

For MVP testing, mock data is used if API keys are not configured. Update the API client implementations in `/lib/apiClients.ts` to use real endpoints.

## Data Requirements

- **Minimum 6 months** of usage data required
- **Green Button ESPI format** XML files
- **Hourly usage readings** in watt-hours (converted to kWh)

## Testing

The application includes:
- TypeScript type checking
- ESLint validation
- Build-time error checking

### Testing with Sample Data

1. Start the development server: `npm run dev`
2. Open http://localhost:3000 in your browser
3. Complete the 5-step form:
   - Skip Step 1 (welcome)
   - Enter current plan details in Step 2
   - Upload the `sample-green-button.xml` file in Step 3
   - Set preferences in Step 4
   - Submit in Step 5
4. Verify that recommendations are generated without errors

### XML Parser

The XML parser uses `fast-xml-parser` to handle Green Button ESPI format files in the Node.js environment (API routes). This replaces the browser-only `DOMParser` that was causing server-side errors.

**Fixed Issues:**
- ✅ "DOMParser is not defined" error resolved
- ✅ "Cannot read properties of undefined (reading 'espi:content')" error resolved
- ✅ XML namespace handling corrected
- ✅ Proper parsing of Green Button ESPI format

### Sample Files

- `sample-green-button.xml` - Complete Green Button XML with 8 months of usage data (January-August 2022)
- `simple-test.xml` - Minimal XML for debugging

To test XML parsing manually:
```javascript
const { parseGreenButtonXML } = require('./lib/xmlParser');
const fs = require('fs');

const xmlContent = fs.readFileSync('sample-green-button.xml', 'utf8');
const result = parseGreenButtonXML(xmlContent);
console.log(result);
```

## Deployment

The application is configured for deployment on Render:

1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy from the main branch

## Performance Targets

- **Page Load**: < 3 seconds
- **Processing Time**: < 10 seconds for recommendation generation
- **File Upload**: Supports up to 10MB XML files

## Known Limitations (MVP)

- Texas market only
- Fixed-rate plans only
- Mock API data for testing
- No user authentication or data persistence
- Single-session webapp (data cleared on browser close)

## Future Enhancements

- Multi-state support (NY, IL, PA, etc.)
- Complex rate structures (tiered, TOU, variable rates)
- User accounts and data persistence
- Real-time API integrations
- Advanced usage pattern analysis

## License

[Add your license here]

## Support

For issues or questions, please [create an issue](link-to-issues) in the repository.

