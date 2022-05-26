const axios = require('axios');
const { extractAll, extractOne } = require('../utils');

let initializedCache = {};
let numResultsCache = {};
let itemCache = {};

const run = async query => {
  try {
    const url = `https://buyee.jp/item/search/query/${encodeURIComponent(query)}?sort=end&order=d`;
    const res = await axios.get(url);

    const numResults = extractOne(res.data, /\/\s*(\d+)\s*hits/);
    const itemIds = extractAll(res.data, /outer">\s*<a href="\/item\/yahoo\/auction\/(\w+)(\?|")/g);
    const imgSrcs = extractAll(res.data, /data-src="([^\?]+)\?/g);
    const itemIdToImgSrc = itemIds.reduce((acc, cur, i) => ({...acc, [cur]: imgSrcs[i]}), {});
    const newItemIds = itemIds.filter(itemId => !itemCache[query]?.[itemId]);

    let messages = [];
    if (numResults != numResultsCache[query]) {
      messages.push(`${query} on Buyee Yahoo Auction: ${numResults} results (previously ${numResultsCache[query] || 0})\n${url}`);
    }
    if (initializedCache[query] && newItemIds.length) {
      messages.push(`${query} on Buyee Yahoo Auction new items:\n${newItemIds.map(itemId => `https://buyee.jp/item/yahoo/auction/${itemId}`).join('\n')}`);
      newItemIds.slice(0, 3).forEach(itemId => messages.push(itemIdToImgSrc[itemId]));
    }

    initializedCache[query] = true;
    numResultsCache[query] = numResults;
    itemCache[query] = itemIds.reduce((acc, cur) => ({...acc, [cur]: true}), {});

    return messages;
  } catch (err) {
    if (err.response?.status === 404) {
      initializedCache[query] = true;
      numResultsCache[query] = 0;
      itemCache[query] = {};
      return [];
    } else {
      return [`Buyee Yahoo Auction (${query}) failed: ${err.response?.status}`];
    }
  }
};

module.exports = run;
