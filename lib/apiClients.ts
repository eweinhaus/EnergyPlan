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
 * Fetch suppliers - Static data since EIA doesn't provide retail supplier catalogs
 * EIA provides statistical data, not individual retail energy supplier information
 */
async function fetchSuppliersWithRetry(
  apiKey: string,
  retries = 3
): Promise<Supplier[]> {
  // Note: EIA API does not provide retail energy supplier catalogs.
  // EIA provides aggregate statistical data about energy markets.
  // For retail supplier data, we use static/mock data.
  // In the future, this could be replaced with a retail supplier API or database.
  
  await new Promise((resolve) => setTimeout(resolve, 50)); // Small delay for consistency

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
 * Fetch plans - Static data since EIA doesn't provide retail plan catalogs
 * EIA provides statistical data, not individual retail energy plan information
 */
async function fetchPlansWithRetry(
  apiKey: string,
  retries = 3
): Promise<Plan[]> {
  // Note: EIA API does not provide retail energy plan catalogs.
  // EIA provides aggregate statistical data about energy markets.
  // For retail plan data, we use static/mock data.
  // In the future, this could be replaced with a retail plan API or database.
  
  await new Promise((resolve) => setTimeout(resolve, 50)); // Small delay for consistency

  const suppliers = await fetchSuppliersWithRetry(apiKey);
  
  // Generate static plans based on suppliers
  const plans: Plan[] = [];
  suppliers.forEach((supplier, index) => {
    // Create 2-3 plans per supplier with varying rates
    const planCount = 2 + (index % 2);
    for (let j = 0; j < planCount; j++) {
      const baseRate = 8 + (index * 0.5) + (j * 0.3);
      plans.push({
        id: `${supplier.id}-${j + 1}`,
        supplierId: supplier.id,
        supplierName: supplier.name,
        name: `${supplier.name} ${j === 0 ? 'Fixed Rate' : j === 1 ? 'Green Choice' : 'Premium'}`,
        rate: Math.round(baseRate * 100) / 100,
        renewablePercentage: j === 1 ? 100 : j === 2 ? 50 : 0,
        fees: {
          delivery: 3.5 + (j * 0.2),
          admin: 5.0,
        },
      });
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

