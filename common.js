"use strict";

/* eslint no-unused-vars: 0 */

const StorageKeys = {
  Settings: "settings"
}

const SiteKeys = {
  Google: "google",
  Hatena: "hatena"
}

/**
 * 
 * @param {[*]} args 
 */
const logging = (...args) => {
  // eslint-disable-next-line no-console
  console.log(...args);
}

/**
 * @param {string} key 
 * @param {*} val 
 */
const setStorageItem = async (key, val) => {
  let item = {};
  item[key] = val;
  chrome.storage.local.set(item);
}

/**
 * @param {string} key 
 * @return {*}
 */
const getStorageItem = async (key) => {
  let item = await browser.storage.local.get(key);
  if (item == null) {
    return null;
  }
  if (item[key] == null) {
    return null;
  }
  return item[key];
}

let delayInvokeTimer = 0;

const delayInvoke = (() => {
  return (callback, ms) => {
    clearTimeout(delayInvokeTimer);
    delayInvokeTimer = setTimeout(callback, ms);
  };
})();