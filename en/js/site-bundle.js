(() => {
  // <stdin>
  (() => {
    var _extends = Object.assign || function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    var isSupported = function isSupported2(node) {
      return node.tagName === "IMG";
    };
    var isNodeList = function isNodeList2(selector) {
      return NodeList.prototype.isPrototypeOf(selector);
    };
    var isNode = function isNode2(selector) {
      return selector && selector.nodeType === 1;
    };
    var isSvg = function isSvg2(image) {
      var source = image.currentSrc || image.src;
      return source.substr(-4).toLowerCase() === ".svg";
    };
    var getImagesFromSelector = function getImagesFromSelector2(selector) {
      try {
        if (Array.isArray(selector)) {
          return selector.filter(isSupported);
        }
        if (isNodeList(selector)) {
          return [].slice.call(selector).filter(isSupported);
        }
        if (isNode(selector)) {
          return [selector].filter(isSupported);
        }
        if (typeof selector === "string") {
          return [].slice.call(document.querySelectorAll(selector)).filter(isSupported);
        }
        return [];
      } catch (err) {
        throw new TypeError("The provided selector is invalid.\nExpects a CSS selector, a Node element, a NodeList or an array.\nSee: https://github.com/francoischalifour/medium-zoom");
      }
    };
    var createOverlay = function createOverlay2(background) {
      var overlay = document.createElement("div");
      overlay.classList.add("medium-zoom-overlay");
      overlay.style.background = background;
      return overlay;
    };
    var cloneTarget = function cloneTarget2(template) {
      var _template$getBounding = template.getBoundingClientRect(), top = _template$getBounding.top, left = _template$getBounding.left, width = _template$getBounding.width, height = _template$getBounding.height;
      var clone = template.cloneNode();
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
      clone.removeAttribute("id");
      clone.style.position = "absolute";
      clone.style.top = top + scrollTop + "px";
      clone.style.left = left + scrollLeft + "px";
      clone.style.width = width + "px";
      clone.style.height = height + "px";
      clone.style.transform = "";
      return clone;
    };
    var createCustomEvent = function createCustomEvent2(type, params) {
      var eventParams = _extends({
        bubbles: false,
        cancelable: false,
        detail: void 0
      }, params);
      if (typeof window.CustomEvent === "function") {
        return new CustomEvent(type, eventParams);
      }
      var customEvent = document.createEvent("CustomEvent");
      customEvent.initCustomEvent(type, eventParams.bubbles, eventParams.cancelable, eventParams.detail);
      return customEvent;
    };
    var mediumZoomEsm = function mediumZoom(selector) {
      var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      var Promise2 = window.Promise || function Promise3(fn) {
        function noop() {
        }
        fn(noop, noop);
      };
      var _handleClick = function _handleClick2(event) {
        var target = event.target;
        if (target === overlay) {
          close();
          return;
        }
        if (images.indexOf(target) === -1) {
          return;
        }
        toggle({ target });
      };
      var _handleScroll = function _handleScroll2() {
        if (isAnimating || !active.original) {
          return;
        }
        var currentScroll = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        if (Math.abs(scrollTop - currentScroll) > zoomOptions.scrollOffset) {
          setTimeout(close, 150);
        }
      };
      var _handleKeyUp = function _handleKeyUp2(event) {
        var key = event.key || event.keyCode;
        if (key === "Escape" || key === "Esc" || key === 27) {
          close();
        }
      };
      var update = function update2() {
        var options2 = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
        var newOptions = options2;
        if (options2.background) {
          overlay.style.background = options2.background;
        }
        if (options2.container && options2.container instanceof Object) {
          newOptions.container = _extends({}, zoomOptions.container, options2.container);
        }
        if (options2.template) {
          var template = isNode(options2.template) ? options2.template : document.querySelector(options2.template);
          newOptions.template = template;
        }
        zoomOptions = _extends({}, zoomOptions, newOptions);
        images.forEach(function(image) {
          image.dispatchEvent(createCustomEvent("medium-zoom:update", {
            detail: { zoom }
          }));
        });
        return zoom;
      };
      var clone = function clone2() {
        var options2 = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
        return mediumZoomEsm(_extends({}, zoomOptions, options2));
      };
      var attach = function attach2() {
        for (var _len = arguments.length, selectors = Array(_len), _key = 0; _key < _len; _key++) {
          selectors[_key] = arguments[_key];
        }
        var newImages = selectors.reduce(function(imagesAccumulator, currentSelector) {
          return [].concat(imagesAccumulator, getImagesFromSelector(currentSelector));
        }, []);
        newImages.filter(function(newImage) {
          return images.indexOf(newImage) === -1;
        }).forEach(function(newImage) {
          images.push(newImage);
          newImage.classList.add("medium-zoom-image");
        });
        eventListeners.forEach(function(_ref) {
          var type = _ref.type, listener = _ref.listener, options2 = _ref.options;
          newImages.forEach(function(image) {
            image.addEventListener(type, listener, options2);
          });
        });
        return zoom;
      };
      var detach = function detach2() {
        for (var _len2 = arguments.length, selectors = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          selectors[_key2] = arguments[_key2];
        }
        if (active.zoomed) {
          close();
        }
        var imagesToDetach = selectors.length > 0 ? selectors.reduce(function(imagesAccumulator, currentSelector) {
          return [].concat(imagesAccumulator, getImagesFromSelector(currentSelector));
        }, []) : images;
        imagesToDetach.forEach(function(image) {
          image.classList.remove("medium-zoom-image");
          image.dispatchEvent(createCustomEvent("medium-zoom:detach", {
            detail: { zoom }
          }));
        });
        images = images.filter(function(image) {
          return imagesToDetach.indexOf(image) === -1;
        });
        return zoom;
      };
      var on = function on2(type, listener) {
        var options2 = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
        images.forEach(function(image) {
          image.addEventListener("medium-zoom:" + type, listener, options2);
        });
        eventListeners.push({ type: "medium-zoom:" + type, listener, options: options2 });
        return zoom;
      };
      var off = function off2(type, listener) {
        var options2 = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
        images.forEach(function(image) {
          image.removeEventListener("medium-zoom:" + type, listener, options2);
        });
        eventListeners = eventListeners.filter(function(eventListener) {
          return !(eventListener.type === "medium-zoom:" + type && eventListener.listener.toString() === listener.toString());
        });
        return zoom;
      };
      var open = function open2() {
        var _ref2 = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, target = _ref2.target;
        var _animate = function _animate2() {
          var container = {
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight,
            left: 0,
            top: 0,
            right: 0,
            bottom: 0
          };
          var viewportWidth = void 0;
          var viewportHeight = void 0;
          if (zoomOptions.container) {
            if (zoomOptions.container instanceof Object) {
              container = _extends({}, container, zoomOptions.container);
              viewportWidth = container.width - container.left - container.right - zoomOptions.margin * 2;
              viewportHeight = container.height - container.top - container.bottom - zoomOptions.margin * 2;
            } else {
              var zoomContainer = isNode(zoomOptions.container) ? zoomOptions.container : document.querySelector(zoomOptions.container);
              var _zoomContainer$getBou = zoomContainer.getBoundingClientRect(), _width = _zoomContainer$getBou.width, _height = _zoomContainer$getBou.height, _left = _zoomContainer$getBou.left, _top = _zoomContainer$getBou.top;
              container = _extends({}, container, {
                width: _width,
                height: _height,
                left: _left,
                top: _top
              });
            }
          }
          viewportWidth = viewportWidth || container.width - zoomOptions.margin * 2;
          viewportHeight = viewportHeight || container.height - zoomOptions.margin * 2;
          var zoomTarget = active.zoomedHd || active.original;
          var naturalWidth = isSvg(zoomTarget) ? viewportWidth : zoomTarget.naturalWidth || viewportWidth;
          var naturalHeight = isSvg(zoomTarget) ? viewportHeight : zoomTarget.naturalHeight || viewportHeight;
          var _zoomTarget$getBoundi = zoomTarget.getBoundingClientRect(), top = _zoomTarget$getBoundi.top, left = _zoomTarget$getBoundi.left, width = _zoomTarget$getBoundi.width, height = _zoomTarget$getBoundi.height;
          var scaleX = Math.min(naturalWidth, viewportWidth) / width;
          var scaleY = Math.min(naturalHeight, viewportHeight) / height;
          var scale = Math.min(scaleX, scaleY);
          var translateX = (-left + (viewportWidth - width) / 2 + zoomOptions.margin + container.left) / scale;
          var translateY = (-top + (viewportHeight - height) / 2 + zoomOptions.margin + container.top) / scale;
          var transform = "scale(" + scale + ") translate3d(" + translateX + "px, " + translateY + "px, 0)";
          active.zoomed.style.transform = transform;
          if (active.zoomedHd) {
            active.zoomedHd.style.transform = transform;
          }
        };
        return new Promise2(function(resolve) {
          if (target && images.indexOf(target) === -1) {
            resolve(zoom);
            return;
          }
          var _handleOpenEnd = function _handleOpenEnd2() {
            isAnimating = false;
            active.zoomed.removeEventListener("transitionend", _handleOpenEnd2);
            active.original.dispatchEvent(createCustomEvent("medium-zoom:opened", {
              detail: { zoom }
            }));
            resolve(zoom);
          };
          if (active.zoomed) {
            resolve(zoom);
            return;
          }
          if (target) {
            active.original = target;
          } else if (images.length > 0) {
            var _images = images;
            active.original = _images[0];
          } else {
            resolve(zoom);
            return;
          }
          active.original.dispatchEvent(createCustomEvent("medium-zoom:open", {
            detail: { zoom }
          }));
          scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
          isAnimating = true;
          active.zoomed = cloneTarget(active.original);
          document.body.appendChild(overlay);
          if (zoomOptions.template) {
            var template = isNode(zoomOptions.template) ? zoomOptions.template : document.querySelector(zoomOptions.template);
            active.template = document.createElement("div");
            active.template.appendChild(template.content.cloneNode(true));
            document.body.appendChild(active.template);
          }
          document.body.appendChild(active.zoomed);
          window.requestAnimationFrame(function() {
            document.body.classList.add("medium-zoom--opened");
          });
          active.original.classList.add("medium-zoom-image--hidden");
          active.zoomed.classList.add("medium-zoom-image--opened");
          active.zoomed.addEventListener("click", close);
          active.zoomed.addEventListener("transitionend", _handleOpenEnd);
          if (active.original.getAttribute("data-zoom-src")) {
            active.zoomedHd = active.zoomed.cloneNode();
            active.zoomedHd.removeAttribute("srcset");
            active.zoomedHd.removeAttribute("sizes");
            active.zoomedHd.src = active.zoomed.getAttribute("data-zoom-src");
            active.zoomedHd.onerror = function() {
              clearInterval(getZoomTargetSize);
              console.warn("Unable to reach the zoom image target " + active.zoomedHd.src);
              active.zoomedHd = null;
              _animate();
            };
            var getZoomTargetSize = setInterval(function() {
              if (active.zoomedHd.complete) {
                clearInterval(getZoomTargetSize);
                active.zoomedHd.classList.add("medium-zoom-image--opened");
                active.zoomedHd.addEventListener("click", close);
                document.body.appendChild(active.zoomedHd);
                _animate();
              }
            }, 10);
          } else if (active.original.hasAttribute("srcset")) {
            active.zoomedHd = active.zoomed.cloneNode();
            active.zoomedHd.removeAttribute("sizes");
            active.zoomedHd.removeAttribute("loading");
            var loadEventListener = active.zoomedHd.addEventListener("load", function() {
              active.zoomedHd.removeEventListener("load", loadEventListener);
              active.zoomedHd.classList.add("medium-zoom-image--opened");
              active.zoomedHd.addEventListener("click", close);
              document.body.appendChild(active.zoomedHd);
              _animate();
            });
          } else {
            _animate();
          }
        });
      };
      var close = function close2() {
        return new Promise2(function(resolve) {
          if (isAnimating || !active.original) {
            resolve(zoom);
            return;
          }
          var _handleCloseEnd = function _handleCloseEnd2() {
            active.original.classList.remove("medium-zoom-image--hidden");
            document.body.removeChild(active.zoomed);
            if (active.zoomedHd) {
              document.body.removeChild(active.zoomedHd);
            }
            document.body.removeChild(overlay);
            active.zoomed.classList.remove("medium-zoom-image--opened");
            if (active.template) {
              document.body.removeChild(active.template);
            }
            isAnimating = false;
            active.zoomed.removeEventListener("transitionend", _handleCloseEnd2);
            active.original.dispatchEvent(createCustomEvent("medium-zoom:closed", {
              detail: { zoom }
            }));
            active.original = null;
            active.zoomed = null;
            active.zoomedHd = null;
            active.template = null;
            resolve(zoom);
          };
          isAnimating = true;
          document.body.classList.remove("medium-zoom--opened");
          active.zoomed.style.transform = "";
          if (active.zoomedHd) {
            active.zoomedHd.style.transform = "";
          }
          if (active.template) {
            active.template.style.transition = "opacity 150ms";
            active.template.style.opacity = 0;
          }
          active.original.dispatchEvent(createCustomEvent("medium-zoom:close", {
            detail: { zoom }
          }));
          active.zoomed.addEventListener("transitionend", _handleCloseEnd);
        });
      };
      var toggle = function toggle2() {
        var _ref3 = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, target = _ref3.target;
        if (active.original) {
          return close();
        }
        return open({ target });
      };
      var getOptions = function getOptions2() {
        return zoomOptions;
      };
      var getImages = function getImages2() {
        return images;
      };
      var getZoomedImage = function getZoomedImage2() {
        return active.original;
      };
      var images = [];
      var eventListeners = [];
      var isAnimating = false;
      var scrollTop = 0;
      var zoomOptions = options;
      var active = {
        original: null,
        zoomed: null,
        zoomedHd: null,
        template: null
        // If the selector is omitted, it's replaced by the options
      };
      if (Object.prototype.toString.call(selector) === "[object Object]") {
        zoomOptions = selector;
      } else if (selector || typeof selector === "string") {
        attach(selector);
      }
      zoomOptions = _extends({
        margin: 0,
        background: "#fff",
        scrollOffset: 40,
        container: null,
        template: null
      }, zoomOptions);
      var overlay = createOverlay(zoomOptions.background);
      document.addEventListener("click", _handleClick);
      document.addEventListener("keyup", _handleKeyUp);
      document.addEventListener("scroll", _handleScroll);
      window.addEventListener("resize", close);
      var zoom = {
        open,
        close,
        toggle,
        update,
        clone,
        attach,
        detach,
        on,
        off,
        getOptions,
        getImages,
        getZoomedImage
      };
      return zoom;
    };
    function styleInject(css2, ref) {
      if (ref === void 0) ref = {};
      var insertAt = ref.insertAt;
      if (!css2 || typeof document === "undefined") {
        return;
      }
      var head = document.head || document.getElementsByTagName("head")[0];
      var style = document.createElement("style");
      style.type = "text/css";
      if (insertAt === "top") {
        if (head.firstChild) {
          head.insertBefore(style, head.firstChild);
        } else {
          head.appendChild(style);
        }
      } else {
        head.appendChild(style);
      }
      if (style.styleSheet) {
        style.styleSheet.cssText = css2;
      } else {
        style.appendChild(document.createTextNode(css2));
      }
    }
    var css = ".medium-zoom-overlay{position:fixed;top:0;right:0;bottom:0;left:0;opacity:0;transition:opacity .3s;will-change:opacity}.medium-zoom--opened .medium-zoom-overlay{cursor:pointer;cursor:zoom-out;opacity:1}.medium-zoom-image{cursor:pointer;cursor:zoom-in;transition:transform .3s cubic-bezier(.2,0,.2,1)!important}.medium-zoom-image--hidden{visibility:hidden}.medium-zoom-image--opened{position:relative;cursor:pointer;cursor:zoom-out;will-change:transform}";
    styleInject(css);
    var medium_zoom_esm_default = mediumZoomEsm;
    var codeHighlighting = false;
    var hugoEnvironment = "development";
    var searchEnabled = true;
    function fixMermaid(render = false) {
      let mermaids = [];
      [].push.apply(mermaids, document.getElementsByClassName("language-mermaid"));
      for (let i = 0; i < mermaids.length; i++) {
        let mermaidCodeElement = mermaids[i];
        let newElement = document.createElement("div");
        newElement.innerHTML = mermaidCodeElement.innerHTML;
        newElement.classList.add("mermaid");
        if (render) {
          window.mermaid.mermaidAPI.render(`mermaid-${i}`, newElement.textContent, function(svgCode) {
            newElement.innerHTML = svgCode;
          });
        }
        mermaidCodeElement.parentNode.replaceWith(newElement);
      }
      console.debug(`Processed ${mermaids.length} Mermaid code blocks`);
    }
    function scrollParentToChild(parent, child) {
      const parentRect = parent.getBoundingClientRect();
      const parentViewableArea = {
        height: parent.clientHeight,
        width: parent.clientWidth
      };
      const childRect = child.getBoundingClientRect();
      const isChildInView = childRect.top >= parentRect.top && childRect.bottom <= parentRect.top + parentViewableArea.height;
      if (!isChildInView) {
        parent.scrollTop = childRect.top + parent.scrollTop - parentRect.top;
      }
    }
    function fadeIn(element, duration = 600) {
      element.style.display = "";
      element.style.opacity = "0";
      let last = +/* @__PURE__ */ new Date();
      let tick = function() {
        element.style.opacity = (+element.style.opacity + (/* @__PURE__ */ new Date() - last) / duration).toString();
        last = +/* @__PURE__ */ new Date();
        if (+element.style.opacity < 1) {
          window.requestAnimationFrame && requestAnimationFrame(tick) || setTimeout(tick, 16);
        }
      };
      tick();
    }
    var body = document.body;
    function getThemeMode() {
      return parseInt(localStorage.getItem("wcTheme") || 2);
    }
    function canChangeTheme() {
      return Boolean(window.wc.darkLightEnabled);
    }
    function initThemeVariation() {
      if (!canChangeTheme()) {
        console.debug("User theming disabled.");
        return {
          isDarkTheme: window.wc.isSiteThemeDark,
          themeMode: window.wc.isSiteThemeDark ? 1 : 0
        };
      }
      console.debug("User theming enabled.");
      let isDarkTheme;
      let currentThemeMode = getThemeMode();
      console.debug(`User's theme variation: ${currentThemeMode}`);
      switch (currentThemeMode) {
        case 0:
          isDarkTheme = false;
          break;
        case 1:
          isDarkTheme = true;
          break;
        default:
          if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            isDarkTheme = true;
          } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
            isDarkTheme = false;
          } else {
            isDarkTheme = window.wc.isSiteThemeDark;
          }
          break;
      }
      if (isDarkTheme && !body.classList.contains("dark")) {
        console.debug("Applying dark theme");
        document.body.classList.add("dark");
      } else if (!isDarkTheme && body.classList.contains("dark")) {
        console.debug("Applying light theme");
        document.body.classList.remove("dark");
      }
      return {
        isDarkTheme,
        themeMode: currentThemeMode
      };
    }
    function changeThemeModeClick(newMode) {
      if (!canChangeTheme()) {
        console.debug("Cannot change theme - user theming disabled.");
        return;
      }
      let isDarkTheme;
      switch (newMode) {
        case 0:
          localStorage.setItem("wcTheme", "0");
          isDarkTheme = false;
          console.debug("User changed theme variation to Light.");
          break;
        case 1:
          localStorage.setItem("wcTheme", "1");
          isDarkTheme = true;
          console.debug("User changed theme variation to Dark.");
          break;
        default:
          localStorage.setItem("wcTheme", "2");
          if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            isDarkTheme = true;
          } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
            isDarkTheme = false;
          } else {
            isDarkTheme = window.wc.isSiteThemeDark;
          }
          console.debug("User changed theme variation to Auto.");
          break;
      }
      renderThemeVariation(isDarkTheme, newMode);
    }
    function showActiveTheme(mode) {
      let linkLight2 = document.querySelector(".js-set-theme-light");
      let linkDark2 = document.querySelector(".js-set-theme-dark");
      let linkAuto2 = document.querySelector(".js-set-theme-auto");
      if (linkLight2 === null) {
        return;
      }
      switch (mode) {
        case 0:
          linkLight2.classList.add("dropdown-item-active");
          linkDark2.classList.remove("dropdown-item-active");
          linkAuto2.classList.remove("dropdown-item-active");
          break;
        case 1:
          linkLight2.classList.remove("dropdown-item-active");
          linkDark2.classList.add("dropdown-item-active");
          linkAuto2.classList.remove("dropdown-item-active");
          break;
        default:
          linkLight2.classList.remove("dropdown-item-active");
          linkDark2.classList.remove("dropdown-item-active");
          linkAuto2.classList.add("dropdown-item-active");
          break;
      }
    }
    function renderThemeVariation(isDarkTheme, themeMode = 2, init = false) {
      const codeHlLight = document.querySelector("link[title=hl-light]");
      const codeHlDark = document.querySelector("link[title=hl-dark]");
      const codeHlEnabled = codeHlLight !== null || codeHlDark !== null;
      const diagramEnabled = document.querySelector("script[title=mermaid]") !== null;
      showActiveTheme(themeMode);
      const themeChangeEvent = new CustomEvent("wcThemeChange", { detail: { isDarkTheme: () => isDarkTheme } });
      document.dispatchEvent(themeChangeEvent);
      if (!init) {
        if (isDarkTheme === false && !body.classList.contains("dark") || isDarkTheme === true && body.classList.contains("dark")) {
          return;
        }
      }
      if (isDarkTheme === false) {
        if (!init) {
          Object.assign(document.body.style, { opacity: 0, visibility: "visible" });
          fadeIn(document.body, 600);
        }
        body.classList.remove("dark");
        if (codeHlEnabled) {
          console.debug("Setting HLJS theme to light");
          if (codeHlLight) {
            codeHlLight.disabled = false;
          }
          if (codeHlDark) {
            codeHlDark.disabled = true;
          }
        }
        if (diagramEnabled) {
          console.debug("Initializing Mermaid with light theme");
          if (init) {
            window.mermaid.initialize({ startOnLoad: false, theme: "default", securityLevel: "loose" });
            fixMermaid(true);
          } else {
            location.reload();
          }
        }
      } else if (isDarkTheme === true) {
        if (!init) {
          Object.assign(document.body.style, { opacity: 0, visibility: "visible" });
          fadeIn(document.body, 600);
        }
        body.classList.add("dark");
        if (codeHlEnabled) {
          console.debug("Setting HLJS theme to dark");
          if (codeHlLight) {
            codeHlLight.disabled = true;
          }
          if (codeHlDark) {
            codeHlDark.disabled = false;
          }
        }
        if (diagramEnabled) {
          console.debug("Initializing Mermaid with dark theme");
          if (init) {
            window.mermaid.initialize({ startOnLoad: false, theme: "dark", securityLevel: "loose" });
            fixMermaid(true);
          } else {
            location.reload();
          }
        }
      }
    }
    function onMediaQueryListEvent(event) {
      if (!canChangeTheme()) {
        return;
      }
      const darkModeOn = event.matches;
      console.debug(`OS dark mode preference changed to ${darkModeOn ? "\u{1F312} on" : "\u2600\uFE0F off"}.`);
      let currentThemeVariation = getThemeMode();
      let isDarkTheme;
      if (currentThemeVariation === 2) {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          isDarkTheme = true;
        } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
          isDarkTheme = false;
        } else {
          isDarkTheme = window.wc.isSiteThemeDark;
        }
        renderThemeVariation(isDarkTheme, currentThemeVariation);
      }
    }
    console.debug(`Environment: ${hugoEnvironment}`);
    function getNavBarHeight() {
      let navbar = document.getElementById("navbar-main");
      let navbarHeight = navbar ? navbar.getBoundingClientRect().height : 0;
      console.debug("Navbar height: " + navbarHeight);
      return navbarHeight;
    }
    function scrollToAnchor(target, duration = 0) {
      target = typeof target === "undefined" || typeof target === "object" ? decodeURIComponent(window.location.hash) : target;
      if ($(target).length) {
        target = "#" + $.escapeSelector(target.substring(1));
        let elementOffset = Math.ceil($(target).offset().top - getNavBarHeight());
        $("body").addClass("scrolling");
        $("html, body").animate(
          {
            scrollTop: elementOffset
          },
          duration,
          function() {
            $("body").removeClass("scrolling");
          }
        );
      } else {
        console.debug("Cannot scroll to target `#" + target + "`. ID not found!");
      }
    }
    function fixScrollspy() {
      let $body = $("body");
      let data = $body.data("bs.scrollspy");
      if (data) {
        data._config.offset = getNavBarHeight();
        $body.data("bs.scrollspy", data);
        $body.scrollspy("refresh");
      }
    }
    function removeQueryParamsFromUrl() {
      if (window.history.replaceState) {
        let urlWithoutSearchParams = window.location.protocol + "//" + window.location.host + window.location.pathname + window.location.hash;
        window.history.replaceState({ path: urlWithoutSearchParams }, "", urlWithoutSearchParams);
      }
    }
    window.addEventListener("hashchange", scrollToAnchor);
    $("#navbar-main li.nav-item a.nav-link, .js-scroll").on("click", function(event) {
      let hash = this.hash;
      if (this.pathname === window.location.pathname && hash && $(hash).length && ($(".js-block-page").length > 0 || $(".js-widget-page").length > 0)) {
        event.preventDefault();
        let elementOffset = Math.ceil($(hash).offset().top - getNavBarHeight());
        $("html, body").animate(
          {
            scrollTop: elementOffset
          },
          800
        );
      }
    });
    $(document).on("click", ".navbar-collapse.show", function(e) {
      let targetElement = $(e.target).is("a") ? $(e.target) : $(e.target).parent();
      if (targetElement.is("a") && targetElement.attr("class") != "dropdown-toggle") {
        $(this).collapse("hide");
      }
    });
    function printLatestRelease(selector, repo) {
      if (hugoEnvironment === "production") {
        $.getJSON("https://api.github.com/repos/" + repo + "/tags").done(function(json) {
          let release = json[0];
          $(selector).append(" " + release.name);
        }).fail(function(jqxhr, textStatus, error) {
          let err = textStatus + ", " + error;
          console.log("Request Failed: " + err);
        });
      }
    }
    function toggleSearchDialog() {
      if ($("body").hasClass("searching")) {
        $("[id=search-query]").blur();
        $("body").removeClass("searching compensate-for-scrollbar");
        removeQueryParamsFromUrl();
        $("#fancybox-style-noscroll").remove();
      } else {
        if (!$("#fancybox-style-noscroll").length && document.body.scrollHeight > window.innerHeight) {
          $("head").append(
            '<style id="fancybox-style-noscroll">.compensate-for-scrollbar{margin-right:' + (window.innerWidth - document.documentElement.clientWidth) + "px;}</style>"
          );
          $("body").addClass("compensate-for-scrollbar");
        }
        $("body").addClass("searching");
        $(".search-results").css({ opacity: 0, visibility: "visible" }).animate({ opacity: 1 }, 200);
        let algoliaSearchBox = document.querySelector(".ais-SearchBox-input");
        if (algoliaSearchBox) {
          algoliaSearchBox.focus();
        } else {
          $("#search-query").focus();
        }
      }
    }
    function fixHugoOutput() {
      $("#TableOfContents").addClass("nav flex-column");
      $("#TableOfContents li").addClass("nav-item");
      $("#TableOfContents li a").addClass("nav-link");
      $("input[type='checkbox'][disabled]").parents("ul").addClass("task-list");
    }
    function getSiblings(elem) {
      return Array.prototype.filter.call(elem.parentNode.children, function(sibling) {
        return sibling !== elem;
      });
    }
    $(document).ready(function() {
      fixHugoOutput();
      let { isDarkTheme, themeMode } = initThemeVariation();
      renderThemeVariation(isDarkTheme, themeMode, true);
      if (codeHighlighting) {
        hljs.initHighlighting();
      }
      let child = document.querySelector(".docs-links .active");
      let parent = document.querySelector(".docs-links");
      if (child && parent) {
        scrollParentToChild(parent, child);
      }
    });
    $(window).on("load", function() {
      fixScrollspy();
      let isotopeInstances = document.querySelectorAll(".projects-container");
      let isotopeInstancesCount = isotopeInstances.length;
      if (window.location.hash && isotopeInstancesCount === 0) {
        scrollToAnchor(decodeURIComponent(window.location.hash), 0);
      }
      let child = document.querySelector(".docs-toc .nav-link.active");
      let parent = document.querySelector(".docs-toc");
      if (child && parent) {
        scrollParentToChild(parent, child);
      }
      let zoomOptions = {};
      if (document.body.classList.contains("dark")) {
        zoomOptions.background = "rgba(0,0,0,0.9)";
      } else {
        zoomOptions.background = "rgba(255,255,255,0.9)";
      }
      medium_zoom_esm_default("[data-zoomable]", zoomOptions);
      let isotopeCounter = 0;
      isotopeInstances.forEach(function(isotopeInstance, index) {
        console.debug(`Loading Isotope instance ${index}`);
        let iso;
        let isoSection = isotopeInstance.closest("section");
        let layout = "";
        if (isoSection.querySelector(".isotope").classList.contains("js-layout-row")) {
          layout = "fitRows";
        } else {
          layout = "masonry";
        }
        let defaultFilter = isoSection.querySelector(".default-project-filter");
        let filterText = "*";
        if (defaultFilter !== null) {
          filterText = defaultFilter.textContent;
        }
        console.debug(`Default Isotope filter: ${filterText}`);
        imagesLoaded(isotopeInstance, function() {
          iso = new Isotope(isotopeInstance, {
            itemSelector: ".isotope-item",
            layoutMode: layout,
            masonry: {
              gutter: 20
            },
            filter: filterText
          });
          let isoFilterButtons = isoSection.querySelectorAll(".project-filters a");
          isoFilterButtons.forEach(
            (button) => button.addEventListener("click", (e) => {
              e.preventDefault();
              let selector = button.getAttribute("data-filter");
              console.debug(`Updating Isotope filter to ${selector}`);
              iso.arrange({ filter: selector });
              button.classList.remove("active");
              button.classList.add("active");
              let buttonSiblings = getSiblings(button);
              buttonSiblings.forEach((buttonSibling) => {
                buttonSibling.classList.remove("active");
                buttonSibling.classList.remove("all");
              });
            })
          );
          incrementIsotopeCounter();
        });
      });
      function incrementIsotopeCounter() {
        isotopeCounter++;
        if (isotopeCounter === isotopeInstancesCount) {
          console.debug(`All Portfolio Isotope instances loaded.`);
          if (window.location.hash) {
            scrollToAnchor(decodeURIComponent(window.location.hash), 0);
          }
        }
      }
      let githubReleaseSelector = ".js-github-release";
      if ($(githubReleaseSelector).length > 0) {
        printLatestRelease(githubReleaseSelector, $(githubReleaseSelector).data("repo"));
      }
      document.addEventListener("keyup", (event) => {
        if (event.code === "Escape") {
          const body2 = document.body;
          if (body2.classList.contains("searching")) {
            toggleSearchDialog();
          }
        }
        if (event.key === "/") {
          let focusedElement = document.hasFocus() && document.activeElement !== document.body && document.activeElement !== document.documentElement && document.activeElement || null;
          let isInputFocused = focusedElement instanceof HTMLInputElement || focusedElement instanceof HTMLTextAreaElement;
          if (searchEnabled && !isInputFocused) {
            event.preventDefault();
            toggleSearchDialog();
          }
        }
      });
      if (searchEnabled) {
        $(".js-search").click(function(e) {
          e.preventDefault();
          toggleSearchDialog();
        });
      }
      $('[data-toggle="tooltip"]').tooltip();
    });
    var linkLight = document.querySelector(".js-set-theme-light");
    var linkDark = document.querySelector(".js-set-theme-dark");
    var linkAuto = document.querySelector(".js-set-theme-auto");
    if (linkLight && linkDark && linkAuto) {
      linkLight.addEventListener("click", (event) => {
        event.preventDefault();
        changeThemeModeClick(0);
      });
      linkDark.addEventListener("click", (event) => {
        event.preventDefault();
        changeThemeModeClick(1);
      });
      linkAuto.addEventListener("click", (event) => {
        event.preventDefault();
        changeThemeModeClick(2);
      });
    }
    var darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    darkModeMediaQuery.addEventListener("change", (event) => {
      onMediaQueryListEvent(event);
    });
    $("body").on("mouseenter mouseleave", ".dropdown", function(e) {
      var dropdown = $(e.target).closest(".dropdown");
      var menu = $(".dropdown-menu", dropdown);
      dropdown.addClass("show");
      menu.addClass("show");
      setTimeout(function() {
        dropdown[dropdown.is(":hover") ? "addClass" : "removeClass"]("show");
        menu[dropdown.is(":hover") ? "addClass" : "removeClass"]("show");
      }, 300);
    });
    var resizeTimer;
    $(window).resize(function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(fixScrollspy, 200);
    });
  })();
  (() => {
    var content_type = { authors: "Authors", event: "\u6F14\u8BB2", post: "\u6587\u7AE0", project: "Projects", publication: "Publications", slides: "Slides" };
    var i18n = { no_results: "No results found", placeholder: "Search...", results: "results found" };
    var search_config = { indexURI: "/en/index.json", minLength: 1, threshold: 0.3 };
    var fuseOptions = {
      shouldSort: true,
      includeMatches: true,
      tokenize: true,
      threshold: search_config.threshold,
      // Set to ~0.3 for parsing diacritics and CJK languages.
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: search_config.minLength,
      // Set to 1 for parsing CJK languages.
      keys: [
        { name: "title", weight: 0.99 },
        { name: "publication_short", weight: 0.85 },
        { name: "publication", weight: 0.65 },
        { name: "summary", weight: 0.6 },
        { name: "authors", weight: 0.5 },
        { name: "content", weight: 0.2 },
        { name: "tags", weight: 0.5 },
        { name: "categories", weight: 0.5 }
      ]
    };
    var summaryLength = 60;
    function getSearchQuery(name) {
      return decodeURIComponent((location.search.split(name + "=")[1] || "").split("&")[0]).replace(/\+/g, " ");
    }
    function updateURL(url) {
      if (history.replaceState) {
        window.history.replaceState({ path: url }, "", url);
      }
    }
    function initSearch(force, fuse) {
      let query = $("#search-query").val();
      if (query.length < 1) {
        $("#search-hits").empty();
        $("#search-common-queries").show();
      }
      if (!force && query.length < fuseOptions.minMatchCharLength) return;
      $("#search-hits").empty();
      $("#search-common-queries").hide();
      searchSite(query, fuse);
      let newURL = window.location.protocol + "//" + window.location.host + window.location.pathname + "?q=" + encodeURIComponent(query) + window.location.hash;
      updateURL(newURL);
    }
    function searchSite(query, fuse) {
      let results = fuse.search(query);
      if (results.length > 0) {
        $("#search-hits").append('<h3 class="mt-0">' + results.length + " " + i18n.results + "</h3>");
        parseResults(query, results);
      } else {
        $("#search-hits").append('<div class="search-no-results">' + i18n.no_results + "</div>");
      }
    }
    function parseResults(query, results) {
      $.each(results, function(key, value) {
        let content_key = value.item.section;
        let content = "";
        let snippet = "";
        let snippetHighlights = [];
        if (["publication", "event"].includes(content_key)) {
          content = value.item.summary;
        } else {
          content = value.item.content;
        }
        if (fuseOptions.tokenize) {
          snippetHighlights.push(query);
        } else {
          $.each(value.matches, function(matchKey, matchValue) {
            if (matchValue.key == "content") {
              let start = matchValue.indices[0][0] - summaryLength > 0 ? matchValue.indices[0][0] - summaryLength : 0;
              let end = matchValue.indices[0][1] + summaryLength < content.length ? matchValue.indices[0][1] + summaryLength : content.length;
              snippet += content.substring(start, end);
              snippetHighlights.push(
                matchValue.value.substring(
                  matchValue.indices[0][0],
                  matchValue.indices[0][1] - matchValue.indices[0][0] + 1
                )
              );
            }
          });
        }
        if (snippet.length < 1) {
          snippet += value.item.summary;
        }
        let template = $("#search-hit-fuse-template").html();
        if (content_key in content_type) {
          content_key = content_type[content_key];
        }
        let templateData = {
          key,
          title: value.item.title,
          type: content_key,
          relpermalink: value.item.relpermalink,
          snippet
        };
        let output = render(template, templateData);
        $("#search-hits").append(output);
        $.each(snippetHighlights, function(hlKey, hlValue) {
          $("#summary-" + key).mark(hlValue);
        });
      });
    }
    function render(template, data) {
      let key, find, re;
      for (key in data) {
        find = "\\{\\{\\s*" + key + "\\s*\\}\\}";
        re = new RegExp(find, "g");
        template = template.replace(re, data[key]);
      }
      return template;
    }
    if (typeof Fuse === "function") {
      $.getJSON(search_config.indexURI, function(search_index) {
        let fuse = new Fuse(search_index, fuseOptions);
        let query = getSearchQuery("q");
        if (query) {
          $("body").addClass("searching");
          $(".search-results").css({ opacity: 0, visibility: "visible" }).animate({ opacity: 1 }, 200);
          $("#search-query").val(query);
          $("#search-query").focus();
          initSearch(true, fuse);
        }
        $("#search-query").keyup(function(e) {
          clearTimeout($.data(this, "searchTimer"));
          if (e.keyCode == 13) {
            initSearch(true, fuse);
          } else {
            $(this).data(
              "searchTimer",
              setTimeout(function() {
                initSearch(false, fuse);
              }, 250)
            );
          }
        });
      });
    }
  })();
})();
/*! medium-zoom 1.0.6 | MIT License | https://github.com/francoischalifour/medium-zoom */
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiPHN0ZGluPiJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiKCgpID0+IHtcbiAgLy8gbnMtaHVnby1pbXA6L1ZvbHVtZXMvQXRyZW9TU0QvaG9tZXBhZ2UyMDI2L2Fzc2V0cy9qcy9fdmVuZG9yL21lZGl1bS16b29tLmVzbS5qc1xuICB2YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldO1xuICAgICAgZm9yICh2YXIga2V5IGluIHNvdXJjZSkge1xuICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkge1xuICAgICAgICAgIHRhcmdldFtrZXldID0gc291cmNlW2tleV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRhcmdldDtcbiAgfTtcbiAgdmFyIGlzU3VwcG9ydGVkID0gZnVuY3Rpb24gaXNTdXBwb3J0ZWQyKG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS50YWdOYW1lID09PSBcIklNR1wiO1xuICB9O1xuICB2YXIgaXNOb2RlTGlzdCA9IGZ1bmN0aW9uIGlzTm9kZUxpc3QyKHNlbGVjdG9yKSB7XG4gICAgcmV0dXJuIE5vZGVMaXN0LnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKHNlbGVjdG9yKTtcbiAgfTtcbiAgdmFyIGlzTm9kZSA9IGZ1bmN0aW9uIGlzTm9kZTIoc2VsZWN0b3IpIHtcbiAgICByZXR1cm4gc2VsZWN0b3IgJiYgc2VsZWN0b3Iubm9kZVR5cGUgPT09IDE7XG4gIH07XG4gIHZhciBpc1N2ZyA9IGZ1bmN0aW9uIGlzU3ZnMihpbWFnZSkge1xuICAgIHZhciBzb3VyY2UgPSBpbWFnZS5jdXJyZW50U3JjIHx8IGltYWdlLnNyYztcbiAgICByZXR1cm4gc291cmNlLnN1YnN0cigtNCkudG9Mb3dlckNhc2UoKSA9PT0gXCIuc3ZnXCI7XG4gIH07XG4gIHZhciBnZXRJbWFnZXNGcm9tU2VsZWN0b3IgPSBmdW5jdGlvbiBnZXRJbWFnZXNGcm9tU2VsZWN0b3IyKHNlbGVjdG9yKSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHNlbGVjdG9yKSkge1xuICAgICAgICByZXR1cm4gc2VsZWN0b3IuZmlsdGVyKGlzU3VwcG9ydGVkKTtcbiAgICAgIH1cbiAgICAgIGlmIChpc05vZGVMaXN0KHNlbGVjdG9yKSkge1xuICAgICAgICByZXR1cm4gW10uc2xpY2UuY2FsbChzZWxlY3RvcikuZmlsdGVyKGlzU3VwcG9ydGVkKTtcbiAgICAgIH1cbiAgICAgIGlmIChpc05vZGUoc2VsZWN0b3IpKSB7XG4gICAgICAgIHJldHVybiBbc2VsZWN0b3JdLmZpbHRlcihpc1N1cHBvcnRlZCk7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHNlbGVjdG9yID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIHJldHVybiBbXS5zbGljZS5jYWxsKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpKS5maWx0ZXIoaXNTdXBwb3J0ZWQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFtdO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlRoZSBwcm92aWRlZCBzZWxlY3RvciBpcyBpbnZhbGlkLlxcbkV4cGVjdHMgYSBDU1Mgc2VsZWN0b3IsIGEgTm9kZSBlbGVtZW50LCBhIE5vZGVMaXN0IG9yIGFuIGFycmF5LlxcblNlZTogaHR0cHM6Ly9naXRodWIuY29tL2ZyYW5jb2lzY2hhbGlmb3VyL21lZGl1bS16b29tXCIpO1xuICAgIH1cbiAgfTtcbiAgdmFyIGNyZWF0ZU92ZXJsYXkgPSBmdW5jdGlvbiBjcmVhdGVPdmVybGF5MihiYWNrZ3JvdW5kKSB7XG4gICAgdmFyIG92ZXJsYXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIG92ZXJsYXkuY2xhc3NMaXN0LmFkZChcIm1lZGl1bS16b29tLW92ZXJsYXlcIik7XG4gICAgb3ZlcmxheS5zdHlsZS5iYWNrZ3JvdW5kID0gYmFja2dyb3VuZDtcbiAgICByZXR1cm4gb3ZlcmxheTtcbiAgfTtcbiAgdmFyIGNsb25lVGFyZ2V0ID0gZnVuY3Rpb24gY2xvbmVUYXJnZXQyKHRlbXBsYXRlKSB7XG4gICAgdmFyIF90ZW1wbGF0ZSRnZXRCb3VuZGluZyA9IHRlbXBsYXRlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLCB0b3AgPSBfdGVtcGxhdGUkZ2V0Qm91bmRpbmcudG9wLCBsZWZ0ID0gX3RlbXBsYXRlJGdldEJvdW5kaW5nLmxlZnQsIHdpZHRoID0gX3RlbXBsYXRlJGdldEJvdW5kaW5nLndpZHRoLCBoZWlnaHQgPSBfdGVtcGxhdGUkZ2V0Qm91bmRpbmcuaGVpZ2h0O1xuICAgIHZhciBjbG9uZSA9IHRlbXBsYXRlLmNsb25lTm9kZSgpO1xuICAgIHZhciBzY3JvbGxUb3AgPSB3aW5kb3cucGFnZVlPZmZzZXQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCB8fCBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCB8fCAwO1xuICAgIHZhciBzY3JvbGxMZWZ0ID0gd2luZG93LnBhZ2VYT2Zmc2V0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxMZWZ0IHx8IGRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdCB8fCAwO1xuICAgIGNsb25lLnJlbW92ZUF0dHJpYnV0ZShcImlkXCIpO1xuICAgIGNsb25lLnN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiO1xuICAgIGNsb25lLnN0eWxlLnRvcCA9IHRvcCArIHNjcm9sbFRvcCArIFwicHhcIjtcbiAgICBjbG9uZS5zdHlsZS5sZWZ0ID0gbGVmdCArIHNjcm9sbExlZnQgKyBcInB4XCI7XG4gICAgY2xvbmUuc3R5bGUud2lkdGggPSB3aWR0aCArIFwicHhcIjtcbiAgICBjbG9uZS5zdHlsZS5oZWlnaHQgPSBoZWlnaHQgKyBcInB4XCI7XG4gICAgY2xvbmUuc3R5bGUudHJhbnNmb3JtID0gXCJcIjtcbiAgICByZXR1cm4gY2xvbmU7XG4gIH07XG4gIHZhciBjcmVhdGVDdXN0b21FdmVudCA9IGZ1bmN0aW9uIGNyZWF0ZUN1c3RvbUV2ZW50Mih0eXBlLCBwYXJhbXMpIHtcbiAgICB2YXIgZXZlbnRQYXJhbXMgPSBfZXh0ZW5kcyh7XG4gICAgICBidWJibGVzOiBmYWxzZSxcbiAgICAgIGNhbmNlbGFibGU6IGZhbHNlLFxuICAgICAgZGV0YWlsOiB2b2lkIDBcbiAgICB9LCBwYXJhbXMpO1xuICAgIGlmICh0eXBlb2Ygd2luZG93LkN1c3RvbUV2ZW50ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIHJldHVybiBuZXcgQ3VzdG9tRXZlbnQodHlwZSwgZXZlbnRQYXJhbXMpO1xuICAgIH1cbiAgICB2YXIgY3VzdG9tRXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudChcIkN1c3RvbUV2ZW50XCIpO1xuICAgIGN1c3RvbUV2ZW50LmluaXRDdXN0b21FdmVudCh0eXBlLCBldmVudFBhcmFtcy5idWJibGVzLCBldmVudFBhcmFtcy5jYW5jZWxhYmxlLCBldmVudFBhcmFtcy5kZXRhaWwpO1xuICAgIHJldHVybiBjdXN0b21FdmVudDtcbiAgfTtcbiAgdmFyIG1lZGl1bVpvb21Fc20gPSBmdW5jdGlvbiBtZWRpdW1ab29tKHNlbGVjdG9yKSB7XG4gICAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHZvaWQgMCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xuICAgIHZhciBQcm9taXNlMiA9IHdpbmRvdy5Qcm9taXNlIHx8IGZ1bmN0aW9uIFByb21pc2UzKGZuKSB7XG4gICAgICBmdW5jdGlvbiBub29wKCkge1xuICAgICAgfVxuICAgICAgZm4obm9vcCwgbm9vcCk7XG4gICAgfTtcbiAgICB2YXIgX2hhbmRsZUNsaWNrID0gZnVuY3Rpb24gX2hhbmRsZUNsaWNrMihldmVudCkge1xuICAgICAgdmFyIHRhcmdldCA9IGV2ZW50LnRhcmdldDtcbiAgICAgIGlmICh0YXJnZXQgPT09IG92ZXJsYXkpIHtcbiAgICAgICAgY2xvc2UoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGltYWdlcy5pbmRleE9mKHRhcmdldCkgPT09IC0xKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRvZ2dsZSh7IHRhcmdldCB9KTtcbiAgICB9O1xuICAgIHZhciBfaGFuZGxlU2Nyb2xsID0gZnVuY3Rpb24gX2hhbmRsZVNjcm9sbDIoKSB7XG4gICAgICBpZiAoaXNBbmltYXRpbmcgfHwgIWFjdGl2ZS5vcmlnaW5hbCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2YXIgY3VycmVudFNjcm9sbCA9IHdpbmRvdy5wYWdlWU9mZnNldCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wIHx8IGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wIHx8IDA7XG4gICAgICBpZiAoTWF0aC5hYnMoc2Nyb2xsVG9wIC0gY3VycmVudFNjcm9sbCkgPiB6b29tT3B0aW9ucy5zY3JvbGxPZmZzZXQpIHtcbiAgICAgICAgc2V0VGltZW91dChjbG9zZSwgMTUwKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHZhciBfaGFuZGxlS2V5VXAgPSBmdW5jdGlvbiBfaGFuZGxlS2V5VXAyKGV2ZW50KSB7XG4gICAgICB2YXIga2V5ID0gZXZlbnQua2V5IHx8IGV2ZW50LmtleUNvZGU7XG4gICAgICBpZiAoa2V5ID09PSBcIkVzY2FwZVwiIHx8IGtleSA9PT0gXCJFc2NcIiB8fCBrZXkgPT09IDI3KSB7XG4gICAgICAgIGNsb3NlKCk7XG4gICAgICB9XG4gICAgfTtcbiAgICB2YXIgdXBkYXRlID0gZnVuY3Rpb24gdXBkYXRlMigpIHtcbiAgICAgIHZhciBvcHRpb25zMiA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdm9pZCAwID8gYXJndW1lbnRzWzBdIDoge307XG4gICAgICB2YXIgbmV3T3B0aW9ucyA9IG9wdGlvbnMyO1xuICAgICAgaWYgKG9wdGlvbnMyLmJhY2tncm91bmQpIHtcbiAgICAgICAgb3ZlcmxheS5zdHlsZS5iYWNrZ3JvdW5kID0gb3B0aW9uczIuYmFja2dyb3VuZDtcbiAgICAgIH1cbiAgICAgIGlmIChvcHRpb25zMi5jb250YWluZXIgJiYgb3B0aW9uczIuY29udGFpbmVyIGluc3RhbmNlb2YgT2JqZWN0KSB7XG4gICAgICAgIG5ld09wdGlvbnMuY29udGFpbmVyID0gX2V4dGVuZHMoe30sIHpvb21PcHRpb25zLmNvbnRhaW5lciwgb3B0aW9uczIuY29udGFpbmVyKTtcbiAgICAgIH1cbiAgICAgIGlmIChvcHRpb25zMi50ZW1wbGF0ZSkge1xuICAgICAgICB2YXIgdGVtcGxhdGUgPSBpc05vZGUob3B0aW9uczIudGVtcGxhdGUpID8gb3B0aW9uczIudGVtcGxhdGUgOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKG9wdGlvbnMyLnRlbXBsYXRlKTtcbiAgICAgICAgbmV3T3B0aW9ucy50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuICAgICAgfVxuICAgICAgem9vbU9wdGlvbnMgPSBfZXh0ZW5kcyh7fSwgem9vbU9wdGlvbnMsIG5ld09wdGlvbnMpO1xuICAgICAgaW1hZ2VzLmZvckVhY2goZnVuY3Rpb24oaW1hZ2UpIHtcbiAgICAgICAgaW1hZ2UuZGlzcGF0Y2hFdmVudChjcmVhdGVDdXN0b21FdmVudChcIm1lZGl1bS16b29tOnVwZGF0ZVwiLCB7XG4gICAgICAgICAgZGV0YWlsOiB7IHpvb20gfVxuICAgICAgICB9KSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB6b29tO1xuICAgIH07XG4gICAgdmFyIGNsb25lID0gZnVuY3Rpb24gY2xvbmUyKCkge1xuICAgICAgdmFyIG9wdGlvbnMyID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB2b2lkIDAgPyBhcmd1bWVudHNbMF0gOiB7fTtcbiAgICAgIHJldHVybiBtZWRpdW1ab29tRXNtKF9leHRlbmRzKHt9LCB6b29tT3B0aW9ucywgb3B0aW9uczIpKTtcbiAgICB9O1xuICAgIHZhciBhdHRhY2ggPSBmdW5jdGlvbiBhdHRhY2gyKCkge1xuICAgICAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIHNlbGVjdG9ycyA9IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgICAgICBzZWxlY3RvcnNbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gICAgICB9XG4gICAgICB2YXIgbmV3SW1hZ2VzID0gc2VsZWN0b3JzLnJlZHVjZShmdW5jdGlvbihpbWFnZXNBY2N1bXVsYXRvciwgY3VycmVudFNlbGVjdG9yKSB7XG4gICAgICAgIHJldHVybiBbXS5jb25jYXQoaW1hZ2VzQWNjdW11bGF0b3IsIGdldEltYWdlc0Zyb21TZWxlY3RvcihjdXJyZW50U2VsZWN0b3IpKTtcbiAgICAgIH0sIFtdKTtcbiAgICAgIG5ld0ltYWdlcy5maWx0ZXIoZnVuY3Rpb24obmV3SW1hZ2UpIHtcbiAgICAgICAgcmV0dXJuIGltYWdlcy5pbmRleE9mKG5ld0ltYWdlKSA9PT0gLTE7XG4gICAgICB9KS5mb3JFYWNoKGZ1bmN0aW9uKG5ld0ltYWdlKSB7XG4gICAgICAgIGltYWdlcy5wdXNoKG5ld0ltYWdlKTtcbiAgICAgICAgbmV3SW1hZ2UuY2xhc3NMaXN0LmFkZChcIm1lZGl1bS16b29tLWltYWdlXCIpO1xuICAgICAgfSk7XG4gICAgICBldmVudExpc3RlbmVycy5mb3JFYWNoKGZ1bmN0aW9uKF9yZWYpIHtcbiAgICAgICAgdmFyIHR5cGUgPSBfcmVmLnR5cGUsIGxpc3RlbmVyID0gX3JlZi5saXN0ZW5lciwgb3B0aW9uczIgPSBfcmVmLm9wdGlvbnM7XG4gICAgICAgIG5ld0ltYWdlcy5mb3JFYWNoKGZ1bmN0aW9uKGltYWdlKSB7XG4gICAgICAgICAgaW1hZ2UuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgb3B0aW9uczIpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHpvb207XG4gICAgfTtcbiAgICB2YXIgZGV0YWNoID0gZnVuY3Rpb24gZGV0YWNoMigpIHtcbiAgICAgIGZvciAodmFyIF9sZW4yID0gYXJndW1lbnRzLmxlbmd0aCwgc2VsZWN0b3JzID0gQXJyYXkoX2xlbjIpLCBfa2V5MiA9IDA7IF9rZXkyIDwgX2xlbjI7IF9rZXkyKyspIHtcbiAgICAgICAgc2VsZWN0b3JzW19rZXkyXSA9IGFyZ3VtZW50c1tfa2V5Ml07XG4gICAgICB9XG4gICAgICBpZiAoYWN0aXZlLnpvb21lZCkge1xuICAgICAgICBjbG9zZSgpO1xuICAgICAgfVxuICAgICAgdmFyIGltYWdlc1RvRGV0YWNoID0gc2VsZWN0b3JzLmxlbmd0aCA+IDAgPyBzZWxlY3RvcnMucmVkdWNlKGZ1bmN0aW9uKGltYWdlc0FjY3VtdWxhdG9yLCBjdXJyZW50U2VsZWN0b3IpIHtcbiAgICAgICAgcmV0dXJuIFtdLmNvbmNhdChpbWFnZXNBY2N1bXVsYXRvciwgZ2V0SW1hZ2VzRnJvbVNlbGVjdG9yKGN1cnJlbnRTZWxlY3RvcikpO1xuICAgICAgfSwgW10pIDogaW1hZ2VzO1xuICAgICAgaW1hZ2VzVG9EZXRhY2guZm9yRWFjaChmdW5jdGlvbihpbWFnZSkge1xuICAgICAgICBpbWFnZS5jbGFzc0xpc3QucmVtb3ZlKFwibWVkaXVtLXpvb20taW1hZ2VcIik7XG4gICAgICAgIGltYWdlLmRpc3BhdGNoRXZlbnQoY3JlYXRlQ3VzdG9tRXZlbnQoXCJtZWRpdW0tem9vbTpkZXRhY2hcIiwge1xuICAgICAgICAgIGRldGFpbDogeyB6b29tIH1cbiAgICAgICAgfSkpO1xuICAgICAgfSk7XG4gICAgICBpbWFnZXMgPSBpbWFnZXMuZmlsdGVyKGZ1bmN0aW9uKGltYWdlKSB7XG4gICAgICAgIHJldHVybiBpbWFnZXNUb0RldGFjaC5pbmRleE9mKGltYWdlKSA9PT0gLTE7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB6b29tO1xuICAgIH07XG4gICAgdmFyIG9uID0gZnVuY3Rpb24gb24yKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICB2YXIgb3B0aW9uczIgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHZvaWQgMCA/IGFyZ3VtZW50c1syXSA6IHt9O1xuICAgICAgaW1hZ2VzLmZvckVhY2goZnVuY3Rpb24oaW1hZ2UpIHtcbiAgICAgICAgaW1hZ2UuYWRkRXZlbnRMaXN0ZW5lcihcIm1lZGl1bS16b29tOlwiICsgdHlwZSwgbGlzdGVuZXIsIG9wdGlvbnMyKTtcbiAgICAgIH0pO1xuICAgICAgZXZlbnRMaXN0ZW5lcnMucHVzaCh7IHR5cGU6IFwibWVkaXVtLXpvb206XCIgKyB0eXBlLCBsaXN0ZW5lciwgb3B0aW9uczogb3B0aW9uczIgfSk7XG4gICAgICByZXR1cm4gem9vbTtcbiAgICB9O1xuICAgIHZhciBvZmYgPSBmdW5jdGlvbiBvZmYyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICB2YXIgb3B0aW9uczIgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHZvaWQgMCA/IGFyZ3VtZW50c1syXSA6IHt9O1xuICAgICAgaW1hZ2VzLmZvckVhY2goZnVuY3Rpb24oaW1hZ2UpIHtcbiAgICAgICAgaW1hZ2UucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1lZGl1bS16b29tOlwiICsgdHlwZSwgbGlzdGVuZXIsIG9wdGlvbnMyKTtcbiAgICAgIH0pO1xuICAgICAgZXZlbnRMaXN0ZW5lcnMgPSBldmVudExpc3RlbmVycy5maWx0ZXIoZnVuY3Rpb24oZXZlbnRMaXN0ZW5lcikge1xuICAgICAgICByZXR1cm4gIShldmVudExpc3RlbmVyLnR5cGUgPT09IFwibWVkaXVtLXpvb206XCIgKyB0eXBlICYmIGV2ZW50TGlzdGVuZXIubGlzdGVuZXIudG9TdHJpbmcoKSA9PT0gbGlzdGVuZXIudG9TdHJpbmcoKSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB6b29tO1xuICAgIH07XG4gICAgdmFyIG9wZW4gPSBmdW5jdGlvbiBvcGVuMigpIHtcbiAgICAgIHZhciBfcmVmMiA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdm9pZCAwID8gYXJndW1lbnRzWzBdIDoge30sIHRhcmdldCA9IF9yZWYyLnRhcmdldDtcbiAgICAgIHZhciBfYW5pbWF0ZSA9IGZ1bmN0aW9uIF9hbmltYXRlMigpIHtcbiAgICAgICAgdmFyIGNvbnRhaW5lciA9IHtcbiAgICAgICAgICB3aWR0aDogZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoLFxuICAgICAgICAgIGhlaWdodDogZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCxcbiAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgIHRvcDogMCxcbiAgICAgICAgICByaWdodDogMCxcbiAgICAgICAgICBib3R0b206IDBcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHZpZXdwb3J0V2lkdGggPSB2b2lkIDA7XG4gICAgICAgIHZhciB2aWV3cG9ydEhlaWdodCA9IHZvaWQgMDtcbiAgICAgICAgaWYgKHpvb21PcHRpb25zLmNvbnRhaW5lcikge1xuICAgICAgICAgIGlmICh6b29tT3B0aW9ucy5jb250YWluZXIgaW5zdGFuY2VvZiBPYmplY3QpIHtcbiAgICAgICAgICAgIGNvbnRhaW5lciA9IF9leHRlbmRzKHt9LCBjb250YWluZXIsIHpvb21PcHRpb25zLmNvbnRhaW5lcik7XG4gICAgICAgICAgICB2aWV3cG9ydFdpZHRoID0gY29udGFpbmVyLndpZHRoIC0gY29udGFpbmVyLmxlZnQgLSBjb250YWluZXIucmlnaHQgLSB6b29tT3B0aW9ucy5tYXJnaW4gKiAyO1xuICAgICAgICAgICAgdmlld3BvcnRIZWlnaHQgPSBjb250YWluZXIuaGVpZ2h0IC0gY29udGFpbmVyLnRvcCAtIGNvbnRhaW5lci5ib3R0b20gLSB6b29tT3B0aW9ucy5tYXJnaW4gKiAyO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgem9vbUNvbnRhaW5lciA9IGlzTm9kZSh6b29tT3B0aW9ucy5jb250YWluZXIpID8gem9vbU9wdGlvbnMuY29udGFpbmVyIDogZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih6b29tT3B0aW9ucy5jb250YWluZXIpO1xuICAgICAgICAgICAgdmFyIF96b29tQ29udGFpbmVyJGdldEJvdSA9IHpvb21Db250YWluZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksIF93aWR0aCA9IF96b29tQ29udGFpbmVyJGdldEJvdS53aWR0aCwgX2hlaWdodCA9IF96b29tQ29udGFpbmVyJGdldEJvdS5oZWlnaHQsIF9sZWZ0ID0gX3pvb21Db250YWluZXIkZ2V0Qm91LmxlZnQsIF90b3AgPSBfem9vbUNvbnRhaW5lciRnZXRCb3UudG9wO1xuICAgICAgICAgICAgY29udGFpbmVyID0gX2V4dGVuZHMoe30sIGNvbnRhaW5lciwge1xuICAgICAgICAgICAgICB3aWR0aDogX3dpZHRoLFxuICAgICAgICAgICAgICBoZWlnaHQ6IF9oZWlnaHQsXG4gICAgICAgICAgICAgIGxlZnQ6IF9sZWZ0LFxuICAgICAgICAgICAgICB0b3A6IF90b3BcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2aWV3cG9ydFdpZHRoID0gdmlld3BvcnRXaWR0aCB8fCBjb250YWluZXIud2lkdGggLSB6b29tT3B0aW9ucy5tYXJnaW4gKiAyO1xuICAgICAgICB2aWV3cG9ydEhlaWdodCA9IHZpZXdwb3J0SGVpZ2h0IHx8IGNvbnRhaW5lci5oZWlnaHQgLSB6b29tT3B0aW9ucy5tYXJnaW4gKiAyO1xuICAgICAgICB2YXIgem9vbVRhcmdldCA9IGFjdGl2ZS56b29tZWRIZCB8fCBhY3RpdmUub3JpZ2luYWw7XG4gICAgICAgIHZhciBuYXR1cmFsV2lkdGggPSBpc1N2Zyh6b29tVGFyZ2V0KSA/IHZpZXdwb3J0V2lkdGggOiB6b29tVGFyZ2V0Lm5hdHVyYWxXaWR0aCB8fCB2aWV3cG9ydFdpZHRoO1xuICAgICAgICB2YXIgbmF0dXJhbEhlaWdodCA9IGlzU3ZnKHpvb21UYXJnZXQpID8gdmlld3BvcnRIZWlnaHQgOiB6b29tVGFyZ2V0Lm5hdHVyYWxIZWlnaHQgfHwgdmlld3BvcnRIZWlnaHQ7XG4gICAgICAgIHZhciBfem9vbVRhcmdldCRnZXRCb3VuZGkgPSB6b29tVGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLCB0b3AgPSBfem9vbVRhcmdldCRnZXRCb3VuZGkudG9wLCBsZWZ0ID0gX3pvb21UYXJnZXQkZ2V0Qm91bmRpLmxlZnQsIHdpZHRoID0gX3pvb21UYXJnZXQkZ2V0Qm91bmRpLndpZHRoLCBoZWlnaHQgPSBfem9vbVRhcmdldCRnZXRCb3VuZGkuaGVpZ2h0O1xuICAgICAgICB2YXIgc2NhbGVYID0gTWF0aC5taW4obmF0dXJhbFdpZHRoLCB2aWV3cG9ydFdpZHRoKSAvIHdpZHRoO1xuICAgICAgICB2YXIgc2NhbGVZID0gTWF0aC5taW4obmF0dXJhbEhlaWdodCwgdmlld3BvcnRIZWlnaHQpIC8gaGVpZ2h0O1xuICAgICAgICB2YXIgc2NhbGUgPSBNYXRoLm1pbihzY2FsZVgsIHNjYWxlWSk7XG4gICAgICAgIHZhciB0cmFuc2xhdGVYID0gKC1sZWZ0ICsgKHZpZXdwb3J0V2lkdGggLSB3aWR0aCkgLyAyICsgem9vbU9wdGlvbnMubWFyZ2luICsgY29udGFpbmVyLmxlZnQpIC8gc2NhbGU7XG4gICAgICAgIHZhciB0cmFuc2xhdGVZID0gKC10b3AgKyAodmlld3BvcnRIZWlnaHQgLSBoZWlnaHQpIC8gMiArIHpvb21PcHRpb25zLm1hcmdpbiArIGNvbnRhaW5lci50b3ApIC8gc2NhbGU7XG4gICAgICAgIHZhciB0cmFuc2Zvcm0gPSBcInNjYWxlKFwiICsgc2NhbGUgKyBcIikgdHJhbnNsYXRlM2QoXCIgKyB0cmFuc2xhdGVYICsgXCJweCwgXCIgKyB0cmFuc2xhdGVZICsgXCJweCwgMClcIjtcbiAgICAgICAgYWN0aXZlLnpvb21lZC5zdHlsZS50cmFuc2Zvcm0gPSB0cmFuc2Zvcm07XG4gICAgICAgIGlmIChhY3RpdmUuem9vbWVkSGQpIHtcbiAgICAgICAgICBhY3RpdmUuem9vbWVkSGQuc3R5bGUudHJhbnNmb3JtID0gdHJhbnNmb3JtO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlMihmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICAgIGlmICh0YXJnZXQgJiYgaW1hZ2VzLmluZGV4T2YodGFyZ2V0KSA9PT0gLTEpIHtcbiAgICAgICAgICByZXNvbHZlKHpvb20pO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgX2hhbmRsZU9wZW5FbmQgPSBmdW5jdGlvbiBfaGFuZGxlT3BlbkVuZDIoKSB7XG4gICAgICAgICAgaXNBbmltYXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICBhY3RpdmUuem9vbWVkLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0cmFuc2l0aW9uZW5kXCIsIF9oYW5kbGVPcGVuRW5kMik7XG4gICAgICAgICAgYWN0aXZlLm9yaWdpbmFsLmRpc3BhdGNoRXZlbnQoY3JlYXRlQ3VzdG9tRXZlbnQoXCJtZWRpdW0tem9vbTpvcGVuZWRcIiwge1xuICAgICAgICAgICAgZGV0YWlsOiB7IHpvb20gfVxuICAgICAgICAgIH0pKTtcbiAgICAgICAgICByZXNvbHZlKHpvb20pO1xuICAgICAgICB9O1xuICAgICAgICBpZiAoYWN0aXZlLnpvb21lZCkge1xuICAgICAgICAgIHJlc29sdmUoem9vbSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0YXJnZXQpIHtcbiAgICAgICAgICBhY3RpdmUub3JpZ2luYWwgPSB0YXJnZXQ7XG4gICAgICAgIH0gZWxzZSBpZiAoaW1hZ2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICB2YXIgX2ltYWdlcyA9IGltYWdlcztcbiAgICAgICAgICBhY3RpdmUub3JpZ2luYWwgPSBfaW1hZ2VzWzBdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc29sdmUoem9vbSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGFjdGl2ZS5vcmlnaW5hbC5kaXNwYXRjaEV2ZW50KGNyZWF0ZUN1c3RvbUV2ZW50KFwibWVkaXVtLXpvb206b3BlblwiLCB7XG4gICAgICAgICAgZGV0YWlsOiB7IHpvb20gfVxuICAgICAgICB9KSk7XG4gICAgICAgIHNjcm9sbFRvcCA9IHdpbmRvdy5wYWdlWU9mZnNldCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wIHx8IGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wIHx8IDA7XG4gICAgICAgIGlzQW5pbWF0aW5nID0gdHJ1ZTtcbiAgICAgICAgYWN0aXZlLnpvb21lZCA9IGNsb25lVGFyZ2V0KGFjdGl2ZS5vcmlnaW5hbCk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQob3ZlcmxheSk7XG4gICAgICAgIGlmICh6b29tT3B0aW9ucy50ZW1wbGF0ZSkge1xuICAgICAgICAgIHZhciB0ZW1wbGF0ZSA9IGlzTm9kZSh6b29tT3B0aW9ucy50ZW1wbGF0ZSkgPyB6b29tT3B0aW9ucy50ZW1wbGF0ZSA6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioem9vbU9wdGlvbnMudGVtcGxhdGUpO1xuICAgICAgICAgIGFjdGl2ZS50ZW1wbGF0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgICAgYWN0aXZlLnRlbXBsYXRlLmFwcGVuZENoaWxkKHRlbXBsYXRlLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpKTtcbiAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGFjdGl2ZS50ZW1wbGF0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChhY3RpdmUuem9vbWVkKTtcbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoXCJtZWRpdW0tem9vbS0tb3BlbmVkXCIpO1xuICAgICAgICB9KTtcbiAgICAgICAgYWN0aXZlLm9yaWdpbmFsLmNsYXNzTGlzdC5hZGQoXCJtZWRpdW0tem9vbS1pbWFnZS0taGlkZGVuXCIpO1xuICAgICAgICBhY3RpdmUuem9vbWVkLmNsYXNzTGlzdC5hZGQoXCJtZWRpdW0tem9vbS1pbWFnZS0tb3BlbmVkXCIpO1xuICAgICAgICBhY3RpdmUuem9vbWVkLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjbG9zZSk7XG4gICAgICAgIGFjdGl2ZS56b29tZWQuYWRkRXZlbnRMaXN0ZW5lcihcInRyYW5zaXRpb25lbmRcIiwgX2hhbmRsZU9wZW5FbmQpO1xuICAgICAgICBpZiAoYWN0aXZlLm9yaWdpbmFsLmdldEF0dHJpYnV0ZShcImRhdGEtem9vbS1zcmNcIikpIHtcbiAgICAgICAgICBhY3RpdmUuem9vbWVkSGQgPSBhY3RpdmUuem9vbWVkLmNsb25lTm9kZSgpO1xuICAgICAgICAgIGFjdGl2ZS56b29tZWRIZC5yZW1vdmVBdHRyaWJ1dGUoXCJzcmNzZXRcIik7XG4gICAgICAgICAgYWN0aXZlLnpvb21lZEhkLnJlbW92ZUF0dHJpYnV0ZShcInNpemVzXCIpO1xuICAgICAgICAgIGFjdGl2ZS56b29tZWRIZC5zcmMgPSBhY3RpdmUuem9vbWVkLmdldEF0dHJpYnV0ZShcImRhdGEtem9vbS1zcmNcIik7XG4gICAgICAgICAgYWN0aXZlLnpvb21lZEhkLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoZ2V0Wm9vbVRhcmdldFNpemUpO1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiVW5hYmxlIHRvIHJlYWNoIHRoZSB6b29tIGltYWdlIHRhcmdldCBcIiArIGFjdGl2ZS56b29tZWRIZC5zcmMpO1xuICAgICAgICAgICAgYWN0aXZlLnpvb21lZEhkID0gbnVsbDtcbiAgICAgICAgICAgIF9hbmltYXRlKCk7XG4gICAgICAgICAgfTtcbiAgICAgICAgICB2YXIgZ2V0Wm9vbVRhcmdldFNpemUgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChhY3RpdmUuem9vbWVkSGQuY29tcGxldGUpIHtcbiAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChnZXRab29tVGFyZ2V0U2l6ZSk7XG4gICAgICAgICAgICAgIGFjdGl2ZS56b29tZWRIZC5jbGFzc0xpc3QuYWRkKFwibWVkaXVtLXpvb20taW1hZ2UtLW9wZW5lZFwiKTtcbiAgICAgICAgICAgICAgYWN0aXZlLnpvb21lZEhkLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjbG9zZSk7XG4gICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYWN0aXZlLnpvb21lZEhkKTtcbiAgICAgICAgICAgICAgX2FuaW1hdGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LCAxMCk7XG4gICAgICAgIH0gZWxzZSBpZiAoYWN0aXZlLm9yaWdpbmFsLmhhc0F0dHJpYnV0ZShcInNyY3NldFwiKSkge1xuICAgICAgICAgIGFjdGl2ZS56b29tZWRIZCA9IGFjdGl2ZS56b29tZWQuY2xvbmVOb2RlKCk7XG4gICAgICAgICAgYWN0aXZlLnpvb21lZEhkLnJlbW92ZUF0dHJpYnV0ZShcInNpemVzXCIpO1xuICAgICAgICAgIGFjdGl2ZS56b29tZWRIZC5yZW1vdmVBdHRyaWJ1dGUoXCJsb2FkaW5nXCIpO1xuICAgICAgICAgIHZhciBsb2FkRXZlbnRMaXN0ZW5lciA9IGFjdGl2ZS56b29tZWRIZC5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGFjdGl2ZS56b29tZWRIZC5yZW1vdmVFdmVudExpc3RlbmVyKFwibG9hZFwiLCBsb2FkRXZlbnRMaXN0ZW5lcik7XG4gICAgICAgICAgICBhY3RpdmUuem9vbWVkSGQuY2xhc3NMaXN0LmFkZChcIm1lZGl1bS16b29tLWltYWdlLS1vcGVuZWRcIik7XG4gICAgICAgICAgICBhY3RpdmUuem9vbWVkSGQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGNsb3NlKTtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYWN0aXZlLnpvb21lZEhkKTtcbiAgICAgICAgICAgIF9hbmltYXRlKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgX2FuaW1hdGUoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcbiAgICB2YXIgY2xvc2UgPSBmdW5jdGlvbiBjbG9zZTIoKSB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UyKGZ1bmN0aW9uKHJlc29sdmUpIHtcbiAgICAgICAgaWYgKGlzQW5pbWF0aW5nIHx8ICFhY3RpdmUub3JpZ2luYWwpIHtcbiAgICAgICAgICByZXNvbHZlKHpvb20pO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgX2hhbmRsZUNsb3NlRW5kID0gZnVuY3Rpb24gX2hhbmRsZUNsb3NlRW5kMigpIHtcbiAgICAgICAgICBhY3RpdmUub3JpZ2luYWwuY2xhc3NMaXN0LnJlbW92ZShcIm1lZGl1bS16b29tLWltYWdlLS1oaWRkZW5cIik7XG4gICAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChhY3RpdmUuem9vbWVkKTtcbiAgICAgICAgICBpZiAoYWN0aXZlLnpvb21lZEhkKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGFjdGl2ZS56b29tZWRIZCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQob3ZlcmxheSk7XG4gICAgICAgICAgYWN0aXZlLnpvb21lZC5jbGFzc0xpc3QucmVtb3ZlKFwibWVkaXVtLXpvb20taW1hZ2UtLW9wZW5lZFwiKTtcbiAgICAgICAgICBpZiAoYWN0aXZlLnRlbXBsYXRlKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGFjdGl2ZS50ZW1wbGF0ZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlzQW5pbWF0aW5nID0gZmFsc2U7XG4gICAgICAgICAgYWN0aXZlLnpvb21lZC5yZW1vdmVFdmVudExpc3RlbmVyKFwidHJhbnNpdGlvbmVuZFwiLCBfaGFuZGxlQ2xvc2VFbmQyKTtcbiAgICAgICAgICBhY3RpdmUub3JpZ2luYWwuZGlzcGF0Y2hFdmVudChjcmVhdGVDdXN0b21FdmVudChcIm1lZGl1bS16b29tOmNsb3NlZFwiLCB7XG4gICAgICAgICAgICBkZXRhaWw6IHsgem9vbSB9XG4gICAgICAgICAgfSkpO1xuICAgICAgICAgIGFjdGl2ZS5vcmlnaW5hbCA9IG51bGw7XG4gICAgICAgICAgYWN0aXZlLnpvb21lZCA9IG51bGw7XG4gICAgICAgICAgYWN0aXZlLnpvb21lZEhkID0gbnVsbDtcbiAgICAgICAgICBhY3RpdmUudGVtcGxhdGUgPSBudWxsO1xuICAgICAgICAgIHJlc29sdmUoem9vbSk7XG4gICAgICAgIH07XG4gICAgICAgIGlzQW5pbWF0aW5nID0gdHJ1ZTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKFwibWVkaXVtLXpvb20tLW9wZW5lZFwiKTtcbiAgICAgICAgYWN0aXZlLnpvb21lZC5zdHlsZS50cmFuc2Zvcm0gPSBcIlwiO1xuICAgICAgICBpZiAoYWN0aXZlLnpvb21lZEhkKSB7XG4gICAgICAgICAgYWN0aXZlLnpvb21lZEhkLnN0eWxlLnRyYW5zZm9ybSA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFjdGl2ZS50ZW1wbGF0ZSkge1xuICAgICAgICAgIGFjdGl2ZS50ZW1wbGF0ZS5zdHlsZS50cmFuc2l0aW9uID0gXCJvcGFjaXR5IDE1MG1zXCI7XG4gICAgICAgICAgYWN0aXZlLnRlbXBsYXRlLnN0eWxlLm9wYWNpdHkgPSAwO1xuICAgICAgICB9XG4gICAgICAgIGFjdGl2ZS5vcmlnaW5hbC5kaXNwYXRjaEV2ZW50KGNyZWF0ZUN1c3RvbUV2ZW50KFwibWVkaXVtLXpvb206Y2xvc2VcIiwge1xuICAgICAgICAgIGRldGFpbDogeyB6b29tIH1cbiAgICAgICAgfSkpO1xuICAgICAgICBhY3RpdmUuem9vbWVkLmFkZEV2ZW50TGlzdGVuZXIoXCJ0cmFuc2l0aW9uZW5kXCIsIF9oYW5kbGVDbG9zZUVuZCk7XG4gICAgICB9KTtcbiAgICB9O1xuICAgIHZhciB0b2dnbGUgPSBmdW5jdGlvbiB0b2dnbGUyKCkge1xuICAgICAgdmFyIF9yZWYzID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB2b2lkIDAgPyBhcmd1bWVudHNbMF0gOiB7fSwgdGFyZ2V0ID0gX3JlZjMudGFyZ2V0O1xuICAgICAgaWYgKGFjdGl2ZS5vcmlnaW5hbCkge1xuICAgICAgICByZXR1cm4gY2xvc2UoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvcGVuKHsgdGFyZ2V0IH0pO1xuICAgIH07XG4gICAgdmFyIGdldE9wdGlvbnMgPSBmdW5jdGlvbiBnZXRPcHRpb25zMigpIHtcbiAgICAgIHJldHVybiB6b29tT3B0aW9ucztcbiAgICB9O1xuICAgIHZhciBnZXRJbWFnZXMgPSBmdW5jdGlvbiBnZXRJbWFnZXMyKCkge1xuICAgICAgcmV0dXJuIGltYWdlcztcbiAgICB9O1xuICAgIHZhciBnZXRab29tZWRJbWFnZSA9IGZ1bmN0aW9uIGdldFpvb21lZEltYWdlMigpIHtcbiAgICAgIHJldHVybiBhY3RpdmUub3JpZ2luYWw7XG4gICAgfTtcbiAgICB2YXIgaW1hZ2VzID0gW107XG4gICAgdmFyIGV2ZW50TGlzdGVuZXJzID0gW107XG4gICAgdmFyIGlzQW5pbWF0aW5nID0gZmFsc2U7XG4gICAgdmFyIHNjcm9sbFRvcCA9IDA7XG4gICAgdmFyIHpvb21PcHRpb25zID0gb3B0aW9ucztcbiAgICB2YXIgYWN0aXZlID0ge1xuICAgICAgb3JpZ2luYWw6IG51bGwsXG4gICAgICB6b29tZWQ6IG51bGwsXG4gICAgICB6b29tZWRIZDogbnVsbCxcbiAgICAgIHRlbXBsYXRlOiBudWxsXG4gICAgICAvLyBJZiB0aGUgc2VsZWN0b3IgaXMgb21pdHRlZCwgaXQncyByZXBsYWNlZCBieSB0aGUgb3B0aW9uc1xuICAgIH07XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChzZWxlY3RvcikgPT09IFwiW29iamVjdCBPYmplY3RdXCIpIHtcbiAgICAgIHpvb21PcHRpb25zID0gc2VsZWN0b3I7XG4gICAgfSBlbHNlIGlmIChzZWxlY3RvciB8fCB0eXBlb2Ygc2VsZWN0b3IgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIGF0dGFjaChzZWxlY3Rvcik7XG4gICAgfVxuICAgIHpvb21PcHRpb25zID0gX2V4dGVuZHMoe1xuICAgICAgbWFyZ2luOiAwLFxuICAgICAgYmFja2dyb3VuZDogXCIjZmZmXCIsXG4gICAgICBzY3JvbGxPZmZzZXQ6IDQwLFxuICAgICAgY29udGFpbmVyOiBudWxsLFxuICAgICAgdGVtcGxhdGU6IG51bGxcbiAgICB9LCB6b29tT3B0aW9ucyk7XG4gICAgdmFyIG92ZXJsYXkgPSBjcmVhdGVPdmVybGF5KHpvb21PcHRpb25zLmJhY2tncm91bmQpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBfaGFuZGxlQ2xpY2spO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCBfaGFuZGxlS2V5VXApO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIiwgX2hhbmRsZVNjcm9sbCk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgY2xvc2UpO1xuICAgIHZhciB6b29tID0ge1xuICAgICAgb3BlbixcbiAgICAgIGNsb3NlLFxuICAgICAgdG9nZ2xlLFxuICAgICAgdXBkYXRlLFxuICAgICAgY2xvbmUsXG4gICAgICBhdHRhY2gsXG4gICAgICBkZXRhY2gsXG4gICAgICBvbixcbiAgICAgIG9mZixcbiAgICAgIGdldE9wdGlvbnMsXG4gICAgICBnZXRJbWFnZXMsXG4gICAgICBnZXRab29tZWRJbWFnZVxuICAgIH07XG4gICAgcmV0dXJuIHpvb207XG4gIH07XG4gIGZ1bmN0aW9uIHN0eWxlSW5qZWN0KGNzczIsIHJlZikge1xuICAgIGlmIChyZWYgPT09IHZvaWQgMCkgcmVmID0ge307XG4gICAgdmFyIGluc2VydEF0ID0gcmVmLmluc2VydEF0O1xuICAgIGlmICghY3NzMiB8fCB0eXBlb2YgZG9jdW1lbnQgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIGhlYWQgPSBkb2N1bWVudC5oZWFkIHx8IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaGVhZFwiKVswXTtcbiAgICB2YXIgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG4gICAgc3R5bGUudHlwZSA9IFwidGV4dC9jc3NcIjtcbiAgICBpZiAoaW5zZXJ0QXQgPT09IFwidG9wXCIpIHtcbiAgICAgIGlmIChoZWFkLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgaGVhZC5pbnNlcnRCZWZvcmUoc3R5bGUsIGhlYWQuZmlyc3RDaGlsZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBoZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaGVhZC5hcHBlbmRDaGlsZChzdHlsZSk7XG4gICAgfVxuICAgIGlmIChzdHlsZS5zdHlsZVNoZWV0KSB7XG4gICAgICBzdHlsZS5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3MyO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHlsZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MyKSk7XG4gICAgfVxuICB9XG4gIHZhciBjc3MgPSBcIi5tZWRpdW0tem9vbS1vdmVybGF5e3Bvc2l0aW9uOmZpeGVkO3RvcDowO3JpZ2h0OjA7Ym90dG9tOjA7bGVmdDowO29wYWNpdHk6MDt0cmFuc2l0aW9uOm9wYWNpdHkgLjNzO3dpbGwtY2hhbmdlOm9wYWNpdHl9Lm1lZGl1bS16b29tLS1vcGVuZWQgLm1lZGl1bS16b29tLW92ZXJsYXl7Y3Vyc29yOnBvaW50ZXI7Y3Vyc29yOnpvb20tb3V0O29wYWNpdHk6MX0ubWVkaXVtLXpvb20taW1hZ2V7Y3Vyc29yOnBvaW50ZXI7Y3Vyc29yOnpvb20taW47dHJhbnNpdGlvbjp0cmFuc2Zvcm0gLjNzIGN1YmljLWJlemllciguMiwwLC4yLDEpIWltcG9ydGFudH0ubWVkaXVtLXpvb20taW1hZ2UtLWhpZGRlbnt2aXNpYmlsaXR5OmhpZGRlbn0ubWVkaXVtLXpvb20taW1hZ2UtLW9wZW5lZHtwb3NpdGlvbjpyZWxhdGl2ZTtjdXJzb3I6cG9pbnRlcjtjdXJzb3I6em9vbS1vdXQ7d2lsbC1jaGFuZ2U6dHJhbnNmb3JtfVwiO1xuICBzdHlsZUluamVjdChjc3MpO1xuICB2YXIgbWVkaXVtX3pvb21fZXNtX2RlZmF1bHQgPSBtZWRpdW1ab29tRXNtO1xuXG4gIC8vIG5zLWh1Z28tcGFyYW1zOjxzdGRpbj5cbiAgdmFyIGNvZGVIaWdobGlnaHRpbmcgPSBmYWxzZTtcbiAgdmFyIGh1Z29FbnZpcm9ubWVudCA9IFwiZGV2ZWxvcG1lbnRcIjtcbiAgdmFyIHNlYXJjaEVuYWJsZWQgPSB0cnVlO1xuXG4gIC8vIG5zLWh1Z28taW1wOi9Wb2x1bWVzL0F0cmVvU1NEL2hvbWVwYWdlMjAyNi9hc3NldHMvanMvc2l0ZS11dGlscy5qc1xuICBmdW5jdGlvbiBmaXhNZXJtYWlkKHJlbmRlciA9IGZhbHNlKSB7XG4gICAgbGV0IG1lcm1haWRzID0gW107XG4gICAgW10ucHVzaC5hcHBseShtZXJtYWlkcywgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcImxhbmd1YWdlLW1lcm1haWRcIikpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbWVybWFpZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBtZXJtYWlkQ29kZUVsZW1lbnQgPSBtZXJtYWlkc1tpXTtcbiAgICAgIGxldCBuZXdFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgIG5ld0VsZW1lbnQuaW5uZXJIVE1MID0gbWVybWFpZENvZGVFbGVtZW50LmlubmVySFRNTDtcbiAgICAgIG5ld0VsZW1lbnQuY2xhc3NMaXN0LmFkZChcIm1lcm1haWRcIik7XG4gICAgICBpZiAocmVuZGVyKSB7XG4gICAgICAgIHdpbmRvdy5tZXJtYWlkLm1lcm1haWRBUEkucmVuZGVyKGBtZXJtYWlkLSR7aX1gLCBuZXdFbGVtZW50LnRleHRDb250ZW50LCBmdW5jdGlvbihzdmdDb2RlKSB7XG4gICAgICAgICAgbmV3RWxlbWVudC5pbm5lckhUTUwgPSBzdmdDb2RlO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIG1lcm1haWRDb2RlRWxlbWVudC5wYXJlbnROb2RlLnJlcGxhY2VXaXRoKG5ld0VsZW1lbnQpO1xuICAgIH1cbiAgICBjb25zb2xlLmRlYnVnKGBQcm9jZXNzZWQgJHttZXJtYWlkcy5sZW5ndGh9IE1lcm1haWQgY29kZSBibG9ja3NgKTtcbiAgfVxuICBmdW5jdGlvbiBzY3JvbGxQYXJlbnRUb0NoaWxkKHBhcmVudCwgY2hpbGQpIHtcbiAgICBjb25zdCBwYXJlbnRSZWN0ID0gcGFyZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IHBhcmVudFZpZXdhYmxlQXJlYSA9IHtcbiAgICAgIGhlaWdodDogcGFyZW50LmNsaWVudEhlaWdodCxcbiAgICAgIHdpZHRoOiBwYXJlbnQuY2xpZW50V2lkdGhcbiAgICB9O1xuICAgIGNvbnN0IGNoaWxkUmVjdCA9IGNoaWxkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IGlzQ2hpbGRJblZpZXcgPSBjaGlsZFJlY3QudG9wID49IHBhcmVudFJlY3QudG9wICYmIGNoaWxkUmVjdC5ib3R0b20gPD0gcGFyZW50UmVjdC50b3AgKyBwYXJlbnRWaWV3YWJsZUFyZWEuaGVpZ2h0O1xuICAgIGlmICghaXNDaGlsZEluVmlldykge1xuICAgICAgcGFyZW50LnNjcm9sbFRvcCA9IGNoaWxkUmVjdC50b3AgKyBwYXJlbnQuc2Nyb2xsVG9wIC0gcGFyZW50UmVjdC50b3A7XG4gICAgfVxuICB9XG5cbiAgLy8gbnMtaHVnby1pbXA6L1ZvbHVtZXMvQXRyZW9TU0QvaG9tZXBhZ2UyMDI2L2Fzc2V0cy9qcy9zaXRlLWFuaW1hdGlvbi5qc1xuICBmdW5jdGlvbiBmYWRlSW4oZWxlbWVudCwgZHVyYXRpb24gPSA2MDApIHtcbiAgICBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBcIlwiO1xuICAgIGVsZW1lbnQuc3R5bGUub3BhY2l0eSA9IFwiMFwiO1xuICAgIGxldCBsYXN0ID0gKy8qIEBfX1BVUkVfXyAqLyBuZXcgRGF0ZSgpO1xuICAgIGxldCB0aWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICBlbGVtZW50LnN0eWxlLm9wYWNpdHkgPSAoK2VsZW1lbnQuc3R5bGUub3BhY2l0eSArICgvKiBAX19QVVJFX18gKi8gbmV3IERhdGUoKSAtIGxhc3QpIC8gZHVyYXRpb24pLnRvU3RyaW5nKCk7XG4gICAgICBsYXN0ID0gKy8qIEBfX1BVUkVfXyAqLyBuZXcgRGF0ZSgpO1xuICAgICAgaWYgKCtlbGVtZW50LnN0eWxlLm9wYWNpdHkgPCAxKSB7XG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgJiYgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRpY2spIHx8IHNldFRpbWVvdXQodGljaywgMTYpO1xuICAgICAgfVxuICAgIH07XG4gICAgdGljaygpO1xuICB9XG5cbiAgLy8gbnMtaHVnby1pbXA6L1ZvbHVtZXMvQXRyZW9TU0QvaG9tZXBhZ2UyMDI2L2Fzc2V0cy9qcy9zaXRlLXRoZW1pbmcuanNcbiAgdmFyIGJvZHkgPSBkb2N1bWVudC5ib2R5O1xuICBmdW5jdGlvbiBnZXRUaGVtZU1vZGUoKSB7XG4gICAgcmV0dXJuIHBhcnNlSW50KGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwid2NUaGVtZVwiKSB8fCAyKTtcbiAgfVxuICBmdW5jdGlvbiBjYW5DaGFuZ2VUaGVtZSgpIHtcbiAgICByZXR1cm4gQm9vbGVhbih3aW5kb3cud2MuZGFya0xpZ2h0RW5hYmxlZCk7XG4gIH1cbiAgZnVuY3Rpb24gaW5pdFRoZW1lVmFyaWF0aW9uKCkge1xuICAgIGlmICghY2FuQ2hhbmdlVGhlbWUoKSkge1xuICAgICAgY29uc29sZS5kZWJ1ZyhcIlVzZXIgdGhlbWluZyBkaXNhYmxlZC5cIik7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBpc0RhcmtUaGVtZTogd2luZG93LndjLmlzU2l0ZVRoZW1lRGFyayxcbiAgICAgICAgdGhlbWVNb2RlOiB3aW5kb3cud2MuaXNTaXRlVGhlbWVEYXJrID8gMSA6IDBcbiAgICAgIH07XG4gICAgfVxuICAgIGNvbnNvbGUuZGVidWcoXCJVc2VyIHRoZW1pbmcgZW5hYmxlZC5cIik7XG4gICAgbGV0IGlzRGFya1RoZW1lO1xuICAgIGxldCBjdXJyZW50VGhlbWVNb2RlID0gZ2V0VGhlbWVNb2RlKCk7XG4gICAgY29uc29sZS5kZWJ1ZyhgVXNlcidzIHRoZW1lIHZhcmlhdGlvbjogJHtjdXJyZW50VGhlbWVNb2RlfWApO1xuICAgIHN3aXRjaCAoY3VycmVudFRoZW1lTW9kZSkge1xuICAgICAgY2FzZSAwOlxuICAgICAgICBpc0RhcmtUaGVtZSA9IGZhbHNlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaXNEYXJrVGhlbWUgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmICh3aW5kb3cubWF0Y2hNZWRpYShcIihwcmVmZXJzLWNvbG9yLXNjaGVtZTogZGFyaylcIikubWF0Y2hlcykge1xuICAgICAgICAgIGlzRGFya1RoZW1lID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmICh3aW5kb3cubWF0Y2hNZWRpYShcIihwcmVmZXJzLWNvbG9yLXNjaGVtZTogbGlnaHQpXCIpLm1hdGNoZXMpIHtcbiAgICAgICAgICBpc0RhcmtUaGVtZSA9IGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlzRGFya1RoZW1lID0gd2luZG93LndjLmlzU2l0ZVRoZW1lRGFyaztcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgaWYgKGlzRGFya1RoZW1lICYmICFib2R5LmNsYXNzTGlzdC5jb250YWlucyhcImRhcmtcIikpIHtcbiAgICAgIGNvbnNvbGUuZGVidWcoXCJBcHBseWluZyBkYXJrIHRoZW1lXCIpO1xuICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKFwiZGFya1wiKTtcbiAgICB9IGVsc2UgaWYgKCFpc0RhcmtUaGVtZSAmJiBib2R5LmNsYXNzTGlzdC5jb250YWlucyhcImRhcmtcIikpIHtcbiAgICAgIGNvbnNvbGUuZGVidWcoXCJBcHBseWluZyBsaWdodCB0aGVtZVwiKTtcbiAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZShcImRhcmtcIik7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBpc0RhcmtUaGVtZSxcbiAgICAgIHRoZW1lTW9kZTogY3VycmVudFRoZW1lTW9kZVxuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gY2hhbmdlVGhlbWVNb2RlQ2xpY2sobmV3TW9kZSkge1xuICAgIGlmICghY2FuQ2hhbmdlVGhlbWUoKSkge1xuICAgICAgY29uc29sZS5kZWJ1ZyhcIkNhbm5vdCBjaGFuZ2UgdGhlbWUgLSB1c2VyIHRoZW1pbmcgZGlzYWJsZWQuXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsZXQgaXNEYXJrVGhlbWU7XG4gICAgc3dpdGNoIChuZXdNb2RlKSB7XG4gICAgICBjYXNlIDA6XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwid2NUaGVtZVwiLCBcIjBcIik7XG4gICAgICAgIGlzRGFya1RoZW1lID0gZmFsc2U7XG4gICAgICAgIGNvbnNvbGUuZGVidWcoXCJVc2VyIGNoYW5nZWQgdGhlbWUgdmFyaWF0aW9uIHRvIExpZ2h0LlwiKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwid2NUaGVtZVwiLCBcIjFcIik7XG4gICAgICAgIGlzRGFya1RoZW1lID0gdHJ1ZTtcbiAgICAgICAgY29uc29sZS5kZWJ1ZyhcIlVzZXIgY2hhbmdlZCB0aGVtZSB2YXJpYXRpb24gdG8gRGFyay5cIik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ3Y1RoZW1lXCIsIFwiMlwiKTtcbiAgICAgICAgaWYgKHdpbmRvdy5tYXRjaE1lZGlhKFwiKHByZWZlcnMtY29sb3Itc2NoZW1lOiBkYXJrKVwiKS5tYXRjaGVzKSB7XG4gICAgICAgICAgaXNEYXJrVGhlbWUgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKHdpbmRvdy5tYXRjaE1lZGlhKFwiKHByZWZlcnMtY29sb3Itc2NoZW1lOiBsaWdodClcIikubWF0Y2hlcykge1xuICAgICAgICAgIGlzRGFya1RoZW1lID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXNEYXJrVGhlbWUgPSB3aW5kb3cud2MuaXNTaXRlVGhlbWVEYXJrO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUuZGVidWcoXCJVc2VyIGNoYW5nZWQgdGhlbWUgdmFyaWF0aW9uIHRvIEF1dG8uXCIpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgcmVuZGVyVGhlbWVWYXJpYXRpb24oaXNEYXJrVGhlbWUsIG5ld01vZGUpO1xuICB9XG4gIGZ1bmN0aW9uIHNob3dBY3RpdmVUaGVtZShtb2RlKSB7XG4gICAgbGV0IGxpbmtMaWdodDIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmpzLXNldC10aGVtZS1saWdodFwiKTtcbiAgICBsZXQgbGlua0RhcmsyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5qcy1zZXQtdGhlbWUtZGFya1wiKTtcbiAgICBsZXQgbGlua0F1dG8yID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5qcy1zZXQtdGhlbWUtYXV0b1wiKTtcbiAgICBpZiAobGlua0xpZ2h0MiA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBzd2l0Y2ggKG1vZGUpIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgbGlua0xpZ2h0Mi5jbGFzc0xpc3QuYWRkKFwiZHJvcGRvd24taXRlbS1hY3RpdmVcIik7XG4gICAgICAgIGxpbmtEYXJrMi5jbGFzc0xpc3QucmVtb3ZlKFwiZHJvcGRvd24taXRlbS1hY3RpdmVcIik7XG4gICAgICAgIGxpbmtBdXRvMi5jbGFzc0xpc3QucmVtb3ZlKFwiZHJvcGRvd24taXRlbS1hY3RpdmVcIik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAxOlxuICAgICAgICBsaW5rTGlnaHQyLmNsYXNzTGlzdC5yZW1vdmUoXCJkcm9wZG93bi1pdGVtLWFjdGl2ZVwiKTtcbiAgICAgICAgbGlua0RhcmsyLmNsYXNzTGlzdC5hZGQoXCJkcm9wZG93bi1pdGVtLWFjdGl2ZVwiKTtcbiAgICAgICAgbGlua0F1dG8yLmNsYXNzTGlzdC5yZW1vdmUoXCJkcm9wZG93bi1pdGVtLWFjdGl2ZVwiKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBsaW5rTGlnaHQyLmNsYXNzTGlzdC5yZW1vdmUoXCJkcm9wZG93bi1pdGVtLWFjdGl2ZVwiKTtcbiAgICAgICAgbGlua0RhcmsyLmNsYXNzTGlzdC5yZW1vdmUoXCJkcm9wZG93bi1pdGVtLWFjdGl2ZVwiKTtcbiAgICAgICAgbGlua0F1dG8yLmNsYXNzTGlzdC5hZGQoXCJkcm9wZG93bi1pdGVtLWFjdGl2ZVwiKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIHJlbmRlclRoZW1lVmFyaWF0aW9uKGlzRGFya1RoZW1lLCB0aGVtZU1vZGUgPSAyLCBpbml0ID0gZmFsc2UpIHtcbiAgICBjb25zdCBjb2RlSGxMaWdodCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJsaW5rW3RpdGxlPWhsLWxpZ2h0XVwiKTtcbiAgICBjb25zdCBjb2RlSGxEYXJrID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImxpbmtbdGl0bGU9aGwtZGFya11cIik7XG4gICAgY29uc3QgY29kZUhsRW5hYmxlZCA9IGNvZGVIbExpZ2h0ICE9PSBudWxsIHx8IGNvZGVIbERhcmsgIT09IG51bGw7XG4gICAgY29uc3QgZGlhZ3JhbUVuYWJsZWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwic2NyaXB0W3RpdGxlPW1lcm1haWRdXCIpICE9PSBudWxsO1xuICAgIHNob3dBY3RpdmVUaGVtZSh0aGVtZU1vZGUpO1xuICAgIGNvbnN0IHRoZW1lQ2hhbmdlRXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQoXCJ3Y1RoZW1lQ2hhbmdlXCIsIHsgZGV0YWlsOiB7IGlzRGFya1RoZW1lOiAoKSA9PiBpc0RhcmtUaGVtZSB9IH0pO1xuICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQodGhlbWVDaGFuZ2VFdmVudCk7XG4gICAgaWYgKCFpbml0KSB7XG4gICAgICBpZiAoaXNEYXJrVGhlbWUgPT09IGZhbHNlICYmICFib2R5LmNsYXNzTGlzdC5jb250YWlucyhcImRhcmtcIikgfHwgaXNEYXJrVGhlbWUgPT09IHRydWUgJiYgYm9keS5jbGFzc0xpc3QuY29udGFpbnMoXCJkYXJrXCIpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGlzRGFya1RoZW1lID09PSBmYWxzZSkge1xuICAgICAgaWYgKCFpbml0KSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24oZG9jdW1lbnQuYm9keS5zdHlsZSwgeyBvcGFjaXR5OiAwLCB2aXNpYmlsaXR5OiBcInZpc2libGVcIiB9KTtcbiAgICAgICAgZmFkZUluKGRvY3VtZW50LmJvZHksIDYwMCk7XG4gICAgICB9XG4gICAgICBib2R5LmNsYXNzTGlzdC5yZW1vdmUoXCJkYXJrXCIpO1xuICAgICAgaWYgKGNvZGVIbEVuYWJsZWQpIHtcbiAgICAgICAgY29uc29sZS5kZWJ1ZyhcIlNldHRpbmcgSExKUyB0aGVtZSB0byBsaWdodFwiKTtcbiAgICAgICAgaWYgKGNvZGVIbExpZ2h0KSB7XG4gICAgICAgICAgY29kZUhsTGlnaHQuZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29kZUhsRGFyaykge1xuICAgICAgICAgIGNvZGVIbERhcmsuZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoZGlhZ3JhbUVuYWJsZWQpIHtcbiAgICAgICAgY29uc29sZS5kZWJ1ZyhcIkluaXRpYWxpemluZyBNZXJtYWlkIHdpdGggbGlnaHQgdGhlbWVcIik7XG4gICAgICAgIGlmIChpbml0KSB7XG4gICAgICAgICAgd2luZG93Lm1lcm1haWQuaW5pdGlhbGl6ZSh7IHN0YXJ0T25Mb2FkOiBmYWxzZSwgdGhlbWU6IFwiZGVmYXVsdFwiLCBzZWN1cml0eUxldmVsOiBcImxvb3NlXCIgfSk7XG4gICAgICAgICAgZml4TWVybWFpZCh0cnVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsb2NhdGlvbi5yZWxvYWQoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaXNEYXJrVGhlbWUgPT09IHRydWUpIHtcbiAgICAgIGlmICghaW5pdCkge1xuICAgICAgICBPYmplY3QuYXNzaWduKGRvY3VtZW50LmJvZHkuc3R5bGUsIHsgb3BhY2l0eTogMCwgdmlzaWJpbGl0eTogXCJ2aXNpYmxlXCIgfSk7XG4gICAgICAgIGZhZGVJbihkb2N1bWVudC5ib2R5LCA2MDApO1xuICAgICAgfVxuICAgICAgYm9keS5jbGFzc0xpc3QuYWRkKFwiZGFya1wiKTtcbiAgICAgIGlmIChjb2RlSGxFbmFibGVkKSB7XG4gICAgICAgIGNvbnNvbGUuZGVidWcoXCJTZXR0aW5nIEhMSlMgdGhlbWUgdG8gZGFya1wiKTtcbiAgICAgICAgaWYgKGNvZGVIbExpZ2h0KSB7XG4gICAgICAgICAgY29kZUhsTGlnaHQuZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb2RlSGxEYXJrKSB7XG4gICAgICAgICAgY29kZUhsRGFyay5kaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoZGlhZ3JhbUVuYWJsZWQpIHtcbiAgICAgICAgY29uc29sZS5kZWJ1ZyhcIkluaXRpYWxpemluZyBNZXJtYWlkIHdpdGggZGFyayB0aGVtZVwiKTtcbiAgICAgICAgaWYgKGluaXQpIHtcbiAgICAgICAgICB3aW5kb3cubWVybWFpZC5pbml0aWFsaXplKHsgc3RhcnRPbkxvYWQ6IGZhbHNlLCB0aGVtZTogXCJkYXJrXCIsIHNlY3VyaXR5TGV2ZWw6IFwibG9vc2VcIiB9KTtcbiAgICAgICAgICBmaXhNZXJtYWlkKHRydWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIG9uTWVkaWFRdWVyeUxpc3RFdmVudChldmVudCkge1xuICAgIGlmICghY2FuQ2hhbmdlVGhlbWUoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBkYXJrTW9kZU9uID0gZXZlbnQubWF0Y2hlcztcbiAgICBjb25zb2xlLmRlYnVnKGBPUyBkYXJrIG1vZGUgcHJlZmVyZW5jZSBjaGFuZ2VkIHRvICR7ZGFya01vZGVPbiA/IFwiXFx1ezFGMzEyfSBvblwiIDogXCJcXHUyNjAwXFx1RkUwRiBvZmZcIn0uYCk7XG4gICAgbGV0IGN1cnJlbnRUaGVtZVZhcmlhdGlvbiA9IGdldFRoZW1lTW9kZSgpO1xuICAgIGxldCBpc0RhcmtUaGVtZTtcbiAgICBpZiAoY3VycmVudFRoZW1lVmFyaWF0aW9uID09PSAyKSB7XG4gICAgICBpZiAod2luZG93Lm1hdGNoTWVkaWEoXCIocHJlZmVycy1jb2xvci1zY2hlbWU6IGRhcmspXCIpLm1hdGNoZXMpIHtcbiAgICAgICAgaXNEYXJrVGhlbWUgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmICh3aW5kb3cubWF0Y2hNZWRpYShcIihwcmVmZXJzLWNvbG9yLXNjaGVtZTogbGlnaHQpXCIpLm1hdGNoZXMpIHtcbiAgICAgICAgaXNEYXJrVGhlbWUgPSBmYWxzZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlzRGFya1RoZW1lID0gd2luZG93LndjLmlzU2l0ZVRoZW1lRGFyaztcbiAgICAgIH1cbiAgICAgIHJlbmRlclRoZW1lVmFyaWF0aW9uKGlzRGFya1RoZW1lLCBjdXJyZW50VGhlbWVWYXJpYXRpb24pO1xuICAgIH1cbiAgfVxuXG4gIC8vIDxzdGRpbj5cbiAgY29uc29sZS5kZWJ1ZyhgRW52aXJvbm1lbnQ6ICR7aHVnb0Vudmlyb25tZW50fWApO1xuICBmdW5jdGlvbiBnZXROYXZCYXJIZWlnaHQoKSB7XG4gICAgbGV0IG5hdmJhciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmF2YmFyLW1haW5cIik7XG4gICAgbGV0IG5hdmJhckhlaWdodCA9IG5hdmJhciA/IG5hdmJhci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQgOiAwO1xuICAgIGNvbnNvbGUuZGVidWcoXCJOYXZiYXIgaGVpZ2h0OiBcIiArIG5hdmJhckhlaWdodCk7XG4gICAgcmV0dXJuIG5hdmJhckhlaWdodDtcbiAgfVxuICBmdW5jdGlvbiBzY3JvbGxUb0FuY2hvcih0YXJnZXQsIGR1cmF0aW9uID0gMCkge1xuICAgIHRhcmdldCA9IHR5cGVvZiB0YXJnZXQgPT09IFwidW5kZWZpbmVkXCIgfHwgdHlwZW9mIHRhcmdldCA9PT0gXCJvYmplY3RcIiA/IGRlY29kZVVSSUNvbXBvbmVudCh3aW5kb3cubG9jYXRpb24uaGFzaCkgOiB0YXJnZXQ7XG4gICAgaWYgKCQodGFyZ2V0KS5sZW5ndGgpIHtcbiAgICAgIHRhcmdldCA9IFwiI1wiICsgJC5lc2NhcGVTZWxlY3Rvcih0YXJnZXQuc3Vic3RyaW5nKDEpKTtcbiAgICAgIGxldCBlbGVtZW50T2Zmc2V0ID0gTWF0aC5jZWlsKCQodGFyZ2V0KS5vZmZzZXQoKS50b3AgLSBnZXROYXZCYXJIZWlnaHQoKSk7XG4gICAgICAkKFwiYm9keVwiKS5hZGRDbGFzcyhcInNjcm9sbGluZ1wiKTtcbiAgICAgICQoXCJodG1sLCBib2R5XCIpLmFuaW1hdGUoXG4gICAgICAgIHtcbiAgICAgICAgICBzY3JvbGxUb3A6IGVsZW1lbnRPZmZzZXRcbiAgICAgICAgfSxcbiAgICAgICAgZHVyYXRpb24sXG4gICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICQoXCJib2R5XCIpLnJlbW92ZUNsYXNzKFwic2Nyb2xsaW5nXCIpO1xuICAgICAgICB9XG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmRlYnVnKFwiQ2Fubm90IHNjcm9sbCB0byB0YXJnZXQgYCNcIiArIHRhcmdldCArIFwiYC4gSUQgbm90IGZvdW5kIVwiKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gZml4U2Nyb2xsc3B5KCkge1xuICAgIGxldCAkYm9keSA9ICQoXCJib2R5XCIpO1xuICAgIGxldCBkYXRhID0gJGJvZHkuZGF0YShcImJzLnNjcm9sbHNweVwiKTtcbiAgICBpZiAoZGF0YSkge1xuICAgICAgZGF0YS5fY29uZmlnLm9mZnNldCA9IGdldE5hdkJhckhlaWdodCgpO1xuICAgICAgJGJvZHkuZGF0YShcImJzLnNjcm9sbHNweVwiLCBkYXRhKTtcbiAgICAgICRib2R5LnNjcm9sbHNweShcInJlZnJlc2hcIik7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIHJlbW92ZVF1ZXJ5UGFyYW1zRnJvbVVybCgpIHtcbiAgICBpZiAod2luZG93Lmhpc3RvcnkucmVwbGFjZVN0YXRlKSB7XG4gICAgICBsZXQgdXJsV2l0aG91dFNlYXJjaFBhcmFtcyA9IHdpbmRvdy5sb2NhdGlvbi5wcm90b2NvbCArIFwiLy9cIiArIHdpbmRvdy5sb2NhdGlvbi5ob3N0ICsgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lICsgd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gICAgICB3aW5kb3cuaGlzdG9yeS5yZXBsYWNlU3RhdGUoeyBwYXRoOiB1cmxXaXRob3V0U2VhcmNoUGFyYW1zIH0sIFwiXCIsIHVybFdpdGhvdXRTZWFyY2hQYXJhbXMpO1xuICAgIH1cbiAgfVxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImhhc2hjaGFuZ2VcIiwgc2Nyb2xsVG9BbmNob3IpO1xuICAkKFwiI25hdmJhci1tYWluIGxpLm5hdi1pdGVtIGEubmF2LWxpbmssIC5qcy1zY3JvbGxcIikub24oXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgIGxldCBoYXNoID0gdGhpcy5oYXNoO1xuICAgIGlmICh0aGlzLnBhdGhuYW1lID09PSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgJiYgaGFzaCAmJiAkKGhhc2gpLmxlbmd0aCAmJiAoJChcIi5qcy1ibG9jay1wYWdlXCIpLmxlbmd0aCA+IDAgfHwgJChcIi5qcy13aWRnZXQtcGFnZVwiKS5sZW5ndGggPiAwKSkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGxldCBlbGVtZW50T2Zmc2V0ID0gTWF0aC5jZWlsKCQoaGFzaCkub2Zmc2V0KCkudG9wIC0gZ2V0TmF2QmFySGVpZ2h0KCkpO1xuICAgICAgJChcImh0bWwsIGJvZHlcIikuYW5pbWF0ZShcbiAgICAgICAge1xuICAgICAgICAgIHNjcm9sbFRvcDogZWxlbWVudE9mZnNldFxuICAgICAgICB9LFxuICAgICAgICA4MDBcbiAgICAgICk7XG4gICAgfVxuICB9KTtcbiAgJChkb2N1bWVudCkub24oXCJjbGlja1wiLCBcIi5uYXZiYXItY29sbGFwc2Uuc2hvd1wiLCBmdW5jdGlvbihlKSB7XG4gICAgbGV0IHRhcmdldEVsZW1lbnQgPSAkKGUudGFyZ2V0KS5pcyhcImFcIikgPyAkKGUudGFyZ2V0KSA6ICQoZS50YXJnZXQpLnBhcmVudCgpO1xuICAgIGlmICh0YXJnZXRFbGVtZW50LmlzKFwiYVwiKSAmJiB0YXJnZXRFbGVtZW50LmF0dHIoXCJjbGFzc1wiKSAhPSBcImRyb3Bkb3duLXRvZ2dsZVwiKSB7XG4gICAgICAkKHRoaXMpLmNvbGxhcHNlKFwiaGlkZVwiKTtcbiAgICB9XG4gIH0pO1xuICBmdW5jdGlvbiBwcmludExhdGVzdFJlbGVhc2Uoc2VsZWN0b3IsIHJlcG8pIHtcbiAgICBpZiAoaHVnb0Vudmlyb25tZW50ID09PSBcInByb2R1Y3Rpb25cIikge1xuICAgICAgJC5nZXRKU09OKFwiaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS9yZXBvcy9cIiArIHJlcG8gKyBcIi90YWdzXCIpLmRvbmUoZnVuY3Rpb24oanNvbikge1xuICAgICAgICBsZXQgcmVsZWFzZSA9IGpzb25bMF07XG4gICAgICAgICQoc2VsZWN0b3IpLmFwcGVuZChcIiBcIiArIHJlbGVhc2UubmFtZSk7XG4gICAgICB9KS5mYWlsKGZ1bmN0aW9uKGpxeGhyLCB0ZXh0U3RhdHVzLCBlcnJvcikge1xuICAgICAgICBsZXQgZXJyID0gdGV4dFN0YXR1cyArIFwiLCBcIiArIGVycm9yO1xuICAgICAgICBjb25zb2xlLmxvZyhcIlJlcXVlc3QgRmFpbGVkOiBcIiArIGVycik7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gdG9nZ2xlU2VhcmNoRGlhbG9nKCkge1xuICAgIGlmICgkKFwiYm9keVwiKS5oYXNDbGFzcyhcInNlYXJjaGluZ1wiKSkge1xuICAgICAgJChcIltpZD1zZWFyY2gtcXVlcnldXCIpLmJsdXIoKTtcbiAgICAgICQoXCJib2R5XCIpLnJlbW92ZUNsYXNzKFwic2VhcmNoaW5nIGNvbXBlbnNhdGUtZm9yLXNjcm9sbGJhclwiKTtcbiAgICAgIHJlbW92ZVF1ZXJ5UGFyYW1zRnJvbVVybCgpO1xuICAgICAgJChcIiNmYW5jeWJveC1zdHlsZS1ub3Njcm9sbFwiKS5yZW1vdmUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCEkKFwiI2ZhbmN5Ym94LXN0eWxlLW5vc2Nyb2xsXCIpLmxlbmd0aCAmJiBkb2N1bWVudC5ib2R5LnNjcm9sbEhlaWdodCA+IHdpbmRvdy5pbm5lckhlaWdodCkge1xuICAgICAgICAkKFwiaGVhZFwiKS5hcHBlbmQoXG4gICAgICAgICAgJzxzdHlsZSBpZD1cImZhbmN5Ym94LXN0eWxlLW5vc2Nyb2xsXCI+LmNvbXBlbnNhdGUtZm9yLXNjcm9sbGJhcnttYXJnaW4tcmlnaHQ6JyArICh3aW5kb3cuaW5uZXJXaWR0aCAtIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCkgKyBcInB4O308L3N0eWxlPlwiXG4gICAgICAgICk7XG4gICAgICAgICQoXCJib2R5XCIpLmFkZENsYXNzKFwiY29tcGVuc2F0ZS1mb3Itc2Nyb2xsYmFyXCIpO1xuICAgICAgfVxuICAgICAgJChcImJvZHlcIikuYWRkQ2xhc3MoXCJzZWFyY2hpbmdcIik7XG4gICAgICAkKFwiLnNlYXJjaC1yZXN1bHRzXCIpLmNzcyh7IG9wYWNpdHk6IDAsIHZpc2liaWxpdHk6IFwidmlzaWJsZVwiIH0pLmFuaW1hdGUoeyBvcGFjaXR5OiAxIH0sIDIwMCk7XG4gICAgICBsZXQgYWxnb2xpYVNlYXJjaEJveCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuYWlzLVNlYXJjaEJveC1pbnB1dFwiKTtcbiAgICAgIGlmIChhbGdvbGlhU2VhcmNoQm94KSB7XG4gICAgICAgIGFsZ29saWFTZWFyY2hCb3guZm9jdXMoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICQoXCIjc2VhcmNoLXF1ZXJ5XCIpLmZvY3VzKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIGZpeEh1Z29PdXRwdXQoKSB7XG4gICAgJChcIiNUYWJsZU9mQ29udGVudHNcIikuYWRkQ2xhc3MoXCJuYXYgZmxleC1jb2x1bW5cIik7XG4gICAgJChcIiNUYWJsZU9mQ29udGVudHMgbGlcIikuYWRkQ2xhc3MoXCJuYXYtaXRlbVwiKTtcbiAgICAkKFwiI1RhYmxlT2ZDb250ZW50cyBsaSBhXCIpLmFkZENsYXNzKFwibmF2LWxpbmtcIik7XG4gICAgJChcImlucHV0W3R5cGU9J2NoZWNrYm94J11bZGlzYWJsZWRdXCIpLnBhcmVudHMoXCJ1bFwiKS5hZGRDbGFzcyhcInRhc2stbGlzdFwiKTtcbiAgfVxuICBmdW5jdGlvbiBnZXRTaWJsaW5ncyhlbGVtKSB7XG4gICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5maWx0ZXIuY2FsbChlbGVtLnBhcmVudE5vZGUuY2hpbGRyZW4sIGZ1bmN0aW9uKHNpYmxpbmcpIHtcbiAgICAgIHJldHVybiBzaWJsaW5nICE9PSBlbGVtO1xuICAgIH0pO1xuICB9XG4gICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgIGZpeEh1Z29PdXRwdXQoKTtcbiAgICBsZXQgeyBpc0RhcmtUaGVtZSwgdGhlbWVNb2RlIH0gPSBpbml0VGhlbWVWYXJpYXRpb24oKTtcbiAgICByZW5kZXJUaGVtZVZhcmlhdGlvbihpc0RhcmtUaGVtZSwgdGhlbWVNb2RlLCB0cnVlKTtcbiAgICBpZiAoY29kZUhpZ2hsaWdodGluZykge1xuICAgICAgaGxqcy5pbml0SGlnaGxpZ2h0aW5nKCk7XG4gICAgfVxuICAgIGxldCBjaGlsZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZG9jcy1saW5rcyAuYWN0aXZlXCIpO1xuICAgIGxldCBwYXJlbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmRvY3MtbGlua3NcIik7XG4gICAgaWYgKGNoaWxkICYmIHBhcmVudCkge1xuICAgICAgc2Nyb2xsUGFyZW50VG9DaGlsZChwYXJlbnQsIGNoaWxkKTtcbiAgICB9XG4gIH0pO1xuICAkKHdpbmRvdykub24oXCJsb2FkXCIsIGZ1bmN0aW9uKCkge1xuICAgIGZpeFNjcm9sbHNweSgpO1xuICAgIGxldCBpc290b3BlSW5zdGFuY2VzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5wcm9qZWN0cy1jb250YWluZXJcIik7XG4gICAgbGV0IGlzb3RvcGVJbnN0YW5jZXNDb3VudCA9IGlzb3RvcGVJbnN0YW5jZXMubGVuZ3RoO1xuICAgIGlmICh3aW5kb3cubG9jYXRpb24uaGFzaCAmJiBpc290b3BlSW5zdGFuY2VzQ291bnQgPT09IDApIHtcbiAgICAgIHNjcm9sbFRvQW5jaG9yKGRlY29kZVVSSUNvbXBvbmVudCh3aW5kb3cubG9jYXRpb24uaGFzaCksIDApO1xuICAgIH1cbiAgICBsZXQgY2hpbGQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmRvY3MtdG9jIC5uYXYtbGluay5hY3RpdmVcIik7XG4gICAgbGV0IHBhcmVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZG9jcy10b2NcIik7XG4gICAgaWYgKGNoaWxkICYmIHBhcmVudCkge1xuICAgICAgc2Nyb2xsUGFyZW50VG9DaGlsZChwYXJlbnQsIGNoaWxkKTtcbiAgICB9XG4gICAgbGV0IHpvb21PcHRpb25zID0ge307XG4gICAgaWYgKGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmNvbnRhaW5zKFwiZGFya1wiKSkge1xuICAgICAgem9vbU9wdGlvbnMuYmFja2dyb3VuZCA9IFwicmdiYSgwLDAsMCwwLjkpXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHpvb21PcHRpb25zLmJhY2tncm91bmQgPSBcInJnYmEoMjU1LDI1NSwyNTUsMC45KVwiO1xuICAgIH1cbiAgICBtZWRpdW1fem9vbV9lc21fZGVmYXVsdChcIltkYXRhLXpvb21hYmxlXVwiLCB6b29tT3B0aW9ucyk7XG4gICAgbGV0IGlzb3RvcGVDb3VudGVyID0gMDtcbiAgICBpc290b3BlSW5zdGFuY2VzLmZvckVhY2goZnVuY3Rpb24oaXNvdG9wZUluc3RhbmNlLCBpbmRleCkge1xuICAgICAgY29uc29sZS5kZWJ1ZyhgTG9hZGluZyBJc290b3BlIGluc3RhbmNlICR7aW5kZXh9YCk7XG4gICAgICBsZXQgaXNvO1xuICAgICAgbGV0IGlzb1NlY3Rpb24gPSBpc290b3BlSW5zdGFuY2UuY2xvc2VzdChcInNlY3Rpb25cIik7XG4gICAgICBsZXQgbGF5b3V0ID0gXCJcIjtcbiAgICAgIGlmIChpc29TZWN0aW9uLnF1ZXJ5U2VsZWN0b3IoXCIuaXNvdG9wZVwiKS5jbGFzc0xpc3QuY29udGFpbnMoXCJqcy1sYXlvdXQtcm93XCIpKSB7XG4gICAgICAgIGxheW91dCA9IFwiZml0Um93c1wiO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGF5b3V0ID0gXCJtYXNvbnJ5XCI7XG4gICAgICB9XG4gICAgICBsZXQgZGVmYXVsdEZpbHRlciA9IGlzb1NlY3Rpb24ucXVlcnlTZWxlY3RvcihcIi5kZWZhdWx0LXByb2plY3QtZmlsdGVyXCIpO1xuICAgICAgbGV0IGZpbHRlclRleHQgPSBcIipcIjtcbiAgICAgIGlmIChkZWZhdWx0RmlsdGVyICE9PSBudWxsKSB7XG4gICAgICAgIGZpbHRlclRleHQgPSBkZWZhdWx0RmlsdGVyLnRleHRDb250ZW50O1xuICAgICAgfVxuICAgICAgY29uc29sZS5kZWJ1ZyhgRGVmYXVsdCBJc290b3BlIGZpbHRlcjogJHtmaWx0ZXJUZXh0fWApO1xuICAgICAgaW1hZ2VzTG9hZGVkKGlzb3RvcGVJbnN0YW5jZSwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGlzbyA9IG5ldyBJc290b3BlKGlzb3RvcGVJbnN0YW5jZSwge1xuICAgICAgICAgIGl0ZW1TZWxlY3RvcjogXCIuaXNvdG9wZS1pdGVtXCIsXG4gICAgICAgICAgbGF5b3V0TW9kZTogbGF5b3V0LFxuICAgICAgICAgIG1hc29ucnk6IHtcbiAgICAgICAgICAgIGd1dHRlcjogMjBcbiAgICAgICAgICB9LFxuICAgICAgICAgIGZpbHRlcjogZmlsdGVyVGV4dFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IGlzb0ZpbHRlckJ1dHRvbnMgPSBpc29TZWN0aW9uLnF1ZXJ5U2VsZWN0b3JBbGwoXCIucHJvamVjdC1maWx0ZXJzIGFcIik7XG4gICAgICAgIGlzb0ZpbHRlckJ1dHRvbnMuZm9yRWFjaChcbiAgICAgICAgICAoYnV0dG9uKSA9PiBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlKSA9PiB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBsZXQgc2VsZWN0b3IgPSBidXR0b24uZ2V0QXR0cmlidXRlKFwiZGF0YS1maWx0ZXJcIik7XG4gICAgICAgICAgICBjb25zb2xlLmRlYnVnKGBVcGRhdGluZyBJc290b3BlIGZpbHRlciB0byAke3NlbGVjdG9yfWApO1xuICAgICAgICAgICAgaXNvLmFycmFuZ2UoeyBmaWx0ZXI6IHNlbGVjdG9yIH0pO1xuICAgICAgICAgICAgYnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XG4gICAgICAgICAgICBidXR0b24uY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTtcbiAgICAgICAgICAgIGxldCBidXR0b25TaWJsaW5ncyA9IGdldFNpYmxpbmdzKGJ1dHRvbik7XG4gICAgICAgICAgICBidXR0b25TaWJsaW5ncy5mb3JFYWNoKChidXR0b25TaWJsaW5nKSA9PiB7XG4gICAgICAgICAgICAgIGJ1dHRvblNpYmxpbmcuY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcbiAgICAgICAgICAgICAgYnV0dG9uU2libGluZy5jbGFzc0xpc3QucmVtb3ZlKFwiYWxsXCIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICAgICAgaW5jcmVtZW50SXNvdG9wZUNvdW50ZXIoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIGZ1bmN0aW9uIGluY3JlbWVudElzb3RvcGVDb3VudGVyKCkge1xuICAgICAgaXNvdG9wZUNvdW50ZXIrKztcbiAgICAgIGlmIChpc290b3BlQ291bnRlciA9PT0gaXNvdG9wZUluc3RhbmNlc0NvdW50KSB7XG4gICAgICAgIGNvbnNvbGUuZGVidWcoYEFsbCBQb3J0Zm9saW8gSXNvdG9wZSBpbnN0YW5jZXMgbG9hZGVkLmApO1xuICAgICAgICBpZiAod2luZG93LmxvY2F0aW9uLmhhc2gpIHtcbiAgICAgICAgICBzY3JvbGxUb0FuY2hvcihkZWNvZGVVUklDb21wb25lbnQod2luZG93LmxvY2F0aW9uLmhhc2gpLCAwKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBsZXQgZ2l0aHViUmVsZWFzZVNlbGVjdG9yID0gXCIuanMtZ2l0aHViLXJlbGVhc2VcIjtcbiAgICBpZiAoJChnaXRodWJSZWxlYXNlU2VsZWN0b3IpLmxlbmd0aCA+IDApIHtcbiAgICAgIHByaW50TGF0ZXN0UmVsZWFzZShnaXRodWJSZWxlYXNlU2VsZWN0b3IsICQoZ2l0aHViUmVsZWFzZVNlbGVjdG9yKS5kYXRhKFwicmVwb1wiKSk7XG4gICAgfVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCAoZXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC5jb2RlID09PSBcIkVzY2FwZVwiKSB7XG4gICAgICAgIGNvbnN0IGJvZHkyID0gZG9jdW1lbnQuYm9keTtcbiAgICAgICAgaWYgKGJvZHkyLmNsYXNzTGlzdC5jb250YWlucyhcInNlYXJjaGluZ1wiKSkge1xuICAgICAgICAgIHRvZ2dsZVNlYXJjaERpYWxvZygpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoZXZlbnQua2V5ID09PSBcIi9cIikge1xuICAgICAgICBsZXQgZm9jdXNlZEVsZW1lbnQgPSBkb2N1bWVudC5oYXNGb2N1cygpICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IGRvY3VtZW50LmJvZHkgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAhPT0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgfHwgbnVsbDtcbiAgICAgICAgbGV0IGlzSW5wdXRGb2N1c2VkID0gZm9jdXNlZEVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50IHx8IGZvY3VzZWRFbGVtZW50IGluc3RhbmNlb2YgSFRNTFRleHRBcmVhRWxlbWVudDtcbiAgICAgICAgaWYgKHNlYXJjaEVuYWJsZWQgJiYgIWlzSW5wdXRGb2N1c2VkKSB7XG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICB0b2dnbGVTZWFyY2hEaWFsb2coKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIGlmIChzZWFyY2hFbmFibGVkKSB7XG4gICAgICAkKFwiLmpzLXNlYXJjaFwiKS5jbGljayhmdW5jdGlvbihlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdG9nZ2xlU2VhcmNoRGlhbG9nKCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcbiAgfSk7XG4gIHZhciBsaW5rTGlnaHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmpzLXNldC10aGVtZS1saWdodFwiKTtcbiAgdmFyIGxpbmtEYXJrID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5qcy1zZXQtdGhlbWUtZGFya1wiKTtcbiAgdmFyIGxpbmtBdXRvID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5qcy1zZXQtdGhlbWUtYXV0b1wiKTtcbiAgaWYgKGxpbmtMaWdodCAmJiBsaW5rRGFyayAmJiBsaW5rQXV0bykge1xuICAgIGxpbmtMaWdodC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgY2hhbmdlVGhlbWVNb2RlQ2xpY2soMCk7XG4gICAgfSk7XG4gICAgbGlua0RhcmsuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudCkgPT4ge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGNoYW5nZVRoZW1lTW9kZUNsaWNrKDEpO1xuICAgIH0pO1xuICAgIGxpbmtBdXRvLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBjaGFuZ2VUaGVtZU1vZGVDbGljaygyKTtcbiAgICB9KTtcbiAgfVxuICB2YXIgZGFya01vZGVNZWRpYVF1ZXJ5ID0gd2luZG93Lm1hdGNoTWVkaWEoXCIocHJlZmVycy1jb2xvci1zY2hlbWU6IGRhcmspXCIpO1xuICBkYXJrTW9kZU1lZGlhUXVlcnkuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoZXZlbnQpID0+IHtcbiAgICBvbk1lZGlhUXVlcnlMaXN0RXZlbnQoZXZlbnQpO1xuICB9KTtcbiAgJChcImJvZHlcIikub24oXCJtb3VzZWVudGVyIG1vdXNlbGVhdmVcIiwgXCIuZHJvcGRvd25cIiwgZnVuY3Rpb24oZSkge1xuICAgIHZhciBkcm9wZG93biA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoXCIuZHJvcGRvd25cIik7XG4gICAgdmFyIG1lbnUgPSAkKFwiLmRyb3Bkb3duLW1lbnVcIiwgZHJvcGRvd24pO1xuICAgIGRyb3Bkb3duLmFkZENsYXNzKFwic2hvd1wiKTtcbiAgICBtZW51LmFkZENsYXNzKFwic2hvd1wiKTtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgZHJvcGRvd25bZHJvcGRvd24uaXMoXCI6aG92ZXJcIikgPyBcImFkZENsYXNzXCIgOiBcInJlbW92ZUNsYXNzXCJdKFwic2hvd1wiKTtcbiAgICAgIG1lbnVbZHJvcGRvd24uaXMoXCI6aG92ZXJcIikgPyBcImFkZENsYXNzXCIgOiBcInJlbW92ZUNsYXNzXCJdKFwic2hvd1wiKTtcbiAgICB9LCAzMDApO1xuICB9KTtcbiAgdmFyIHJlc2l6ZVRpbWVyO1xuICAkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uKCkge1xuICAgIGNsZWFyVGltZW91dChyZXNpemVUaW1lcik7XG4gICAgcmVzaXplVGltZXIgPSBzZXRUaW1lb3V0KGZpeFNjcm9sbHNweSwgMjAwKTtcbiAgfSk7XG59KSgpO1xuLyohIG1lZGl1bS16b29tIDEuMC42IHwgTUlUIExpY2Vuc2UgfCBodHRwczovL2dpdGh1Yi5jb20vZnJhbmNvaXNjaGFsaWZvdXIvbWVkaXVtLXpvb20gKi9cblxuO1xuKCgpID0+IHtcbiAgLy8gbnMtaHVnby1wYXJhbXM6PHN0ZGluPlxuICB2YXIgY29udGVudF90eXBlID0geyBhdXRob3JzOiBcIkF1dGhvcnNcIiwgZXZlbnQ6IFwiXFx1NkYxNFxcdThCQjJcIiwgcG9zdDogXCJcXHU2NTg3XFx1N0FFMFwiLCBwcm9qZWN0OiBcIlByb2plY3RzXCIsIHB1YmxpY2F0aW9uOiBcIlB1YmxpY2F0aW9uc1wiLCBzbGlkZXM6IFwiU2xpZGVzXCIgfTtcbiAgdmFyIGkxOG4gPSB7IG5vX3Jlc3VsdHM6IFwiTm8gcmVzdWx0cyBmb3VuZFwiLCBwbGFjZWhvbGRlcjogXCJTZWFyY2guLi5cIiwgcmVzdWx0czogXCJyZXN1bHRzIGZvdW5kXCIgfTtcbiAgdmFyIHNlYXJjaF9jb25maWcgPSB7IGluZGV4VVJJOiBcIi9lbi9pbmRleC5qc29uXCIsIG1pbkxlbmd0aDogMSwgdGhyZXNob2xkOiAwLjMgfTtcblxuICAvLyA8c3RkaW4+XG4gIHZhciBmdXNlT3B0aW9ucyA9IHtcbiAgICBzaG91bGRTb3J0OiB0cnVlLFxuICAgIGluY2x1ZGVNYXRjaGVzOiB0cnVlLFxuICAgIHRva2VuaXplOiB0cnVlLFxuICAgIHRocmVzaG9sZDogc2VhcmNoX2NvbmZpZy50aHJlc2hvbGQsXG4gICAgLy8gU2V0IHRvIH4wLjMgZm9yIHBhcnNpbmcgZGlhY3JpdGljcyBhbmQgQ0pLIGxhbmd1YWdlcy5cbiAgICBsb2NhdGlvbjogMCxcbiAgICBkaXN0YW5jZTogMTAwLFxuICAgIG1heFBhdHRlcm5MZW5ndGg6IDMyLFxuICAgIG1pbk1hdGNoQ2hhckxlbmd0aDogc2VhcmNoX2NvbmZpZy5taW5MZW5ndGgsXG4gICAgLy8gU2V0IHRvIDEgZm9yIHBhcnNpbmcgQ0pLIGxhbmd1YWdlcy5cbiAgICBrZXlzOiBbXG4gICAgICB7IG5hbWU6IFwidGl0bGVcIiwgd2VpZ2h0OiAwLjk5IH0sXG4gICAgICB7IG5hbWU6IFwicHVibGljYXRpb25fc2hvcnRcIiwgd2VpZ2h0OiAwLjg1IH0sXG4gICAgICB7IG5hbWU6IFwicHVibGljYXRpb25cIiwgd2VpZ2h0OiAwLjY1IH0sXG4gICAgICB7IG5hbWU6IFwic3VtbWFyeVwiLCB3ZWlnaHQ6IDAuNiB9LFxuICAgICAgeyBuYW1lOiBcImF1dGhvcnNcIiwgd2VpZ2h0OiAwLjUgfSxcbiAgICAgIHsgbmFtZTogXCJjb250ZW50XCIsIHdlaWdodDogMC4yIH0sXG4gICAgICB7IG5hbWU6IFwidGFnc1wiLCB3ZWlnaHQ6IDAuNSB9LFxuICAgICAgeyBuYW1lOiBcImNhdGVnb3JpZXNcIiwgd2VpZ2h0OiAwLjUgfVxuICAgIF1cbiAgfTtcbiAgdmFyIHN1bW1hcnlMZW5ndGggPSA2MDtcbiAgZnVuY3Rpb24gZ2V0U2VhcmNoUXVlcnkobmFtZSkge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoKGxvY2F0aW9uLnNlYXJjaC5zcGxpdChuYW1lICsgXCI9XCIpWzFdIHx8IFwiXCIpLnNwbGl0KFwiJlwiKVswXSkucmVwbGFjZSgvXFwrL2csIFwiIFwiKTtcbiAgfVxuICBmdW5jdGlvbiB1cGRhdGVVUkwodXJsKSB7XG4gICAgaWYgKGhpc3RvcnkucmVwbGFjZVN0YXRlKSB7XG4gICAgICB3aW5kb3cuaGlzdG9yeS5yZXBsYWNlU3RhdGUoeyBwYXRoOiB1cmwgfSwgXCJcIiwgdXJsKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gaW5pdFNlYXJjaChmb3JjZSwgZnVzZSkge1xuICAgIGxldCBxdWVyeSA9ICQoXCIjc2VhcmNoLXF1ZXJ5XCIpLnZhbCgpO1xuICAgIGlmIChxdWVyeS5sZW5ndGggPCAxKSB7XG4gICAgICAkKFwiI3NlYXJjaC1oaXRzXCIpLmVtcHR5KCk7XG4gICAgICAkKFwiI3NlYXJjaC1jb21tb24tcXVlcmllc1wiKS5zaG93KCk7XG4gICAgfVxuICAgIGlmICghZm9yY2UgJiYgcXVlcnkubGVuZ3RoIDwgZnVzZU9wdGlvbnMubWluTWF0Y2hDaGFyTGVuZ3RoKSByZXR1cm47XG4gICAgJChcIiNzZWFyY2gtaGl0c1wiKS5lbXB0eSgpO1xuICAgICQoXCIjc2VhcmNoLWNvbW1vbi1xdWVyaWVzXCIpLmhpZGUoKTtcbiAgICBzZWFyY2hTaXRlKHF1ZXJ5LCBmdXNlKTtcbiAgICBsZXQgbmV3VVJMID0gd2luZG93LmxvY2F0aW9uLnByb3RvY29sICsgXCIvL1wiICsgd2luZG93LmxvY2F0aW9uLmhvc3QgKyB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgKyBcIj9xPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KHF1ZXJ5KSArIHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuICAgIHVwZGF0ZVVSTChuZXdVUkwpO1xuICB9XG4gIGZ1bmN0aW9uIHNlYXJjaFNpdGUocXVlcnksIGZ1c2UpIHtcbiAgICBsZXQgcmVzdWx0cyA9IGZ1c2Uuc2VhcmNoKHF1ZXJ5KTtcbiAgICBpZiAocmVzdWx0cy5sZW5ndGggPiAwKSB7XG4gICAgICAkKFwiI3NlYXJjaC1oaXRzXCIpLmFwcGVuZCgnPGgzIGNsYXNzPVwibXQtMFwiPicgKyByZXN1bHRzLmxlbmd0aCArIFwiIFwiICsgaTE4bi5yZXN1bHRzICsgXCI8L2gzPlwiKTtcbiAgICAgIHBhcnNlUmVzdWx0cyhxdWVyeSwgcmVzdWx0cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICQoXCIjc2VhcmNoLWhpdHNcIikuYXBwZW5kKCc8ZGl2IGNsYXNzPVwic2VhcmNoLW5vLXJlc3VsdHNcIj4nICsgaTE4bi5ub19yZXN1bHRzICsgXCI8L2Rpdj5cIik7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIHBhcnNlUmVzdWx0cyhxdWVyeSwgcmVzdWx0cykge1xuICAgICQuZWFjaChyZXN1bHRzLCBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICBsZXQgY29udGVudF9rZXkgPSB2YWx1ZS5pdGVtLnNlY3Rpb247XG4gICAgICBsZXQgY29udGVudCA9IFwiXCI7XG4gICAgICBsZXQgc25pcHBldCA9IFwiXCI7XG4gICAgICBsZXQgc25pcHBldEhpZ2hsaWdodHMgPSBbXTtcbiAgICAgIGlmIChbXCJwdWJsaWNhdGlvblwiLCBcImV2ZW50XCJdLmluY2x1ZGVzKGNvbnRlbnRfa2V5KSkge1xuICAgICAgICBjb250ZW50ID0gdmFsdWUuaXRlbS5zdW1tYXJ5O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29udGVudCA9IHZhbHVlLml0ZW0uY29udGVudDtcbiAgICAgIH1cbiAgICAgIGlmIChmdXNlT3B0aW9ucy50b2tlbml6ZSkge1xuICAgICAgICBzbmlwcGV0SGlnaGxpZ2h0cy5wdXNoKHF1ZXJ5KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICQuZWFjaCh2YWx1ZS5tYXRjaGVzLCBmdW5jdGlvbihtYXRjaEtleSwgbWF0Y2hWYWx1ZSkge1xuICAgICAgICAgIGlmIChtYXRjaFZhbHVlLmtleSA9PSBcImNvbnRlbnRcIikge1xuICAgICAgICAgICAgbGV0IHN0YXJ0ID0gbWF0Y2hWYWx1ZS5pbmRpY2VzWzBdWzBdIC0gc3VtbWFyeUxlbmd0aCA+IDAgPyBtYXRjaFZhbHVlLmluZGljZXNbMF1bMF0gLSBzdW1tYXJ5TGVuZ3RoIDogMDtcbiAgICAgICAgICAgIGxldCBlbmQgPSBtYXRjaFZhbHVlLmluZGljZXNbMF1bMV0gKyBzdW1tYXJ5TGVuZ3RoIDwgY29udGVudC5sZW5ndGggPyBtYXRjaFZhbHVlLmluZGljZXNbMF1bMV0gKyBzdW1tYXJ5TGVuZ3RoIDogY29udGVudC5sZW5ndGg7XG4gICAgICAgICAgICBzbmlwcGV0ICs9IGNvbnRlbnQuc3Vic3RyaW5nKHN0YXJ0LCBlbmQpO1xuICAgICAgICAgICAgc25pcHBldEhpZ2hsaWdodHMucHVzaChcbiAgICAgICAgICAgICAgbWF0Y2hWYWx1ZS52YWx1ZS5zdWJzdHJpbmcoXG4gICAgICAgICAgICAgICAgbWF0Y2hWYWx1ZS5pbmRpY2VzWzBdWzBdLFxuICAgICAgICAgICAgICAgIG1hdGNoVmFsdWUuaW5kaWNlc1swXVsxXSAtIG1hdGNoVmFsdWUuaW5kaWNlc1swXVswXSArIDFcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgaWYgKHNuaXBwZXQubGVuZ3RoIDwgMSkge1xuICAgICAgICBzbmlwcGV0ICs9IHZhbHVlLml0ZW0uc3VtbWFyeTtcbiAgICAgIH1cbiAgICAgIGxldCB0ZW1wbGF0ZSA9ICQoXCIjc2VhcmNoLWhpdC1mdXNlLXRlbXBsYXRlXCIpLmh0bWwoKTtcbiAgICAgIGlmIChjb250ZW50X2tleSBpbiBjb250ZW50X3R5cGUpIHtcbiAgICAgICAgY29udGVudF9rZXkgPSBjb250ZW50X3R5cGVbY29udGVudF9rZXldO1xuICAgICAgfVxuICAgICAgbGV0IHRlbXBsYXRlRGF0YSA9IHtcbiAgICAgICAga2V5LFxuICAgICAgICB0aXRsZTogdmFsdWUuaXRlbS50aXRsZSxcbiAgICAgICAgdHlwZTogY29udGVudF9rZXksXG4gICAgICAgIHJlbHBlcm1hbGluazogdmFsdWUuaXRlbS5yZWxwZXJtYWxpbmssXG4gICAgICAgIHNuaXBwZXRcbiAgICAgIH07XG4gICAgICBsZXQgb3V0cHV0ID0gcmVuZGVyKHRlbXBsYXRlLCB0ZW1wbGF0ZURhdGEpO1xuICAgICAgJChcIiNzZWFyY2gtaGl0c1wiKS5hcHBlbmQob3V0cHV0KTtcbiAgICAgICQuZWFjaChzbmlwcGV0SGlnaGxpZ2h0cywgZnVuY3Rpb24oaGxLZXksIGhsVmFsdWUpIHtcbiAgICAgICAgJChcIiNzdW1tYXJ5LVwiICsga2V5KS5tYXJrKGhsVmFsdWUpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbiAgZnVuY3Rpb24gcmVuZGVyKHRlbXBsYXRlLCBkYXRhKSB7XG4gICAgbGV0IGtleSwgZmluZCwgcmU7XG4gICAgZm9yIChrZXkgaW4gZGF0YSkge1xuICAgICAgZmluZCA9IFwiXFxcXHtcXFxce1xcXFxzKlwiICsga2V5ICsgXCJcXFxccypcXFxcfVxcXFx9XCI7XG4gICAgICByZSA9IG5ldyBSZWdFeHAoZmluZCwgXCJnXCIpO1xuICAgICAgdGVtcGxhdGUgPSB0ZW1wbGF0ZS5yZXBsYWNlKHJlLCBkYXRhW2tleV0pO1xuICAgIH1cbiAgICByZXR1cm4gdGVtcGxhdGU7XG4gIH1cbiAgaWYgKHR5cGVvZiBGdXNlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAkLmdldEpTT04oc2VhcmNoX2NvbmZpZy5pbmRleFVSSSwgZnVuY3Rpb24oc2VhcmNoX2luZGV4KSB7XG4gICAgICBsZXQgZnVzZSA9IG5ldyBGdXNlKHNlYXJjaF9pbmRleCwgZnVzZU9wdGlvbnMpO1xuICAgICAgbGV0IHF1ZXJ5ID0gZ2V0U2VhcmNoUXVlcnkoXCJxXCIpO1xuICAgICAgaWYgKHF1ZXJ5KSB7XG4gICAgICAgICQoXCJib2R5XCIpLmFkZENsYXNzKFwic2VhcmNoaW5nXCIpO1xuICAgICAgICAkKFwiLnNlYXJjaC1yZXN1bHRzXCIpLmNzcyh7IG9wYWNpdHk6IDAsIHZpc2liaWxpdHk6IFwidmlzaWJsZVwiIH0pLmFuaW1hdGUoeyBvcGFjaXR5OiAxIH0sIDIwMCk7XG4gICAgICAgICQoXCIjc2VhcmNoLXF1ZXJ5XCIpLnZhbChxdWVyeSk7XG4gICAgICAgICQoXCIjc2VhcmNoLXF1ZXJ5XCIpLmZvY3VzKCk7XG4gICAgICAgIGluaXRTZWFyY2godHJ1ZSwgZnVzZSk7XG4gICAgICB9XG4gICAgICAkKFwiI3NlYXJjaC1xdWVyeVwiKS5rZXl1cChmdW5jdGlvbihlKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCgkLmRhdGEodGhpcywgXCJzZWFyY2hUaW1lclwiKSk7XG4gICAgICAgIGlmIChlLmtleUNvZGUgPT0gMTMpIHtcbiAgICAgICAgICBpbml0U2VhcmNoKHRydWUsIGZ1c2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICQodGhpcykuZGF0YShcbiAgICAgICAgICAgIFwic2VhcmNoVGltZXJcIixcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIGluaXRTZWFyY2goZmFsc2UsIGZ1c2UpO1xuICAgICAgICAgICAgfSwgMjUwKVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59KSgpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7QUFBQSxHQUFDLE1BQU07QUFFTCxRQUFJLFdBQVcsT0FBTyxVQUFVLFNBQVMsUUFBUTtBQUMvQyxlQUFTLElBQUksR0FBRyxJQUFJLFVBQVUsUUFBUSxLQUFLO0FBQ3pDLFlBQUksU0FBUyxVQUFVLENBQUM7QUFDeEIsaUJBQVMsT0FBTyxRQUFRO0FBQ3RCLGNBQUksT0FBTyxVQUFVLGVBQWUsS0FBSyxRQUFRLEdBQUcsR0FBRztBQUNyRCxtQkFBTyxHQUFHLElBQUksT0FBTyxHQUFHO0FBQUEsVUFDMUI7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUNBLGFBQU87QUFBQSxJQUNUO0FBQ0EsUUFBSSxjQUFjLFNBQVMsYUFBYSxNQUFNO0FBQzVDLGFBQU8sS0FBSyxZQUFZO0FBQUEsSUFDMUI7QUFDQSxRQUFJLGFBQWEsU0FBUyxZQUFZLFVBQVU7QUFDOUMsYUFBTyxTQUFTLFVBQVUsY0FBYyxRQUFRO0FBQUEsSUFDbEQ7QUFDQSxRQUFJLFNBQVMsU0FBUyxRQUFRLFVBQVU7QUFDdEMsYUFBTyxZQUFZLFNBQVMsYUFBYTtBQUFBLElBQzNDO0FBQ0EsUUFBSSxRQUFRLFNBQVMsT0FBTyxPQUFPO0FBQ2pDLFVBQUksU0FBUyxNQUFNLGNBQWMsTUFBTTtBQUN2QyxhQUFPLE9BQU8sT0FBTyxFQUFFLEVBQUUsWUFBWSxNQUFNO0FBQUEsSUFDN0M7QUFDQSxRQUFJLHdCQUF3QixTQUFTLHVCQUF1QixVQUFVO0FBQ3BFLFVBQUk7QUFDRixZQUFJLE1BQU0sUUFBUSxRQUFRLEdBQUc7QUFDM0IsaUJBQU8sU0FBUyxPQUFPLFdBQVc7QUFBQSxRQUNwQztBQUNBLFlBQUksV0FBVyxRQUFRLEdBQUc7QUFDeEIsaUJBQU8sQ0FBQyxF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
