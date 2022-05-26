const https = require('https');
const axios = require('axios');
const { filterNew, getCachedNum, isCacheInitialized, updateCache } = require('../cache');
const { extractAll } = require('../utils');

const run = async query => {
  const cacheKey = `canimeSpecial${query}`;

  try {
    const url = `http://special.canime.jp/${encodeURIComponent(query)}/`;
    const agent = new https.Agent({
      rejectUnauthorized: false
    });
    const res = await axios.get(url, { httpsAgent: agent });

    const itemIds = extractAll(res.data, /<a href="\/cart\/add\?n=([A-Za-z0-9-]+)"/g);
    const numResults = itemIds.length;
    const newItemIds = filterNew(cacheKey, itemIds);

    let messages = [];
    if (numResults != getCachedNum(cacheKey)) {
      messages.push(`${query} on Canime Special: ${numResults} results (previously ${getCachedNum(cacheKey)})\n${url}`);
    }
    if (isCacheInitialized(cacheKey) && newItemIds.length) {
      messages.push(`${query} on Canime Special new items:\n${newItemIds.map(itemId => `https://special.canime.jp/cart/add?n=${itemId}`).join('\n')}`);
      newItemIds.slice(0, 3).forEach(itemId => messages.push(`https://special.canime.jp/misc/jk/${itemId}.jpg`));
    }

    updateCache(cacheKey, itemIds, numResults);

    return messages;
  } catch (err) {
    return [`Canime Special (${query}) failed: ${err.response?.status}`];
  }
};

module.exports = run;
