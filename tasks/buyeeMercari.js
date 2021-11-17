const axios = require('axios');

let initializedCache = {};
let numResultsCache = {};
let itemCache = {};

const run = query => {
  const numResultsRegex = new RegExp(`&quot;${query}&quot;\\s*(\\d+)\\s*results`);
  const itemIdRegex = /<a href="\/mercari\/item\/(\w+)"/g;
  const url = `https://buyee.jp/mercari/search?keyword=${encodeURIComponent(query)}`;

  return axios.get(url).then(res => {
    const numResultsMatch = res.data.match(numResultsRegex);
    const numResults = numResultsMatch[1];

    const itemIdMatches = [...res.data.matchAll(itemIdRegex)];
    const itemIds = itemIdMatches.map(itemIdMatch => itemIdMatch[1]);
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
  }).catch(err => {
    return [`Buyee Mercari (${query}) failed: ${err.response?.status}`];
  });
};

module.exports = run;
