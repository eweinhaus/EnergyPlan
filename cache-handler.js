// Vercel Incremental Cache Handler
// This enables better caching for API responses and static content

class CacheHandler {
  constructor() {
    this.cache = new Map();
  }

  async get(key) {
    return this.cache.get(key.value) || null;
  }

  async set(key, data, { revalidate }) {
    this.cache.set(key.value, {
      value: data,
      lastModified: Date.now(),
      revalidate,
    });
  }

  async revalidateTag(tag) {
    // Simple implementation - clear cache on revalidate
    this.cache.clear();
  }
}

module.exports = CacheHandler;

