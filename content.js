"use strict";

/* global browser, logging, StorageKeys, SiteKeys, getStorageItem */

/** @typedef {{iconSite:string}} CommonSettings */

/** @type {CommonSettings} */
let settings = null;

/** @type {MutationObserver} */
let pageObserver = null;

/** @type {IntersectionObserver} */
let imageIntersectObserver = null;

/** @type {string} */
const NULL_IMAGE_DATA = browser.runtime.getURL("empty.gif");

const initialize = async () => {
  try {
    let rootElm = document.querySelector("#res");
    if (rootElm == null) {
      return;
    }
    // load settings
    settings = await getStorageItem(StorageKeys.Settings);

    // start observation
    pageObserver = new MutationObserver(((records, observer) => {
      scanTargetLinks(records, observer);
    }));
    pageObserver.observe(rootElm, {
      childList: true,
      subtree: true,
    });

    let itersectObsOption = {
      threshold: [0.0, 1.0],
      rootMargin: "50% 0% 50% 0%"
    };
    imageIntersectObserver = new IntersectionObserver((entries, observer) => {
      intersectionChanged(entries, observer);
    }, itersectObsOption);
  } catch (e) {
    logging(e);
  }
}


/**
 * 
 * @param {MutationRecord[]} records 
 * @param {MutationObserver} observer 
 */
const scanTargetLinks = (records, observer) => {
  if (pageObserver == null) {
    return;
  }
  window.requestIdleCallback(async () => {
    try {
      let iconSite = settings.iconSite;
      
      let resultRootElm = getResultRootElement();
      if (resultRootElm == null) {
        return;
      }
      let anchorElms = resultRootElm.querySelectorAll("a cite:not([data-ext-favicon])");
      for (let anchorElm of anchorElms) {
        let linkElm = null;
        let parentElm = anchorElm;
        while ((parentElm = parentElm.parentElement) != null) {
          if (parentElm.tagName === "A") {
            linkElm = parentElm;
            break;
          }
        }
        if (linkElm == null) {
          continue;
        }

        anchorElm.setAttribute("data-ext-favicon", "true");

        let url = new URL(linkElm.href)
        let faviconUrl = null;

        let imgElm = document.createElement("img");
        imgElm.classList.add("ext-favicon");
        switch (iconSite) {
          case SiteKeys.Google:
            faviconUrl = `//www.google.com/s2/favicons?domain=${url.hostname}`;
            break;
          case SiteKeys.Hatena:
            faviconUrl = `//cdn-ak.favicon.st-hatena.com/?url=${url.protocol}//${url.hostname}/`;
            break;
        }
        imgElm.setAttribute("data-ext-favicon-src", faviconUrl);
        imgElm.width = 16;
        imgElm.height = 16;
        imgElm.src = NULL_IMAGE_DATA;

        let containerElm = document.createElement("div");
        containerElm.classList.add("ext-favicon-container");
        containerElm.appendChild(imgElm);

        anchorElm.insertBefore(containerElm, anchorElm.firstChild);

        imageIntersectObserver.observe(imgElm);
      }
    } catch (e) {
      logging(e);
    }
  });
}

const getResultRootElement= () => {
  let elm = null;
  elm = document.querySelector("#rcnt");
  if (elm != null) {
    return elm;
  }
  elm = document.querySelector("#ires");
  if (elm != null) {
    return elm;
  }
  return null;
}


/**
 * 
 * @param {IntersectionObserverEntry[]} entries 
 * @param {IntersectionObserver} observer 
 */
const intersectionChanged = (entries, observer) => {
  try {
    for (let entry of entries) {
      let imgElm = entry.target;
      if (!entry.isIntersecting) {
        continue;
      }
      if (!imgElm.hasAttribute("data-ext-favicon-src")) {
        continue;
      }
      imageIntersectObserver.unobserve(imgElm);
      imgElm.src = imgElm.getAttribute("data-ext-favicon-src");
      imgElm.removeAttribute("data-ext-favicon-src");
    }
  } catch (e) {
    logging(e);
  }
}


document.addEventListener("DOMContentLoaded", async (event) => {
  await initialize();
  scanTargetLinks();
});