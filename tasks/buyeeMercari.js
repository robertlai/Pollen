const axios = require('axios');
const { extractAll, extractOne } = require('../utils');

let initializedCache = {};
let numResultsCache = {};
let itemCache = {};

const run = async query => {
  try {
    const url = `https://buyee.jp/mercari/search?keyword=${encodeURIComponent(query)}`;
    const res = await axios.get(url);

    const numResults = extractOne(res.data, /&quot;\s*(\d+)\s*results/);
    const itemIds = extractAll(res.data, /<a href="\/mercari\/item\/(\w+)(\?|")/g);
    const newItemIds = itemIds.filter(itemId => !itemCache[query]?.[itemId]);

    let messages = [];
    if (numResults != numResultsCache[query]) {
      messages.push(`${query} on Buyee Mercari: ${numResults} results (previously ${numResultsCache[query] || 0})\n${url}`);
    }
    if (initializedCache[query] && newItemIds.length) {
      messages.push(`${query} on Buyee Mercari new items:\n${newItemIds.map(itemId => `https://buyee.jp/mercari/item/${itemId}`).join('\n')}`);
      newItemIds.slice(0, 3).forEach(itemId => messages.push(`https://static.mercdn.net/c!/w=240/thumb/photos/${itemId}_1.jpg`));
    }

    initializedCache[query] = true;
    numResultsCache[query] = numResults;
    itemCache[query] = itemIds.reduce((acc, cur) => ({...acc, [cur]: true}), {});

    return messages;
  } catch (err) {
    return [`Buyee Mercari (${query}) failed: ${err.response?.status}`];
  }
};

module.exports = run;
