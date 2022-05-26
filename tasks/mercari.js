const axios = require('axios');
const puppeteer = require('puppeteer');
const { filterNew, getCachedNum, isCacheInitialized, updateCache } = require('../cache');
const { extractAll } = require('../utils');

const run = async query => {
  const cacheKey = `mercari${query}`;

  try {
    const url = `https://jp.mercari.com/search?keyword=${encodeURIComponent(query)}&status=on_sale&sort=created_time&order=desc`;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    const pageHtml = await page.evaluate('new XMLSerializer().serializeToString(document.doctype) + document.documentElement.outerHTML');

    const itemIds =  extractAll(pageHtml, /href="\/item\/(\w+)">/g);
    const newItemIds = filterNew(cacheKey, itemIds);

    let messages = [];
    if (isCacheInitialized(cacheKey) && newItemIds.length) {
      messages.push(`${query} on Mercari new items:\n${newItemIds.slice(0, 3).map(itemId => `https://jp.mercari.com/item/${itemId}`).join('\n')}`);
      newItemIds.slice(0, 3).forEach(itemId => messages.push(`https://static.mercdn.net/c!/w=240/thumb/photos/${itemId}_1.jpg`));
    }

    updateCache(cacheKey, itemIds);

    return messages;
  } catch (err) {
    return [`Mercari (${query}) failed: ${err}`];
  }
};

module.exports = run;
