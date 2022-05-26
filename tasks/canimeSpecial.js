const https = require('https');
const axios = require('axios');
const { extractAll } = require('../utils');

let initializedCache = {};
let numResultsCache = {};
let itemCache = {};

const run = async query => {
  try {
    const url = `http://special.canime.jp/${encodeURIComponent(query)}/`;
    const agent = new https.Agent({
      rejectUnauthorized: false
    });
    const res = await axios.get(url, { httpsAgent: agent });

    const itemIds = extractAll(res.data, /<a href="\/cart\/add\?n=([A-Za-z0-9-]+)"/g);
    const numResults = itemIds.length;
    const newItemIds = itemIds.filter(itemId => !itemCache[query]?.[itemId]);

    let messages = [];
    if (numResults != numResultsCache[query]) {
      messages.push(`${query} on Canime Special: ${numResults} results (previously ${numResultsCache[query] || 0})\n${url}`);
    }
    if (initializedCache[query] && newItemIds.length) {
      messages.push(`${query} on Canime Special new items:\n${newItemIds.map(itemId => `https://special.canime.jp/cart/add?n=${itemId}`).join('\n')}`);
      newItemIds.slice(0, 3).forEach(itemId => messages.push(`https://special.canime.jp/misc/jk/${itemId}.jpg`));
    }

    initializedCache[query] = true;
    numResultsCache[query] = numResults;
    itemCache[query] = itemIds.reduce((acc, cur) => ({...acc, [cur]: true}), {});

    return messages;
  } catch (err) {
    return [`Canime Special (${query}) failed: ${err.response?.status}`];
  }
};

module.exports = run;
