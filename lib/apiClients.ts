import { Supplier, Plan } from './types';

// Cache for API responses
let supplierCache: Supplier[] | null = null;
let planCache: Plan[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Fetch suppliers from UtilityAPI with retry logic
 */
async function fetchSuppliersWithRetry(
  apiKey: string,
  retries = 3
): Promise<Supplier[]> {
  for (let i = 0; i < retries; i++) {
    try {
      // Mock implementation - replace with actual UtilityAPI endpoint
      // const response = await fetch(`https://api.utilityapi.com/v1/utility-data/texas-suppliers`, {
      //   headers: {
      //     'Authorization': `Bearer ${apiKey}`,
      //   },
      // });

      // For MVP, return mock data
      // In production, uncomment the above and handle the real API response
      await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate API call

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
    } catch (error) {
      if (i === retries - 1) {
        console.error('Failed to fetch suppliers after retries:', error);
        throw error;
      }
      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  return [];
}

/**
 * Fetch plans from Arcadia API with retry logic
 */
async function fetchPlansWithRetry(
  apiKey: string,
  retries = 3
): Promise<Plan[]> {
  for (let i = 0; i < retries; i++) {
    try {
      // Mock implementation - replace with actual Arcadia endpoint
      // const response = await fetch(`https://api.arcadia.com/v1/plans`, {
      //   headers: {
      //     'Authorization': `Bearer ${apiKey}`,
      //   },
      // });

      // For MVP, return mock data
      // In production, uncomment the above and handle the real API response
      await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate API call

      const suppliers = await fetchSuppliersWithRetry(apiKey);
      
      // Generate mock plans
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
    } catch (error) {
      if (i === retries - 1) {
        console.error('Failed to fetch plans after retries:', error);
        throw error;
      }
      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  return [];
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

