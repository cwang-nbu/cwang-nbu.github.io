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
    var content_type = { authors: "Authors", event: "\u6F14\u8BB2", post: "\u6587\u7AE0", project: "\u9879\u76EE", publication: "\u51FA\u7248\u7269", slides: "Slides" };
    var i18n = { no_results: "\u6CA1\u6709\u627E\u5230\u7ED3\u679C", placeholder: "\u641C\u7D22...", results: "\u641C\u7D22\u7ED3\u679C" };
    var search_config = { indexURI: "/zh/index.json", minLength: 1, threshold: 0.3 };
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiPHN0ZGluPiJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiKCgpID0+IHtcbiAgLy8gbnMtaHVnby1pbXA6L1ZvbHVtZXMvQXRyZW9TU0QvaG9tZXBhZ2VPbGQvYXNzZXRzL2pzL192ZW5kb3IvbWVkaXVtLXpvb20uZXNtLmpzXG4gIHZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07XG4gICAgICBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7XG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7XG4gICAgICAgICAgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0O1xuICB9O1xuICB2YXIgaXNTdXBwb3J0ZWQgPSBmdW5jdGlvbiBpc1N1cHBvcnRlZDIobm9kZSkge1xuICAgIHJldHVybiBub2RlLnRhZ05hbWUgPT09IFwiSU1HXCI7XG4gIH07XG4gIHZhciBpc05vZGVMaXN0ID0gZnVuY3Rpb24gaXNOb2RlTGlzdDIoc2VsZWN0b3IpIHtcbiAgICByZXR1cm4gTm9kZUxpc3QucHJvdG90eXBlLmlzUHJvdG90eXBlT2Yoc2VsZWN0b3IpO1xuICB9O1xuICB2YXIgaXNOb2RlID0gZnVuY3Rpb24gaXNOb2RlMihzZWxlY3Rvcikge1xuICAgIHJldHVybiBzZWxlY3RvciAmJiBzZWxlY3Rvci5ub2RlVHlwZSA9PT0gMTtcbiAgfTtcbiAgdmFyIGlzU3ZnID0gZnVuY3Rpb24gaXNTdmcyKGltYWdlKSB7XG4gICAgdmFyIHNvdXJjZSA9IGltYWdlLmN1cnJlbnRTcmMgfHwgaW1hZ2Uuc3JjO1xuICAgIHJldHVybiBzb3VyY2Uuc3Vic3RyKC00KS50b0xvd2VyQ2FzZSgpID09PSBcIi5zdmdcIjtcbiAgfTtcbiAgdmFyIGdldEltYWdlc0Zyb21TZWxlY3RvciA9IGZ1bmN0aW9uIGdldEltYWdlc0Zyb21TZWxlY3RvcjIoc2VsZWN0b3IpIHtcbiAgICB0cnkge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoc2VsZWN0b3IpKSB7XG4gICAgICAgIHJldHVybiBzZWxlY3Rvci5maWx0ZXIoaXNTdXBwb3J0ZWQpO1xuICAgICAgfVxuICAgICAgaWYgKGlzTm9kZUxpc3Qoc2VsZWN0b3IpKSB7XG4gICAgICAgIHJldHVybiBbXS5zbGljZS5jYWxsKHNlbGVjdG9yKS5maWx0ZXIoaXNTdXBwb3J0ZWQpO1xuICAgICAgfVxuICAgICAgaWYgKGlzTm9kZShzZWxlY3RvcikpIHtcbiAgICAgICAgcmV0dXJuIFtzZWxlY3Rvcl0uZmlsdGVyKGlzU3VwcG9ydGVkKTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2Ygc2VsZWN0b3IgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgcmV0dXJuIFtdLnNsaWNlLmNhbGwoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikpLmZpbHRlcihpc1N1cHBvcnRlZCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gW107XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiVGhlIHByb3ZpZGVkIHNlbGVjdG9yIGlzIGludmFsaWQuXFxuRXhwZWN0cyBhIENTUyBzZWxlY3RvciwgYSBOb2RlIGVsZW1lbnQsIGEgTm9kZUxpc3Qgb3IgYW4gYXJyYXkuXFxuU2VlOiBodHRwczovL2dpdGh1Yi5jb20vZnJhbmNvaXNjaGFsaWZvdXIvbWVkaXVtLXpvb21cIik7XG4gICAgfVxuICB9O1xuICB2YXIgY3JlYXRlT3ZlcmxheSA9IGZ1bmN0aW9uIGNyZWF0ZU92ZXJsYXkyKGJhY2tncm91bmQpIHtcbiAgICB2YXIgb3ZlcmxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgb3ZlcmxheS5jbGFzc0xpc3QuYWRkKFwibWVkaXVtLXpvb20tb3ZlcmxheVwiKTtcbiAgICBvdmVybGF5LnN0eWxlLmJhY2tncm91bmQgPSBiYWNrZ3JvdW5kO1xuICAgIHJldHVybiBvdmVybGF5O1xuICB9O1xuICB2YXIgY2xvbmVUYXJnZXQgPSBmdW5jdGlvbiBjbG9uZVRhcmdldDIodGVtcGxhdGUpIHtcbiAgICB2YXIgX3RlbXBsYXRlJGdldEJvdW5kaW5nID0gdGVtcGxhdGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksIHRvcCA9IF90ZW1wbGF0ZSRnZXRCb3VuZGluZy50b3AsIGxlZnQgPSBfdGVtcGxhdGUkZ2V0Qm91bmRpbmcubGVmdCwgd2lkdGggPSBfdGVtcGxhdGUkZ2V0Qm91bmRpbmcud2lkdGgsIGhlaWdodCA9IF90ZW1wbGF0ZSRnZXRCb3VuZGluZy5oZWlnaHQ7XG4gICAgdmFyIGNsb25lID0gdGVtcGxhdGUuY2xvbmVOb2RlKCk7XG4gICAgdmFyIHNjcm9sbFRvcCA9IHdpbmRvdy5wYWdlWU9mZnNldCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wIHx8IGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wIHx8IDA7XG4gICAgdmFyIHNjcm9sbExlZnQgPSB3aW5kb3cucGFnZVhPZmZzZXQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbExlZnQgfHwgZG9jdW1lbnQuYm9keS5zY3JvbGxMZWZ0IHx8IDA7XG4gICAgY2xvbmUucmVtb3ZlQXR0cmlidXRlKFwiaWRcIik7XG4gICAgY2xvbmUuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG4gICAgY2xvbmUuc3R5bGUudG9wID0gdG9wICsgc2Nyb2xsVG9wICsgXCJweFwiO1xuICAgIGNsb25lLnN0eWxlLmxlZnQgPSBsZWZ0ICsgc2Nyb2xsTGVmdCArIFwicHhcIjtcbiAgICBjbG9uZS5zdHlsZS53aWR0aCA9IHdpZHRoICsgXCJweFwiO1xuICAgIGNsb25lLnN0eWxlLmhlaWdodCA9IGhlaWdodCArIFwicHhcIjtcbiAgICBjbG9uZS5zdHlsZS50cmFuc2Zvcm0gPSBcIlwiO1xuICAgIHJldHVybiBjbG9uZTtcbiAgfTtcbiAgdmFyIGNyZWF0ZUN1c3RvbUV2ZW50ID0gZnVuY3Rpb24gY3JlYXRlQ3VzdG9tRXZlbnQyKHR5cGUsIHBhcmFtcykge1xuICAgIHZhciBldmVudFBhcmFtcyA9IF9leHRlbmRzKHtcbiAgICAgIGJ1YmJsZXM6IGZhbHNlLFxuICAgICAgY2FuY2VsYWJsZTogZmFsc2UsXG4gICAgICBkZXRhaWw6IHZvaWQgMFxuICAgIH0sIHBhcmFtcyk7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cuQ3VzdG9tRXZlbnQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgcmV0dXJuIG5ldyBDdXN0b21FdmVudCh0eXBlLCBldmVudFBhcmFtcyk7XG4gICAgfVxuICAgIHZhciBjdXN0b21FdmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KFwiQ3VzdG9tRXZlbnRcIik7XG4gICAgY3VzdG9tRXZlbnQuaW5pdEN1c3RvbUV2ZW50KHR5cGUsIGV2ZW50UGFyYW1zLmJ1YmJsZXMsIGV2ZW50UGFyYW1zLmNhbmNlbGFibGUsIGV2ZW50UGFyYW1zLmRldGFpbCk7XG4gICAgcmV0dXJuIGN1c3RvbUV2ZW50O1xuICB9O1xuICB2YXIgbWVkaXVtWm9vbUVzbSA9IGZ1bmN0aW9uIG1lZGl1bVpvb20oc2VsZWN0b3IpIHtcbiAgICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdm9pZCAwID8gYXJndW1lbnRzWzFdIDoge307XG4gICAgdmFyIFByb21pc2UyID0gd2luZG93LlByb21pc2UgfHwgZnVuY3Rpb24gUHJvbWlzZTMoZm4pIHtcbiAgICAgIGZ1bmN0aW9uIG5vb3AoKSB7XG4gICAgICB9XG4gICAgICBmbihub29wLCBub29wKTtcbiAgICB9O1xuICAgIHZhciBfaGFuZGxlQ2xpY2sgPSBmdW5jdGlvbiBfaGFuZGxlQ2xpY2syKGV2ZW50KSB7XG4gICAgICB2YXIgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xuICAgICAgaWYgKHRhcmdldCA9PT0gb3ZlcmxheSkge1xuICAgICAgICBjbG9zZSgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoaW1hZ2VzLmluZGV4T2YodGFyZ2V0KSA9PT0gLTEpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdG9nZ2xlKHsgdGFyZ2V0IH0pO1xuICAgIH07XG4gICAgdmFyIF9oYW5kbGVTY3JvbGwgPSBmdW5jdGlvbiBfaGFuZGxlU2Nyb2xsMigpIHtcbiAgICAgIGlmIChpc0FuaW1hdGluZyB8fCAhYWN0aXZlLm9yaWdpbmFsKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHZhciBjdXJyZW50U2Nyb2xsID0gd2luZG93LnBhZ2VZT2Zmc2V0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3AgfHwgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgfHwgMDtcbiAgICAgIGlmIChNYXRoLmFicyhzY3JvbGxUb3AgLSBjdXJyZW50U2Nyb2xsKSA+IHpvb21PcHRpb25zLnNjcm9sbE9mZnNldCkge1xuICAgICAgICBzZXRUaW1lb3V0KGNsb3NlLCAxNTApO1xuICAgICAgfVxuICAgIH07XG4gICAgdmFyIF9oYW5kbGVLZXlVcCA9IGZ1bmN0aW9uIF9oYW5kbGVLZXlVcDIoZXZlbnQpIHtcbiAgICAgIHZhciBrZXkgPSBldmVudC5rZXkgfHwgZXZlbnQua2V5Q29kZTtcbiAgICAgIGlmIChrZXkgPT09IFwiRXNjYXBlXCIgfHwga2V5ID09PSBcIkVzY1wiIHx8IGtleSA9PT0gMjcpIHtcbiAgICAgICAgY2xvc2UoKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHZhciB1cGRhdGUgPSBmdW5jdGlvbiB1cGRhdGUyKCkge1xuICAgICAgdmFyIG9wdGlvbnMyID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB2b2lkIDAgPyBhcmd1bWVudHNbMF0gOiB7fTtcbiAgICAgIHZhciBuZXdPcHRpb25zID0gb3B0aW9uczI7XG4gICAgICBpZiAob3B0aW9uczIuYmFja2dyb3VuZCkge1xuICAgICAgICBvdmVybGF5LnN0eWxlLmJhY2tncm91bmQgPSBvcHRpb25zMi5iYWNrZ3JvdW5kO1xuICAgICAgfVxuICAgICAgaWYgKG9wdGlvbnMyLmNvbnRhaW5lciAmJiBvcHRpb25zMi5jb250YWluZXIgaW5zdGFuY2VvZiBPYmplY3QpIHtcbiAgICAgICAgbmV3T3B0aW9ucy5jb250YWluZXIgPSBfZXh0ZW5kcyh7fSwgem9vbU9wdGlvbnMuY29udGFpbmVyLCBvcHRpb25zMi5jb250YWluZXIpO1xuICAgICAgfVxuICAgICAgaWYgKG9wdGlvbnMyLnRlbXBsYXRlKSB7XG4gICAgICAgIHZhciB0ZW1wbGF0ZSA9IGlzTm9kZShvcHRpb25zMi50ZW1wbGF0ZSkgPyBvcHRpb25zMi50ZW1wbGF0ZSA6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Iob3B0aW9uczIudGVtcGxhdGUpO1xuICAgICAgICBuZXdPcHRpb25zLnRlbXBsYXRlID0gdGVtcGxhdGU7XG4gICAgICB9XG4gICAgICB6b29tT3B0aW9ucyA9IF9leHRlbmRzKHt9LCB6b29tT3B0aW9ucywgbmV3T3B0aW9ucyk7XG4gICAgICBpbWFnZXMuZm9yRWFjaChmdW5jdGlvbihpbWFnZSkge1xuICAgICAgICBpbWFnZS5kaXNwYXRjaEV2ZW50KGNyZWF0ZUN1c3RvbUV2ZW50KFwibWVkaXVtLXpvb206dXBkYXRlXCIsIHtcbiAgICAgICAgICBkZXRhaWw6IHsgem9vbSB9XG4gICAgICAgIH0pKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHpvb207XG4gICAgfTtcbiAgICB2YXIgY2xvbmUgPSBmdW5jdGlvbiBjbG9uZTIoKSB7XG4gICAgICB2YXIgb3B0aW9uczIgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHZvaWQgMCA/IGFyZ3VtZW50c1swXSA6IHt9O1xuICAgICAgcmV0dXJuIG1lZGl1bVpvb21Fc20oX2V4dGVuZHMoe30sIHpvb21PcHRpb25zLCBvcHRpb25zMikpO1xuICAgIH07XG4gICAgdmFyIGF0dGFjaCA9IGZ1bmN0aW9uIGF0dGFjaDIoKSB7XG4gICAgICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgc2VsZWN0b3JzID0gQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgICAgIHNlbGVjdG9yc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICAgIH1cbiAgICAgIHZhciBuZXdJbWFnZXMgPSBzZWxlY3RvcnMucmVkdWNlKGZ1bmN0aW9uKGltYWdlc0FjY3VtdWxhdG9yLCBjdXJyZW50U2VsZWN0b3IpIHtcbiAgICAgICAgcmV0dXJuIFtdLmNvbmNhdChpbWFnZXNBY2N1bXVsYXRvciwgZ2V0SW1hZ2VzRnJvbVNlbGVjdG9yKGN1cnJlbnRTZWxlY3RvcikpO1xuICAgICAgfSwgW10pO1xuICAgICAgbmV3SW1hZ2VzLmZpbHRlcihmdW5jdGlvbihuZXdJbWFnZSkge1xuICAgICAgICByZXR1cm4gaW1hZ2VzLmluZGV4T2YobmV3SW1hZ2UpID09PSAtMTtcbiAgICAgIH0pLmZvckVhY2goZnVuY3Rpb24obmV3SW1hZ2UpIHtcbiAgICAgICAgaW1hZ2VzLnB1c2gobmV3SW1hZ2UpO1xuICAgICAgICBuZXdJbWFnZS5jbGFzc0xpc3QuYWRkKFwibWVkaXVtLXpvb20taW1hZ2VcIik7XG4gICAgICB9KTtcbiAgICAgIGV2ZW50TGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24oX3JlZikge1xuICAgICAgICB2YXIgdHlwZSA9IF9yZWYudHlwZSwgbGlzdGVuZXIgPSBfcmVmLmxpc3RlbmVyLCBvcHRpb25zMiA9IF9yZWYub3B0aW9ucztcbiAgICAgICAgbmV3SW1hZ2VzLmZvckVhY2goZnVuY3Rpb24oaW1hZ2UpIHtcbiAgICAgICAgICBpbWFnZS5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyLCBvcHRpb25zMik7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gem9vbTtcbiAgICB9O1xuICAgIHZhciBkZXRhY2ggPSBmdW5jdGlvbiBkZXRhY2gyKCkge1xuICAgICAgZm9yICh2YXIgX2xlbjIgPSBhcmd1bWVudHMubGVuZ3RoLCBzZWxlY3RvcnMgPSBBcnJheShfbGVuMiksIF9rZXkyID0gMDsgX2tleTIgPCBfbGVuMjsgX2tleTIrKykge1xuICAgICAgICBzZWxlY3RvcnNbX2tleTJdID0gYXJndW1lbnRzW19rZXkyXTtcbiAgICAgIH1cbiAgICAgIGlmIChhY3RpdmUuem9vbWVkKSB7XG4gICAgICAgIGNsb3NlKCk7XG4gICAgICB9XG4gICAgICB2YXIgaW1hZ2VzVG9EZXRhY2ggPSBzZWxlY3RvcnMubGVuZ3RoID4gMCA/IHNlbGVjdG9ycy5yZWR1Y2UoZnVuY3Rpb24oaW1hZ2VzQWNjdW11bGF0b3IsIGN1cnJlbnRTZWxlY3Rvcikge1xuICAgICAgICByZXR1cm4gW10uY29uY2F0KGltYWdlc0FjY3VtdWxhdG9yLCBnZXRJbWFnZXNGcm9tU2VsZWN0b3IoY3VycmVudFNlbGVjdG9yKSk7XG4gICAgICB9LCBbXSkgOiBpbWFnZXM7XG4gICAgICBpbWFnZXNUb0RldGFjaC5mb3JFYWNoKGZ1bmN0aW9uKGltYWdlKSB7XG4gICAgICAgIGltYWdlLmNsYXNzTGlzdC5yZW1vdmUoXCJtZWRpdW0tem9vbS1pbWFnZVwiKTtcbiAgICAgICAgaW1hZ2UuZGlzcGF0Y2hFdmVudChjcmVhdGVDdXN0b21FdmVudChcIm1lZGl1bS16b29tOmRldGFjaFwiLCB7XG4gICAgICAgICAgZGV0YWlsOiB7IHpvb20gfVxuICAgICAgICB9KSk7XG4gICAgICB9KTtcbiAgICAgIGltYWdlcyA9IGltYWdlcy5maWx0ZXIoZnVuY3Rpb24oaW1hZ2UpIHtcbiAgICAgICAgcmV0dXJuIGltYWdlc1RvRGV0YWNoLmluZGV4T2YoaW1hZ2UpID09PSAtMTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHpvb207XG4gICAgfTtcbiAgICB2YXIgb24gPSBmdW5jdGlvbiBvbjIodHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgIHZhciBvcHRpb25zMiA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdm9pZCAwID8gYXJndW1lbnRzWzJdIDoge307XG4gICAgICBpbWFnZXMuZm9yRWFjaChmdW5jdGlvbihpbWFnZSkge1xuICAgICAgICBpbWFnZS5hZGRFdmVudExpc3RlbmVyKFwibWVkaXVtLXpvb206XCIgKyB0eXBlLCBsaXN0ZW5lciwgb3B0aW9uczIpO1xuICAgICAgfSk7XG4gICAgICBldmVudExpc3RlbmVycy5wdXNoKHsgdHlwZTogXCJtZWRpdW0tem9vbTpcIiArIHR5cGUsIGxpc3RlbmVyLCBvcHRpb25zOiBvcHRpb25zMiB9KTtcbiAgICAgIHJldHVybiB6b29tO1xuICAgIH07XG4gICAgdmFyIG9mZiA9IGZ1bmN0aW9uIG9mZjIodHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgIHZhciBvcHRpb25zMiA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdm9pZCAwID8gYXJndW1lbnRzWzJdIDoge307XG4gICAgICBpbWFnZXMuZm9yRWFjaChmdW5jdGlvbihpbWFnZSkge1xuICAgICAgICBpbWFnZS5yZW1vdmVFdmVudExpc3RlbmVyKFwibWVkaXVtLXpvb206XCIgKyB0eXBlLCBsaXN0ZW5lciwgb3B0aW9uczIpO1xuICAgICAgfSk7XG4gICAgICBldmVudExpc3RlbmVycyA9IGV2ZW50TGlzdGVuZXJzLmZpbHRlcihmdW5jdGlvbihldmVudExpc3RlbmVyKSB7XG4gICAgICAgIHJldHVybiAhKGV2ZW50TGlzdGVuZXIudHlwZSA9PT0gXCJtZWRpdW0tem9vbTpcIiArIHR5cGUgJiYgZXZlbnRMaXN0ZW5lci5saXN0ZW5lci50b1N0cmluZygpID09PSBsaXN0ZW5lci50b1N0cmluZygpKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHpvb207XG4gICAgfTtcbiAgICB2YXIgb3BlbiA9IGZ1bmN0aW9uIG9wZW4yKCkge1xuICAgICAgdmFyIF9yZWYyID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB2b2lkIDAgPyBhcmd1bWVudHNbMF0gOiB7fSwgdGFyZ2V0ID0gX3JlZjIudGFyZ2V0O1xuICAgICAgdmFyIF9hbmltYXRlID0gZnVuY3Rpb24gX2FuaW1hdGUyKCkge1xuICAgICAgICB2YXIgY29udGFpbmVyID0ge1xuICAgICAgICAgIHdpZHRoOiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgsXG4gICAgICAgICAgaGVpZ2h0OiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0LFxuICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgdG9wOiAwLFxuICAgICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICAgIGJvdHRvbTogMFxuICAgICAgICB9O1xuICAgICAgICB2YXIgdmlld3BvcnRXaWR0aCA9IHZvaWQgMDtcbiAgICAgICAgdmFyIHZpZXdwb3J0SGVpZ2h0ID0gdm9pZCAwO1xuICAgICAgICBpZiAoem9vbU9wdGlvbnMuY29udGFpbmVyKSB7XG4gICAgICAgICAgaWYgKHpvb21PcHRpb25zLmNvbnRhaW5lciBpbnN0YW5jZW9mIE9iamVjdCkge1xuICAgICAgICAgICAgY29udGFpbmVyID0gX2V4dGVuZHMoe30sIGNvbnRhaW5lciwgem9vbU9wdGlvbnMuY29udGFpbmVyKTtcbiAgICAgICAgICAgIHZpZXdwb3J0V2lkdGggPSBjb250YWluZXIud2lkdGggLSBjb250YWluZXIubGVmdCAtIGNvbnRhaW5lci5yaWdodCAtIHpvb21PcHRpb25zLm1hcmdpbiAqIDI7XG4gICAgICAgICAgICB2aWV3cG9ydEhlaWdodCA9IGNvbnRhaW5lci5oZWlnaHQgLSBjb250YWluZXIudG9wIC0gY29udGFpbmVyLmJvdHRvbSAtIHpvb21PcHRpb25zLm1hcmdpbiAqIDI7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciB6b29tQ29udGFpbmVyID0gaXNOb2RlKHpvb21PcHRpb25zLmNvbnRhaW5lcikgPyB6b29tT3B0aW9ucy5jb250YWluZXIgOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHpvb21PcHRpb25zLmNvbnRhaW5lcik7XG4gICAgICAgICAgICB2YXIgX3pvb21Db250YWluZXIkZ2V0Qm91ID0gem9vbUNvbnRhaW5lci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSwgX3dpZHRoID0gX3pvb21Db250YWluZXIkZ2V0Qm91LndpZHRoLCBfaGVpZ2h0ID0gX3pvb21Db250YWluZXIkZ2V0Qm91LmhlaWdodCwgX2xlZnQgPSBfem9vbUNvbnRhaW5lciRnZXRCb3UubGVmdCwgX3RvcCA9IF96b29tQ29udGFpbmVyJGdldEJvdS50b3A7XG4gICAgICAgICAgICBjb250YWluZXIgPSBfZXh0ZW5kcyh7fSwgY29udGFpbmVyLCB7XG4gICAgICAgICAgICAgIHdpZHRoOiBfd2lkdGgsXG4gICAgICAgICAgICAgIGhlaWdodDogX2hlaWdodCxcbiAgICAgICAgICAgICAgbGVmdDogX2xlZnQsXG4gICAgICAgICAgICAgIHRvcDogX3RvcFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZpZXdwb3J0V2lkdGggPSB2aWV3cG9ydFdpZHRoIHx8IGNvbnRhaW5lci53aWR0aCAtIHpvb21PcHRpb25zLm1hcmdpbiAqIDI7XG4gICAgICAgIHZpZXdwb3J0SGVpZ2h0ID0gdmlld3BvcnRIZWlnaHQgfHwgY29udGFpbmVyLmhlaWdodCAtIHpvb21PcHRpb25zLm1hcmdpbiAqIDI7XG4gICAgICAgIHZhciB6b29tVGFyZ2V0ID0gYWN0aXZlLnpvb21lZEhkIHx8IGFjdGl2ZS5vcmlnaW5hbDtcbiAgICAgICAgdmFyIG5hdHVyYWxXaWR0aCA9IGlzU3ZnKHpvb21UYXJnZXQpID8gdmlld3BvcnRXaWR0aCA6IHpvb21UYXJnZXQubmF0dXJhbFdpZHRoIHx8IHZpZXdwb3J0V2lkdGg7XG4gICAgICAgIHZhciBuYXR1cmFsSGVpZ2h0ID0gaXNTdmcoem9vbVRhcmdldCkgPyB2aWV3cG9ydEhlaWdodCA6IHpvb21UYXJnZXQubmF0dXJhbEhlaWdodCB8fCB2aWV3cG9ydEhlaWdodDtcbiAgICAgICAgdmFyIF96b29tVGFyZ2V0JGdldEJvdW5kaSA9IHpvb21UYXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksIHRvcCA9IF96b29tVGFyZ2V0JGdldEJvdW5kaS50b3AsIGxlZnQgPSBfem9vbVRhcmdldCRnZXRCb3VuZGkubGVmdCwgd2lkdGggPSBfem9vbVRhcmdldCRnZXRCb3VuZGkud2lkdGgsIGhlaWdodCA9IF96b29tVGFyZ2V0JGdldEJvdW5kaS5oZWlnaHQ7XG4gICAgICAgIHZhciBzY2FsZVggPSBNYXRoLm1pbihuYXR1cmFsV2lkdGgsIHZpZXdwb3J0V2lkdGgpIC8gd2lkdGg7XG4gICAgICAgIHZhciBzY2FsZVkgPSBNYXRoLm1pbihuYXR1cmFsSGVpZ2h0LCB2aWV3cG9ydEhlaWdodCkgLyBoZWlnaHQ7XG4gICAgICAgIHZhciBzY2FsZSA9IE1hdGgubWluKHNjYWxlWCwgc2NhbGVZKTtcbiAgICAgICAgdmFyIHRyYW5zbGF0ZVggPSAoLWxlZnQgKyAodmlld3BvcnRXaWR0aCAtIHdpZHRoKSAvIDIgKyB6b29tT3B0aW9ucy5tYXJnaW4gKyBjb250YWluZXIubGVmdCkgLyBzY2FsZTtcbiAgICAgICAgdmFyIHRyYW5zbGF0ZVkgPSAoLXRvcCArICh2aWV3cG9ydEhlaWdodCAtIGhlaWdodCkgLyAyICsgem9vbU9wdGlvbnMubWFyZ2luICsgY29udGFpbmVyLnRvcCkgLyBzY2FsZTtcbiAgICAgICAgdmFyIHRyYW5zZm9ybSA9IFwic2NhbGUoXCIgKyBzY2FsZSArIFwiKSB0cmFuc2xhdGUzZChcIiArIHRyYW5zbGF0ZVggKyBcInB4LCBcIiArIHRyYW5zbGF0ZVkgKyBcInB4LCAwKVwiO1xuICAgICAgICBhY3RpdmUuem9vbWVkLnN0eWxlLnRyYW5zZm9ybSA9IHRyYW5zZm9ybTtcbiAgICAgICAgaWYgKGFjdGl2ZS56b29tZWRIZCkge1xuICAgICAgICAgIGFjdGl2ZS56b29tZWRIZC5zdHlsZS50cmFuc2Zvcm0gPSB0cmFuc2Zvcm07XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UyKGZ1bmN0aW9uKHJlc29sdmUpIHtcbiAgICAgICAgaWYgKHRhcmdldCAmJiBpbWFnZXMuaW5kZXhPZih0YXJnZXQpID09PSAtMSkge1xuICAgICAgICAgIHJlc29sdmUoem9vbSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBfaGFuZGxlT3BlbkVuZCA9IGZ1bmN0aW9uIF9oYW5kbGVPcGVuRW5kMigpIHtcbiAgICAgICAgICBpc0FuaW1hdGluZyA9IGZhbHNlO1xuICAgICAgICAgIGFjdGl2ZS56b29tZWQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInRyYW5zaXRpb25lbmRcIiwgX2hhbmRsZU9wZW5FbmQyKTtcbiAgICAgICAgICBhY3RpdmUub3JpZ2luYWwuZGlzcGF0Y2hFdmVudChjcmVhdGVDdXN0b21FdmVudChcIm1lZGl1bS16b29tOm9wZW5lZFwiLCB7XG4gICAgICAgICAgICBkZXRhaWw6IHsgem9vbSB9XG4gICAgICAgICAgfSkpO1xuICAgICAgICAgIHJlc29sdmUoem9vbSk7XG4gICAgICAgIH07XG4gICAgICAgIGlmIChhY3RpdmUuem9vbWVkKSB7XG4gICAgICAgICAgcmVzb2x2ZSh6b29tKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRhcmdldCkge1xuICAgICAgICAgIGFjdGl2ZS5vcmlnaW5hbCA9IHRhcmdldDtcbiAgICAgICAgfSBlbHNlIGlmIChpbWFnZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHZhciBfaW1hZ2VzID0gaW1hZ2VzO1xuICAgICAgICAgIGFjdGl2ZS5vcmlnaW5hbCA9IF9pbWFnZXNbMF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzb2x2ZSh6b29tKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgYWN0aXZlLm9yaWdpbmFsLmRpc3BhdGNoRXZlbnQoY3JlYXRlQ3VzdG9tRXZlbnQoXCJtZWRpdW0tem9vbTpvcGVuXCIsIHtcbiAgICAgICAgICBkZXRhaWw6IHsgem9vbSB9XG4gICAgICAgIH0pKTtcbiAgICAgICAgc2Nyb2xsVG9wID0gd2luZG93LnBhZ2VZT2Zmc2V0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3AgfHwgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgfHwgMDtcbiAgICAgICAgaXNBbmltYXRpbmcgPSB0cnVlO1xuICAgICAgICBhY3RpdmUuem9vbWVkID0gY2xvbmVUYXJnZXQoYWN0aXZlLm9yaWdpbmFsKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChvdmVybGF5KTtcbiAgICAgICAgaWYgKHpvb21PcHRpb25zLnRlbXBsYXRlKSB7XG4gICAgICAgICAgdmFyIHRlbXBsYXRlID0gaXNOb2RlKHpvb21PcHRpb25zLnRlbXBsYXRlKSA/IHpvb21PcHRpb25zLnRlbXBsYXRlIDogZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih6b29tT3B0aW9ucy50ZW1wbGF0ZSk7XG4gICAgICAgICAgYWN0aXZlLnRlbXBsYXRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgICBhY3RpdmUudGVtcGxhdGUuYXBwZW5kQ2hpbGQodGVtcGxhdGUuY29udGVudC5jbG9uZU5vZGUodHJ1ZSkpO1xuICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYWN0aXZlLnRlbXBsYXRlKTtcbiAgICAgICAgfVxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGFjdGl2ZS56b29tZWQpO1xuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZChcIm1lZGl1bS16b29tLS1vcGVuZWRcIik7XG4gICAgICAgIH0pO1xuICAgICAgICBhY3RpdmUub3JpZ2luYWwuY2xhc3NMaXN0LmFkZChcIm1lZGl1bS16b29tLWltYWdlLS1oaWRkZW5cIik7XG4gICAgICAgIGFjdGl2ZS56b29tZWQuY2xhc3NMaXN0LmFkZChcIm1lZGl1bS16b29tLWltYWdlLS1vcGVuZWRcIik7XG4gICAgICAgIGFjdGl2ZS56b29tZWQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGNsb3NlKTtcbiAgICAgICAgYWN0aXZlLnpvb21lZC5hZGRFdmVudExpc3RlbmVyKFwidHJhbnNpdGlvbmVuZFwiLCBfaGFuZGxlT3BlbkVuZCk7XG4gICAgICAgIGlmIChhY3RpdmUub3JpZ2luYWwuZ2V0QXR0cmlidXRlKFwiZGF0YS16b29tLXNyY1wiKSkge1xuICAgICAgICAgIGFjdGl2ZS56b29tZWRIZCA9IGFjdGl2ZS56b29tZWQuY2xvbmVOb2RlKCk7XG4gICAgICAgICAgYWN0aXZlLnpvb21lZEhkLnJlbW92ZUF0dHJpYnV0ZShcInNyY3NldFwiKTtcbiAgICAgICAgICBhY3RpdmUuem9vbWVkSGQucmVtb3ZlQXR0cmlidXRlKFwic2l6ZXNcIik7XG4gICAgICAgICAgYWN0aXZlLnpvb21lZEhkLnNyYyA9IGFjdGl2ZS56b29tZWQuZ2V0QXR0cmlidXRlKFwiZGF0YS16b29tLXNyY1wiKTtcbiAgICAgICAgICBhY3RpdmUuem9vbWVkSGQub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChnZXRab29tVGFyZ2V0U2l6ZSk7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCJVbmFibGUgdG8gcmVhY2ggdGhlIHpvb20gaW1hZ2UgdGFyZ2V0IFwiICsgYWN0aXZlLnpvb21lZEhkLnNyYyk7XG4gICAgICAgICAgICBhY3RpdmUuem9vbWVkSGQgPSBudWxsO1xuICAgICAgICAgICAgX2FuaW1hdGUoKTtcbiAgICAgICAgICB9O1xuICAgICAgICAgIHZhciBnZXRab29tVGFyZ2V0U2l6ZSA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKGFjdGl2ZS56b29tZWRIZC5jb21wbGV0ZSkge1xuICAgICAgICAgICAgICBjbGVhckludGVydmFsKGdldFpvb21UYXJnZXRTaXplKTtcbiAgICAgICAgICAgICAgYWN0aXZlLnpvb21lZEhkLmNsYXNzTGlzdC5hZGQoXCJtZWRpdW0tem9vbS1pbWFnZS0tb3BlbmVkXCIpO1xuICAgICAgICAgICAgICBhY3RpdmUuem9vbWVkSGQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGNsb3NlKTtcbiAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChhY3RpdmUuem9vbWVkSGQpO1xuICAgICAgICAgICAgICBfYW5pbWF0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sIDEwKTtcbiAgICAgICAgfSBlbHNlIGlmIChhY3RpdmUub3JpZ2luYWwuaGFzQXR0cmlidXRlKFwic3Jjc2V0XCIpKSB7XG4gICAgICAgICAgYWN0aXZlLnpvb21lZEhkID0gYWN0aXZlLnpvb21lZC5jbG9uZU5vZGUoKTtcbiAgICAgICAgICBhY3RpdmUuem9vbWVkSGQucmVtb3ZlQXR0cmlidXRlKFwic2l6ZXNcIik7XG4gICAgICAgICAgYWN0aXZlLnpvb21lZEhkLnJlbW92ZUF0dHJpYnV0ZShcImxvYWRpbmdcIik7XG4gICAgICAgICAgdmFyIGxvYWRFdmVudExpc3RlbmVyID0gYWN0aXZlLnpvb21lZEhkLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgYWN0aXZlLnpvb21lZEhkLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGxvYWRFdmVudExpc3RlbmVyKTtcbiAgICAgICAgICAgIGFjdGl2ZS56b29tZWRIZC5jbGFzc0xpc3QuYWRkKFwibWVkaXVtLXpvb20taW1hZ2UtLW9wZW5lZFwiKTtcbiAgICAgICAgICAgIGFjdGl2ZS56b29tZWRIZC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgY2xvc2UpO1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChhY3RpdmUuem9vbWVkSGQpO1xuICAgICAgICAgICAgX2FuaW1hdGUoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBfYW5pbWF0ZSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuICAgIHZhciBjbG9zZSA9IGZ1bmN0aW9uIGNsb3NlMigpIHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZTIoZnVuY3Rpb24ocmVzb2x2ZSkge1xuICAgICAgICBpZiAoaXNBbmltYXRpbmcgfHwgIWFjdGl2ZS5vcmlnaW5hbCkge1xuICAgICAgICAgIHJlc29sdmUoem9vbSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBfaGFuZGxlQ2xvc2VFbmQgPSBmdW5jdGlvbiBfaGFuZGxlQ2xvc2VFbmQyKCkge1xuICAgICAgICAgIGFjdGl2ZS5vcmlnaW5hbC5jbGFzc0xpc3QucmVtb3ZlKFwibWVkaXVtLXpvb20taW1hZ2UtLWhpZGRlblwiKTtcbiAgICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGFjdGl2ZS56b29tZWQpO1xuICAgICAgICAgIGlmIChhY3RpdmUuem9vbWVkSGQpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoYWN0aXZlLnpvb21lZEhkKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChvdmVybGF5KTtcbiAgICAgICAgICBhY3RpdmUuem9vbWVkLmNsYXNzTGlzdC5yZW1vdmUoXCJtZWRpdW0tem9vbS1pbWFnZS0tb3BlbmVkXCIpO1xuICAgICAgICAgIGlmIChhY3RpdmUudGVtcGxhdGUpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoYWN0aXZlLnRlbXBsYXRlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaXNBbmltYXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICBhY3RpdmUuem9vbWVkLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0cmFuc2l0aW9uZW5kXCIsIF9oYW5kbGVDbG9zZUVuZDIpO1xuICAgICAgICAgIGFjdGl2ZS5vcmlnaW5hbC5kaXNwYXRjaEV2ZW50KGNyZWF0ZUN1c3RvbUV2ZW50KFwibWVkaXVtLXpvb206Y2xvc2VkXCIsIHtcbiAgICAgICAgICAgIGRldGFpbDogeyB6b29tIH1cbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgYWN0aXZlLm9yaWdpbmFsID0gbnVsbDtcbiAgICAgICAgICBhY3RpdmUuem9vbWVkID0gbnVsbDtcbiAgICAgICAgICBhY3RpdmUuem9vbWVkSGQgPSBudWxsO1xuICAgICAgICAgIGFjdGl2ZS50ZW1wbGF0ZSA9IG51bGw7XG4gICAgICAgICAgcmVzb2x2ZSh6b29tKTtcbiAgICAgICAgfTtcbiAgICAgICAgaXNBbmltYXRpbmcgPSB0cnVlO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoXCJtZWRpdW0tem9vbS0tb3BlbmVkXCIpO1xuICAgICAgICBhY3RpdmUuem9vbWVkLnN0eWxlLnRyYW5zZm9ybSA9IFwiXCI7XG4gICAgICAgIGlmIChhY3RpdmUuem9vbWVkSGQpIHtcbiAgICAgICAgICBhY3RpdmUuem9vbWVkSGQuc3R5bGUudHJhbnNmb3JtID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYWN0aXZlLnRlbXBsYXRlKSB7XG4gICAgICAgICAgYWN0aXZlLnRlbXBsYXRlLnN0eWxlLnRyYW5zaXRpb24gPSBcIm9wYWNpdHkgMTUwbXNcIjtcbiAgICAgICAgICBhY3RpdmUudGVtcGxhdGUuc3R5bGUub3BhY2l0eSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgYWN0aXZlLm9yaWdpbmFsLmRpc3BhdGNoRXZlbnQoY3JlYXRlQ3VzdG9tRXZlbnQoXCJtZWRpdW0tem9vbTpjbG9zZVwiLCB7XG4gICAgICAgICAgZGV0YWlsOiB7IHpvb20gfVxuICAgICAgICB9KSk7XG4gICAgICAgIGFjdGl2ZS56b29tZWQuYWRkRXZlbnRMaXN0ZW5lcihcInRyYW5zaXRpb25lbmRcIiwgX2hhbmRsZUNsb3NlRW5kKTtcbiAgICAgIH0pO1xuICAgIH07XG4gICAgdmFyIHRvZ2dsZSA9IGZ1bmN0aW9uIHRvZ2dsZTIoKSB7XG4gICAgICB2YXIgX3JlZjMgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHZvaWQgMCA/IGFyZ3VtZW50c1swXSA6IHt9LCB0YXJnZXQgPSBfcmVmMy50YXJnZXQ7XG4gICAgICBpZiAoYWN0aXZlLm9yaWdpbmFsKSB7XG4gICAgICAgIHJldHVybiBjbG9zZSgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG9wZW4oeyB0YXJnZXQgfSk7XG4gICAgfTtcbiAgICB2YXIgZ2V0T3B0aW9ucyA9IGZ1bmN0aW9uIGdldE9wdGlvbnMyKCkge1xuICAgICAgcmV0dXJuIHpvb21PcHRpb25zO1xuICAgIH07XG4gICAgdmFyIGdldEltYWdlcyA9IGZ1bmN0aW9uIGdldEltYWdlczIoKSB7XG4gICAgICByZXR1cm4gaW1hZ2VzO1xuICAgIH07XG4gICAgdmFyIGdldFpvb21lZEltYWdlID0gZnVuY3Rpb24gZ2V0Wm9vbWVkSW1hZ2UyKCkge1xuICAgICAgcmV0dXJuIGFjdGl2ZS5vcmlnaW5hbDtcbiAgICB9O1xuICAgIHZhciBpbWFnZXMgPSBbXTtcbiAgICB2YXIgZXZlbnRMaXN0ZW5lcnMgPSBbXTtcbiAgICB2YXIgaXNBbmltYXRpbmcgPSBmYWxzZTtcbiAgICB2YXIgc2Nyb2xsVG9wID0gMDtcbiAgICB2YXIgem9vbU9wdGlvbnMgPSBvcHRpb25zO1xuICAgIHZhciBhY3RpdmUgPSB7XG4gICAgICBvcmlnaW5hbDogbnVsbCxcbiAgICAgIHpvb21lZDogbnVsbCxcbiAgICAgIHpvb21lZEhkOiBudWxsLFxuICAgICAgdGVtcGxhdGU6IG51bGxcbiAgICAgIC8vIElmIHRoZSBzZWxlY3RvciBpcyBvbWl0dGVkLCBpdCdzIHJlcGxhY2VkIGJ5IHRoZSBvcHRpb25zXG4gICAgfTtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHNlbGVjdG9yKSA9PT0gXCJbb2JqZWN0IE9iamVjdF1cIikge1xuICAgICAgem9vbU9wdGlvbnMgPSBzZWxlY3RvcjtcbiAgICB9IGVsc2UgaWYgKHNlbGVjdG9yIHx8IHR5cGVvZiBzZWxlY3RvciA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgYXR0YWNoKHNlbGVjdG9yKTtcbiAgICB9XG4gICAgem9vbU9wdGlvbnMgPSBfZXh0ZW5kcyh7XG4gICAgICBtYXJnaW46IDAsXG4gICAgICBiYWNrZ3JvdW5kOiBcIiNmZmZcIixcbiAgICAgIHNjcm9sbE9mZnNldDogNDAsXG4gICAgICBjb250YWluZXI6IG51bGwsXG4gICAgICB0ZW1wbGF0ZTogbnVsbFxuICAgIH0sIHpvb21PcHRpb25zKTtcbiAgICB2YXIgb3ZlcmxheSA9IGNyZWF0ZU92ZXJsYXkoem9vbU9wdGlvbnMuYmFja2dyb3VuZCk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIF9oYW5kbGVDbGljayk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsIF9oYW5kbGVLZXlVcCk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLCBfaGFuZGxlU2Nyb2xsKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCBjbG9zZSk7XG4gICAgdmFyIHpvb20gPSB7XG4gICAgICBvcGVuLFxuICAgICAgY2xvc2UsXG4gICAgICB0b2dnbGUsXG4gICAgICB1cGRhdGUsXG4gICAgICBjbG9uZSxcbiAgICAgIGF0dGFjaCxcbiAgICAgIGRldGFjaCxcbiAgICAgIG9uLFxuICAgICAgb2ZmLFxuICAgICAgZ2V0T3B0aW9ucyxcbiAgICAgIGdldEltYWdlcyxcbiAgICAgIGdldFpvb21lZEltYWdlXG4gICAgfTtcbiAgICByZXR1cm4gem9vbTtcbiAgfTtcbiAgZnVuY3Rpb24gc3R5bGVJbmplY3QoY3NzMiwgcmVmKSB7XG4gICAgaWYgKHJlZiA9PT0gdm9pZCAwKSByZWYgPSB7fTtcbiAgICB2YXIgaW5zZXJ0QXQgPSByZWYuaW5zZXJ0QXQ7XG4gICAgaWYgKCFjc3MyIHx8IHR5cGVvZiBkb2N1bWVudCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgaGVhZCA9IGRvY3VtZW50LmhlYWQgfHwgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJoZWFkXCIpWzBdO1xuICAgIHZhciBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcbiAgICBzdHlsZS50eXBlID0gXCJ0ZXh0L2Nzc1wiO1xuICAgIGlmIChpbnNlcnRBdCA9PT0gXCJ0b3BcIikge1xuICAgICAgaWYgKGhlYWQuZmlyc3RDaGlsZCkge1xuICAgICAgICBoZWFkLmluc2VydEJlZm9yZShzdHlsZSwgaGVhZC5maXJzdENoaWxkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBoZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcbiAgICB9XG4gICAgaWYgKHN0eWxlLnN0eWxlU2hlZXQpIHtcbiAgICAgIHN0eWxlLnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzczI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0eWxlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzczIpKTtcbiAgICB9XG4gIH1cbiAgdmFyIGNzcyA9IFwiLm1lZGl1bS16b29tLW92ZXJsYXl7cG9zaXRpb246Zml4ZWQ7dG9wOjA7cmlnaHQ6MDtib3R0b206MDtsZWZ0OjA7b3BhY2l0eTowO3RyYW5zaXRpb246b3BhY2l0eSAuM3M7d2lsbC1jaGFuZ2U6b3BhY2l0eX0ubWVkaXVtLXpvb20tLW9wZW5lZCAubWVkaXVtLXpvb20tb3ZlcmxheXtjdXJzb3I6cG9pbnRlcjtjdXJzb3I6em9vbS1vdXQ7b3BhY2l0eToxfS5tZWRpdW0tem9vbS1pbWFnZXtjdXJzb3I6cG9pbnRlcjtjdXJzb3I6em9vbS1pbjt0cmFuc2l0aW9uOnRyYW5zZm9ybSAuM3MgY3ViaWMtYmV6aWVyKC4yLDAsLjIsMSkhaW1wb3J0YW50fS5tZWRpdW0tem9vbS1pbWFnZS0taGlkZGVue3Zpc2liaWxpdHk6aGlkZGVufS5tZWRpdW0tem9vbS1pbWFnZS0tb3BlbmVke3Bvc2l0aW9uOnJlbGF0aXZlO2N1cnNvcjpwb2ludGVyO2N1cnNvcjp6b29tLW91dDt3aWxsLWNoYW5nZTp0cmFuc2Zvcm19XCI7XG4gIHN0eWxlSW5qZWN0KGNzcyk7XG4gIHZhciBtZWRpdW1fem9vbV9lc21fZGVmYXVsdCA9IG1lZGl1bVpvb21Fc207XG5cbiAgLy8gbnMtaHVnby1wYXJhbXM6PHN0ZGluPlxuICB2YXIgY29kZUhpZ2hsaWdodGluZyA9IGZhbHNlO1xuICB2YXIgaHVnb0Vudmlyb25tZW50ID0gXCJkZXZlbG9wbWVudFwiO1xuICB2YXIgc2VhcmNoRW5hYmxlZCA9IHRydWU7XG5cbiAgLy8gbnMtaHVnby1pbXA6L1ZvbHVtZXMvQXRyZW9TU0QvaG9tZXBhZ2VPbGQvYXNzZXRzL2pzL3NpdGUtdXRpbHMuanNcbiAgZnVuY3Rpb24gZml4TWVybWFpZChyZW5kZXIgPSBmYWxzZSkge1xuICAgIGxldCBtZXJtYWlkcyA9IFtdO1xuICAgIFtdLnB1c2guYXBwbHkobWVybWFpZHMsIGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJsYW5ndWFnZS1tZXJtYWlkXCIpKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1lcm1haWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgbWVybWFpZENvZGVFbGVtZW50ID0gbWVybWFpZHNbaV07XG4gICAgICBsZXQgbmV3RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICBuZXdFbGVtZW50LmlubmVySFRNTCA9IG1lcm1haWRDb2RlRWxlbWVudC5pbm5lckhUTUw7XG4gICAgICBuZXdFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJtZXJtYWlkXCIpO1xuICAgICAgaWYgKHJlbmRlcikge1xuICAgICAgICB3aW5kb3cubWVybWFpZC5tZXJtYWlkQVBJLnJlbmRlcihgbWVybWFpZC0ke2l9YCwgbmV3RWxlbWVudC50ZXh0Q29udGVudCwgZnVuY3Rpb24oc3ZnQ29kZSkge1xuICAgICAgICAgIG5ld0VsZW1lbnQuaW5uZXJIVE1MID0gc3ZnQ29kZTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBtZXJtYWlkQ29kZUVsZW1lbnQucGFyZW50Tm9kZS5yZXBsYWNlV2l0aChuZXdFbGVtZW50KTtcbiAgICB9XG4gICAgY29uc29sZS5kZWJ1ZyhgUHJvY2Vzc2VkICR7bWVybWFpZHMubGVuZ3RofSBNZXJtYWlkIGNvZGUgYmxvY2tzYCk7XG4gIH1cbiAgZnVuY3Rpb24gc2Nyb2xsUGFyZW50VG9DaGlsZChwYXJlbnQsIGNoaWxkKSB7XG4gICAgY29uc3QgcGFyZW50UmVjdCA9IHBhcmVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBjb25zdCBwYXJlbnRWaWV3YWJsZUFyZWEgPSB7XG4gICAgICBoZWlnaHQ6IHBhcmVudC5jbGllbnRIZWlnaHQsXG4gICAgICB3aWR0aDogcGFyZW50LmNsaWVudFdpZHRoXG4gICAgfTtcbiAgICBjb25zdCBjaGlsZFJlY3QgPSBjaGlsZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBjb25zdCBpc0NoaWxkSW5WaWV3ID0gY2hpbGRSZWN0LnRvcCA+PSBwYXJlbnRSZWN0LnRvcCAmJiBjaGlsZFJlY3QuYm90dG9tIDw9IHBhcmVudFJlY3QudG9wICsgcGFyZW50Vmlld2FibGVBcmVhLmhlaWdodDtcbiAgICBpZiAoIWlzQ2hpbGRJblZpZXcpIHtcbiAgICAgIHBhcmVudC5zY3JvbGxUb3AgPSBjaGlsZFJlY3QudG9wICsgcGFyZW50LnNjcm9sbFRvcCAtIHBhcmVudFJlY3QudG9wO1xuICAgIH1cbiAgfVxuXG4gIC8vIG5zLWh1Z28taW1wOi9Wb2x1bWVzL0F0cmVvU1NEL2hvbWVwYWdlT2xkL2Fzc2V0cy9qcy9zaXRlLWFuaW1hdGlvbi5qc1xuICBmdW5jdGlvbiBmYWRlSW4oZWxlbWVudCwgZHVyYXRpb24gPSA2MDApIHtcbiAgICBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBcIlwiO1xuICAgIGVsZW1lbnQuc3R5bGUub3BhY2l0eSA9IFwiMFwiO1xuICAgIGxldCBsYXN0ID0gKy8qIEBfX1BVUkVfXyAqLyBuZXcgRGF0ZSgpO1xuICAgIGxldCB0aWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICBlbGVtZW50LnN0eWxlLm9wYWNpdHkgPSAoK2VsZW1lbnQuc3R5bGUub3BhY2l0eSArICgvKiBAX19QVVJFX18gKi8gbmV3IERhdGUoKSAtIGxhc3QpIC8gZHVyYXRpb24pLnRvU3RyaW5nKCk7XG4gICAgICBsYXN0ID0gKy8qIEBfX1BVUkVfXyAqLyBuZXcgRGF0ZSgpO1xuICAgICAgaWYgKCtlbGVtZW50LnN0eWxlLm9wYWNpdHkgPCAxKSB7XG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgJiYgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRpY2spIHx8IHNldFRpbWVvdXQodGljaywgMTYpO1xuICAgICAgfVxuICAgIH07XG4gICAgdGljaygpO1xuICB9XG5cbiAgLy8gbnMtaHVnby1pbXA6L1ZvbHVtZXMvQXRyZW9TU0QvaG9tZXBhZ2VPbGQvYXNzZXRzL2pzL3NpdGUtdGhlbWluZy5qc1xuICB2YXIgYm9keSA9IGRvY3VtZW50LmJvZHk7XG4gIGZ1bmN0aW9uIGdldFRoZW1lTW9kZSgpIHtcbiAgICByZXR1cm4gcGFyc2VJbnQobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJ3Y1RoZW1lXCIpIHx8IDIpO1xuICB9XG4gIGZ1bmN0aW9uIGNhbkNoYW5nZVRoZW1lKCkge1xuICAgIHJldHVybiBCb29sZWFuKHdpbmRvdy53Yy5kYXJrTGlnaHRFbmFibGVkKTtcbiAgfVxuICBmdW5jdGlvbiBpbml0VGhlbWVWYXJpYXRpb24oKSB7XG4gICAgaWYgKCFjYW5DaGFuZ2VUaGVtZSgpKSB7XG4gICAgICBjb25zb2xlLmRlYnVnKFwiVXNlciB0aGVtaW5nIGRpc2FibGVkLlwiKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGlzRGFya1RoZW1lOiB3aW5kb3cud2MuaXNTaXRlVGhlbWVEYXJrLFxuICAgICAgICB0aGVtZU1vZGU6IHdpbmRvdy53Yy5pc1NpdGVUaGVtZURhcmsgPyAxIDogMFxuICAgICAgfTtcbiAgICB9XG4gICAgY29uc29sZS5kZWJ1ZyhcIlVzZXIgdGhlbWluZyBlbmFibGVkLlwiKTtcbiAgICBsZXQgaXNEYXJrVGhlbWU7XG4gICAgbGV0IGN1cnJlbnRUaGVtZU1vZGUgPSBnZXRUaGVtZU1vZGUoKTtcbiAgICBjb25zb2xlLmRlYnVnKGBVc2VyJ3MgdGhlbWUgdmFyaWF0aW9uOiAke2N1cnJlbnRUaGVtZU1vZGV9YCk7XG4gICAgc3dpdGNoIChjdXJyZW50VGhlbWVNb2RlKSB7XG4gICAgICBjYXNlIDA6XG4gICAgICAgIGlzRGFya1RoZW1lID0gZmFsc2U7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAxOlxuICAgICAgICBpc0RhcmtUaGVtZSA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKHdpbmRvdy5tYXRjaE1lZGlhKFwiKHByZWZlcnMtY29sb3Itc2NoZW1lOiBkYXJrKVwiKS5tYXRjaGVzKSB7XG4gICAgICAgICAgaXNEYXJrVGhlbWUgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKHdpbmRvdy5tYXRjaE1lZGlhKFwiKHByZWZlcnMtY29sb3Itc2NoZW1lOiBsaWdodClcIikubWF0Y2hlcykge1xuICAgICAgICAgIGlzRGFya1RoZW1lID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXNEYXJrVGhlbWUgPSB3aW5kb3cud2MuaXNTaXRlVGhlbWVEYXJrO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBpZiAoaXNEYXJrVGhlbWUgJiYgIWJvZHkuY2xhc3NMaXN0LmNvbnRhaW5zKFwiZGFya1wiKSkge1xuICAgICAgY29uc29sZS5kZWJ1ZyhcIkFwcGx5aW5nIGRhcmsgdGhlbWVcIik7XG4gICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoXCJkYXJrXCIpO1xuICAgIH0gZWxzZSBpZiAoIWlzRGFya1RoZW1lICYmIGJvZHkuY2xhc3NMaXN0LmNvbnRhaW5zKFwiZGFya1wiKSkge1xuICAgICAgY29uc29sZS5kZWJ1ZyhcIkFwcGx5aW5nIGxpZ2h0IHRoZW1lXCIpO1xuICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKFwiZGFya1wiKTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIGlzRGFya1RoZW1lLFxuICAgICAgdGhlbWVNb2RlOiBjdXJyZW50VGhlbWVNb2RlXG4gICAgfTtcbiAgfVxuICBmdW5jdGlvbiBjaGFuZ2VUaGVtZU1vZGVDbGljayhuZXdNb2RlKSB7XG4gICAgaWYgKCFjYW5DaGFuZ2VUaGVtZSgpKSB7XG4gICAgICBjb25zb2xlLmRlYnVnKFwiQ2Fubm90IGNoYW5nZSB0aGVtZSAtIHVzZXIgdGhlbWluZyBkaXNhYmxlZC5cIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCBpc0RhcmtUaGVtZTtcbiAgICBzd2l0Y2ggKG5ld01vZGUpIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ3Y1RoZW1lXCIsIFwiMFwiKTtcbiAgICAgICAgaXNEYXJrVGhlbWUgPSBmYWxzZTtcbiAgICAgICAgY29uc29sZS5kZWJ1ZyhcIlVzZXIgY2hhbmdlZCB0aGVtZSB2YXJpYXRpb24gdG8gTGlnaHQuXCIpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ3Y1RoZW1lXCIsIFwiMVwiKTtcbiAgICAgICAgaXNEYXJrVGhlbWUgPSB0cnVlO1xuICAgICAgICBjb25zb2xlLmRlYnVnKFwiVXNlciBjaGFuZ2VkIHRoZW1lIHZhcmlhdGlvbiB0byBEYXJrLlwiKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcIndjVGhlbWVcIiwgXCIyXCIpO1xuICAgICAgICBpZiAod2luZG93Lm1hdGNoTWVkaWEoXCIocHJlZmVycy1jb2xvci1zY2hlbWU6IGRhcmspXCIpLm1hdGNoZXMpIHtcbiAgICAgICAgICBpc0RhcmtUaGVtZSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAod2luZG93Lm1hdGNoTWVkaWEoXCIocHJlZmVycy1jb2xvci1zY2hlbWU6IGxpZ2h0KVwiKS5tYXRjaGVzKSB7XG4gICAgICAgICAgaXNEYXJrVGhlbWUgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpc0RhcmtUaGVtZSA9IHdpbmRvdy53Yy5pc1NpdGVUaGVtZURhcms7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5kZWJ1ZyhcIlVzZXIgY2hhbmdlZCB0aGVtZSB2YXJpYXRpb24gdG8gQXV0by5cIik7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICByZW5kZXJUaGVtZVZhcmlhdGlvbihpc0RhcmtUaGVtZSwgbmV3TW9kZSk7XG4gIH1cbiAgZnVuY3Rpb24gc2hvd0FjdGl2ZVRoZW1lKG1vZGUpIHtcbiAgICBsZXQgbGlua0xpZ2h0MiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuanMtc2V0LXRoZW1lLWxpZ2h0XCIpO1xuICAgIGxldCBsaW5rRGFyazIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmpzLXNldC10aGVtZS1kYXJrXCIpO1xuICAgIGxldCBsaW5rQXV0bzIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmpzLXNldC10aGVtZS1hdXRvXCIpO1xuICAgIGlmIChsaW5rTGlnaHQyID09PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHN3aXRjaCAobW9kZSkge1xuICAgICAgY2FzZSAwOlxuICAgICAgICBsaW5rTGlnaHQyLmNsYXNzTGlzdC5hZGQoXCJkcm9wZG93bi1pdGVtLWFjdGl2ZVwiKTtcbiAgICAgICAgbGlua0RhcmsyLmNsYXNzTGlzdC5yZW1vdmUoXCJkcm9wZG93bi1pdGVtLWFjdGl2ZVwiKTtcbiAgICAgICAgbGlua0F1dG8yLmNsYXNzTGlzdC5yZW1vdmUoXCJkcm9wZG93bi1pdGVtLWFjdGl2ZVwiKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIGxpbmtMaWdodDIuY2xhc3NMaXN0LnJlbW92ZShcImRyb3Bkb3duLWl0ZW0tYWN0aXZlXCIpO1xuICAgICAgICBsaW5rRGFyazIuY2xhc3NMaXN0LmFkZChcImRyb3Bkb3duLWl0ZW0tYWN0aXZlXCIpO1xuICAgICAgICBsaW5rQXV0bzIuY2xhc3NMaXN0LnJlbW92ZShcImRyb3Bkb3duLWl0ZW0tYWN0aXZlXCIpO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGxpbmtMaWdodDIuY2xhc3NMaXN0LnJlbW92ZShcImRyb3Bkb3duLWl0ZW0tYWN0aXZlXCIpO1xuICAgICAgICBsaW5rRGFyazIuY2xhc3NMaXN0LnJlbW92ZShcImRyb3Bkb3duLWl0ZW0tYWN0aXZlXCIpO1xuICAgICAgICBsaW5rQXV0bzIuY2xhc3NMaXN0LmFkZChcImRyb3Bkb3duLWl0ZW0tYWN0aXZlXCIpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gcmVuZGVyVGhlbWVWYXJpYXRpb24oaXNEYXJrVGhlbWUsIHRoZW1lTW9kZSA9IDIsIGluaXQgPSBmYWxzZSkge1xuICAgIGNvbnN0IGNvZGVIbExpZ2h0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImxpbmtbdGl0bGU9aGwtbGlnaHRdXCIpO1xuICAgIGNvbnN0IGNvZGVIbERhcmsgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwibGlua1t0aXRsZT1obC1kYXJrXVwiKTtcbiAgICBjb25zdCBjb2RlSGxFbmFibGVkID0gY29kZUhsTGlnaHQgIT09IG51bGwgfHwgY29kZUhsRGFyayAhPT0gbnVsbDtcbiAgICBjb25zdCBkaWFncmFtRW5hYmxlZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJzY3JpcHRbdGl0bGU9bWVybWFpZF1cIikgIT09IG51bGw7XG4gICAgc2hvd0FjdGl2ZVRoZW1lKHRoZW1lTW9kZSk7XG4gICAgY29uc3QgdGhlbWVDaGFuZ2VFdmVudCA9IG5ldyBDdXN0b21FdmVudChcIndjVGhlbWVDaGFuZ2VcIiwgeyBkZXRhaWw6IHsgaXNEYXJrVGhlbWU6ICgpID0+IGlzRGFya1RoZW1lIH0gfSk7XG4gICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudCh0aGVtZUNoYW5nZUV2ZW50KTtcbiAgICBpZiAoIWluaXQpIHtcbiAgICAgIGlmIChpc0RhcmtUaGVtZSA9PT0gZmFsc2UgJiYgIWJvZHkuY2xhc3NMaXN0LmNvbnRhaW5zKFwiZGFya1wiKSB8fCBpc0RhcmtUaGVtZSA9PT0gdHJ1ZSAmJiBib2R5LmNsYXNzTGlzdC5jb250YWlucyhcImRhcmtcIikpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoaXNEYXJrVGhlbWUgPT09IGZhbHNlKSB7XG4gICAgICBpZiAoIWluaXQpIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbihkb2N1bWVudC5ib2R5LnN0eWxlLCB7IG9wYWNpdHk6IDAsIHZpc2liaWxpdHk6IFwidmlzaWJsZVwiIH0pO1xuICAgICAgICBmYWRlSW4oZG9jdW1lbnQuYm9keSwgNjAwKTtcbiAgICAgIH1cbiAgICAgIGJvZHkuY2xhc3NMaXN0LnJlbW92ZShcImRhcmtcIik7XG4gICAgICBpZiAoY29kZUhsRW5hYmxlZCkge1xuICAgICAgICBjb25zb2xlLmRlYnVnKFwiU2V0dGluZyBITEpTIHRoZW1lIHRvIGxpZ2h0XCIpO1xuICAgICAgICBpZiAoY29kZUhsTGlnaHQpIHtcbiAgICAgICAgICBjb2RlSGxMaWdodC5kaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb2RlSGxEYXJrKSB7XG4gICAgICAgICAgY29kZUhsRGFyay5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChkaWFncmFtRW5hYmxlZCkge1xuICAgICAgICBjb25zb2xlLmRlYnVnKFwiSW5pdGlhbGl6aW5nIE1lcm1haWQgd2l0aCBsaWdodCB0aGVtZVwiKTtcbiAgICAgICAgaWYgKGluaXQpIHtcbiAgICAgICAgICB3aW5kb3cubWVybWFpZC5pbml0aWFsaXplKHsgc3RhcnRPbkxvYWQ6IGZhbHNlLCB0aGVtZTogXCJkZWZhdWx0XCIsIHNlY3VyaXR5TGV2ZWw6IFwibG9vc2VcIiB9KTtcbiAgICAgICAgICBmaXhNZXJtYWlkKHRydWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChpc0RhcmtUaGVtZSA9PT0gdHJ1ZSkge1xuICAgICAgaWYgKCFpbml0KSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24oZG9jdW1lbnQuYm9keS5zdHlsZSwgeyBvcGFjaXR5OiAwLCB2aXNpYmlsaXR5OiBcInZpc2libGVcIiB9KTtcbiAgICAgICAgZmFkZUluKGRvY3VtZW50LmJvZHksIDYwMCk7XG4gICAgICB9XG4gICAgICBib2R5LmNsYXNzTGlzdC5hZGQoXCJkYXJrXCIpO1xuICAgICAgaWYgKGNvZGVIbEVuYWJsZWQpIHtcbiAgICAgICAgY29uc29sZS5kZWJ1ZyhcIlNldHRpbmcgSExKUyB0aGVtZSB0byBkYXJrXCIpO1xuICAgICAgICBpZiAoY29kZUhsTGlnaHQpIHtcbiAgICAgICAgICBjb2RlSGxMaWdodC5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvZGVIbERhcmspIHtcbiAgICAgICAgICBjb2RlSGxEYXJrLmRpc2FibGVkID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChkaWFncmFtRW5hYmxlZCkge1xuICAgICAgICBjb25zb2xlLmRlYnVnKFwiSW5pdGlhbGl6aW5nIE1lcm1haWQgd2l0aCBkYXJrIHRoZW1lXCIpO1xuICAgICAgICBpZiAoaW5pdCkge1xuICAgICAgICAgIHdpbmRvdy5tZXJtYWlkLmluaXRpYWxpemUoeyBzdGFydE9uTG9hZDogZmFsc2UsIHRoZW1lOiBcImRhcmtcIiwgc2VjdXJpdHlMZXZlbDogXCJsb29zZVwiIH0pO1xuICAgICAgICAgIGZpeE1lcm1haWQodHJ1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbG9jYXRpb24ucmVsb2FkKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gb25NZWRpYVF1ZXJ5TGlzdEV2ZW50KGV2ZW50KSB7XG4gICAgaWYgKCFjYW5DaGFuZ2VUaGVtZSgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGRhcmtNb2RlT24gPSBldmVudC5tYXRjaGVzO1xuICAgIGNvbnNvbGUuZGVidWcoYE9TIGRhcmsgbW9kZSBwcmVmZXJlbmNlIGNoYW5nZWQgdG8gJHtkYXJrTW9kZU9uID8gXCJcXHV7MUYzMTJ9IG9uXCIgOiBcIlxcdTI2MDBcXHVGRTBGIG9mZlwifS5gKTtcbiAgICBsZXQgY3VycmVudFRoZW1lVmFyaWF0aW9uID0gZ2V0VGhlbWVNb2RlKCk7XG4gICAgbGV0IGlzRGFya1RoZW1lO1xuICAgIGlmIChjdXJyZW50VGhlbWVWYXJpYXRpb24gPT09IDIpIHtcbiAgICAgIGlmICh3aW5kb3cubWF0Y2hNZWRpYShcIihwcmVmZXJzLWNvbG9yLXNjaGVtZTogZGFyaylcIikubWF0Y2hlcykge1xuICAgICAgICBpc0RhcmtUaGVtZSA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKHdpbmRvdy5tYXRjaE1lZGlhKFwiKHByZWZlcnMtY29sb3Itc2NoZW1lOiBsaWdodClcIikubWF0Y2hlcykge1xuICAgICAgICBpc0RhcmtUaGVtZSA9IGZhbHNlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaXNEYXJrVGhlbWUgPSB3aW5kb3cud2MuaXNTaXRlVGhlbWVEYXJrO1xuICAgICAgfVxuICAgICAgcmVuZGVyVGhlbWVWYXJpYXRpb24oaXNEYXJrVGhlbWUsIGN1cnJlbnRUaGVtZVZhcmlhdGlvbik7XG4gICAgfVxuICB9XG5cbiAgLy8gPHN0ZGluPlxuICBjb25zb2xlLmRlYnVnKGBFbnZpcm9ubWVudDogJHtodWdvRW52aXJvbm1lbnR9YCk7XG4gIGZ1bmN0aW9uIGdldE5hdkJhckhlaWdodCgpIHtcbiAgICBsZXQgbmF2YmFyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuYXZiYXItbWFpblwiKTtcbiAgICBsZXQgbmF2YmFySGVpZ2h0ID0gbmF2YmFyID8gbmF2YmFyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodCA6IDA7XG4gICAgY29uc29sZS5kZWJ1ZyhcIk5hdmJhciBoZWlnaHQ6IFwiICsgbmF2YmFySGVpZ2h0KTtcbiAgICByZXR1cm4gbmF2YmFySGVpZ2h0O1xuICB9XG4gIGZ1bmN0aW9uIHNjcm9sbFRvQW5jaG9yKHRhcmdldCwgZHVyYXRpb24gPSAwKSB7XG4gICAgdGFyZ2V0ID0gdHlwZW9mIHRhcmdldCA9PT0gXCJ1bmRlZmluZWRcIiB8fCB0eXBlb2YgdGFyZ2V0ID09PSBcIm9iamVjdFwiID8gZGVjb2RlVVJJQ29tcG9uZW50KHdpbmRvdy5sb2NhdGlvbi5oYXNoKSA6IHRhcmdldDtcbiAgICBpZiAoJCh0YXJnZXQpLmxlbmd0aCkge1xuICAgICAgdGFyZ2V0ID0gXCIjXCIgKyAkLmVzY2FwZVNlbGVjdG9yKHRhcmdldC5zdWJzdHJpbmcoMSkpO1xuICAgICAgbGV0IGVsZW1lbnRPZmZzZXQgPSBNYXRoLmNlaWwoJCh0YXJnZXQpLm9mZnNldCgpLnRvcCAtIGdldE5hdkJhckhlaWdodCgpKTtcbiAgICAgICQoXCJib2R5XCIpLmFkZENsYXNzKFwic2Nyb2xsaW5nXCIpO1xuICAgICAgJChcImh0bWwsIGJvZHlcIikuYW5pbWF0ZShcbiAgICAgICAge1xuICAgICAgICAgIHNjcm9sbFRvcDogZWxlbWVudE9mZnNldFxuICAgICAgICB9LFxuICAgICAgICBkdXJhdGlvbixcbiAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgJChcImJvZHlcIikucmVtb3ZlQ2xhc3MoXCJzY3JvbGxpbmdcIik7XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUuZGVidWcoXCJDYW5ub3Qgc2Nyb2xsIHRvIHRhcmdldCBgI1wiICsgdGFyZ2V0ICsgXCJgLiBJRCBub3QgZm91bmQhXCIpO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBmaXhTY3JvbGxzcHkoKSB7XG4gICAgbGV0ICRib2R5ID0gJChcImJvZHlcIik7XG4gICAgbGV0IGRhdGEgPSAkYm9keS5kYXRhKFwiYnMuc2Nyb2xsc3B5XCIpO1xuICAgIGlmIChkYXRhKSB7XG4gICAgICBkYXRhLl9jb25maWcub2Zmc2V0ID0gZ2V0TmF2QmFySGVpZ2h0KCk7XG4gICAgICAkYm9keS5kYXRhKFwiYnMuc2Nyb2xsc3B5XCIsIGRhdGEpO1xuICAgICAgJGJvZHkuc2Nyb2xsc3B5KFwicmVmcmVzaFwiKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gcmVtb3ZlUXVlcnlQYXJhbXNGcm9tVXJsKCkge1xuICAgIGlmICh3aW5kb3cuaGlzdG9yeS5yZXBsYWNlU3RhdGUpIHtcbiAgICAgIGxldCB1cmxXaXRob3V0U2VhcmNoUGFyYW1zID0gd2luZG93LmxvY2F0aW9uLnByb3RvY29sICsgXCIvL1wiICsgd2luZG93LmxvY2F0aW9uLmhvc3QgKyB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgKyB3aW5kb3cubG9jYXRpb24uaGFzaDtcbiAgICAgIHdpbmRvdy5oaXN0b3J5LnJlcGxhY2VTdGF0ZSh7IHBhdGg6IHVybFdpdGhvdXRTZWFyY2hQYXJhbXMgfSwgXCJcIiwgdXJsV2l0aG91dFNlYXJjaFBhcmFtcyk7XG4gICAgfVxuICB9XG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiaGFzaGNoYW5nZVwiLCBzY3JvbGxUb0FuY2hvcik7XG4gICQoXCIjbmF2YmFyLW1haW4gbGkubmF2LWl0ZW0gYS5uYXYtbGluaywgLmpzLXNjcm9sbFwiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgbGV0IGhhc2ggPSB0aGlzLmhhc2g7XG4gICAgaWYgKHRoaXMucGF0aG5hbWUgPT09IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSAmJiBoYXNoICYmICQoaGFzaCkubGVuZ3RoICYmICgkKFwiLmpzLWJsb2NrLXBhZ2VcIikubGVuZ3RoID4gMCB8fCAkKFwiLmpzLXdpZGdldC1wYWdlXCIpLmxlbmd0aCA+IDApKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgbGV0IGVsZW1lbnRPZmZzZXQgPSBNYXRoLmNlaWwoJChoYXNoKS5vZmZzZXQoKS50b3AgLSBnZXROYXZCYXJIZWlnaHQoKSk7XG4gICAgICAkKFwiaHRtbCwgYm9keVwiKS5hbmltYXRlKFxuICAgICAgICB7XG4gICAgICAgICAgc2Nyb2xsVG9wOiBlbGVtZW50T2Zmc2V0XG4gICAgICAgIH0sXG4gICAgICAgIDgwMFxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuICAkKGRvY3VtZW50KS5vbihcImNsaWNrXCIsIFwiLm5hdmJhci1jb2xsYXBzZS5zaG93XCIsIGZ1bmN0aW9uKGUpIHtcbiAgICBsZXQgdGFyZ2V0RWxlbWVudCA9ICQoZS50YXJnZXQpLmlzKFwiYVwiKSA/ICQoZS50YXJnZXQpIDogJChlLnRhcmdldCkucGFyZW50KCk7XG4gICAgaWYgKHRhcmdldEVsZW1lbnQuaXMoXCJhXCIpICYmIHRhcmdldEVsZW1lbnQuYXR0cihcImNsYXNzXCIpICE9IFwiZHJvcGRvd24tdG9nZ2xlXCIpIHtcbiAgICAgICQodGhpcykuY29sbGFwc2UoXCJoaWRlXCIpO1xuICAgIH1cbiAgfSk7XG4gIGZ1bmN0aW9uIHByaW50TGF0ZXN0UmVsZWFzZShzZWxlY3RvciwgcmVwbykge1xuICAgIGlmIChodWdvRW52aXJvbm1lbnQgPT09IFwicHJvZHVjdGlvblwiKSB7XG4gICAgICAkLmdldEpTT04oXCJodHRwczovL2FwaS5naXRodWIuY29tL3JlcG9zL1wiICsgcmVwbyArIFwiL3RhZ3NcIikuZG9uZShmdW5jdGlvbihqc29uKSB7XG4gICAgICAgIGxldCByZWxlYXNlID0ganNvblswXTtcbiAgICAgICAgJChzZWxlY3RvcikuYXBwZW5kKFwiIFwiICsgcmVsZWFzZS5uYW1lKTtcbiAgICAgIH0pLmZhaWwoZnVuY3Rpb24oanF4aHIsIHRleHRTdGF0dXMsIGVycm9yKSB7XG4gICAgICAgIGxldCBlcnIgPSB0ZXh0U3RhdHVzICsgXCIsIFwiICsgZXJyb3I7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiUmVxdWVzdCBGYWlsZWQ6IFwiICsgZXJyKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiB0b2dnbGVTZWFyY2hEaWFsb2coKSB7XG4gICAgaWYgKCQoXCJib2R5XCIpLmhhc0NsYXNzKFwic2VhcmNoaW5nXCIpKSB7XG4gICAgICAkKFwiW2lkPXNlYXJjaC1xdWVyeV1cIikuYmx1cigpO1xuICAgICAgJChcImJvZHlcIikucmVtb3ZlQ2xhc3MoXCJzZWFyY2hpbmcgY29tcGVuc2F0ZS1mb3Itc2Nyb2xsYmFyXCIpO1xuICAgICAgcmVtb3ZlUXVlcnlQYXJhbXNGcm9tVXJsKCk7XG4gICAgICAkKFwiI2ZhbmN5Ym94LXN0eWxlLW5vc2Nyb2xsXCIpLnJlbW92ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoISQoXCIjZmFuY3lib3gtc3R5bGUtbm9zY3JvbGxcIikubGVuZ3RoICYmIGRvY3VtZW50LmJvZHkuc2Nyb2xsSGVpZ2h0ID4gd2luZG93LmlubmVySGVpZ2h0KSB7XG4gICAgICAgICQoXCJoZWFkXCIpLmFwcGVuZChcbiAgICAgICAgICAnPHN0eWxlIGlkPVwiZmFuY3lib3gtc3R5bGUtbm9zY3JvbGxcIj4uY29tcGVuc2F0ZS1mb3Itc2Nyb2xsYmFye21hcmdpbi1yaWdodDonICsgKHdpbmRvdy5pbm5lcldpZHRoIC0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoKSArIFwicHg7fTwvc3R5bGU+XCJcbiAgICAgICAgKTtcbiAgICAgICAgJChcImJvZHlcIikuYWRkQ2xhc3MoXCJjb21wZW5zYXRlLWZvci1zY3JvbGxiYXJcIik7XG4gICAgICB9XG4gICAgICAkKFwiYm9keVwiKS5hZGRDbGFzcyhcInNlYXJjaGluZ1wiKTtcbiAgICAgICQoXCIuc2VhcmNoLXJlc3VsdHNcIikuY3NzKHsgb3BhY2l0eTogMCwgdmlzaWJpbGl0eTogXCJ2aXNpYmxlXCIgfSkuYW5pbWF0ZSh7IG9wYWNpdHk6IDEgfSwgMjAwKTtcbiAgICAgIGxldCBhbGdvbGlhU2VhcmNoQm94ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5haXMtU2VhcmNoQm94LWlucHV0XCIpO1xuICAgICAgaWYgKGFsZ29saWFTZWFyY2hCb3gpIHtcbiAgICAgICAgYWxnb2xpYVNlYXJjaEJveC5mb2N1cygpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJChcIiNzZWFyY2gtcXVlcnlcIikuZm9jdXMoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gZml4SHVnb091dHB1dCgpIHtcbiAgICAkKFwiI1RhYmxlT2ZDb250ZW50c1wiKS5hZGRDbGFzcyhcIm5hdiBmbGV4LWNvbHVtblwiKTtcbiAgICAkKFwiI1RhYmxlT2ZDb250ZW50cyBsaVwiKS5hZGRDbGFzcyhcIm5hdi1pdGVtXCIpO1xuICAgICQoXCIjVGFibGVPZkNvbnRlbnRzIGxpIGFcIikuYWRkQ2xhc3MoXCJuYXYtbGlua1wiKTtcbiAgICAkKFwiaW5wdXRbdHlwZT0nY2hlY2tib3gnXVtkaXNhYmxlZF1cIikucGFyZW50cyhcInVsXCIpLmFkZENsYXNzKFwidGFzay1saXN0XCIpO1xuICB9XG4gIGZ1bmN0aW9uIGdldFNpYmxpbmdzKGVsZW0pIHtcbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLmZpbHRlci5jYWxsKGVsZW0ucGFyZW50Tm9kZS5jaGlsZHJlbiwgZnVuY3Rpb24oc2libGluZykge1xuICAgICAgcmV0dXJuIHNpYmxpbmcgIT09IGVsZW07XG4gICAgfSk7XG4gIH1cbiAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgZml4SHVnb091dHB1dCgpO1xuICAgIGxldCB7IGlzRGFya1RoZW1lLCB0aGVtZU1vZGUgfSA9IGluaXRUaGVtZVZhcmlhdGlvbigpO1xuICAgIHJlbmRlclRoZW1lVmFyaWF0aW9uKGlzRGFya1RoZW1lLCB0aGVtZU1vZGUsIHRydWUpO1xuICAgIGlmIChjb2RlSGlnaGxpZ2h0aW5nKSB7XG4gICAgICBobGpzLmluaXRIaWdobGlnaHRpbmcoKTtcbiAgICB9XG4gICAgbGV0IGNoaWxkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5kb2NzLWxpbmtzIC5hY3RpdmVcIik7XG4gICAgbGV0IHBhcmVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZG9jcy1saW5rc1wiKTtcbiAgICBpZiAoY2hpbGQgJiYgcGFyZW50KSB7XG4gICAgICBzY3JvbGxQYXJlbnRUb0NoaWxkKHBhcmVudCwgY2hpbGQpO1xuICAgIH1cbiAgfSk7XG4gICQod2luZG93KS5vbihcImxvYWRcIiwgZnVuY3Rpb24oKSB7XG4gICAgZml4U2Nyb2xsc3B5KCk7XG4gICAgbGV0IGlzb3RvcGVJbnN0YW5jZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnByb2plY3RzLWNvbnRhaW5lclwiKTtcbiAgICBsZXQgaXNvdG9wZUluc3RhbmNlc0NvdW50ID0gaXNvdG9wZUluc3RhbmNlcy5sZW5ndGg7XG4gICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoICYmIGlzb3RvcGVJbnN0YW5jZXNDb3VudCA9PT0gMCkge1xuICAgICAgc2Nyb2xsVG9BbmNob3IoZGVjb2RlVVJJQ29tcG9uZW50KHdpbmRvdy5sb2NhdGlvbi5oYXNoKSwgMCk7XG4gICAgfVxuICAgIGxldCBjaGlsZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZG9jcy10b2MgLm5hdi1saW5rLmFjdGl2ZVwiKTtcbiAgICBsZXQgcGFyZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5kb2NzLXRvY1wiKTtcbiAgICBpZiAoY2hpbGQgJiYgcGFyZW50KSB7XG4gICAgICBzY3JvbGxQYXJlbnRUb0NoaWxkKHBhcmVudCwgY2hpbGQpO1xuICAgIH1cbiAgICBsZXQgem9vbU9wdGlvbnMgPSB7fTtcbiAgICBpZiAoZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuY29udGFpbnMoXCJkYXJrXCIpKSB7XG4gICAgICB6b29tT3B0aW9ucy5iYWNrZ3JvdW5kID0gXCJyZ2JhKDAsMCwwLDAuOSlcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgem9vbU9wdGlvbnMuYmFja2dyb3VuZCA9IFwicmdiYSgyNTUsMjU1LDI1NSwwLjkpXCI7XG4gICAgfVxuICAgIG1lZGl1bV96b29tX2VzbV9kZWZhdWx0KFwiW2RhdGEtem9vbWFibGVdXCIsIHpvb21PcHRpb25zKTtcbiAgICBsZXQgaXNvdG9wZUNvdW50ZXIgPSAwO1xuICAgIGlzb3RvcGVJbnN0YW5jZXMuZm9yRWFjaChmdW5jdGlvbihpc290b3BlSW5zdGFuY2UsIGluZGV4KSB7XG4gICAgICBjb25zb2xlLmRlYnVnKGBMb2FkaW5nIElzb3RvcGUgaW5zdGFuY2UgJHtpbmRleH1gKTtcbiAgICAgIGxldCBpc287XG4gICAgICBsZXQgaXNvU2VjdGlvbiA9IGlzb3RvcGVJbnN0YW5jZS5jbG9zZXN0KFwic2VjdGlvblwiKTtcbiAgICAgIGxldCBsYXlvdXQgPSBcIlwiO1xuICAgICAgaWYgKGlzb1NlY3Rpb24ucXVlcnlTZWxlY3RvcihcIi5pc290b3BlXCIpLmNsYXNzTGlzdC5jb250YWlucyhcImpzLWxheW91dC1yb3dcIikpIHtcbiAgICAgICAgbGF5b3V0ID0gXCJmaXRSb3dzXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsYXlvdXQgPSBcIm1hc29ucnlcIjtcbiAgICAgIH1cbiAgICAgIGxldCBkZWZhdWx0RmlsdGVyID0gaXNvU2VjdGlvbi5xdWVyeVNlbGVjdG9yKFwiLmRlZmF1bHQtcHJvamVjdC1maWx0ZXJcIik7XG4gICAgICBsZXQgZmlsdGVyVGV4dCA9IFwiKlwiO1xuICAgICAgaWYgKGRlZmF1bHRGaWx0ZXIgIT09IG51bGwpIHtcbiAgICAgICAgZmlsdGVyVGV4dCA9IGRlZmF1bHRGaWx0ZXIudGV4dENvbnRlbnQ7XG4gICAgICB9XG4gICAgICBjb25zb2xlLmRlYnVnKGBEZWZhdWx0IElzb3RvcGUgZmlsdGVyOiAke2ZpbHRlclRleHR9YCk7XG4gICAgICBpbWFnZXNMb2FkZWQoaXNvdG9wZUluc3RhbmNlLCBmdW5jdGlvbigpIHtcbiAgICAgICAgaXNvID0gbmV3IElzb3RvcGUoaXNvdG9wZUluc3RhbmNlLCB7XG4gICAgICAgICAgaXRlbVNlbGVjdG9yOiBcIi5pc290b3BlLWl0ZW1cIixcbiAgICAgICAgICBsYXlvdXRNb2RlOiBsYXlvdXQsXG4gICAgICAgICAgbWFzb25yeToge1xuICAgICAgICAgICAgZ3V0dGVyOiAyMFxuICAgICAgICAgIH0sXG4gICAgICAgICAgZmlsdGVyOiBmaWx0ZXJUZXh0XG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgaXNvRmlsdGVyQnV0dG9ucyA9IGlzb1NlY3Rpb24ucXVlcnlTZWxlY3RvckFsbChcIi5wcm9qZWN0LWZpbHRlcnMgYVwiKTtcbiAgICAgICAgaXNvRmlsdGVyQnV0dG9ucy5mb3JFYWNoKFxuICAgICAgICAgIChidXR0b24pID0+IGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGUpID0+IHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGxldCBzZWxlY3RvciA9IGJ1dHRvbi5nZXRBdHRyaWJ1dGUoXCJkYXRhLWZpbHRlclwiKTtcbiAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoYFVwZGF0aW5nIElzb3RvcGUgZmlsdGVyIHRvICR7c2VsZWN0b3J9YCk7XG4gICAgICAgICAgICBpc28uYXJyYW5nZSh7IGZpbHRlcjogc2VsZWN0b3IgfSk7XG4gICAgICAgICAgICBidXR0b24uY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcbiAgICAgICAgICAgIGJ1dHRvbi5jbGFzc0xpc3QuYWRkKFwiYWN0aXZlXCIpO1xuICAgICAgICAgICAgbGV0IGJ1dHRvblNpYmxpbmdzID0gZ2V0U2libGluZ3MoYnV0dG9uKTtcbiAgICAgICAgICAgIGJ1dHRvblNpYmxpbmdzLmZvckVhY2goKGJ1dHRvblNpYmxpbmcpID0+IHtcbiAgICAgICAgICAgICAgYnV0dG9uU2libGluZy5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xuICAgICAgICAgICAgICBidXR0b25TaWJsaW5nLmNsYXNzTGlzdC5yZW1vdmUoXCJhbGxcIik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KVxuICAgICAgICApO1xuICAgICAgICBpbmNyZW1lbnRJc290b3BlQ291bnRlcigpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgZnVuY3Rpb24gaW5jcmVtZW50SXNvdG9wZUNvdW50ZXIoKSB7XG4gICAgICBpc290b3BlQ291bnRlcisrO1xuICAgICAgaWYgKGlzb3RvcGVDb3VudGVyID09PSBpc290b3BlSW5zdGFuY2VzQ291bnQpIHtcbiAgICAgICAgY29uc29sZS5kZWJ1ZyhgQWxsIFBvcnRmb2xpbyBJc290b3BlIGluc3RhbmNlcyBsb2FkZWQuYCk7XG4gICAgICAgIGlmICh3aW5kb3cubG9jYXRpb24uaGFzaCkge1xuICAgICAgICAgIHNjcm9sbFRvQW5jaG9yKGRlY29kZVVSSUNvbXBvbmVudCh3aW5kb3cubG9jYXRpb24uaGFzaCksIDApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGxldCBnaXRodWJSZWxlYXNlU2VsZWN0b3IgPSBcIi5qcy1naXRodWItcmVsZWFzZVwiO1xuICAgIGlmICgkKGdpdGh1YlJlbGVhc2VTZWxlY3RvcikubGVuZ3RoID4gMCkge1xuICAgICAgcHJpbnRMYXRlc3RSZWxlYXNlKGdpdGh1YlJlbGVhc2VTZWxlY3RvciwgJChnaXRodWJSZWxlYXNlU2VsZWN0b3IpLmRhdGEoXCJyZXBvXCIpKTtcbiAgICB9XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsIChldmVudCkgPT4ge1xuICAgICAgaWYgKGV2ZW50LmNvZGUgPT09IFwiRXNjYXBlXCIpIHtcbiAgICAgICAgY29uc3QgYm9keTIgPSBkb2N1bWVudC5ib2R5O1xuICAgICAgICBpZiAoYm9keTIuY2xhc3NMaXN0LmNvbnRhaW5zKFwic2VhcmNoaW5nXCIpKSB7XG4gICAgICAgICAgdG9nZ2xlU2VhcmNoRGlhbG9nKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChldmVudC5rZXkgPT09IFwiL1wiKSB7XG4gICAgICAgIGxldCBmb2N1c2VkRWxlbWVudCA9IGRvY3VtZW50Lmhhc0ZvY3VzKCkgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAhPT0gZG9jdW1lbnQuYm9keSAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCB8fCBudWxsO1xuICAgICAgICBsZXQgaXNJbnB1dEZvY3VzZWQgPSBmb2N1c2VkRWxlbWVudCBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQgfHwgZm9jdXNlZEVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MVGV4dEFyZWFFbGVtZW50O1xuICAgICAgICBpZiAoc2VhcmNoRW5hYmxlZCAmJiAhaXNJbnB1dEZvY3VzZWQpIHtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIHRvZ2dsZVNlYXJjaERpYWxvZygpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYgKHNlYXJjaEVuYWJsZWQpIHtcbiAgICAgICQoXCIuanMtc2VhcmNoXCIpLmNsaWNrKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0b2dnbGVTZWFyY2hEaWFsb2coKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICAkKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpO1xuICB9KTtcbiAgdmFyIGxpbmtMaWdodCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuanMtc2V0LXRoZW1lLWxpZ2h0XCIpO1xuICB2YXIgbGlua0RhcmsgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmpzLXNldC10aGVtZS1kYXJrXCIpO1xuICB2YXIgbGlua0F1dG8gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmpzLXNldC10aGVtZS1hdXRvXCIpO1xuICBpZiAobGlua0xpZ2h0ICYmIGxpbmtEYXJrICYmIGxpbmtBdXRvKSB7XG4gICAgbGlua0xpZ2h0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBjaGFuZ2VUaGVtZU1vZGVDbGljaygwKTtcbiAgICB9KTtcbiAgICBsaW5rRGFyay5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgY2hhbmdlVGhlbWVNb2RlQ2xpY2soMSk7XG4gICAgfSk7XG4gICAgbGlua0F1dG8uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudCkgPT4ge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGNoYW5nZVRoZW1lTW9kZUNsaWNrKDIpO1xuICAgIH0pO1xuICB9XG4gIHZhciBkYXJrTW9kZU1lZGlhUXVlcnkgPSB3aW5kb3cubWF0Y2hNZWRpYShcIihwcmVmZXJzLWNvbG9yLXNjaGVtZTogZGFyaylcIik7XG4gIGRhcmtNb2RlTWVkaWFRdWVyeS5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIChldmVudCkgPT4ge1xuICAgIG9uTWVkaWFRdWVyeUxpc3RFdmVudChldmVudCk7XG4gIH0pO1xuICAkKFwiYm9keVwiKS5vbihcIm1vdXNlZW50ZXIgbW91c2VsZWF2ZVwiLCBcIi5kcm9wZG93blwiLCBmdW5jdGlvbihlKSB7XG4gICAgdmFyIGRyb3Bkb3duID0gJChlLnRhcmdldCkuY2xvc2VzdChcIi5kcm9wZG93blwiKTtcbiAgICB2YXIgbWVudSA9ICQoXCIuZHJvcGRvd24tbWVudVwiLCBkcm9wZG93bik7XG4gICAgZHJvcGRvd24uYWRkQ2xhc3MoXCJzaG93XCIpO1xuICAgIG1lbnUuYWRkQ2xhc3MoXCJzaG93XCIpO1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICBkcm9wZG93bltkcm9wZG93bi5pcyhcIjpob3ZlclwiKSA/IFwiYWRkQ2xhc3NcIiA6IFwicmVtb3ZlQ2xhc3NcIl0oXCJzaG93XCIpO1xuICAgICAgbWVudVtkcm9wZG93bi5pcyhcIjpob3ZlclwiKSA/IFwiYWRkQ2xhc3NcIiA6IFwicmVtb3ZlQ2xhc3NcIl0oXCJzaG93XCIpO1xuICAgIH0sIDMwMCk7XG4gIH0pO1xuICB2YXIgcmVzaXplVGltZXI7XG4gICQod2luZG93KS5yZXNpemUoZnVuY3Rpb24oKSB7XG4gICAgY2xlYXJUaW1lb3V0KHJlc2l6ZVRpbWVyKTtcbiAgICByZXNpemVUaW1lciA9IHNldFRpbWVvdXQoZml4U2Nyb2xsc3B5LCAyMDApO1xuICB9KTtcbn0pKCk7XG4vKiEgbWVkaXVtLXpvb20gMS4wLjYgfCBNSVQgTGljZW5zZSB8IGh0dHBzOi8vZ2l0aHViLmNvbS9mcmFuY29pc2NoYWxpZm91ci9tZWRpdW0tem9vbSAqL1xuXG47XG4oKCkgPT4ge1xuICAvLyBucy1odWdvLXBhcmFtczo8c3RkaW4+XG4gIHZhciBjb250ZW50X3R5cGUgPSB7IGF1dGhvcnM6IFwiQXV0aG9yc1wiLCBldmVudDogXCJcXHU2RjE0XFx1OEJCMlwiLCBwb3N0OiBcIlxcdTY1ODdcXHU3QUUwXCIsIHByb2plY3Q6IFwiXFx1OTg3OVxcdTc2RUVcIiwgcHVibGljYXRpb246IFwiXFx1NTFGQVxcdTcyNDhcXHU3MjY5XCIsIHNsaWRlczogXCJTbGlkZXNcIiB9O1xuICB2YXIgaTE4biA9IHsgbm9fcmVzdWx0czogXCJcXHU2Q0ExXFx1NjcwOVxcdTYyN0VcXHU1MjMwXFx1N0VEM1xcdTY3OUNcIiwgcGxhY2Vob2xkZXI6IFwiXFx1NjQxQ1xcdTdEMjIuLi5cIiwgcmVzdWx0czogXCJcXHU2NDFDXFx1N0QyMlxcdTdFRDNcXHU2NzlDXCIgfTtcbiAgdmFyIHNlYXJjaF9jb25maWcgPSB7IGluZGV4VVJJOiBcIi96aC9pbmRleC5qc29uXCIsIG1pbkxlbmd0aDogMSwgdGhyZXNob2xkOiAwLjMgfTtcblxuICAvLyA8c3RkaW4+XG4gIHZhciBmdXNlT3B0aW9ucyA9IHtcbiAgICBzaG91bGRTb3J0OiB0cnVlLFxuICAgIGluY2x1ZGVNYXRjaGVzOiB0cnVlLFxuICAgIHRva2VuaXplOiB0cnVlLFxuICAgIHRocmVzaG9sZDogc2VhcmNoX2NvbmZpZy50aHJlc2hvbGQsXG4gICAgLy8gU2V0IHRvIH4wLjMgZm9yIHBhcnNpbmcgZGlhY3JpdGljcyBhbmQgQ0pLIGxhbmd1YWdlcy5cbiAgICBsb2NhdGlvbjogMCxcbiAgICBkaXN0YW5jZTogMTAwLFxuICAgIG1heFBhdHRlcm5MZW5ndGg6IDMyLFxuICAgIG1pbk1hdGNoQ2hhckxlbmd0aDogc2VhcmNoX2NvbmZpZy5taW5MZW5ndGgsXG4gICAgLy8gU2V0IHRvIDEgZm9yIHBhcnNpbmcgQ0pLIGxhbmd1YWdlcy5cbiAgICBrZXlzOiBbXG4gICAgICB7IG5hbWU6IFwidGl0bGVcIiwgd2VpZ2h0OiAwLjk5IH0sXG4gICAgICB7IG5hbWU6IFwicHVibGljYXRpb25fc2hvcnRcIiwgd2VpZ2h0OiAwLjg1IH0sXG4gICAgICB7IG5hbWU6IFwicHVibGljYXRpb25cIiwgd2VpZ2h0OiAwLjY1IH0sXG4gICAgICB7IG5hbWU6IFwic3VtbWFyeVwiLCB3ZWlnaHQ6IDAuNiB9LFxuICAgICAgeyBuYW1lOiBcImF1dGhvcnNcIiwgd2VpZ2h0OiAwLjUgfSxcbiAgICAgIHsgbmFtZTogXCJjb250ZW50XCIsIHdlaWdodDogMC4yIH0sXG4gICAgICB7IG5hbWU6IFwidGFnc1wiLCB3ZWlnaHQ6IDAuNSB9LFxuICAgICAgeyBuYW1lOiBcImNhdGVnb3JpZXNcIiwgd2VpZ2h0OiAwLjUgfVxuICAgIF1cbiAgfTtcbiAgdmFyIHN1bW1hcnlMZW5ndGggPSA2MDtcbiAgZnVuY3Rpb24gZ2V0U2VhcmNoUXVlcnkobmFtZSkge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoKGxvY2F0aW9uLnNlYXJjaC5zcGxpdChuYW1lICsgXCI9XCIpWzFdIHx8IFwiXCIpLnNwbGl0KFwiJlwiKVswXSkucmVwbGFjZSgvXFwrL2csIFwiIFwiKTtcbiAgfVxuICBmdW5jdGlvbiB1cGRhdGVVUkwodXJsKSB7XG4gICAgaWYgKGhpc3RvcnkucmVwbGFjZVN0YXRlKSB7XG4gICAgICB3aW5kb3cuaGlzdG9yeS5yZXBsYWNlU3RhdGUoeyBwYXRoOiB1cmwgfSwgXCJcIiwgdXJsKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gaW5pdFNlYXJjaChmb3JjZSwgZnVzZSkge1xuICAgIGxldCBxdWVyeSA9ICQoXCIjc2VhcmNoLXF1ZXJ5XCIpLnZhbCgpO1xuICAgIGlmIChxdWVyeS5sZW5ndGggPCAxKSB7XG4gICAgICAkKFwiI3NlYXJjaC1oaXRzXCIpLmVtcHR5KCk7XG4gICAgICAkKFwiI3NlYXJjaC1jb21tb24tcXVlcmllc1wiKS5zaG93KCk7XG4gICAgfVxuICAgIGlmICghZm9yY2UgJiYgcXVlcnkubGVuZ3RoIDwgZnVzZU9wdGlvbnMubWluTWF0Y2hDaGFyTGVuZ3RoKSByZXR1cm47XG4gICAgJChcIiNzZWFyY2gtaGl0c1wiKS5lbXB0eSgpO1xuICAgICQoXCIjc2VhcmNoLWNvbW1vbi1xdWVyaWVzXCIpLmhpZGUoKTtcbiAgICBzZWFyY2hTaXRlKHF1ZXJ5LCBmdXNlKTtcbiAgICBsZXQgbmV3VVJMID0gd2luZG93LmxvY2F0aW9uLnByb3RvY29sICsgXCIvL1wiICsgd2luZG93LmxvY2F0aW9uLmhvc3QgKyB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgKyBcIj9xPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KHF1ZXJ5KSArIHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuICAgIHVwZGF0ZVVSTChuZXdVUkwpO1xuICB9XG4gIGZ1bmN0aW9uIHNlYXJjaFNpdGUocXVlcnksIGZ1c2UpIHtcbiAgICBsZXQgcmVzdWx0cyA9IGZ1c2Uuc2VhcmNoKHF1ZXJ5KTtcbiAgICBpZiAocmVzdWx0cy5sZW5ndGggPiAwKSB7XG4gICAgICAkKFwiI3NlYXJjaC1oaXRzXCIpLmFwcGVuZCgnPGgzIGNsYXNzPVwibXQtMFwiPicgKyByZXN1bHRzLmxlbmd0aCArIFwiIFwiICsgaTE4bi5yZXN1bHRzICsgXCI8L2gzPlwiKTtcbiAgICAgIHBhcnNlUmVzdWx0cyhxdWVyeSwgcmVzdWx0cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICQoXCIjc2VhcmNoLWhpdHNcIikuYXBwZW5kKCc8ZGl2IGNsYXNzPVwic2VhcmNoLW5vLXJlc3VsdHNcIj4nICsgaTE4bi5ub19yZXN1bHRzICsgXCI8L2Rpdj5cIik7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIHBhcnNlUmVzdWx0cyhxdWVyeSwgcmVzdWx0cykge1xuICAgICQuZWFjaChyZXN1bHRzLCBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICBsZXQgY29udGVudF9rZXkgPSB2YWx1ZS5pdGVtLnNlY3Rpb247XG4gICAgICBsZXQgY29udGVudCA9IFwiXCI7XG4gICAgICBsZXQgc25pcHBldCA9IFwiXCI7XG4gICAgICBsZXQgc25pcHBldEhpZ2hsaWdodHMgPSBbXTtcbiAgICAgIGlmIChbXCJwdWJsaWNhdGlvblwiLCBcImV2ZW50XCJdLmluY2x1ZGVzKGNvbnRlbnRfa2V5KSkge1xuICAgICAgICBjb250ZW50ID0gdmFsdWUuaXRlbS5zdW1tYXJ5O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29udGVudCA9IHZhbHVlLml0ZW0uY29udGVudDtcbiAgICAgIH1cbiAgICAgIGlmIChmdXNlT3B0aW9ucy50b2tlbml6ZSkge1xuICAgICAgICBzbmlwcGV0SGlnaGxpZ2h0cy5wdXNoKHF1ZXJ5KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICQuZWFjaCh2YWx1ZS5tYXRjaGVzLCBmdW5jdGlvbihtYXRjaEtleSwgbWF0Y2hWYWx1ZSkge1xuICAgICAgICAgIGlmIChtYXRjaFZhbHVlLmtleSA9PSBcImNvbnRlbnRcIikge1xuICAgICAgICAgICAgbGV0IHN0YXJ0ID0gbWF0Y2hWYWx1ZS5pbmRpY2VzWzBdWzBdIC0gc3VtbWFyeUxlbmd0aCA+IDAgPyBtYXRjaFZhbHVlLmluZGljZXNbMF1bMF0gLSBzdW1tYXJ5TGVuZ3RoIDogMDtcbiAgICAgICAgICAgIGxldCBlbmQgPSBtYXRjaFZhbHVlLmluZGljZXNbMF1bMV0gKyBzdW1tYXJ5TGVuZ3RoIDwgY29udGVudC5sZW5ndGggPyBtYXRjaFZhbHVlLmluZGljZXNbMF1bMV0gKyBzdW1tYXJ5TGVuZ3RoIDogY29udGVudC5sZW5ndGg7XG4gICAgICAgICAgICBzbmlwcGV0ICs9IGNvbnRlbnQuc3Vic3RyaW5nKHN0YXJ0LCBlbmQpO1xuICAgICAgICAgICAgc25pcHBldEhpZ2hsaWdodHMucHVzaChcbiAgICAgICAgICAgICAgbWF0Y2hWYWx1ZS52YWx1ZS5zdWJzdHJpbmcoXG4gICAgICAgICAgICAgICAgbWF0Y2hWYWx1ZS5pbmRpY2VzWzBdWzBdLFxuICAgICAgICAgICAgICAgIG1hdGNoVmFsdWUuaW5kaWNlc1swXVsxXSAtIG1hdGNoVmFsdWUuaW5kaWNlc1swXVswXSArIDFcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgaWYgKHNuaXBwZXQubGVuZ3RoIDwgMSkge1xuICAgICAgICBzbmlwcGV0ICs9IHZhbHVlLml0ZW0uc3VtbWFyeTtcbiAgICAgIH1cbiAgICAgIGxldCB0ZW1wbGF0ZSA9ICQoXCIjc2VhcmNoLWhpdC1mdXNlLXRlbXBsYXRlXCIpLmh0bWwoKTtcbiAgICAgIGlmIChjb250ZW50X2tleSBpbiBjb250ZW50X3R5cGUpIHtcbiAgICAgICAgY29udGVudF9rZXkgPSBjb250ZW50X3R5cGVbY29udGVudF9rZXldO1xuICAgICAgfVxuICAgICAgbGV0IHRlbXBsYXRlRGF0YSA9IHtcbiAgICAgICAga2V5LFxuICAgICAgICB0aXRsZTogdmFsdWUuaXRlbS50aXRsZSxcbiAgICAgICAgdHlwZTogY29udGVudF9rZXksXG4gICAgICAgIHJlbHBlcm1hbGluazogdmFsdWUuaXRlbS5yZWxwZXJtYWxpbmssXG4gICAgICAgIHNuaXBwZXRcbiAgICAgIH07XG4gICAgICBsZXQgb3V0cHV0ID0gcmVuZGVyKHRlbXBsYXRlLCB0ZW1wbGF0ZURhdGEpO1xuICAgICAgJChcIiNzZWFyY2gtaGl0c1wiKS5hcHBlbmQob3V0cHV0KTtcbiAgICAgICQuZWFjaChzbmlwcGV0SGlnaGxpZ2h0cywgZnVuY3Rpb24oaGxLZXksIGhsVmFsdWUpIHtcbiAgICAgICAgJChcIiNzdW1tYXJ5LVwiICsga2V5KS5tYXJrKGhsVmFsdWUpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbiAgZnVuY3Rpb24gcmVuZGVyKHRlbXBsYXRlLCBkYXRhKSB7XG4gICAgbGV0IGtleSwgZmluZCwgcmU7XG4gICAgZm9yIChrZXkgaW4gZGF0YSkge1xuICAgICAgZmluZCA9IFwiXFxcXHtcXFxce1xcXFxzKlwiICsga2V5ICsgXCJcXFxccypcXFxcfVxcXFx9XCI7XG4gICAgICByZSA9IG5ldyBSZWdFeHAoZmluZCwgXCJnXCIpO1xuICAgICAgdGVtcGxhdGUgPSB0ZW1wbGF0ZS5yZXBsYWNlKHJlLCBkYXRhW2tleV0pO1xuICAgIH1cbiAgICByZXR1cm4gdGVtcGxhdGU7XG4gIH1cbiAgaWYgKHR5cGVvZiBGdXNlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAkLmdldEpTT04oc2VhcmNoX2NvbmZpZy5pbmRleFVSSSwgZnVuY3Rpb24oc2VhcmNoX2luZGV4KSB7XG4gICAgICBsZXQgZnVzZSA9IG5ldyBGdXNlKHNlYXJjaF9pbmRleCwgZnVzZU9wdGlvbnMpO1xuICAgICAgbGV0IHF1ZXJ5ID0gZ2V0U2VhcmNoUXVlcnkoXCJxXCIpO1xuICAgICAgaWYgKHF1ZXJ5KSB7XG4gICAgICAgICQoXCJib2R5XCIpLmFkZENsYXNzKFwic2VhcmNoaW5nXCIpO1xuICAgICAgICAkKFwiLnNlYXJjaC1yZXN1bHRzXCIpLmNzcyh7IG9wYWNpdHk6IDAsIHZpc2liaWxpdHk6IFwidmlzaWJsZVwiIH0pLmFuaW1hdGUoeyBvcGFjaXR5OiAxIH0sIDIwMCk7XG4gICAgICAgICQoXCIjc2VhcmNoLXF1ZXJ5XCIpLnZhbChxdWVyeSk7XG4gICAgICAgICQoXCIjc2VhcmNoLXF1ZXJ5XCIpLmZvY3VzKCk7XG4gICAgICAgIGluaXRTZWFyY2godHJ1ZSwgZnVzZSk7XG4gICAgICB9XG4gICAgICAkKFwiI3NlYXJjaC1xdWVyeVwiKS5rZXl1cChmdW5jdGlvbihlKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCgkLmRhdGEodGhpcywgXCJzZWFyY2hUaW1lclwiKSk7XG4gICAgICAgIGlmIChlLmtleUNvZGUgPT0gMTMpIHtcbiAgICAgICAgICBpbml0U2VhcmNoKHRydWUsIGZ1c2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICQodGhpcykuZGF0YShcbiAgICAgICAgICAgIFwic2VhcmNoVGltZXJcIixcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIGluaXRTZWFyY2goZmFsc2UsIGZ1c2UpO1xuICAgICAgICAgICAgfSwgMjUwKVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59KSgpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7QUFBQSxHQUFDLE1BQU07QUFFTCxRQUFJLFdBQVcsT0FBTyxVQUFVLFNBQVMsUUFBUTtBQUMvQyxlQUFTLElBQUksR0FBRyxJQUFJLFVBQVUsUUFBUSxLQUFLO0FBQ3pDLFlBQUksU0FBUyxVQUFVLENBQUM7QUFDeEIsaUJBQVMsT0FBTyxRQUFRO0FBQ3RCLGNBQUksT0FBTyxVQUFVLGVBQWUsS0FBSyxRQUFRLEdBQUcsR0FBRztBQUNyRCxtQkFBTyxHQUFHLElBQUksT0FBTyxHQUFHO0FBQUEsVUFDMUI7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUNBLGFBQU87QUFBQSxJQUNUO0FBQ0EsUUFBSSxjQUFjLFNBQVMsYUFBYSxNQUFNO0FBQzVDLGFBQU8sS0FBSyxZQUFZO0FBQUEsSUFDMUI7QUFDQSxRQUFJLGFBQWEsU0FBUyxZQUFZLFVBQVU7QUFDOUMsYUFBTyxTQUFTLFVBQVUsY0FBYyxRQUFRO0FBQUEsSUFDbEQ7QUFDQSxRQUFJLFNBQVMsU0FBUyxRQUFRLFVBQVU7QUFDdEMsYUFBTyxZQUFZLFNBQVMsYUFBYTtBQUFBLElBQzNDO0FBQ0EsUUFBSSxRQUFRLFNBQVMsT0FBTyxPQUFPO0FBQ2pDLFVBQUksU0FBUyxNQUFNLGNBQWMsTUFBTTtBQUN2QyxhQUFPLE9BQU8sT0FBTyxFQUFFLEVBQUUsWUFBWSxNQUFNO0FBQUEsSUFDN0M7QUFDQSxRQUFJLHdCQUF3QixTQUFTLHVCQUF1QixVQUFVO0FBQ3BFLFVBQUk7QUFDRixZQUFJLE1BQU0sUUFBUSxRQUFRLEdBQUc7QUFDM0IsaUJBQU8sU0FBUyxPQUFP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
