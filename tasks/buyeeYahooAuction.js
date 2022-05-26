const axios = require('axios');
const { filterNew, getCachedNum, isCacheInitialized, updateCache } = require('../cache');
const { extractAll, extractOne } = require('../utils');

const run = async query => {
  const cacheKey = `buyeeYahooAuction${query}`;

  try {
    const url = `https://buyee.jp/item/search/query/${encodeURIComponent(query)}?sort=end&order=d`;
    const res = await axios.get(url);

    const numResults = extractOne(res.data, /\/\s*(\d+)\s*hits/);
    const itemIds = extractAll(res.data, /outer">\s*<a href="\/item\/yahoo\/auction\/(\w+)(\?|")/g);
    const imgSrcs = extractAll(res.data, /data-src="([^\?]+)\?/g);
    const itemIdToImgSrc = itemIds.reduce((acc, cur, i) => ({...acc, [cur]: imgSrcs[i]}), {});
    const newItemIds = filterNew(cacheKey, itemIds);

    let messages = [];
    if (numResults != getCachedNum(cacheKey)) {
      messages.push(`${query} on Buyee Yahoo Auction: ${numResults} results (previously ${getCachedNum(cacheKey)})\n${url}`);
    }
    if (isCacheInitialized(cacheKey) && newItemIds.length) {
      messages.push(`${query} on Buyee Yahoo Auction new items:\n${newItemIds.map(itemId => `https://buyee.jp/item/yahoo/auction/${itemId}`).join('\n')}`);
      newItemIds.slice(0, 3).forEach(itemId => messages.push(itemIdToImgSrc[itemId]));
    }

    updateCache(cacheKey, itemIds, numResults);

    return messages;
  } catch (err) {
    if (err.response?.status === 404) {
      updateCache(cacheKey, [], 0);
      return [];
    } else {
      return [`Buyee Yahoo Auction (${query}) failed: ${err.response?.status}`];
    }
  }
};

module.exports = run;
