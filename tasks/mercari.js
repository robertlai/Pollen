const axios = require('axios');
const puppeteer = require('puppeteer');

let initializedCache = {};
let itemCache = {};

const run = async query => {
  try {
    const itemIdRegex = /href="\/item\/(\w+)">/g;
    const url = `https://jp.mercari.com/search?keyword=${encodeURIComponent(query)}&status=on_sale&sort=created_time&order=desc`;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    const pageHtml = await page.evaluate('new XMLSerializer().serializeToString(document.doctype) + document.documentElement.outerHTML');

    const itemIdMatches = [...pageHtml.matchAll(itemIdRegex)];
    const itemIds = itemIdMatches.map(itemIdMatch => itemIdMatch[1]);
    const newItemIds = itemIds.filter(itemId => !itemCache[query]?.[itemId]);

    let messages = [];
    if (initializedCache[query] && newItemIds.length) {
      messages.push(`${query} on Mercari new items:\n${newItemIds.map(itemId => `https://jp.mercari.com/item/${itemId}`).join('\n')}`);
      newItemIds.slice(0, 3).forEach(itemId => messages.push(`https://static.mercdn.net/c!/w=240/thumb/photos/${itemId}_1.jpg`));
    }

    initializedCache[query] = true;
    itemCache[query] = itemIds.reduce((acc, cur) => ({...acc, [cur]: true}), {});

    return messages;
  } catch (err) {
    return [`Mercari (${query}) failed: ${err}`];
  }
};

module.exports = run;
