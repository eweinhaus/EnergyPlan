import { Supplier, Plan } from './types';

// Cache for API responses
let supplierCache: Supplier[] | null = null;
let planCache: Plan[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * EIA API Base URL
 */
const EIA_API_BASE = 'https://api.eia.gov/v2';

/**
 * UtilityAPI Base URL
 * UtilityAPI provides access to real utility supplier and plan data
 */
const UTILITY_API_BASE = 'https://utilityapi.com/api/v2';

/**
 * Fetch data from EIA API with retry logic
 * EIA API provides statistical energy data, not retail supplier catalogs
 */
async function fetchEIAWithRetry(
  endpoint: string,
  apiKey: string,
  retries = 3
): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const url = `${EIA_API_BASE}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${apiKey}`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`EIA API responded with status ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // EIA API v2 returns data in response.data format
      if (data.response && data.response.data) {
        return data.response.data;
      }
      
      return data;
    } catch (error) {
      if (i === retries - 1) {
        console.error('Failed to fetch EIA data after retries:', error);
        throw error;
      }
      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  return null;
}

/**
 * Get average electricity price for Texas from EIA
 * This can be used for market context and validation
 */
export async function getTexasAverageElectricityPrice(apiKey: string): Promise<number | null> {
  try {
    // EIA series ID for Texas average retail electricity price (residential)
    // Series: ELEC.PRICE.TX-RES.M (Monthly average price in cents/kWh)
    // Note: This is a placeholder - actual series ID needs to be verified via EIA API browser
    const data = await fetchEIAWithRetry('/electricity/retail-sales/data/?frequency=monthly&data[0]=price&facets[stateid][]=TX&facets[sectorid][]=RES&sort[0][column]=period&sort[0][direction]=desc&length=1', apiKey);

    if (data && data.length > 0 && data[0].price) {
      // Price is typically in cents per kWh
      return data[0].price;
    }

    return null;
  } catch (error) {
    console.warn('Could not fetch Texas average electricity price from EIA:', error);
    return null;
  }
}

/**
 * Fetch data from UtilityAPI with retry logic
 * UtilityAPI provides real retail energy supplier and plan data
 */
async function fetchUtilityAPIWithRetry(
  endpoint: string,
  apiKey: string,
  retries = 3
): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const url = `${UTILITY_API_BASE}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`UtilityAPI responded with status ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (i === retries - 1) {
        console.error('Failed to fetch UtilityAPI data after retries:', error);
        throw error;
      }
      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  return null;
}

/**
 * Fetch suppliers from UtilityAPI - Real retail energy supplier data
 * UtilityAPI provides access to current Texas retail energy suppliers
 */
async function fetchSuppliersWithRetry(
  apiKey: string,
  retries = 3
): Promise<Supplier[]> {
  try {
    // Try to get suppliers from UtilityAPI first
    const data = await fetchUtilityAPIWithRetry('/suppliers?state=TX', apiKey, retries);

    if (data && data.suppliers && Array.isArray(data.suppliers)) {
      // Map UtilityAPI response to our Supplier interface
      return data.suppliers.map((supplier: any) => ({
        id: supplier.id.toString(),
        name: supplier.name || supplier.utility_name,
        rating: supplier.rating || 4.0, // Default rating if not provided
      }));
    }
  } catch (error) {
    console.warn('Could not fetch suppliers from UtilityAPI, falling back to mock data:', error);
  }

  // Fallback to mock data if UtilityAPI fails
  console.log('Using mock supplier data as fallback');
  return [
    { id: '1', name: 'Reliant Energy', rating: 4.5 },
    { id: '2', name: 'TXU Energy', rating: 4.3 },
    { id: '3', name: 'Direct Energy', rating: 4.0 },
    { id: '4', name: 'Green Mountain Energy', rating: 4.7 },
    { id: '5', name: 'Cirro Energy', rating: 3.8 },
    { id: '6', name: 'Champion Energy', rating: 4.2 },
    { id: '7', name: 'Gexa Energy', rating: 3.9 },
    { id: '8', name: 'Just Energy', rating: 3.7 },
  ];
}

/**
 * Fetch plans from UtilityAPI - Real retail energy plan data
 * UtilityAPI provides access to current Texas retail energy plans and rates
 */
async function fetchPlansWithRetry(
  apiKey: string,
  retries = 3
): Promise<Plan[]> {
  try {
    // Try to get plans from UtilityAPI first
    const data = await fetchUtilityAPIWithRetry('/plans?state=TX&active=true', apiKey, retries);

    if (data && data.plans && Array.isArray(data.plans)) {
      // Map UtilityAPI response to our Plan interface
      return data.plans.map((plan: any) => ({
        id: plan.id.toString(),
        supplierId: plan.supplier_id.toString(),
        supplierName: plan.supplier_name || plan.utility_name,
        name: plan.name || `${plan.supplier_name} Plan`,
        rate: plan.rate_per_kwh || plan.rate || 12.0, // Default rate if not provided
        renewablePercentage: plan.renewable_percentage || plan.green_percentage || 0,
        fees: {
          delivery: plan.delivery_fee || plan.tdsp_fee || 3.5,
          admin: plan.admin_fee || 5.0,
        },
      }));
    }
  } catch (error) {
    console.warn('Could not fetch plans from UtilityAPI, falling back to mock data:', error);
  }

  // Fallback to mock data if UtilityAPI fails
  console.log('Using mock plan data as fallback');
  const suppliers = await fetchSuppliersWithRetry(apiKey);

  // Generate static plans based on suppliers with advanced rate structures
  const plans: Plan[] = [];
  suppliers.forEach((supplier, index) => {
    // Create 2-4 plans per supplier with varying rates and structures
    const planCount = 2 + (index % 3);
    for (let j = 0; j < planCount; j++) {
      const baseRate = 8 + (index * 0.5) + (j * 0.3);
      const planType = j % 4; // 0: fixed, 1: tiered, 2: TOU, 3: seasonal

      let plan: Plan;

      switch (planType) {
        case 0: // Fixed rate
          plan = {
            id: `${supplier.id}-${j + 1}`,
            supplierId: supplier.id,
            supplierName: supplier.name,
            name: `${supplier.name} Fixed Rate`,
            rate: Math.round(baseRate * 100) / 100,
            renewablePercentage: j === 1 ? 100 : j === 2 ? 50 : 0,
            fees: {
              delivery: 3.5 + (j * 0.2),
              admin: 5.0,
            },
          };
          break;

        case 1: // Tiered rate (Texas residential tiers)
          plan = {
            id: `${supplier.id}-${j + 1}`,
            supplierId: supplier.id,
            supplierName: supplier.name,
            name: `${supplier.name} Tiered Rate`,
            rate: Math.round(baseRate * 100) / 100, // fallback rate
            renewablePercentage: j === 1 ? 100 : j === 2 ? 50 : 0,
            fees: {
              delivery: 3.5 + (j * 0.2),
              admin: 5.0,
            },
            rateStructure: {
              type: 'tiered',
              tiered: {
                tiers: [
                  { minKwh: 0, maxKwh: 500, ratePerKwh: Math.round((baseRate - 1) * 100) / 100 },
                  { minKwh: 501, maxKwh: 1000, ratePerKwh: Math.round(baseRate * 100) / 100 },
                  { minKwh: 1001, maxKwh: 999999, ratePerKwh: Math.round((baseRate + 1) * 100) / 100 },
                ],
              },
            },
          };
          break;

        case 2: // Time-of-Use rate
          plan = {
            id: `${supplier.id}-${j + 1}`,
            supplierId: supplier.id,
            supplierName: supplier.name,
            name: `${supplier.name} Time-of-Use`,
            rate: Math.round(baseRate * 100) / 100, // fallback rate
            renewablePercentage: j === 1 ? 100 : j === 2 ? 50 : 0,
            fees: {
              delivery: 3.5 + (j * 0.2),
              admin: 5.0,
            },
            rateStructure: {
              type: 'tou',
              tou: {
                peakHours: { start: '16:00', end: '21:00', ratePerKwh: Math.round((baseRate + 2) * 100) / 100 },
                offPeakRatePerKwh: Math.round((baseRate - 2) * 100) / 100,
                superOffPeakRatePerKwh: Math.round((baseRate - 3) * 100) / 100,
              },
            },
          };
          break;

        case 3: // Seasonal rate
          plan = {
            id: `${supplier.id}-${j + 1}`,
            supplierId: supplier.id,
            supplierName: supplier.name,
            name: `${supplier.name} Seasonal Rate`,
            rate: Math.round(baseRate * 100) / 100, // fallback rate
            renewablePercentage: j === 1 ? 100 : j === 2 ? 50 : 0,
            fees: {
              delivery: 3.5 + (j * 0.2),
              admin: 5.0,
            },
            rateStructure: {
              type: 'seasonal',
              seasonal: {
                winterRatePerKwh: Math.round((baseRate - 1) * 100) / 100,
                summerRatePerKwh: Math.round((baseRate + 1) * 100) / 100,
                seasonalMonths: {
                  winter: [0, 1, 2, 3, 9, 10, 11], // Jan-Apr, Oct-Dec
                  summer: [4, 5, 6, 7, 8], // May-Sep
                },
              },
            },
          };
          break;

        default:
          plan = {
            id: `${supplier.id}-${j + 1}`,
            supplierId: supplier.id,
            supplierName: supplier.name,
            name: `${supplier.name} Fixed Rate`,
            rate: Math.round(baseRate * 100) / 100,
            renewablePercentage: j === 1 ? 100 : j === 2 ? 50 : 0,
            fees: {
              delivery: 3.5 + (j * 0.2),
              admin: 5.0,
            },
          };
      }

      plans.push(plan);
    }
  });

  return plans;
}

/**
 * Get suppliers with caching
 */
export async function getSuppliers(apiKey: string): Promise<Supplier[]> {
  const now = Date.now();
  
  if (supplierCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return supplierCache;
  }

  try {
    supplierCache = await fetchSuppliersWithRetry(apiKey);
    cacheTimestamp = now;
    return supplierCache;
  } catch (error) {
    // Return cached data if available, even if stale
    if (supplierCache) {
      console.warn('Using stale supplier cache due to API error');
      return supplierCache;
    }
    throw error;
  }
}

/**
 * Get plans with caching
 */
export async function getPlans(apiKey: string): Promise<Plan[]> {
  const now = Date.now();
  
  if (planCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return planCache;
  }

  try {
    planCache = await fetchPlansWithRetry(apiKey);
    cacheTimestamp = now;
    return planCache;
  } catch (error) {
    // Return cached data if available, even if stale
    if (planCache) {
      console.warn('Using stale plan cache due to API error');
      return planCache;
    }
    throw error;
  }
}

/**
 * Clear API cache (useful for testing or forced refresh)
 */
export function clearCache(): void {
  supplierCache = null;
  planCache = null;
  cacheTimestamp = 0;
}

