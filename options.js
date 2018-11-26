// オプションページ

"use strict";

/* global StorageKeys, SiteKeys, logging, delayInvoke, setStorageItem, getStorageItem */

(function () {
  let settings = null;

  const siteGoogleElement = document.getElementById("icon-site-google");
  const siteDuckDuckGoElement = document.getElementById("icon-site-duckduckgo");
  const siteHatenaElement = document.getElementById("icon-site-hatena");

  /** 
   * initialize
   */
  const initialize = async () => {
    try {
      siteGoogleElement.value = SiteKeys.Google;
      siteDuckDuckGoElement.value = SiteKeys.DuckDuckGo;
      siteHatenaElement.value = SiteKeys.Hatena;
      
      settings = await getStorageItem(StorageKeys.Settings);
      const onUpdatedElementValueForInput = (evt) => {
        delayInvoke(() => {
          try {
            saveConfigValue(evt.target);
            setStorageItem(StorageKeys.Settings, settings);
          } catch (e) {
            logging(e);
          }
        }, 100)
      };
      loadConfigValue(siteGoogleElement);

      siteGoogleElement.addEventListener("input", onUpdatedElementValueForInput, false);
      siteDuckDuckGoElement.addEventListener("input", onUpdatedElementValueForInput, false);
      siteHatenaElement.addEventListener("input", onUpdatedElementValueForInput, false);
      
      document.getElementById("main-form").style.removeProperty("visibility");
    } catch (e) {
      logging(e);
    }
  };

  /**
   * @param {HTMLElement} element 
   * @return {number|string}
   */
  const getElementValue = (element) => {
    if (element.tagName === "INPUT") {
      switch (element.type) {
        case "checkbox":
          return element.checked === true;
        case "text":
        case "color":
          return element.value;
        case "number":
        case "range":
          return element.valueAsNumber;
        case "radio":
          for (let radioElm of document.getElementsByName(element.name)) {
            if (radioElm.checked === true) {
              return radioElm.value;
            }
          }
          break;
        default:
          return;
      }
    } else if (element.tagName === "TEXTAREA") {
      return element.value;
    }
  }

  /**
   * @param {HTMLElement} element 
   */
  const saveConfigValue = (element) => {
    if (!element.validity.valid) {
      return;
    }
    let configKey = element.getAttribute("data-storage-key");
    settings[configKey] = getElementValue(element);
  }

  /**
   * @param {HTMLElement} element 
   */
  const loadConfigValue = (element) => {
    let configKey = element.getAttribute("data-storage-key");
    let value = settings[configKey];
    if (!value) {
      return;
    }
    if (element.tagName === "INPUT") {
      switch (element.type) {
        case "checkbox":
          element.checked = value;
          break;
        case "text":
        case "color":
          element.value = value;
          break;
        case "number":
        case "range":
          element.valueAsNumber = value;
          break;
        case "radio":
          for (let radioElm of document.getElementsByName(element.name)) {
            if (radioElm.value === value) {
              radioElm.checked = true;
              break;
            }
          }
          break;
        default:
          return;
      }
    } else if (element.tagName === "TEXTAREA") {
      element.value = value;
    }
  }

  initialize();
})();