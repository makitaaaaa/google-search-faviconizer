"use strict";

/* global browser, logging, StorageKeys, SiteKeys, getStorageItem, setStorageItem */

/** @typedef {{iconSite:string}} CommonSettings */

(function () {
  /** @type {CommonSettings} */
  let commonSettings = {};

  /** 
   * initialize
   */
  const initialize = async () => {
    try {
      let loadSettigns = await getStorageItem(StorageKeys.Settings);
      let defaultSettings = {};

      defaultSettings.iconSite = SiteKeys.Google;
      commonSettings = Object.assign(defaultSettings, loadSettigns);
      await setStorageItem(StorageKeys.Settings, commonSettings);
    } catch (e) {
      logging(e);
    }
  }

  initialize();
})();