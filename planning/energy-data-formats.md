# Energy Data Formats & APIs Guide

## Overview
This guide covers the data formats and API standards for building an AI energy plan recommendation system, focusing on 12 months kWh usage data and supplier catalog data.

## 12 Months kWh Usage Data

### Industry Standard: Green Button XML (ESPI)
- **Standard**: Energy Services Provider Interface (ESPI) XML format
- **Governing Body**: North American Energy Standards Board (NAESB)
- **Legal Basis**: Energy Policy Act of 2005 mandates access for most US utilities

### File Formats
- **Primary**: XML files following Atom Syndication Format
- **Alternative**: JSON (via some APIs)
- **Common Extensions**: `.xml`, `.greenbutton`

### Data Structure
Contains structured energy usage information wrapped in XML elements:

**Key Components:**
- `feed` (Atom) - Root container
- `entry` (Atom) - Individual data records
- `content` (Atom) - ESPI resource wrapper
- `MeterReading` (ESPI) - Usage measurement data
- `IntervalBlock` - Time-series data blocks
- `IntervalReading` - Individual readings

### Sample XML Structure
```xml
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <content>
      <MeterReading xmlns="http://naesb.org/espi">
        <IntervalBlock>
          <interval>
            <start>1640995200</start>  <!-- Unix timestamp -->
            <duration>3600</duration>  <!-- 1 hour in seconds -->
          </interval>
          <IntervalReading>
            <value>12500</value>  <!-- Watt-hours consumed -->
          </IntervalReading>
        </IntervalBlock>
      </MeterReading>
    </content>
  </entry>
</feed>
```

### Data Fields Included
- **Consumption Values**: kWh/watt-hours used
- **Time Stamps**: Start/end times for each interval
- **Duration**: Length of measurement period
- **Service Point ID**: Unique meter identifier
- **Local Time Parameters**: Time zone, DST adjustments
- **Quality Flags**: Data validation indicators

### Data Granularity
- **Hourly**: Most common for residential/commercial
- **Daily**: Some utilities provide daily summaries
- **15-minute**: Advanced metering infrastructure (AMI)
- **Real-time**: Available from some smart meters

### Sources & Access Methods
1. **Direct Utility Downloads**: Customer portals (PDF statements converted to XML)
2. **Green Button Connect**: Standardized API access
3. **Third-party APIs**: UtilityAPI, Arcadia, EnergyBot
4. **Government Mandates**: Most utilities required to provide access

### Consistency Level: HIGH
- **Standardized Format**: ESPI XML schema consistent across utilities
- **Federal Compliance**: Energy Policy Act ensures broad adoption
- **Validation Tools**: Green Button validators available
- **Interoperability**: Data portable between systems

## Supplier Catalog Data

### API Landscape
Multiple commercial APIs provide electricity supplier plan data:

1. **UtilityAPI** - Comprehensive utility data platform
2. **Arcadia (Genability)** - Electricity rate intelligence
3. **EnergyBot** - Energy supplier marketplace API
4. **EIA API** - Government energy information
5. **State PUC APIs** - Public utility commission data

### Primary Format: JSON
- **API Type**: REST APIs with JSON responses
- **Alternative**: CSV for bulk data downloads
- **Real-time**: Most APIs provide current rate data

### Data Categories

#### Plan Information
- Supplier name and branding
- Plan name and marketing description
- Contract terms (length, auto-renewal)
- Geographic coverage (zip codes, territories)

#### Rate Structures
- **Fixed Rate**: Single $/kWh price
- **Tiered Rate**: Different prices for usage blocks
- **Time-of-Use (TOU)**: Peak/off-peak pricing
- **Variable Rate**: Indexed to wholesale prices

#### Cost Components
- Base energy rate ($/kWh)
- Delivery charges
- Demand charges ($/kW)
- Taxes and fees
- Early termination fees

#### Environmental Attributes
- Renewable energy percentage
- Carbon offset credits
- Green pricing options

### Sample JSON Structure
```json
{
  "supplierId": "GREEN_ENERGY_CO",
  "planId": "ECOSAVER_PLUS_2024",
  "planName": "EcoSaver Plus",
  "description": "100% renewable energy plan",
  "rateStructure": "TIME_OF_USE",
  "contractLength": 12,
  "earlyTerminationFee": 150.00,
  "renewablePercentage": 100,
  "rates": {
    "energy": {
      "offPeak": {
        "rate": 0.12,
        "unit": "kWh"
      },
      "onPeak": {
        "rate": 0.28,
        "unit": "kWh"
      }
    },
    "demand": {
      "summerPeak": {
        "rate": 15.00,
        "unit": "kW"
      }
    }
  },
  "serviceTerritories": ["CA", "TX", "NY"],
  "effectiveDate": "2024-01-01T00:00:00Z",
  "expirationDate": "2024-12-31T23:59:59Z"
}
```

### Geographic Coverage
- **Deregulated Markets**: TX, NY, IL, PA, MD, NJ, CT, MA
- **Partially Deregulated**: CA, OH, MI
- **Regulated Markets**: Limited supplier choice

### Update Frequency
- **Daily/Weekly**: Rate changes
- **Monthly**: New plan introductions
- **Annually**: Major market restructuring

### Consistency Level: MEDIUM-LOW
- **Variable Formats**: Each API has unique schema
- **State Variations**: Different regulatory requirements
- **Data Completeness**: Varies by market maturity
- **Quality Issues**: Rate accuracy depends on source

## Integration Challenges

### Usage Data Integration
- **File Parsing**: XML parsing with Atom/ESPI namespaces
- **Data Validation**: Check for missing intervals, anomalies
- **Time Zone Handling**: Convert to consistent timezone
- **Unit Conversion**: Standardize kWh vs watt-hours

### Supplier Data Integration
- **API Aggregation**: Combine multiple API sources
- **Data Normalization**: Standardize rate structures
- **Geographic Mapping**: Match plans to user location
- **Rate Calculation**: Handle complex tiered/TOU structures

### Data Quality Considerations
- **Completeness**: Ensure 12+ months of usage data
- **Accuracy**: Validate against utility statements
- **Timeliness**: Use current supplier catalog data
- **Coverage**: Handle multi-state operations

## Recommended Implementation Approach

1. **Usage Data**: Use UtilityAPI or Arcadia for standardized access
2. **Supplier Data**: Aggregate from multiple APIs (UtilityAPI + Arcadia + EnergyBot)
3. **Data Storage**: Normalize into internal PostgreSQL schema
4. **Caching**: Cache supplier data with 24-hour refresh
5. **Validation**: Implement data quality checks and fallbacks

## Key Resources
- **Green Button Alliance**: greenbuttonalliance.org
- **NAESB ESPI Standards**: naesb.org
- **UtilityAPI Docs**: docs.utilityapi.com
- **Arcadia Platform**: arcadia.com/platform
- **EIA Energy Data**: eia.gov/electricity/data
