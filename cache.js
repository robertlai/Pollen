const itemCache = {};
const numCache = {};

const filterNew = (cacheKey, items) => items.filter(item => !itemCache[cacheKey]?.has(item));

const getCachedNum = (cacheKey) => numCache[cacheKey] || 0;

const isCacheInitialized = (cacheKey) => !!itemCache[cacheKey];

const updateCache = (cacheKey, items, num) => {
  numCache[cacheKey] = num || items.length;
  itemCache[cacheKey] = new Set(items);
};

module.exports = {
  filterNew,
  getCachedNum,
  isCacheInitialized,
  updateCache,
};
