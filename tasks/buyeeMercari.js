const axios = require('axios');
const { filterNew, getCachedNum, isCacheInitialized, updateCache } = require('../cache');
const { extractAll, extractOne } = require('../utils');

const run = async query => {
  const cacheKey = `buyeeMercari${query}`;

  try {
    const url = `https://buyee.jp/mercari/search?keyword=${encodeURIComponent(query)}`;
    const res = await axios.get(url);

    const numResults = extractOne(res.data, /&quot;\s*(\d+)\s*results/);
    const itemIds = extractAll(res.data, /<a href="\/mercari\/item\/(\w+)(\?|")/g);
    const newItemIds = filterNew(cacheKey, itemIds);

    let messages = [];
    if (numResults != getCachedNum(cacheKey)) {
      messages.push(`${query} on Buyee Mercari: ${numResults} results (previously ${getCachedNum(cacheKey)})\n${url}`);
    }
    if (isCacheInitialized(cacheKey) && newItemIds.length) {
      messages.push(`${query} on Buyee Mercari new items:\n${newItemIds.map(itemId => `https://buyee.jp/mercari/item/${itemId}`).join('\n')}`);
      newItemIds.slice(0, 3).forEach(itemId => messages.push(`https://static.mercdn.net/c!/w=240/thumb/photos/${itemId}_1.jpg`));
    }

    updateCache(cacheKey, itemIds, numResults);

    return messages;
  } catch (err) {
    return [`Buyee Mercari (${query}) failed: ${err.response?.status}`];
  }
};

module.exports = run;
