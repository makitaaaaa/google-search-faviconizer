"use strict";

/** @type {MutationObserver} */
let pageObserver = null;

/** @type {IntersectionObserver} */
let imageIntersectObserver = null;

/** @type {number} */
let rotationIndex = 0;

/** @type {number} */
//const ROTATION_COUNT = 3;

/** @type {string} */
const NULL_IMAGE_DATA = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

const initialize = () => {
  try {
    let rootElm = document.querySelector("#res");
    if (rootElm == null) {
      return;
    }
    pageObserver = new MutationObserver(((records, observer) => {
      scanTargetLinks(records, observer);
    }));
    pageObserver.observe(rootElm, {
      childList: true,
      subtree: true,
    });

    let itersectObsOption = {
      threshold: [0.0, 1.0],
      rootMargin: "25% 0% 25% 0%"
    };
    imageIntersectObserver = new IntersectionObserver((entries, observer) => {
      intersectionChanged(entries, observer);
    }, itersectObsOption);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
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
  window.requestIdleCallback(() => {
    try {
      let citeElms = document.querySelectorAll("#ires a cite:not([data-ext-favicon])");
      for (let citeElm of citeElms) {
        let linkElm = null;
        let parentElm = citeElm;
        while ((parentElm = parentElm.parentElement) != null) {
          if (parentElm.tagName === "A") {
            linkElm = parentElm;
            break;
          }
        }
        if (linkElm == null) {
          continue;
        }

        citeElm.setAttribute("data-ext-favicon", "true");

        let url = new URL(linkElm.href)
        let faviconUrl = null;

        let imgElm = document.createElement("img");
        imgElm.classList.add("ext-favicon");
        switch (rotationIndex) {
          case 0:
            faviconUrl = `//www.google.com/s2/favicons?domain=${url.hostname}`;
            break;
          case 1:
            faviconUrl = `//cdn-ak.favicon.st-hatena.com/?url=${url.protocol}//${url.hostname}/`;
            break;
          case 2:
            faviconUrl = `//proxy.duckduckgo.com/ip3/${url.hostname}.ico`;
            break;
        }
        imgElm.setAttribute("data-ext-favicon-src", faviconUrl);
        imgElm.width = 16;
        imgElm.height = 16;
        imgElm.src = NULL_IMAGE_DATA;

        let containerElm = document.createElement("div");
        containerElm.classList.add("ext-favicon-container");
        containerElm.appendChild(imgElm);

        citeElm.insertBefore(containerElm, citeElm.firstChild);

        //rotationIndex = (rotationIndex + 1) % ROTATION_COUNT;
        imageIntersectObserver.observe(imgElm);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  });
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
    // eslint-disable-next-line no-console
    console.log(e);
  }
}


document.addEventListener("DOMContentLoaded", (event) => {
  initialize();
  scanTargetLinks();
});
