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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiPHN0ZGluPiJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiKCgpID0+IHtcbiAgLy8gbnMtaHVnby1pbXA6L1ZvbHVtZXMvQXRyZW9TU0QvaG9tZXBhZ2UyMDI2L2Fzc2V0cy9qcy9fdmVuZG9yL21lZGl1bS16b29tLmVzbS5qc1xuICB2YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldO1xuICAgICAgZm9yICh2YXIga2V5IGluIHNvdXJjZSkge1xuICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkge1xuICAgICAgICAgIHRhcmdldFtrZXldID0gc291cmNlW2tleV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRhcmdldDtcbiAgfTtcbiAgdmFyIGlzU3VwcG9ydGVkID0gZnVuY3Rpb24gaXNTdXBwb3J0ZWQyKG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS50YWdOYW1lID09PSBcIklNR1wiO1xuICB9O1xuICB2YXIgaXNOb2RlTGlzdCA9IGZ1bmN0aW9uIGlzTm9kZUxpc3QyKHNlbGVjdG9yKSB7XG4gICAgcmV0dXJuIE5vZGVMaXN0LnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKHNlbGVjdG9yKTtcbiAgfTtcbiAgdmFyIGlzTm9kZSA9IGZ1bmN0aW9uIGlzTm9kZTIoc2VsZWN0b3IpIHtcbiAgICByZXR1cm4gc2VsZWN0b3IgJiYgc2VsZWN0b3Iubm9kZVR5cGUgPT09IDE7XG4gIH07XG4gIHZhciBpc1N2ZyA9IGZ1bmN0aW9uIGlzU3ZnMihpbWFnZSkge1xuICAgIHZhciBzb3VyY2UgPSBpbWFnZS5jdXJyZW50U3JjIHx8IGltYWdlLnNyYztcbiAgICByZXR1cm4gc291cmNlLnN1YnN0cigtNCkudG9Mb3dlckNhc2UoKSA9PT0gXCIuc3ZnXCI7XG4gIH07XG4gIHZhciBnZXRJbWFnZXNGcm9tU2VsZWN0b3IgPSBmdW5jdGlvbiBnZXRJbWFnZXNGcm9tU2VsZWN0b3IyKHNlbGVjdG9yKSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHNlbGVjdG9yKSkge1xuICAgICAgICByZXR1cm4gc2VsZWN0b3IuZmlsdGVyKGlzU3VwcG9ydGVkKTtcbiAgICAgIH1cbiAgICAgIGlmIChpc05vZGVMaXN0KHNlbGVjdG9yKSkge1xuICAgICAgICByZXR1cm4gW10uc2xpY2UuY2FsbChzZWxlY3RvcikuZmlsdGVyKGlzU3VwcG9ydGVkKTtcbiAgICAgIH1cbiAgICAgIGlmIChpc05vZGUoc2VsZWN0b3IpKSB7XG4gICAgICAgIHJldHVybiBbc2VsZWN0b3JdLmZpbHRlcihpc1N1cHBvcnRlZCk7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHNlbGVjdG9yID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIHJldHVybiBbXS5zbGljZS5jYWxsKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpKS5maWx0ZXIoaXNTdXBwb3J0ZWQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFtdO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlRoZSBwcm92aWRlZCBzZWxlY3RvciBpcyBpbnZhbGlkLlxcbkV4cGVjdHMgYSBDU1Mgc2VsZWN0b3IsIGEgTm9kZSBlbGVtZW50LCBhIE5vZGVMaXN0IG9yIGFuIGFycmF5LlxcblNlZTogaHR0cHM6Ly9naXRodWIuY29tL2ZyYW5jb2lzY2hhbGlmb3VyL21lZGl1bS16b29tXCIpO1xuICAgIH1cbiAgfTtcbiAgdmFyIGNyZWF0ZU92ZXJsYXkgPSBmdW5jdGlvbiBjcmVhdGVPdmVybGF5MihiYWNrZ3JvdW5kKSB7XG4gICAgdmFyIG92ZXJsYXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIG92ZXJsYXkuY2xhc3NMaXN0LmFkZChcIm1lZGl1bS16b29tLW92ZXJsYXlcIik7XG4gICAgb3ZlcmxheS5zdHlsZS5iYWNrZ3JvdW5kID0gYmFja2dyb3VuZDtcbiAgICByZXR1cm4gb3ZlcmxheTtcbiAgfTtcbiAgdmFyIGNsb25lVGFyZ2V0ID0gZnVuY3Rpb24gY2xvbmVUYXJnZXQyKHRlbXBsYXRlKSB7XG4gICAgdmFyIF90ZW1wbGF0ZSRnZXRCb3VuZGluZyA9IHRlbXBsYXRlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLCB0b3AgPSBfdGVtcGxhdGUkZ2V0Qm91bmRpbmcudG9wLCBsZWZ0ID0gX3RlbXBsYXRlJGdldEJvdW5kaW5nLmxlZnQsIHdpZHRoID0gX3RlbXBsYXRlJGdldEJvdW5kaW5nLndpZHRoLCBoZWlnaHQgPSBfdGVtcGxhdGUkZ2V0Qm91bmRpbmcuaGVpZ2h0O1xuICAgIHZhciBjbG9uZSA9IHRlbXBsYXRlLmNsb25lTm9kZSgpO1xuICAgIHZhciBzY3JvbGxUb3AgPSB3aW5kb3cucGFnZVlPZmZzZXQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCB8fCBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCB8fCAwO1xuICAgIHZhciBzY3JvbGxMZWZ0ID0gd2luZG93LnBhZ2VYT2Zmc2V0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxMZWZ0IHx8IGRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdCB8fCAwO1xuICAgIGNsb25lLnJlbW92ZUF0dHJpYnV0ZShcImlkXCIpO1xuICAgIGNsb25lLnN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiO1xuICAgIGNsb25lLnN0eWxlLnRvcCA9IHRvcCArIHNjcm9sbFRvcCArIFwicHhcIjtcbiAgICBjbG9uZS5zdHlsZS5sZWZ0ID0gbGVmdCArIHNjcm9sbExlZnQgKyBcInB4XCI7XG4gICAgY2xvbmUuc3R5bGUud2lkdGggPSB3aWR0aCArIFwicHhcIjtcbiAgICBjbG9uZS5zdHlsZS5oZWlnaHQgPSBoZWlnaHQgKyBcInB4XCI7XG4gICAgY2xvbmUuc3R5bGUudHJhbnNmb3JtID0gXCJcIjtcbiAgICByZXR1cm4gY2xvbmU7XG4gIH07XG4gIHZhciBjcmVhdGVDdXN0b21FdmVudCA9IGZ1bmN0aW9uIGNyZWF0ZUN1c3RvbUV2ZW50Mih0eXBlLCBwYXJhbXMpIHtcbiAgICB2YXIgZXZlbnRQYXJhbXMgPSBfZXh0ZW5kcyh7XG4gICAgICBidWJibGVzOiBmYWxzZSxcbiAgICAgIGNhbmNlbGFibGU6IGZhbHNlLFxuICAgICAgZGV0YWlsOiB2b2lkIDBcbiAgICB9LCBwYXJhbXMpO1xuICAgIGlmICh0eXBlb2Ygd2luZG93LkN1c3RvbUV2ZW50ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIHJldHVybiBuZXcgQ3VzdG9tRXZlbnQodHlwZSwgZXZlbnRQYXJhbXMpO1xuICAgIH1cbiAgICB2YXIgY3VzdG9tRXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudChcIkN1c3RvbUV2ZW50XCIpO1xuICAgIGN1c3RvbUV2ZW50LmluaXRDdXN0b21FdmVudCh0eXBlLCBldmVudFBhcmFtcy5idWJibGVzLCBldmVudFBhcmFtcy5jYW5jZWxhYmxlLCBldmVudFBhcmFtcy5kZXRhaWwpO1xuICAgIHJldHVybiBjdXN0b21FdmVudDtcbiAgfTtcbiAgdmFyIG1lZGl1bVpvb21Fc20gPSBmdW5jdGlvbiBtZWRpdW1ab29tKHNlbGVjdG9yKSB7XG4gICAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHZvaWQgMCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xuICAgIHZhciBQcm9taXNlMiA9IHdpbmRvdy5Qcm9taXNlIHx8IGZ1bmN0aW9uIFByb21pc2UzKGZuKSB7XG4gICAgICBmdW5jdGlvbiBub29wKCkge1xuICAgICAgfVxuICAgICAgZm4obm9vcCwgbm9vcCk7XG4gICAgfTtcbiAgICB2YXIgX2hhbmRsZUNsaWNrID0gZnVuY3Rpb24gX2hhbmRsZUNsaWNrMihldmVudCkge1xuICAgICAgdmFyIHRhcmdldCA9IGV2ZW50LnRhcmdldDtcbiAgICAgIGlmICh0YXJnZXQgPT09IG92ZXJsYXkpIHtcbiAgICAgICAgY2xvc2UoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGltYWdlcy5pbmRleE9mKHRhcmdldCkgPT09IC0xKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRvZ2dsZSh7IHRhcmdldCB9KTtcbiAgICB9O1xuICAgIHZhciBfaGFuZGxlU2Nyb2xsID0gZnVuY3Rpb24gX2hhbmRsZVNjcm9sbDIoKSB7XG4gICAgICBpZiAoaXNBbmltYXRpbmcgfHwgIWFjdGl2ZS5vcmlnaW5hbCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2YXIgY3VycmVudFNjcm9sbCA9IHdpbmRvdy5wYWdlWU9mZnNldCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wIHx8IGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wIHx8IDA7XG4gICAgICBpZiAoTWF0aC5hYnMoc2Nyb2xsVG9wIC0gY3VycmVudFNjcm9sbCkgPiB6b29tT3B0aW9ucy5zY3JvbGxPZmZzZXQpIHtcbiAgICAgICAgc2V0VGltZW91dChjbG9zZSwgMTUwKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHZhciBfaGFuZGxlS2V5VXAgPSBmdW5jdGlvbiBfaGFuZGxlS2V5VXAyKGV2ZW50KSB7XG4gICAgICB2YXIga2V5ID0gZXZlbnQua2V5IHx8IGV2ZW50LmtleUNvZGU7XG4gICAgICBpZiAoa2V5ID09PSBcIkVzY2FwZVwiIHx8IGtleSA9PT0gXCJFc2NcIiB8fCBrZXkgPT09IDI3KSB7XG4gICAgICAgIGNsb3NlKCk7XG4gICAgICB9XG4gICAgfTtcbiAgICB2YXIgdXBkYXRlID0gZnVuY3Rpb24gdXBkYXRlMigpIHtcbiAgICAgIHZhciBvcHRpb25zMiA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdm9pZCAwID8gYXJndW1lbnRzWzBdIDoge307XG4gICAgICB2YXIgbmV3T3B0aW9ucyA9IG9wdGlvbnMyO1xuICAgICAgaWYgKG9wdGlvbnMyLmJhY2tncm91bmQpIHtcbiAgICAgICAgb3ZlcmxheS5zdHlsZS5iYWNrZ3JvdW5kID0gb3B0aW9uczIuYmFja2dyb3VuZDtcbiAgICAgIH1cbiAgICAgIGlmIChvcHRpb25zMi5jb250YWluZXIgJiYgb3B0aW9uczIuY29udGFpbmVyIGluc3RhbmNlb2YgT2JqZWN0KSB7XG4gICAgICAgIG5ld09wdGlvbnMuY29udGFpbmVyID0gX2V4dGVuZHMoe30sIHpvb21PcHRpb25zLmNvbnRhaW5lciwgb3B0aW9uczIuY29udGFpbmVyKTtcbiAgICAgIH1cbiAgICAgIGlmIChvcHRpb25zMi50ZW1wbGF0ZSkge1xuICAgICAgICB2YXIgdGVtcGxhdGUgPSBpc05vZGUob3B0aW9uczIudGVtcGxhdGUpID8gb3B0aW9uczIudGVtcGxhdGUgOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKG9wdGlvbnMyLnRlbXBsYXRlKTtcbiAgICAgICAgbmV3T3B0aW9ucy50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuICAgICAgfVxuICAgICAgem9vbU9wdGlvbnMgPSBfZXh0ZW5kcyh7fSwgem9vbU9wdGlvbnMsIG5ld09wdGlvbnMpO1xuICAgICAgaW1hZ2VzLmZvckVhY2goZnVuY3Rpb24oaW1hZ2UpIHtcbiAgICAgICAgaW1hZ2UuZGlzcGF0Y2hFdmVudChjcmVhdGVDdXN0b21FdmVudChcIm1lZGl1bS16b29tOnVwZGF0ZVwiLCB7XG4gICAgICAgICAgZGV0YWlsOiB7IHpvb20gfVxuICAgICAgICB9KSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB6b29tO1xuICAgIH07XG4gICAgdmFyIGNsb25lID0gZnVuY3Rpb24gY2xvbmUyKCkge1xuICAgICAgdmFyIG9wdGlvbnMyID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB2b2lkIDAgPyBhcmd1bWVudHNbMF0gOiB7fTtcbiAgICAgIHJldHVybiBtZWRpdW1ab29tRXNtKF9leHRlbmRzKHt9LCB6b29tT3B0aW9ucywgb3B0aW9uczIpKTtcbiAgICB9O1xuICAgIHZhciBhdHRhY2ggPSBmdW5jdGlvbiBhdHRhY2gyKCkge1xuICAgICAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIHNlbGVjdG9ycyA9IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgICAgICBzZWxlY3RvcnNbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gICAgICB9XG4gICAgICB2YXIgbmV3SW1hZ2VzID0gc2VsZWN0b3JzLnJlZHVjZShmdW5jdGlvbihpbWFnZXNBY2N1bXVsYXRvciwgY3VycmVudFNlbGVjdG9yKSB7XG4gICAgICAgIHJldHVybiBbXS5jb25jYXQoaW1hZ2VzQWNjdW11bGF0b3IsIGdldEltYWdlc0Zyb21TZWxlY3RvcihjdXJyZW50U2VsZWN0b3IpKTtcbiAgICAgIH0sIFtdKTtcbiAgICAgIG5ld0ltYWdlcy5maWx0ZXIoZnVuY3Rpb24obmV3SW1hZ2UpIHtcbiAgICAgICAgcmV0dXJuIGltYWdlcy5pbmRleE9mKG5ld0ltYWdlKSA9PT0gLTE7XG4gICAgICB9KS5mb3JFYWNoKGZ1bmN0aW9uKG5ld0ltYWdlKSB7XG4gICAgICAgIGltYWdlcy5wdXNoKG5ld0ltYWdlKTtcbiAgICAgICAgbmV3SW1hZ2UuY2xhc3NMaXN0LmFkZChcIm1lZGl1bS16b29tLWltYWdlXCIpO1xuICAgICAgfSk7XG4gICAgICBldmVudExpc3RlbmVycy5mb3JFYWNoKGZ1bmN0aW9uKF9yZWYpIHtcbiAgICAgICAgdmFyIHR5cGUgPSBfcmVmLnR5cGUsIGxpc3RlbmVyID0gX3JlZi5saXN0ZW5lciwgb3B0aW9uczIgPSBfcmVmLm9wdGlvbnM7XG4gICAgICAgIG5ld0ltYWdlcy5mb3JFYWNoKGZ1bmN0aW9uKGltYWdlKSB7XG4gICAgICAgICAgaW1hZ2UuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgb3B0aW9uczIpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHpvb207XG4gICAgfTtcbiAgICB2YXIgZGV0YWNoID0gZnVuY3Rpb24gZGV0YWNoMigpIHtcbiAgICAgIGZvciAodmFyIF9sZW4yID0gYXJndW1lbnRzLmxlbmd0aCwgc2VsZWN0b3JzID0gQXJyYXkoX2xlbjIpLCBfa2V5MiA9IDA7IF9rZXkyIDwgX2xlbjI7IF9rZXkyKyspIHtcbiAgICAgICAgc2VsZWN0b3JzW19rZXkyXSA9IGFyZ3VtZW50c1tfa2V5Ml07XG4gICAgICB9XG4gICAgICBpZiAoYWN0aXZlLnpvb21lZCkge1xuICAgICAgICBjbG9zZSgpO1xuICAgICAgfVxuICAgICAgdmFyIGltYWdlc1RvRGV0YWNoID0gc2VsZWN0b3JzLmxlbmd0aCA+IDAgPyBzZWxlY3RvcnMucmVkdWNlKGZ1bmN0aW9uKGltYWdlc0FjY3VtdWxhdG9yLCBjdXJyZW50U2VsZWN0b3IpIHtcbiAgICAgICAgcmV0dXJuIFtdLmNvbmNhdChpbWFnZXNBY2N1bXVsYXRvciwgZ2V0SW1hZ2VzRnJvbVNlbGVjdG9yKGN1cnJlbnRTZWxlY3RvcikpO1xuICAgICAgfSwgW10pIDogaW1hZ2VzO1xuICAgICAgaW1hZ2VzVG9EZXRhY2guZm9yRWFjaChmdW5jdGlvbihpbWFnZSkge1xuICAgICAgICBpbWFnZS5jbGFzc0xpc3QucmVtb3ZlKFwibWVkaXVtLXpvb20taW1hZ2VcIik7XG4gICAgICAgIGltYWdlLmRpc3BhdGNoRXZlbnQoY3JlYXRlQ3VzdG9tRXZlbnQoXCJtZWRpdW0tem9vbTpkZXRhY2hcIiwge1xuICAgICAgICAgIGRldGFpbDogeyB6b29tIH1cbiAgICAgICAgfSkpO1xuICAgICAgfSk7XG4gICAgICBpbWFnZXMgPSBpbWFnZXMuZmlsdGVyKGZ1bmN0aW9uKGltYWdlKSB7XG4gICAgICAgIHJldHVybiBpbWFnZXNUb0RldGFjaC5pbmRleE9mKGltYWdlKSA9PT0gLTE7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB6b29tO1xuICAgIH07XG4gICAgdmFyIG9uID0gZnVuY3Rpb24gb24yKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICB2YXIgb3B0aW9uczIgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHZvaWQgMCA/IGFyZ3VtZW50c1syXSA6IHt9O1xuICAgICAgaW1hZ2VzLmZvckVhY2goZnVuY3Rpb24oaW1hZ2UpIHtcbiAgICAgICAgaW1hZ2UuYWRkRXZlbnRMaXN0ZW5lcihcIm1lZGl1bS16b29tOlwiICsgdHlwZSwgbGlzdGVuZXIsIG9wdGlvbnMyKTtcbiAgICAgIH0pO1xuICAgICAgZXZlbnRMaXN0ZW5lcnMucHVzaCh7IHR5cGU6IFwibWVkaXVtLXpvb206XCIgKyB0eXBlLCBsaXN0ZW5lciwgb3B0aW9uczogb3B0aW9uczIgfSk7XG4gICAgICByZXR1cm4gem9vbTtcbiAgICB9O1xuICAgIHZhciBvZmYgPSBmdW5jdGlvbiBvZmYyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICB2YXIgb3B0aW9uczIgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHZvaWQgMCA/IGFyZ3VtZW50c1syXSA6IHt9O1xuICAgICAgaW1hZ2VzLmZvckVhY2goZnVuY3Rpb24oaW1hZ2UpIHtcbiAgICAgICAgaW1hZ2UucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1lZGl1bS16b29tOlwiICsgdHlwZSwgbGlzdGVuZXIsIG9wdGlvbnMyKTtcbiAgICAgIH0pO1xuICAgICAgZXZlbnRMaXN0ZW5lcnMgPSBldmVudExpc3RlbmVycy5maWx0ZXIoZnVuY3Rpb24oZXZlbnRMaXN0ZW5lcikge1xuICAgICAgICByZXR1cm4gIShldmVudExpc3RlbmVyLnR5cGUgPT09IFwibWVkaXVtLXpvb206XCIgKyB0eXBlICYmIGV2ZW50TGlzdGVuZXIubGlzdGVuZXIudG9TdHJpbmcoKSA9PT0gbGlzdGVuZXIudG9TdHJpbmcoKSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB6b29tO1xuICAgIH07XG4gICAgdmFyIG9wZW4gPSBmdW5jdGlvbiBvcGVuMigpIHtcbiAgICAgIHZhciBfcmVmMiA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdm9pZCAwID8gYXJndW1lbnRzWzBdIDoge30sIHRhcmdldCA9IF9yZWYyLnRhcmdldDtcbiAgICAgIHZhciBfYW5pbWF0ZSA9IGZ1bmN0aW9uIF9hbmltYXRlMigpIHtcbiAgICAgICAgdmFyIGNvbnRhaW5lciA9IHtcbiAgICAgICAgICB3aWR0aDogZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoLFxuICAgICAgICAgIGhlaWdodDogZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCxcbiAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgIHRvcDogMCxcbiAgICAgICAgICByaWdodDogMCxcbiAgICAgICAgICBib3R0b206IDBcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHZpZXdwb3J0V2lkdGggPSB2b2lkIDA7XG4gICAgICAgIHZhciB2aWV3cG9ydEhlaWdodCA9IHZvaWQgMDtcbiAgICAgICAgaWYgKHpvb21PcHRpb25zLmNvbnRhaW5lcikge1xuICAgICAgICAgIGlmICh6b29tT3B0aW9ucy5jb250YWluZXIgaW5zdGFuY2VvZiBPYmplY3QpIHtcbiAgICAgICAgICAgIGNvbnRhaW5lciA9IF9leHRlbmRzKHt9LCBjb250YWluZXIsIHpvb21PcHRpb25zLmNvbnRhaW5lcik7XG4gICAgICAgICAgICB2aWV3cG9ydFdpZHRoID0gY29udGFpbmVyLndpZHRoIC0gY29udGFpbmVyLmxlZnQgLSBjb250YWluZXIucmlnaHQgLSB6b29tT3B0aW9ucy5tYXJnaW4gKiAyO1xuICAgICAgICAgICAgdmlld3BvcnRIZWlnaHQgPSBjb250YWluZXIuaGVpZ2h0IC0gY29udGFpbmVyLnRvcCAtIGNvbnRhaW5lci5ib3R0b20gLSB6b29tT3B0aW9ucy5tYXJnaW4gKiAyO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgem9vbUNvbnRhaW5lciA9IGlzTm9kZSh6b29tT3B0aW9ucy5jb250YWluZXIpID8gem9vbU9wdGlvbnMuY29udGFpbmVyIDogZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih6b29tT3B0aW9ucy5jb250YWluZXIpO1xuICAgICAgICAgICAgdmFyIF96b29tQ29udGFpbmVyJGdldEJvdSA9IHpvb21Db250YWluZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksIF93aWR0aCA9IF96b29tQ29udGFpbmVyJGdldEJvdS53aWR0aCwgX2hlaWdodCA9IF96b29tQ29udGFpbmVyJGdldEJvdS5oZWlnaHQsIF9sZWZ0ID0gX3pvb21Db250YWluZXIkZ2V0Qm91LmxlZnQsIF90b3AgPSBfem9vbUNvbnRhaW5lciRnZXRCb3UudG9wO1xuICAgICAgICAgICAgY29udGFpbmVyID0gX2V4dGVuZHMoe30sIGNvbnRhaW5lciwge1xuICAgICAgICAgICAgICB3aWR0aDogX3dpZHRoLFxuICAgICAgICAgICAgICBoZWlnaHQ6IF9oZWlnaHQsXG4gICAgICAgICAgICAgIGxlZnQ6IF9sZWZ0LFxuICAgICAgICAgICAgICB0b3A6IF90b3BcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2aWV3cG9ydFdpZHRoID0gdmlld3BvcnRXaWR0aCB8fCBjb250YWluZXIud2lkdGggLSB6b29tT3B0aW9ucy5tYXJnaW4gKiAyO1xuICAgICAgICB2aWV3cG9ydEhlaWdodCA9IHZpZXdwb3J0SGVpZ2h0IHx8IGNvbnRhaW5lci5oZWlnaHQgLSB6b29tT3B0aW9ucy5tYXJnaW4gKiAyO1xuICAgICAgICB2YXIgem9vbVRhcmdldCA9IGFjdGl2ZS56b29tZWRIZCB8fCBhY3RpdmUub3JpZ2luYWw7XG4gICAgICAgIHZhciBuYXR1cmFsV2lkdGggPSBpc1N2Zyh6b29tVGFyZ2V0KSA/IHZpZXdwb3J0V2lkdGggOiB6b29tVGFyZ2V0Lm5hdHVyYWxXaWR0aCB8fCB2aWV3cG9ydFdpZHRoO1xuICAgICAgICB2YXIgbmF0dXJhbEhlaWdodCA9IGlzU3ZnKHpvb21UYXJnZXQpID8gdmlld3BvcnRIZWlnaHQgOiB6b29tVGFyZ2V0Lm5hdHVyYWxIZWlnaHQgfHwgdmlld3BvcnRIZWlnaHQ7XG4gICAgICAgIHZhciBfem9vbVRhcmdldCRnZXRCb3VuZGkgPSB6b29tVGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLCB0b3AgPSBfem9vbVRhcmdldCRnZXRCb3VuZGkudG9wLCBsZWZ0ID0gX3pvb21UYXJnZXQkZ2V0Qm91bmRpLmxlZnQsIHdpZHRoID0gX3pvb21UYXJnZXQkZ2V0Qm91bmRpLndpZHRoLCBoZWlnaHQgPSBfem9vbVRhcmdldCRnZXRCb3VuZGkuaGVpZ2h0O1xuICAgICAgICB2YXIgc2NhbGVYID0gTWF0aC5taW4obmF0dXJhbFdpZHRoLCB2aWV3cG9ydFdpZHRoKSAvIHdpZHRoO1xuICAgICAgICB2YXIgc2NhbGVZID0gTWF0aC5taW4obmF0dXJhbEhlaWdodCwgdmlld3BvcnRIZWlnaHQpIC8gaGVpZ2h0O1xuICAgICAgICB2YXIgc2NhbGUgPSBNYXRoLm1pbihzY2FsZVgsIHNjYWxlWSk7XG4gICAgICAgIHZhciB0cmFuc2xhdGVYID0gKC1sZWZ0ICsgKHZpZXdwb3J0V2lkdGggLSB3aWR0aCkgLyAyICsgem9vbU9wdGlvbnMubWFyZ2luICsgY29udGFpbmVyLmxlZnQpIC8gc2NhbGU7XG4gICAgICAgIHZhciB0cmFuc2xhdGVZID0gKC10b3AgKyAodmlld3BvcnRIZWlnaHQgLSBoZWlnaHQpIC8gMiArIHpvb21PcHRpb25zLm1hcmdpbiArIGNvbnRhaW5lci50b3ApIC8gc2NhbGU7XG4gICAgICAgIHZhciB0cmFuc2Zvcm0gPSBcInNjYWxlKFwiICsgc2NhbGUgKyBcIikgdHJhbnNsYXRlM2QoXCIgKyB0cmFuc2xhdGVYICsgXCJweCwgXCIgKyB0cmFuc2xhdGVZICsgXCJweCwgMClcIjtcbiAgICAgICAgYWN0aXZlLnpvb21lZC5zdHlsZS50cmFuc2Zvcm0gPSB0cmFuc2Zvcm07XG4gICAgICAgIGlmIChhY3RpdmUuem9vbWVkSGQpIHtcbiAgICAgICAgICBhY3RpdmUuem9vbWVkSGQuc3R5bGUudHJhbnNmb3JtID0gdHJhbnNmb3JtO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlMihmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICAgIGlmICh0YXJnZXQgJiYgaW1hZ2VzLmluZGV4T2YodGFyZ2V0KSA9PT0gLTEpIHtcbiAgICAgICAgICByZXNvbHZlKHpvb20pO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgX2hhbmRsZU9wZW5FbmQgPSBmdW5jdGlvbiBfaGFuZGxlT3BlbkVuZDIoKSB7XG4gICAgICAgICAgaXNBbmltYXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICBhY3RpdmUuem9vbWVkLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0cmFuc2l0aW9uZW5kXCIsIF9oYW5kbGVPcGVuRW5kMik7XG4gICAgICAgICAgYWN0aXZlLm9yaWdpbmFsLmRpc3BhdGNoRXZlbnQoY3JlYXRlQ3VzdG9tRXZlbnQoXCJtZWRpdW0tem9vbTpvcGVuZWRcIiwge1xuICAgICAgICAgICAgZGV0YWlsOiB7IHpvb20gfVxuICAgICAgICAgIH0pKTtcbiAgICAgICAgICByZXNvbHZlKHpvb20pO1xuICAgICAgICB9O1xuICAgICAgICBpZiAoYWN0aXZlLnpvb21lZCkge1xuICAgICAgICAgIHJlc29sdmUoem9vbSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0YXJnZXQpIHtcbiAgICAgICAgICBhY3RpdmUub3JpZ2luYWwgPSB0YXJnZXQ7XG4gICAgICAgIH0gZWxzZSBpZiAoaW1hZ2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICB2YXIgX2ltYWdlcyA9IGltYWdlcztcbiAgICAgICAgICBhY3RpdmUub3JpZ2luYWwgPSBfaW1hZ2VzWzBdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc29sdmUoem9vbSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGFjdGl2ZS5vcmlnaW5hbC5kaXNwYXRjaEV2ZW50KGNyZWF0ZUN1c3RvbUV2ZW50KFwibWVkaXVtLXpvb206b3BlblwiLCB7XG4gICAgICAgICAgZGV0YWlsOiB7IHpvb20gfVxuICAgICAgICB9KSk7XG4gICAgICAgIHNjcm9sbFRvcCA9IHdpbmRvdy5wYWdlWU9mZnNldCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wIHx8IGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wIHx8IDA7XG4gICAgICAgIGlzQW5pbWF0aW5nID0gdHJ1ZTtcbiAgICAgICAgYWN0aXZlLnpvb21lZCA9IGNsb25lVGFyZ2V0KGFjdGl2ZS5vcmlnaW5hbCk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQob3ZlcmxheSk7XG4gICAgICAgIGlmICh6b29tT3B0aW9ucy50ZW1wbGF0ZSkge1xuICAgICAgICAgIHZhciB0ZW1wbGF0ZSA9IGlzTm9kZSh6b29tT3B0aW9ucy50ZW1wbGF0ZSkgPyB6b29tT3B0aW9ucy50ZW1wbGF0ZSA6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioem9vbU9wdGlvbnMudGVtcGxhdGUpO1xuICAgICAgICAgIGFjdGl2ZS50ZW1wbGF0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgICAgYWN0aXZlLnRlbXBsYXRlLmFwcGVuZENoaWxkKHRlbXBsYXRlLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpKTtcbiAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGFjdGl2ZS50ZW1wbGF0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChhY3RpdmUuem9vbWVkKTtcbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoXCJtZWRpdW0tem9vbS0tb3BlbmVkXCIpO1xuICAgICAgICB9KTtcbiAgICAgICAgYWN0aXZlLm9yaWdpbmFsLmNsYXNzTGlzdC5hZGQoXCJtZWRpdW0tem9vbS1pbWFnZS0taGlkZGVuXCIpO1xuICAgICAgICBhY3RpdmUuem9vbWVkLmNsYXNzTGlzdC5hZGQoXCJtZWRpdW0tem9vbS1pbWFnZS0tb3BlbmVkXCIpO1xuICAgICAgICBhY3RpdmUuem9vbWVkLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjbG9zZSk7XG4gICAgICAgIGFjdGl2ZS56b29tZWQuYWRkRXZlbnRMaXN0ZW5lcihcInRyYW5zaXRpb25lbmRcIiwgX2hhbmRsZU9wZW5FbmQpO1xuICAgICAgICBpZiAoYWN0aXZlLm9yaWdpbmFsLmdldEF0dHJpYnV0ZShcImRhdGEtem9vbS1zcmNcIikpIHtcbiAgICAgICAgICBhY3RpdmUuem9vbWVkSGQgPSBhY3RpdmUuem9vbWVkLmNsb25lTm9kZSgpO1xuICAgICAgICAgIGFjdGl2ZS56b29tZWRIZC5yZW1vdmVBdHRyaWJ1dGUoXCJzcmNzZXRcIik7XG4gICAgICAgICAgYWN0aXZlLnpvb21lZEhkLnJlbW92ZUF0dHJpYnV0ZShcInNpemVzXCIpO1xuICAgICAgICAgIGFjdGl2ZS56b29tZWRIZC5zcmMgPSBhY3RpdmUuem9vbWVkLmdldEF0dHJpYnV0ZShcImRhdGEtem9vbS1zcmNcIik7XG4gICAgICAgICAgYWN0aXZlLnpvb21lZEhkLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoZ2V0Wm9vbVRhcmdldFNpemUpO1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiVW5hYmxlIHRvIHJlYWNoIHRoZSB6b29tIGltYWdlIHRhcmdldCBcIiArIGFjdGl2ZS56b29tZWRIZC5zcmMpO1xuICAgICAgICAgICAgYWN0aXZlLnpvb21lZEhkID0gbnVsbDtcbiAgICAgICAgICAgIF9hbmltYXRlKCk7XG4gICAgICAgICAgfTtcbiAgICAgICAgICB2YXIgZ2V0Wm9vbVRhcmdldFNpemUgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChhY3RpdmUuem9vbWVkSGQuY29tcGxldGUpIHtcbiAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChnZXRab29tVGFyZ2V0U2l6ZSk7XG4gICAgICAgICAgICAgIGFjdGl2ZS56b29tZWRIZC5jbGFzc0xpc3QuYWRkKFwibWVkaXVtLXpvb20taW1hZ2UtLW9wZW5lZFwiKTtcbiAgICAgICAgICAgICAgYWN0aXZlLnpvb21lZEhkLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjbG9zZSk7XG4gICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYWN0aXZlLnpvb21lZEhkKTtcbiAgICAgICAgICAgICAgX2FuaW1hdGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LCAxMCk7XG4gICAgICAgIH0gZWxzZSBpZiAoYWN0aXZlLm9yaWdpbmFsLmhhc0F0dHJpYnV0ZShcInNyY3NldFwiKSkge1xuICAgICAgICAgIGFjdGl2ZS56b29tZWRIZCA9IGFjdGl2ZS56b29tZWQuY2xvbmVOb2RlKCk7XG4gICAgICAgICAgYWN0aXZlLnpvb21lZEhkLnJlbW92ZUF0dHJpYnV0ZShcInNpemVzXCIpO1xuICAgICAgICAgIGFjdGl2ZS56b29tZWRIZC5yZW1vdmVBdHRyaWJ1dGUoXCJsb2FkaW5nXCIpO1xuICAgICAgICAgIHZhciBsb2FkRXZlbnRMaXN0ZW5lciA9IGFjdGl2ZS56b29tZWRIZC5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGFjdGl2ZS56b29tZWRIZC5yZW1vdmVFdmVudExpc3RlbmVyKFwibG9hZFwiLCBsb2FkRXZlbnRMaXN0ZW5lcik7XG4gICAgICAgICAgICBhY3RpdmUuem9vbWVkSGQuY2xhc3NMaXN0LmFkZChcIm1lZGl1bS16b29tLWltYWdlLS1vcGVuZWRcIik7XG4gICAgICAgICAgICBhY3RpdmUuem9vbWVkSGQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGNsb3NlKTtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYWN0aXZlLnpvb21lZEhkKTtcbiAgICAgICAgICAgIF9hbmltYXRlKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgX2FuaW1hdGUoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcbiAgICB2YXIgY2xvc2UgPSBmdW5jdGlvbiBjbG9zZTIoKSB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UyKGZ1bmN0aW9uKHJlc29sdmUpIHtcbiAgICAgICAgaWYgKGlzQW5pbWF0aW5nIHx8ICFhY3RpdmUub3JpZ2luYWwpIHtcbiAgICAgICAgICByZXNvbHZlKHpvb20pO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgX2hhbmRsZUNsb3NlRW5kID0gZnVuY3Rpb24gX2hhbmRsZUNsb3NlRW5kMigpIHtcbiAgICAgICAgICBhY3RpdmUub3JpZ2luYWwuY2xhc3NMaXN0LnJlbW92ZShcIm1lZGl1bS16b29tLWltYWdlLS1oaWRkZW5cIik7XG4gICAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChhY3RpdmUuem9vbWVkKTtcbiAgICAgICAgICBpZiAoYWN0aXZlLnpvb21lZEhkKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGFjdGl2ZS56b29tZWRIZCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQob3ZlcmxheSk7XG4gICAgICAgICAgYWN0aXZlLnpvb21lZC5jbGFzc0xpc3QucmVtb3ZlKFwibWVkaXVtLXpvb20taW1hZ2UtLW9wZW5lZFwiKTtcbiAgICAgICAgICBpZiAoYWN0aXZlLnRlbXBsYXRlKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGFjdGl2ZS50ZW1wbGF0ZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlzQW5pbWF0aW5nID0gZmFsc2U7XG4gICAgICAgICAgYWN0aXZlLnpvb21lZC5yZW1vdmVFdmVudExpc3RlbmVyKFwidHJhbnNpdGlvbmVuZFwiLCBfaGFuZGxlQ2xvc2VFbmQyKTtcbiAgICAgICAgICBhY3RpdmUub3JpZ2luYWwuZGlzcGF0Y2hFdmVudChjcmVhdGVDdXN0b21FdmVudChcIm1lZGl1bS16b29tOmNsb3NlZFwiLCB7XG4gICAgICAgICAgICBkZXRhaWw6IHsgem9vbSB9XG4gICAgICAgICAgfSkpO1xuICAgICAgICAgIGFjdGl2ZS5vcmlnaW5hbCA9IG51bGw7XG4gICAgICAgICAgYWN0aXZlLnpvb21lZCA9IG51bGw7XG4gICAgICAgICAgYWN0aXZlLnpvb21lZEhkID0gbnVsbDtcbiAgICAgICAgICBhY3RpdmUudGVtcGxhdGUgPSBudWxsO1xuICAgICAgICAgIHJlc29sdmUoem9vbSk7XG4gICAgICAgIH07XG4gICAgICAgIGlzQW5pbWF0aW5nID0gdHJ1ZTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKFwibWVkaXVtLXpvb20tLW9wZW5lZFwiKTtcbiAgICAgICAgYWN0aXZlLnpvb21lZC5zdHlsZS50cmFuc2Zvcm0gPSBcIlwiO1xuICAgICAgICBpZiAoYWN0aXZlLnpvb21lZEhkKSB7XG4gICAgICAgICAgYWN0aXZlLnpvb21lZEhkLnN0eWxlLnRyYW5zZm9ybSA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFjdGl2ZS50ZW1wbGF0ZSkge1xuICAgICAgICAgIGFjdGl2ZS50ZW1wbGF0ZS5zdHlsZS50cmFuc2l0aW9uID0gXCJvcGFjaXR5IDE1MG1zXCI7XG4gICAgICAgICAgYWN0aXZlLnRlbXBsYXRlLnN0eWxlLm9wYWNpdHkgPSAwO1xuICAgICAgICB9XG4gICAgICAgIGFjdGl2ZS5vcmlnaW5hbC5kaXNwYXRjaEV2ZW50KGNyZWF0ZUN1c3RvbUV2ZW50KFwibWVkaXVtLXpvb206Y2xvc2VcIiwge1xuICAgICAgICAgIGRldGFpbDogeyB6b29tIH1cbiAgICAgICAgfSkpO1xuICAgICAgICBhY3RpdmUuem9vbWVkLmFkZEV2ZW50TGlzdGVuZXIoXCJ0cmFuc2l0aW9uZW5kXCIsIF9oYW5kbGVDbG9zZUVuZCk7XG4gICAgICB9KTtcbiAgICB9O1xuICAgIHZhciB0b2dnbGUgPSBmdW5jdGlvbiB0b2dnbGUyKCkge1xuICAgICAgdmFyIF9yZWYzID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB2b2lkIDAgPyBhcmd1bWVudHNbMF0gOiB7fSwgdGFyZ2V0ID0gX3JlZjMudGFyZ2V0O1xuICAgICAgaWYgKGFjdGl2ZS5vcmlnaW5hbCkge1xuICAgICAgICByZXR1cm4gY2xvc2UoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvcGVuKHsgdGFyZ2V0IH0pO1xuICAgIH07XG4gICAgdmFyIGdldE9wdGlvbnMgPSBmdW5jdGlvbiBnZXRPcHRpb25zMigpIHtcbiAgICAgIHJldHVybiB6b29tT3B0aW9ucztcbiAgICB9O1xuICAgIHZhciBnZXRJbWFnZXMgPSBmdW5jdGlvbiBnZXRJbWFnZXMyKCkge1xuICAgICAgcmV0dXJuIGltYWdlcztcbiAgICB9O1xuICAgIHZhciBnZXRab29tZWRJbWFnZSA9IGZ1bmN0aW9uIGdldFpvb21lZEltYWdlMigpIHtcbiAgICAgIHJldHVybiBhY3RpdmUub3JpZ2luYWw7XG4gICAgfTtcbiAgICB2YXIgaW1hZ2VzID0gW107XG4gICAgdmFyIGV2ZW50TGlzdGVuZXJzID0gW107XG4gICAgdmFyIGlzQW5pbWF0aW5nID0gZmFsc2U7XG4gICAgdmFyIHNjcm9sbFRvcCA9IDA7XG4gICAgdmFyIHpvb21PcHRpb25zID0gb3B0aW9ucztcbiAgICB2YXIgYWN0aXZlID0ge1xuICAgICAgb3JpZ2luYWw6IG51bGwsXG4gICAgICB6b29tZWQ6IG51bGwsXG4gICAgICB6b29tZWRIZDogbnVsbCxcbiAgICAgIHRlbXBsYXRlOiBudWxsXG4gICAgICAvLyBJZiB0aGUgc2VsZWN0b3IgaXMgb21pdHRlZCwgaXQncyByZXBsYWNlZCBieSB0aGUgb3B0aW9uc1xuICAgIH07XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChzZWxlY3RvcikgPT09IFwiW29iamVjdCBPYmplY3RdXCIpIHtcbiAgICAgIHpvb21PcHRpb25zID0gc2VsZWN0b3I7XG4gICAgfSBlbHNlIGlmIChzZWxlY3RvciB8fCB0eXBlb2Ygc2VsZWN0b3IgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIGF0dGFjaChzZWxlY3Rvcik7XG4gICAgfVxuICAgIHpvb21PcHRpb25zID0gX2V4dGVuZHMoe1xuICAgICAgbWFyZ2luOiAwLFxuICAgICAgYmFja2dyb3VuZDogXCIjZmZmXCIsXG4gICAgICBzY3JvbGxPZmZzZXQ6IDQwLFxuICAgICAgY29udGFpbmVyOiBudWxsLFxuICAgICAgdGVtcGxhdGU6IG51bGxcbiAgICB9LCB6b29tT3B0aW9ucyk7XG4gICAgdmFyIG92ZXJsYXkgPSBjcmVhdGVPdmVybGF5KHpvb21PcHRpb25zLmJhY2tncm91bmQpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBfaGFuZGxlQ2xpY2spO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCBfaGFuZGxlS2V5VXApO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIiwgX2hhbmRsZVNjcm9sbCk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgY2xvc2UpO1xuICAgIHZhciB6b29tID0ge1xuICAgICAgb3BlbixcbiAgICAgIGNsb3NlLFxuICAgICAgdG9nZ2xlLFxuICAgICAgdXBkYXRlLFxuICAgICAgY2xvbmUsXG4gICAgICBhdHRhY2gsXG4gICAgICBkZXRhY2gsXG4gICAgICBvbixcbiAgICAgIG9mZixcbiAgICAgIGdldE9wdGlvbnMsXG4gICAgICBnZXRJbWFnZXMsXG4gICAgICBnZXRab29tZWRJbWFnZVxuICAgIH07XG4gICAgcmV0dXJuIHpvb207XG4gIH07XG4gIGZ1bmN0aW9uIHN0eWxlSW5qZWN0KGNzczIsIHJlZikge1xuICAgIGlmIChyZWYgPT09IHZvaWQgMCkgcmVmID0ge307XG4gICAgdmFyIGluc2VydEF0ID0gcmVmLmluc2VydEF0O1xuICAgIGlmICghY3NzMiB8fCB0eXBlb2YgZG9jdW1lbnQgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIGhlYWQgPSBkb2N1bWVudC5oZWFkIHx8IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaGVhZFwiKVswXTtcbiAgICB2YXIgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG4gICAgc3R5bGUudHlwZSA9IFwidGV4dC9jc3NcIjtcbiAgICBpZiAoaW5zZXJ0QXQgPT09IFwidG9wXCIpIHtcbiAgICAgIGlmIChoZWFkLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgaGVhZC5pbnNlcnRCZWZvcmUoc3R5bGUsIGhlYWQuZmlyc3RDaGlsZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBoZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaGVhZC5hcHBlbmRDaGlsZChzdHlsZSk7XG4gICAgfVxuICAgIGlmIChzdHlsZS5zdHlsZVNoZWV0KSB7XG4gICAgICBzdHlsZS5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3MyO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHlsZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MyKSk7XG4gICAgfVxuICB9XG4gIHZhciBjc3MgPSBcIi5tZWRpdW0tem9vbS1vdmVybGF5e3Bvc2l0aW9uOmZpeGVkO3RvcDowO3JpZ2h0OjA7Ym90dG9tOjA7bGVmdDowO29wYWNpdHk6MDt0cmFuc2l0aW9uOm9wYWNpdHkgLjNzO3dpbGwtY2hhbmdlOm9wYWNpdHl9Lm1lZGl1bS16b29tLS1vcGVuZWQgLm1lZGl1bS16b29tLW92ZXJsYXl7Y3Vyc29yOnBvaW50ZXI7Y3Vyc29yOnpvb20tb3V0O29wYWNpdHk6MX0ubWVkaXVtLXpvb20taW1hZ2V7Y3Vyc29yOnBvaW50ZXI7Y3Vyc29yOnpvb20taW47dHJhbnNpdGlvbjp0cmFuc2Zvcm0gLjNzIGN1YmljLWJlemllciguMiwwLC4yLDEpIWltcG9ydGFudH0ubWVkaXVtLXpvb20taW1hZ2UtLWhpZGRlbnt2aXNpYmlsaXR5OmhpZGRlbn0ubWVkaXVtLXpvb20taW1hZ2UtLW9wZW5lZHtwb3NpdGlvbjpyZWxhdGl2ZTtjdXJzb3I6cG9pbnRlcjtjdXJzb3I6em9vbS1vdXQ7d2lsbC1jaGFuZ2U6dHJhbnNmb3JtfVwiO1xuICBzdHlsZUluamVjdChjc3MpO1xuICB2YXIgbWVkaXVtX3pvb21fZXNtX2RlZmF1bHQgPSBtZWRpdW1ab29tRXNtO1xuXG4gIC8vIG5zLWh1Z28tcGFyYW1zOjxzdGRpbj5cbiAgdmFyIGNvZGVIaWdobGlnaHRpbmcgPSBmYWxzZTtcbiAgdmFyIGh1Z29FbnZpcm9ubWVudCA9IFwiZGV2ZWxvcG1lbnRcIjtcbiAgdmFyIHNlYXJjaEVuYWJsZWQgPSB0cnVlO1xuXG4gIC8vIG5zLWh1Z28taW1wOi9Wb2x1bWVzL0F0cmVvU1NEL2hvbWVwYWdlMjAyNi9hc3NldHMvanMvc2l0ZS11dGlscy5qc1xuICBmdW5jdGlvbiBmaXhNZXJtYWlkKHJlbmRlciA9IGZhbHNlKSB7XG4gICAgbGV0IG1lcm1haWRzID0gW107XG4gICAgW10ucHVzaC5hcHBseShtZXJtYWlkcywgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcImxhbmd1YWdlLW1lcm1haWRcIikpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbWVybWFpZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBtZXJtYWlkQ29kZUVsZW1lbnQgPSBtZXJtYWlkc1tpXTtcbiAgICAgIGxldCBuZXdFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgIG5ld0VsZW1lbnQuaW5uZXJIVE1MID0gbWVybWFpZENvZGVFbGVtZW50LmlubmVySFRNTDtcbiAgICAgIG5ld0VsZW1lbnQuY2xhc3NMaXN0LmFkZChcIm1lcm1haWRcIik7XG4gICAgICBpZiAocmVuZGVyKSB7XG4gICAgICAgIHdpbmRvdy5tZXJtYWlkLm1lcm1haWRBUEkucmVuZGVyKGBtZXJtYWlkLSR7aX1gLCBuZXdFbGVtZW50LnRleHRDb250ZW50LCBmdW5jdGlvbihzdmdDb2RlKSB7XG4gICAgICAgICAgbmV3RWxlbWVudC5pbm5lckhUTUwgPSBzdmdDb2RlO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIG1lcm1haWRDb2RlRWxlbWVudC5wYXJlbnROb2RlLnJlcGxhY2VXaXRoKG5ld0VsZW1lbnQpO1xuICAgIH1cbiAgICBjb25zb2xlLmRlYnVnKGBQcm9jZXNzZWQgJHttZXJtYWlkcy5sZW5ndGh9IE1lcm1haWQgY29kZSBibG9ja3NgKTtcbiAgfVxuICBmdW5jdGlvbiBzY3JvbGxQYXJlbnRUb0NoaWxkKHBhcmVudCwgY2hpbGQpIHtcbiAgICBjb25zdCBwYXJlbnRSZWN0ID0gcGFyZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IHBhcmVudFZpZXdhYmxlQXJlYSA9IHtcbiAgICAgIGhlaWdodDogcGFyZW50LmNsaWVudEhlaWdodCxcbiAgICAgIHdpZHRoOiBwYXJlbnQuY2xpZW50V2lkdGhcbiAgICB9O1xuICAgIGNvbnN0IGNoaWxkUmVjdCA9IGNoaWxkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IGlzQ2hpbGRJblZpZXcgPSBjaGlsZFJlY3QudG9wID49IHBhcmVudFJlY3QudG9wICYmIGNoaWxkUmVjdC5ib3R0b20gPD0gcGFyZW50UmVjdC50b3AgKyBwYXJlbnRWaWV3YWJsZUFyZWEuaGVpZ2h0O1xuICAgIGlmICghaXNDaGlsZEluVmlldykge1xuICAgICAgcGFyZW50LnNjcm9sbFRvcCA9IGNoaWxkUmVjdC50b3AgKyBwYXJlbnQuc2Nyb2xsVG9wIC0gcGFyZW50UmVjdC50b3A7XG4gICAgfVxuICB9XG5cbiAgLy8gbnMtaHVnby1pbXA6L1ZvbHVtZXMvQXRyZW9TU0QvaG9tZXBhZ2UyMDI2L2Fzc2V0cy9qcy9zaXRlLWFuaW1hdGlvbi5qc1xuICBmdW5jdGlvbiBmYWRlSW4oZWxlbWVudCwgZHVyYXRpb24gPSA2MDApIHtcbiAgICBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBcIlwiO1xuICAgIGVsZW1lbnQuc3R5bGUub3BhY2l0eSA9IFwiMFwiO1xuICAgIGxldCBsYXN0ID0gKy8qIEBfX1BVUkVfXyAqLyBuZXcgRGF0ZSgpO1xuICAgIGxldCB0aWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICBlbGVtZW50LnN0eWxlLm9wYWNpdHkgPSAoK2VsZW1lbnQuc3R5bGUub3BhY2l0eSArICgvKiBAX19QVVJFX18gKi8gbmV3IERhdGUoKSAtIGxhc3QpIC8gZHVyYXRpb24pLnRvU3RyaW5nKCk7XG4gICAgICBsYXN0ID0gKy8qIEBfX1BVUkVfXyAqLyBuZXcgRGF0ZSgpO1xuICAgICAgaWYgKCtlbGVtZW50LnN0eWxlLm9wYWNpdHkgPCAxKSB7XG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgJiYgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRpY2spIHx8IHNldFRpbWVvdXQodGljaywgMTYpO1xuICAgICAgfVxuICAgIH07XG4gICAgdGljaygpO1xuICB9XG5cbiAgLy8gbnMtaHVnby1pbXA6L1ZvbHVtZXMvQXRyZW9TU0QvaG9tZXBhZ2UyMDI2L2Fzc2V0cy9qcy9zaXRlLXRoZW1pbmcuanNcbiAgdmFyIGJvZHkgPSBkb2N1bWVudC5ib2R5O1xuICBmdW5jdGlvbiBnZXRUaGVtZU1vZGUoKSB7XG4gICAgcmV0dXJuIHBhcnNlSW50KGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwid2NUaGVtZVwiKSB8fCAyKTtcbiAgfVxuICBmdW5jdGlvbiBjYW5DaGFuZ2VUaGVtZSgpIHtcbiAgICByZXR1cm4gQm9vbGVhbih3aW5kb3cud2MuZGFya0xpZ2h0RW5hYmxlZCk7XG4gIH1cbiAgZnVuY3Rpb24gaW5pdFRoZW1lVmFyaWF0aW9uKCkge1xuICAgIGlmICghY2FuQ2hhbmdlVGhlbWUoKSkge1xuICAgICAgY29uc29sZS5kZWJ1ZyhcIlVzZXIgdGhlbWluZyBkaXNhYmxlZC5cIik7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBpc0RhcmtUaGVtZTogd2luZG93LndjLmlzU2l0ZVRoZW1lRGFyayxcbiAgICAgICAgdGhlbWVNb2RlOiB3aW5kb3cud2MuaXNTaXRlVGhlbWVEYXJrID8gMSA6IDBcbiAgICAgIH07XG4gICAgfVxuICAgIGNvbnNvbGUuZGVidWcoXCJVc2VyIHRoZW1pbmcgZW5hYmxlZC5cIik7XG4gICAgbGV0IGlzRGFya1RoZW1lO1xuICAgIGxldCBjdXJyZW50VGhlbWVNb2RlID0gZ2V0VGhlbWVNb2RlKCk7XG4gICAgY29uc29sZS5kZWJ1ZyhgVXNlcidzIHRoZW1lIHZhcmlhdGlvbjogJHtjdXJyZW50VGhlbWVNb2RlfWApO1xuICAgIHN3aXRjaCAoY3VycmVudFRoZW1lTW9kZSkge1xuICAgICAgY2FzZSAwOlxuICAgICAgICBpc0RhcmtUaGVtZSA9IGZhbHNlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaXNEYXJrVGhlbWUgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmICh3aW5kb3cubWF0Y2hNZWRpYShcIihwcmVmZXJzLWNvbG9yLXNjaGVtZTogZGFyaylcIikubWF0Y2hlcykge1xuICAgICAgICAgIGlzRGFya1RoZW1lID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmICh3aW5kb3cubWF0Y2hNZWRpYShcIihwcmVmZXJzLWNvbG9yLXNjaGVtZTogbGlnaHQpXCIpLm1hdGNoZXMpIHtcbiAgICAgICAgICBpc0RhcmtUaGVtZSA9IGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlzRGFya1RoZW1lID0gd2luZG93LndjLmlzU2l0ZVRoZW1lRGFyaztcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgaWYgKGlzRGFya1RoZW1lICYmICFib2R5LmNsYXNzTGlzdC5jb250YWlucyhcImRhcmtcIikpIHtcbiAgICAgIGNvbnNvbGUuZGVidWcoXCJBcHBseWluZyBkYXJrIHRoZW1lXCIpO1xuICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKFwiZGFya1wiKTtcbiAgICB9IGVsc2UgaWYgKCFpc0RhcmtUaGVtZSAmJiBib2R5LmNsYXNzTGlzdC5jb250YWlucyhcImRhcmtcIikpIHtcbiAgICAgIGNvbnNvbGUuZGVidWcoXCJBcHBseWluZyBsaWdodCB0aGVtZVwiKTtcbiAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZShcImRhcmtcIik7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBpc0RhcmtUaGVtZSxcbiAgICAgIHRoZW1lTW9kZTogY3VycmVudFRoZW1lTW9kZVxuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gY2hhbmdlVGhlbWVNb2RlQ2xpY2sobmV3TW9kZSkge1xuICAgIGlmICghY2FuQ2hhbmdlVGhlbWUoKSkge1xuICAgICAgY29uc29sZS5kZWJ1ZyhcIkNhbm5vdCBjaGFuZ2UgdGhlbWUgLSB1c2VyIHRoZW1pbmcgZGlzYWJsZWQuXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsZXQgaXNEYXJrVGhlbWU7XG4gICAgc3dpdGNoIChuZXdNb2RlKSB7XG4gICAgICBjYXNlIDA6XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwid2NUaGVtZVwiLCBcIjBcIik7XG4gICAgICAgIGlzRGFya1RoZW1lID0gZmFsc2U7XG4gICAgICAgIGNvbnNvbGUuZGVidWcoXCJVc2VyIGNoYW5nZWQgdGhlbWUgdmFyaWF0aW9uIHRvIExpZ2h0LlwiKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwid2NUaGVtZVwiLCBcIjFcIik7XG4gICAgICAgIGlzRGFya1RoZW1lID0gdHJ1ZTtcbiAgICAgICAgY29uc29sZS5kZWJ1ZyhcIlVzZXIgY2hhbmdlZCB0aGVtZSB2YXJpYXRpb24gdG8gRGFyay5cIik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ3Y1RoZW1lXCIsIFwiMlwiKTtcbiAgICAgICAgaWYgKHdpbmRvdy5tYXRjaE1lZGlhKFwiKHByZWZlcnMtY29sb3Itc2NoZW1lOiBkYXJrKVwiKS5tYXRjaGVzKSB7XG4gICAgICAgICAgaXNEYXJrVGhlbWUgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKHdpbmRvdy5tYXRjaE1lZGlhKFwiKHByZWZlcnMtY29sb3Itc2NoZW1lOiBsaWdodClcIikubWF0Y2hlcykge1xuICAgICAgICAgIGlzRGFya1RoZW1lID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXNEYXJrVGhlbWUgPSB3aW5kb3cud2MuaXNTaXRlVGhlbWVEYXJrO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUuZGVidWcoXCJVc2VyIGNoYW5nZWQgdGhlbWUgdmFyaWF0aW9uIHRvIEF1dG8uXCIpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgcmVuZGVyVGhlbWVWYXJpYXRpb24oaXNEYXJrVGhlbWUsIG5ld01vZGUpO1xuICB9XG4gIGZ1bmN0aW9uIHNob3dBY3RpdmVUaGVtZShtb2RlKSB7XG4gICAgbGV0IGxpbmtMaWdodDIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmpzLXNldC10aGVtZS1saWdodFwiKTtcbiAgICBsZXQgbGlua0RhcmsyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5qcy1zZXQtdGhlbWUtZGFya1wiKTtcbiAgICBsZXQgbGlua0F1dG8yID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5qcy1zZXQtdGhlbWUtYXV0b1wiKTtcbiAgICBpZiAobGlua0xpZ2h0MiA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBzd2l0Y2ggKG1vZGUpIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgbGlua0xpZ2h0Mi5jbGFzc0xpc3QuYWRkKFwiZHJvcGRvd24taXRlbS1hY3RpdmVcIik7XG4gICAgICAgIGxpbmtEYXJrMi5jbGFzc0xpc3QucmVtb3ZlKFwiZHJvcGRvd24taXRlbS1hY3RpdmVcIik7XG4gICAgICAgIGxpbmtBdXRvMi5jbGFzc0xpc3QucmVtb3ZlKFwiZHJvcGRvd24taXRlbS1hY3RpdmVcIik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAxOlxuICAgICAgICBsaW5rTGlnaHQyLmNsYXNzTGlzdC5yZW1vdmUoXCJkcm9wZG93bi1pdGVtLWFjdGl2ZVwiKTtcbiAgICAgICAgbGlua0RhcmsyLmNsYXNzTGlzdC5hZGQoXCJkcm9wZG93bi1pdGVtLWFjdGl2ZVwiKTtcbiAgICAgICAgbGlua0F1dG8yLmNsYXNzTGlzdC5yZW1vdmUoXCJkcm9wZG93bi1pdGVtLWFjdGl2ZVwiKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBsaW5rTGlnaHQyLmNsYXNzTGlzdC5yZW1vdmUoXCJkcm9wZG93bi1pdGVtLWFjdGl2ZVwiKTtcbiAgICAgICAgbGlua0RhcmsyLmNsYXNzTGlzdC5yZW1vdmUoXCJkcm9wZG93bi1pdGVtLWFjdGl2ZVwiKTtcbiAgICAgICAgbGlua0F1dG8yLmNsYXNzTGlzdC5hZGQoXCJkcm9wZG93bi1pdGVtLWFjdGl2ZVwiKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIHJlbmRlclRoZW1lVmFyaWF0aW9uKGlzRGFya1RoZW1lLCB0aGVtZU1vZGUgPSAyLCBpbml0ID0gZmFsc2UpIHtcbiAgICBjb25zdCBjb2RlSGxMaWdodCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJsaW5rW3RpdGxlPWhsLWxpZ2h0XVwiKTtcbiAgICBjb25zdCBjb2RlSGxEYXJrID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImxpbmtbdGl0bGU9aGwtZGFya11cIik7XG4gICAgY29uc3QgY29kZUhsRW5hYmxlZCA9IGNvZGVIbExpZ2h0ICE9PSBudWxsIHx8IGNvZGVIbERhcmsgIT09IG51bGw7XG4gICAgY29uc3QgZGlhZ3JhbUVuYWJsZWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwic2NyaXB0W3RpdGxlPW1lcm1haWRdXCIpICE9PSBudWxsO1xuICAgIHNob3dBY3RpdmVUaGVtZSh0aGVtZU1vZGUpO1xuICAgIGNvbnN0IHRoZW1lQ2hhbmdlRXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQoXCJ3Y1RoZW1lQ2hhbmdlXCIsIHsgZGV0YWlsOiB7IGlzRGFya1RoZW1lOiAoKSA9PiBpc0RhcmtUaGVtZSB9IH0pO1xuICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQodGhlbWVDaGFuZ2VFdmVudCk7XG4gICAgaWYgKCFpbml0KSB7XG4gICAgICBpZiAoaXNEYXJrVGhlbWUgPT09IGZhbHNlICYmICFib2R5LmNsYXNzTGlzdC5jb250YWlucyhcImRhcmtcIikgfHwgaXNEYXJrVGhlbWUgPT09IHRydWUgJiYgYm9keS5jbGFzc0xpc3QuY29udGFpbnMoXCJkYXJrXCIpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGlzRGFya1RoZW1lID09PSBmYWxzZSkge1xuICAgICAgaWYgKCFpbml0KSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24oZG9jdW1lbnQuYm9keS5zdHlsZSwgeyBvcGFjaXR5OiAwLCB2aXNpYmlsaXR5OiBcInZpc2libGVcIiB9KTtcbiAgICAgICAgZmFkZUluKGRvY3VtZW50LmJvZHksIDYwMCk7XG4gICAgICB9XG4gICAgICBib2R5LmNsYXNzTGlzdC5yZW1vdmUoXCJkYXJrXCIpO1xuICAgICAgaWYgKGNvZGVIbEVuYWJsZWQpIHtcbiAgICAgICAgY29uc29sZS5kZWJ1ZyhcIlNldHRpbmcgSExKUyB0aGVtZSB0byBsaWdodFwiKTtcbiAgICAgICAgaWYgKGNvZGVIbExpZ2h0KSB7XG4gICAgICAgICAgY29kZUhsTGlnaHQuZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29kZUhsRGFyaykge1xuICAgICAgICAgIGNvZGVIbERhcmsuZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoZGlhZ3JhbUVuYWJsZWQpIHtcbiAgICAgICAgY29uc29sZS5kZWJ1ZyhcIkluaXRpYWxpemluZyBNZXJtYWlkIHdpdGggbGlnaHQgdGhlbWVcIik7XG4gICAgICAgIGlmIChpbml0KSB7XG4gICAgICAgICAgd2luZG93Lm1lcm1haWQuaW5pdGlhbGl6ZSh7IHN0YXJ0T25Mb2FkOiBmYWxzZSwgdGhlbWU6IFwiZGVmYXVsdFwiLCBzZWN1cml0eUxldmVsOiBcImxvb3NlXCIgfSk7XG4gICAgICAgICAgZml4TWVybWFpZCh0cnVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsb2NhdGlvbi5yZWxvYWQoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaXNEYXJrVGhlbWUgPT09IHRydWUpIHtcbiAgICAgIGlmICghaW5pdCkge1xuICAgICAgICBPYmplY3QuYXNzaWduKGRvY3VtZW50LmJvZHkuc3R5bGUsIHsgb3BhY2l0eTogMCwgdmlzaWJpbGl0eTogXCJ2aXNpYmxlXCIgfSk7XG4gICAgICAgIGZhZGVJbihkb2N1bWVudC5ib2R5LCA2MDApO1xuICAgICAgfVxuICAgICAgYm9keS5jbGFzc0xpc3QuYWRkKFwiZGFya1wiKTtcbiAgICAgIGlmIChjb2RlSGxFbmFibGVkKSB7XG4gICAgICAgIGNvbnNvbGUuZGVidWcoXCJTZXR0aW5nIEhMSlMgdGhlbWUgdG8gZGFya1wiKTtcbiAgICAgICAgaWYgKGNvZGVIbExpZ2h0KSB7XG4gICAgICAgICAgY29kZUhsTGlnaHQuZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb2RlSGxEYXJrKSB7XG4gICAgICAgICAgY29kZUhsRGFyay5kaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoZGlhZ3JhbUVuYWJsZWQpIHtcbiAgICAgICAgY29uc29sZS5kZWJ1ZyhcIkluaXRpYWxpemluZyBNZXJtYWlkIHdpdGggZGFyayB0aGVtZVwiKTtcbiAgICAgICAgaWYgKGluaXQpIHtcbiAgICAgICAgICB3aW5kb3cubWVybWFpZC5pbml0aWFsaXplKHsgc3RhcnRPbkxvYWQ6IGZhbHNlLCB0aGVtZTogXCJkYXJrXCIsIHNlY3VyaXR5TGV2ZWw6IFwibG9vc2VcIiB9KTtcbiAgICAgICAgICBmaXhNZXJtYWlkKHRydWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIG9uTWVkaWFRdWVyeUxpc3RFdmVudChldmVudCkge1xuICAgIGlmICghY2FuQ2hhbmdlVGhlbWUoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBkYXJrTW9kZU9uID0gZXZlbnQubWF0Y2hlcztcbiAgICBjb25zb2xlLmRlYnVnKGBPUyBkYXJrIG1vZGUgcHJlZmVyZW5jZSBjaGFuZ2VkIHRvICR7ZGFya01vZGVPbiA/IFwiXFx1ezFGMzEyfSBvblwiIDogXCJcXHUyNjAwXFx1RkUwRiBvZmZcIn0uYCk7XG4gICAgbGV0IGN1cnJlbnRUaGVtZVZhcmlhdGlvbiA9IGdldFRoZW1lTW9kZSgpO1xuICAgIGxldCBpc0RhcmtUaGVtZTtcbiAgICBpZiAoY3VycmVudFRoZW1lVmFyaWF0aW9uID09PSAyKSB7XG4gICAgICBpZiAod2luZG93Lm1hdGNoTWVkaWEoXCIocHJlZmVycy1jb2xvci1zY2hlbWU6IGRhcmspXCIpLm1hdGNoZXMpIHtcbiAgICAgICAgaXNEYXJrVGhlbWUgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmICh3aW5kb3cubWF0Y2hNZWRpYShcIihwcmVmZXJzLWNvbG9yLXNjaGVtZTogbGlnaHQpXCIpLm1hdGNoZXMpIHtcbiAgICAgICAgaXNEYXJrVGhlbWUgPSBmYWxzZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlzRGFya1RoZW1lID0gd2luZG93LndjLmlzU2l0ZVRoZW1lRGFyaztcbiAgICAgIH1cbiAgICAgIHJlbmRlclRoZW1lVmFyaWF0aW9uKGlzRGFya1RoZW1lLCBjdXJyZW50VGhlbWVWYXJpYXRpb24pO1xuICAgIH1cbiAgfVxuXG4gIC8vIDxzdGRpbj5cbiAgY29uc29sZS5kZWJ1ZyhgRW52aXJvbm1lbnQ6ICR7aHVnb0Vudmlyb25tZW50fWApO1xuICBmdW5jdGlvbiBnZXROYXZCYXJIZWlnaHQoKSB7XG4gICAgbGV0IG5hdmJhciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmF2YmFyLW1haW5cIik7XG4gICAgbGV0IG5hdmJhckhlaWdodCA9IG5hdmJhciA/IG5hdmJhci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQgOiAwO1xuICAgIGNvbnNvbGUuZGVidWcoXCJOYXZiYXIgaGVpZ2h0OiBcIiArIG5hdmJhckhlaWdodCk7XG4gICAgcmV0dXJuIG5hdmJhckhlaWdodDtcbiAgfVxuICBmdW5jdGlvbiBzY3JvbGxUb0FuY2hvcih0YXJnZXQsIGR1cmF0aW9uID0gMCkge1xuICAgIHRhcmdldCA9IHR5cGVvZiB0YXJnZXQgPT09IFwidW5kZWZpbmVkXCIgfHwgdHlwZW9mIHRhcmdldCA9PT0gXCJvYmplY3RcIiA/IGRlY29kZVVSSUNvbXBvbmVudCh3aW5kb3cubG9jYXRpb24uaGFzaCkgOiB0YXJnZXQ7XG4gICAgaWYgKCQodGFyZ2V0KS5sZW5ndGgpIHtcbiAgICAgIHRhcmdldCA9IFwiI1wiICsgJC5lc2NhcGVTZWxlY3Rvcih0YXJnZXQuc3Vic3RyaW5nKDEpKTtcbiAgICAgIGxldCBlbGVtZW50T2Zmc2V0ID0gTWF0aC5jZWlsKCQodGFyZ2V0KS5vZmZzZXQoKS50b3AgLSBnZXROYXZCYXJIZWlnaHQoKSk7XG4gICAgICAkKFwiYm9keVwiKS5hZGRDbGFzcyhcInNjcm9sbGluZ1wiKTtcbiAgICAgICQoXCJodG1sLCBib2R5XCIpLmFuaW1hdGUoXG4gICAgICAgIHtcbiAgICAgICAgICBzY3JvbGxUb3A6IGVsZW1lbnRPZmZzZXRcbiAgICAgICAgfSxcbiAgICAgICAgZHVyYXRpb24sXG4gICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICQoXCJib2R5XCIpLnJlbW92ZUNsYXNzKFwic2Nyb2xsaW5nXCIpO1xuICAgICAgICB9XG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmRlYnVnKFwiQ2Fubm90IHNjcm9sbCB0byB0YXJnZXQgYCNcIiArIHRhcmdldCArIFwiYC4gSUQgbm90IGZvdW5kIVwiKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gZml4U2Nyb2xsc3B5KCkge1xuICAgIGxldCAkYm9keSA9ICQoXCJib2R5XCIpO1xuICAgIGxldCBkYXRhID0gJGJvZHkuZGF0YShcImJzLnNjcm9sbHNweVwiKTtcbiAgICBpZiAoZGF0YSkge1xuICAgICAgZGF0YS5fY29uZmlnLm9mZnNldCA9IGdldE5hdkJhckhlaWdodCgpO1xuICAgICAgJGJvZHkuZGF0YShcImJzLnNjcm9sbHNweVwiLCBkYXRhKTtcbiAgICAgICRib2R5LnNjcm9sbHNweShcInJlZnJlc2hcIik7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIHJlbW92ZVF1ZXJ5UGFyYW1zRnJvbVVybCgpIHtcbiAgICBpZiAod2luZG93Lmhpc3RvcnkucmVwbGFjZVN0YXRlKSB7XG4gICAgICBsZXQgdXJsV2l0aG91dFNlYXJjaFBhcmFtcyA9IHdpbmRvdy5sb2NhdGlvbi5wcm90b2NvbCArIFwiLy9cIiArIHdpbmRvdy5sb2NhdGlvbi5ob3N0ICsgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lICsgd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gICAgICB3aW5kb3cuaGlzdG9yeS5yZXBsYWNlU3RhdGUoeyBwYXRoOiB1cmxXaXRob3V0U2VhcmNoUGFyYW1zIH0sIFwiXCIsIHVybFdpdGhvdXRTZWFyY2hQYXJhbXMpO1xuICAgIH1cbiAgfVxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImhhc2hjaGFuZ2VcIiwgc2Nyb2xsVG9BbmNob3IpO1xuICAkKFwiI25hdmJhci1tYWluIGxpLm5hdi1pdGVtIGEubmF2LWxpbmssIC5qcy1zY3JvbGxcIikub24oXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgIGxldCBoYXNoID0gdGhpcy5oYXNoO1xuICAgIGlmICh0aGlzLnBhdGhuYW1lID09PSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgJiYgaGFzaCAmJiAkKGhhc2gpLmxlbmd0aCAmJiAoJChcIi5qcy1ibG9jay1wYWdlXCIpLmxlbmd0aCA+IDAgfHwgJChcIi5qcy13aWRnZXQtcGFnZVwiKS5sZW5ndGggPiAwKSkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGxldCBlbGVtZW50T2Zmc2V0ID0gTWF0aC5jZWlsKCQoaGFzaCkub2Zmc2V0KCkudG9wIC0gZ2V0TmF2QmFySGVpZ2h0KCkpO1xuICAgICAgJChcImh0bWwsIGJvZHlcIikuYW5pbWF0ZShcbiAgICAgICAge1xuICAgICAgICAgIHNjcm9sbFRvcDogZWxlbWVudE9mZnNldFxuICAgICAgICB9LFxuICAgICAgICA4MDBcbiAgICAgICk7XG4gICAgfVxuICB9KTtcbiAgJChkb2N1bWVudCkub24oXCJjbGlja1wiLCBcIi5uYXZiYXItY29sbGFwc2Uuc2hvd1wiLCBmdW5jdGlvbihlKSB7XG4gICAgbGV0IHRhcmdldEVsZW1lbnQgPSAkKGUudGFyZ2V0KS5pcyhcImFcIikgPyAkKGUudGFyZ2V0KSA6ICQoZS50YXJnZXQpLnBhcmVudCgpO1xuICAgIGlmICh0YXJnZXRFbGVtZW50LmlzKFwiYVwiKSAmJiB0YXJnZXRFbGVtZW50LmF0dHIoXCJjbGFzc1wiKSAhPSBcImRyb3Bkb3duLXRvZ2dsZVwiKSB7XG4gICAgICAkKHRoaXMpLmNvbGxhcHNlKFwiaGlkZVwiKTtcbiAgICB9XG4gIH0pO1xuICBmdW5jdGlvbiBwcmludExhdGVzdFJlbGVhc2Uoc2VsZWN0b3IsIHJlcG8pIHtcbiAgICBpZiAoaHVnb0Vudmlyb25tZW50ID09PSBcInByb2R1Y3Rpb25cIikge1xuICAgICAgJC5nZXRKU09OKFwiaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS9yZXBvcy9cIiArIHJlcG8gKyBcIi90YWdzXCIpLmRvbmUoZnVuY3Rpb24oanNvbikge1xuICAgICAgICBsZXQgcmVsZWFzZSA9IGpzb25bMF07XG4gICAgICAgICQoc2VsZWN0b3IpLmFwcGVuZChcIiBcIiArIHJlbGVhc2UubmFtZSk7XG4gICAgICB9KS5mYWlsKGZ1bmN0aW9uKGpxeGhyLCB0ZXh0U3RhdHVzLCBlcnJvcikge1xuICAgICAgICBsZXQgZXJyID0gdGV4dFN0YXR1cyArIFwiLCBcIiArIGVycm9yO1xuICAgICAgICBjb25zb2xlLmxvZyhcIlJlcXVlc3QgRmFpbGVkOiBcIiArIGVycik7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gdG9nZ2xlU2VhcmNoRGlhbG9nKCkge1xuICAgIGlmICgkKFwiYm9keVwiKS5oYXNDbGFzcyhcInNlYXJjaGluZ1wiKSkge1xuICAgICAgJChcIltpZD1zZWFyY2gtcXVlcnldXCIpLmJsdXIoKTtcbiAgICAgICQoXCJib2R5XCIpLnJlbW92ZUNsYXNzKFwic2VhcmNoaW5nIGNvbXBlbnNhdGUtZm9yLXNjcm9sbGJhclwiKTtcbiAgICAgIHJlbW92ZVF1ZXJ5UGFyYW1zRnJvbVVybCgpO1xuICAgICAgJChcIiNmYW5jeWJveC1zdHlsZS1ub3Njcm9sbFwiKS5yZW1vdmUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCEkKFwiI2ZhbmN5Ym94LXN0eWxlLW5vc2Nyb2xsXCIpLmxlbmd0aCAmJiBkb2N1bWVudC5ib2R5LnNjcm9sbEhlaWdodCA+IHdpbmRvdy5pbm5lckhlaWdodCkge1xuICAgICAgICAkKFwiaGVhZFwiKS5hcHBlbmQoXG4gICAgICAgICAgJzxzdHlsZSBpZD1cImZhbmN5Ym94LXN0eWxlLW5vc2Nyb2xsXCI+LmNvbXBlbnNhdGUtZm9yLXNjcm9sbGJhcnttYXJnaW4tcmlnaHQ6JyArICh3aW5kb3cuaW5uZXJXaWR0aCAtIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCkgKyBcInB4O308L3N0eWxlPlwiXG4gICAgICAgICk7XG4gICAgICAgICQoXCJib2R5XCIpLmFkZENsYXNzKFwiY29tcGVuc2F0ZS1mb3Itc2Nyb2xsYmFyXCIpO1xuICAgICAgfVxuICAgICAgJChcImJvZHlcIikuYWRkQ2xhc3MoXCJzZWFyY2hpbmdcIik7XG4gICAgICAkKFwiLnNlYXJjaC1yZXN1bHRzXCIpLmNzcyh7IG9wYWNpdHk6IDAsIHZpc2liaWxpdHk6IFwidmlzaWJsZVwiIH0pLmFuaW1hdGUoeyBvcGFjaXR5OiAxIH0sIDIwMCk7XG4gICAgICBsZXQgYWxnb2xpYVNlYXJjaEJveCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuYWlzLVNlYXJjaEJveC1pbnB1dFwiKTtcbiAgICAgIGlmIChhbGdvbGlhU2VhcmNoQm94KSB7XG4gICAgICAgIGFsZ29saWFTZWFyY2hCb3guZm9jdXMoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICQoXCIjc2VhcmNoLXF1ZXJ5XCIpLmZvY3VzKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIGZpeEh1Z29PdXRwdXQoKSB7XG4gICAgJChcIiNUYWJsZU9mQ29udGVudHNcIikuYWRkQ2xhc3MoXCJuYXYgZmxleC1jb2x1bW5cIik7XG4gICAgJChcIiNUYWJsZU9mQ29udGVudHMgbGlcIikuYWRkQ2xhc3MoXCJuYXYtaXRlbVwiKTtcbiAgICAkKFwiI1RhYmxlT2ZDb250ZW50cyBsaSBhXCIpLmFkZENsYXNzKFwibmF2LWxpbmtcIik7XG4gICAgJChcImlucHV0W3R5cGU9J2NoZWNrYm94J11bZGlzYWJsZWRdXCIpLnBhcmVudHMoXCJ1bFwiKS5hZGRDbGFzcyhcInRhc2stbGlzdFwiKTtcbiAgfVxuICBmdW5jdGlvbiBnZXRTaWJsaW5ncyhlbGVtKSB7XG4gICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5maWx0ZXIuY2FsbChlbGVtLnBhcmVudE5vZGUuY2hpbGRyZW4sIGZ1bmN0aW9uKHNpYmxpbmcpIHtcbiAgICAgIHJldHVybiBzaWJsaW5nICE9PSBlbGVtO1xuICAgIH0pO1xuICB9XG4gICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgIGZpeEh1Z29PdXRwdXQoKTtcbiAgICBsZXQgeyBpc0RhcmtUaGVtZSwgdGhlbWVNb2RlIH0gPSBpbml0VGhlbWVWYXJpYXRpb24oKTtcbiAgICByZW5kZXJUaGVtZVZhcmlhdGlvbihpc0RhcmtUaGVtZSwgdGhlbWVNb2RlLCB0cnVlKTtcbiAgICBpZiAoY29kZUhpZ2hsaWdodGluZykge1xuICAgICAgaGxqcy5pbml0SGlnaGxpZ2h0aW5nKCk7XG4gICAgfVxuICAgIGxldCBjaGlsZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZG9jcy1saW5rcyAuYWN0aXZlXCIpO1xuICAgIGxldCBwYXJlbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmRvY3MtbGlua3NcIik7XG4gICAgaWYgKGNoaWxkICYmIHBhcmVudCkge1xuICAgICAgc2Nyb2xsUGFyZW50VG9DaGlsZChwYXJlbnQsIGNoaWxkKTtcbiAgICB9XG4gIH0pO1xuICAkKHdpbmRvdykub24oXCJsb2FkXCIsIGZ1bmN0aW9uKCkge1xuICAgIGZpeFNjcm9sbHNweSgpO1xuICAgIGxldCBpc290b3BlSW5zdGFuY2VzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5wcm9qZWN0cy1jb250YWluZXJcIik7XG4gICAgbGV0IGlzb3RvcGVJbnN0YW5jZXNDb3VudCA9IGlzb3RvcGVJbnN0YW5jZXMubGVuZ3RoO1xuICAgIGlmICh3aW5kb3cubG9jYXRpb24uaGFzaCAmJiBpc290b3BlSW5zdGFuY2VzQ291bnQgPT09IDApIHtcbiAgICAgIHNjcm9sbFRvQW5jaG9yKGRlY29kZVVSSUNvbXBvbmVudCh3aW5kb3cubG9jYXRpb24uaGFzaCksIDApO1xuICAgIH1cbiAgICBsZXQgY2hpbGQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmRvY3MtdG9jIC5uYXYtbGluay5hY3RpdmVcIik7XG4gICAgbGV0IHBhcmVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZG9jcy10b2NcIik7XG4gICAgaWYgKGNoaWxkICYmIHBhcmVudCkge1xuICAgICAgc2Nyb2xsUGFyZW50VG9DaGlsZChwYXJlbnQsIGNoaWxkKTtcbiAgICB9XG4gICAgbGV0IHpvb21PcHRpb25zID0ge307XG4gICAgaWYgKGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmNvbnRhaW5zKFwiZGFya1wiKSkge1xuICAgICAgem9vbU9wdGlvbnMuYmFja2dyb3VuZCA9IFwicmdiYSgwLDAsMCwwLjkpXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHpvb21PcHRpb25zLmJhY2tncm91bmQgPSBcInJnYmEoMjU1LDI1NSwyNTUsMC45KVwiO1xuICAgIH1cbiAgICBtZWRpdW1fem9vbV9lc21fZGVmYXVsdChcIltkYXRhLXpvb21hYmxlXVwiLCB6b29tT3B0aW9ucyk7XG4gICAgbGV0IGlzb3RvcGVDb3VudGVyID0gMDtcbiAgICBpc290b3BlSW5zdGFuY2VzLmZvckVhY2goZnVuY3Rpb24oaXNvdG9wZUluc3RhbmNlLCBpbmRleCkge1xuICAgICAgY29uc29sZS5kZWJ1ZyhgTG9hZGluZyBJc290b3BlIGluc3RhbmNlICR7aW5kZXh9YCk7XG4gICAgICBsZXQgaXNvO1xuICAgICAgbGV0IGlzb1NlY3Rpb24gPSBpc290b3BlSW5zdGFuY2UuY2xvc2VzdChcInNlY3Rpb25cIik7XG4gICAgICBsZXQgbGF5b3V0ID0gXCJcIjtcbiAgICAgIGlmIChpc29TZWN0aW9uLnF1ZXJ5U2VsZWN0b3IoXCIuaXNvdG9wZVwiKS5jbGFzc0xpc3QuY29udGFpbnMoXCJqcy1sYXlvdXQtcm93XCIpKSB7XG4gICAgICAgIGxheW91dCA9IFwiZml0Um93c1wiO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGF5b3V0ID0gXCJtYXNvbnJ5XCI7XG4gICAgICB9XG4gICAgICBsZXQgZGVmYXVsdEZpbHRlciA9IGlzb1NlY3Rpb24ucXVlcnlTZWxlY3RvcihcIi5kZWZhdWx0LXByb2plY3QtZmlsdGVyXCIpO1xuICAgICAgbGV0IGZpbHRlclRleHQgPSBcIipcIjtcbiAgICAgIGlmIChkZWZhdWx0RmlsdGVyICE9PSBudWxsKSB7XG4gICAgICAgIGZpbHRlclRleHQgPSBkZWZhdWx0RmlsdGVyLnRleHRDb250ZW50O1xuICAgICAgfVxuICAgICAgY29uc29sZS5kZWJ1ZyhgRGVmYXVsdCBJc290b3BlIGZpbHRlcjogJHtmaWx0ZXJUZXh0fWApO1xuICAgICAgaW1hZ2VzTG9hZGVkKGlzb3RvcGVJbnN0YW5jZSwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGlzbyA9IG5ldyBJc290b3BlKGlzb3RvcGVJbnN0YW5jZSwge1xuICAgICAgICAgIGl0ZW1TZWxlY3RvcjogXCIuaXNvdG9wZS1pdGVtXCIsXG4gICAgICAgICAgbGF5b3V0TW9kZTogbGF5b3V0LFxuICAgICAgICAgIG1hc29ucnk6IHtcbiAgICAgICAgICAgIGd1dHRlcjogMjBcbiAgICAgICAgICB9LFxuICAgICAgICAgIGZpbHRlcjogZmlsdGVyVGV4dFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IGlzb0ZpbHRlckJ1dHRvbnMgPSBpc29TZWN0aW9uLnF1ZXJ5U2VsZWN0b3JBbGwoXCIucHJvamVjdC1maWx0ZXJzIGFcIik7XG4gICAgICAgIGlzb0ZpbHRlckJ1dHRvbnMuZm9yRWFjaChcbiAgICAgICAgICAoYnV0dG9uKSA9PiBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlKSA9PiB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBsZXQgc2VsZWN0b3IgPSBidXR0b24uZ2V0QXR0cmlidXRlKFwiZGF0YS1maWx0ZXJcIik7XG4gICAgICAgICAgICBjb25zb2xlLmRlYnVnKGBVcGRhdGluZyBJc290b3BlIGZpbHRlciB0byAke3NlbGVjdG9yfWApO1xuICAgICAgICAgICAgaXNvLmFycmFuZ2UoeyBmaWx0ZXI6IHNlbGVjdG9yIH0pO1xuICAgICAgICAgICAgYnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XG4gICAgICAgICAgICBidXR0b24uY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTtcbiAgICAgICAgICAgIGxldCBidXR0b25TaWJsaW5ncyA9IGdldFNpYmxpbmdzKGJ1dHRvbik7XG4gICAgICAgICAgICBidXR0b25TaWJsaW5ncy5mb3JFYWNoKChidXR0b25TaWJsaW5nKSA9PiB7XG4gICAgICAgICAgICAgIGJ1dHRvblNpYmxpbmcuY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcbiAgICAgICAgICAgICAgYnV0dG9uU2libGluZy5jbGFzc0xpc3QucmVtb3ZlKFwiYWxsXCIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICAgICAgaW5jcmVtZW50SXNvdG9wZUNvdW50ZXIoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIGZ1bmN0aW9uIGluY3JlbWVudElzb3RvcGVDb3VudGVyKCkge1xuICAgICAgaXNvdG9wZUNvdW50ZXIrKztcbiAgICAgIGlmIChpc290b3BlQ291bnRlciA9PT0gaXNvdG9wZUluc3RhbmNlc0NvdW50KSB7XG4gICAgICAgIGNvbnNvbGUuZGVidWcoYEFsbCBQb3J0Zm9saW8gSXNvdG9wZSBpbnN0YW5jZXMgbG9hZGVkLmApO1xuICAgICAgICBpZiAod2luZG93LmxvY2F0aW9uLmhhc2gpIHtcbiAgICAgICAgICBzY3JvbGxUb0FuY2hvcihkZWNvZGVVUklDb21wb25lbnQod2luZG93LmxvY2F0aW9uLmhhc2gpLCAwKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBsZXQgZ2l0aHViUmVsZWFzZVNlbGVjdG9yID0gXCIuanMtZ2l0aHViLXJlbGVhc2VcIjtcbiAgICBpZiAoJChnaXRodWJSZWxlYXNlU2VsZWN0b3IpLmxlbmd0aCA+IDApIHtcbiAgICAgIHByaW50TGF0ZXN0UmVsZWFzZShnaXRodWJSZWxlYXNlU2VsZWN0b3IsICQoZ2l0aHViUmVsZWFzZVNlbGVjdG9yKS5kYXRhKFwicmVwb1wiKSk7XG4gICAgfVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCAoZXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC5jb2RlID09PSBcIkVzY2FwZVwiKSB7XG4gICAgICAgIGNvbnN0IGJvZHkyID0gZG9jdW1lbnQuYm9keTtcbiAgICAgICAgaWYgKGJvZHkyLmNsYXNzTGlzdC5jb250YWlucyhcInNlYXJjaGluZ1wiKSkge1xuICAgICAgICAgIHRvZ2dsZVNlYXJjaERpYWxvZygpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoZXZlbnQua2V5ID09PSBcIi9cIikge1xuICAgICAgICBsZXQgZm9jdXNlZEVsZW1lbnQgPSBkb2N1bWVudC5oYXNGb2N1cygpICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IGRvY3VtZW50LmJvZHkgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAhPT0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgfHwgbnVsbDtcbiAgICAgICAgbGV0IGlzSW5wdXRGb2N1c2VkID0gZm9jdXNlZEVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50IHx8IGZvY3VzZWRFbGVtZW50IGluc3RhbmNlb2YgSFRNTFRleHRBcmVhRWxlbWVudDtcbiAgICAgICAgaWYgKHNlYXJjaEVuYWJsZWQgJiYgIWlzSW5wdXRGb2N1c2VkKSB7XG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICB0b2dnbGVTZWFyY2hEaWFsb2coKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIGlmIChzZWFyY2hFbmFibGVkKSB7XG4gICAgICAkKFwiLmpzLXNlYXJjaFwiKS5jbGljayhmdW5jdGlvbihlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdG9nZ2xlU2VhcmNoRGlhbG9nKCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcbiAgfSk7XG4gIHZhciBsaW5rTGlnaHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmpzLXNldC10aGVtZS1saWdodFwiKTtcbiAgdmFyIGxpbmtEYXJrID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5qcy1zZXQtdGhlbWUtZGFya1wiKTtcbiAgdmFyIGxpbmtBdXRvID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5qcy1zZXQtdGhlbWUtYXV0b1wiKTtcbiAgaWYgKGxpbmtMaWdodCAmJiBsaW5rRGFyayAmJiBsaW5rQXV0bykge1xuICAgIGxpbmtMaWdodC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgY2hhbmdlVGhlbWVNb2RlQ2xpY2soMCk7XG4gICAgfSk7XG4gICAgbGlua0RhcmsuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudCkgPT4ge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGNoYW5nZVRoZW1lTW9kZUNsaWNrKDEpO1xuICAgIH0pO1xuICAgIGxpbmtBdXRvLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBjaGFuZ2VUaGVtZU1vZGVDbGljaygyKTtcbiAgICB9KTtcbiAgfVxuICB2YXIgZGFya01vZGVNZWRpYVF1ZXJ5ID0gd2luZG93Lm1hdGNoTWVkaWEoXCIocHJlZmVycy1jb2xvci1zY2hlbWU6IGRhcmspXCIpO1xuICBkYXJrTW9kZU1lZGlhUXVlcnkuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoZXZlbnQpID0+IHtcbiAgICBvbk1lZGlhUXVlcnlMaXN0RXZlbnQoZXZlbnQpO1xuICB9KTtcbiAgJChcImJvZHlcIikub24oXCJtb3VzZWVudGVyIG1vdXNlbGVhdmVcIiwgXCIuZHJvcGRvd25cIiwgZnVuY3Rpb24oZSkge1xuICAgIHZhciBkcm9wZG93biA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoXCIuZHJvcGRvd25cIik7XG4gICAgdmFyIG1lbnUgPSAkKFwiLmRyb3Bkb3duLW1lbnVcIiwgZHJvcGRvd24pO1xuICAgIGRyb3Bkb3duLmFkZENsYXNzKFwic2hvd1wiKTtcbiAgICBtZW51LmFkZENsYXNzKFwic2hvd1wiKTtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgZHJvcGRvd25bZHJvcGRvd24uaXMoXCI6aG92ZXJcIikgPyBcImFkZENsYXNzXCIgOiBcInJlbW92ZUNsYXNzXCJdKFwic2hvd1wiKTtcbiAgICAgIG1lbnVbZHJvcGRvd24uaXMoXCI6aG92ZXJcIikgPyBcImFkZENsYXNzXCIgOiBcInJlbW92ZUNsYXNzXCJdKFwic2hvd1wiKTtcbiAgICB9LCAzMDApO1xuICB9KTtcbiAgdmFyIHJlc2l6ZVRpbWVyO1xuICAkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uKCkge1xuICAgIGNsZWFyVGltZW91dChyZXNpemVUaW1lcik7XG4gICAgcmVzaXplVGltZXIgPSBzZXRUaW1lb3V0KGZpeFNjcm9sbHNweSwgMjAwKTtcbiAgfSk7XG59KSgpO1xuLyohIG1lZGl1bS16b29tIDEuMC42IHwgTUlUIExpY2Vuc2UgfCBodHRwczovL2dpdGh1Yi5jb20vZnJhbmNvaXNjaGFsaWZvdXIvbWVkaXVtLXpvb20gKi9cblxuO1xuKCgpID0+IHtcbiAgLy8gbnMtaHVnby1wYXJhbXM6PHN0ZGluPlxuICB2YXIgY29udGVudF90eXBlID0geyBhdXRob3JzOiBcIkF1dGhvcnNcIiwgZXZlbnQ6IFwiXFx1NkYxNFxcdThCQjJcIiwgcG9zdDogXCJcXHU2NTg3XFx1N0FFMFwiLCBwcm9qZWN0OiBcIlxcdTk4NzlcXHU3NkVFXCIsIHB1YmxpY2F0aW9uOiBcIlxcdTUxRkFcXHU3MjQ4XFx1NzI2OVwiLCBzbGlkZXM6IFwiU2xpZGVzXCIgfTtcbiAgdmFyIGkxOG4gPSB7IG5vX3Jlc3VsdHM6IFwiXFx1NkNBMVxcdTY3MDlcXHU2MjdFXFx1NTIzMFxcdTdFRDNcXHU2NzlDXCIsIHBsYWNlaG9sZGVyOiBcIlxcdTY0MUNcXHU3RDIyLi4uXCIsIHJlc3VsdHM6IFwiXFx1NjQxQ1xcdTdEMjJcXHU3RUQzXFx1Njc5Q1wiIH07XG4gIHZhciBzZWFyY2hfY29uZmlnID0geyBpbmRleFVSSTogXCIvemgvaW5kZXguanNvblwiLCBtaW5MZW5ndGg6IDEsIHRocmVzaG9sZDogMC4zIH07XG5cbiAgLy8gPHN0ZGluPlxuICB2YXIgZnVzZU9wdGlvbnMgPSB7XG4gICAgc2hvdWxkU29ydDogdHJ1ZSxcbiAgICBpbmNsdWRlTWF0Y2hlczogdHJ1ZSxcbiAgICB0b2tlbml6ZTogdHJ1ZSxcbiAgICB0aHJlc2hvbGQ6IHNlYXJjaF9jb25maWcudGhyZXNob2xkLFxuICAgIC8vIFNldCB0byB+MC4zIGZvciBwYXJzaW5nIGRpYWNyaXRpY3MgYW5kIENKSyBsYW5ndWFnZXMuXG4gICAgbG9jYXRpb246IDAsXG4gICAgZGlzdGFuY2U6IDEwMCxcbiAgICBtYXhQYXR0ZXJuTGVuZ3RoOiAzMixcbiAgICBtaW5NYXRjaENoYXJMZW5ndGg6IHNlYXJjaF9jb25maWcubWluTGVuZ3RoLFxuICAgIC8vIFNldCB0byAxIGZvciBwYXJzaW5nIENKSyBsYW5ndWFnZXMuXG4gICAga2V5czogW1xuICAgICAgeyBuYW1lOiBcInRpdGxlXCIsIHdlaWdodDogMC45OSB9LFxuICAgICAgeyBuYW1lOiBcInB1YmxpY2F0aW9uX3Nob3J0XCIsIHdlaWdodDogMC44NSB9LFxuICAgICAgeyBuYW1lOiBcInB1YmxpY2F0aW9uXCIsIHdlaWdodDogMC42NSB9LFxuICAgICAgeyBuYW1lOiBcInN1bW1hcnlcIiwgd2VpZ2h0OiAwLjYgfSxcbiAgICAgIHsgbmFtZTogXCJhdXRob3JzXCIsIHdlaWdodDogMC41IH0sXG4gICAgICB7IG5hbWU6IFwiY29udGVudFwiLCB3ZWlnaHQ6IDAuMiB9LFxuICAgICAgeyBuYW1lOiBcInRhZ3NcIiwgd2VpZ2h0OiAwLjUgfSxcbiAgICAgIHsgbmFtZTogXCJjYXRlZ29yaWVzXCIsIHdlaWdodDogMC41IH1cbiAgICBdXG4gIH07XG4gIHZhciBzdW1tYXJ5TGVuZ3RoID0gNjA7XG4gIGZ1bmN0aW9uIGdldFNlYXJjaFF1ZXJ5KG5hbWUpIHtcbiAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KChsb2NhdGlvbi5zZWFyY2guc3BsaXQobmFtZSArIFwiPVwiKVsxXSB8fCBcIlwiKS5zcGxpdChcIiZcIilbMF0pLnJlcGxhY2UoL1xcKy9nLCBcIiBcIik7XG4gIH1cbiAgZnVuY3Rpb24gdXBkYXRlVVJMKHVybCkge1xuICAgIGlmIChoaXN0b3J5LnJlcGxhY2VTdGF0ZSkge1xuICAgICAgd2luZG93Lmhpc3RvcnkucmVwbGFjZVN0YXRlKHsgcGF0aDogdXJsIH0sIFwiXCIsIHVybCk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIGluaXRTZWFyY2goZm9yY2UsIGZ1c2UpIHtcbiAgICBsZXQgcXVlcnkgPSAkKFwiI3NlYXJjaC1xdWVyeVwiKS52YWwoKTtcbiAgICBpZiAocXVlcnkubGVuZ3RoIDwgMSkge1xuICAgICAgJChcIiNzZWFyY2gtaGl0c1wiKS5lbXB0eSgpO1xuICAgICAgJChcIiNzZWFyY2gtY29tbW9uLXF1ZXJpZXNcIikuc2hvdygpO1xuICAgIH1cbiAgICBpZiAoIWZvcmNlICYmIHF1ZXJ5Lmxlbmd0aCA8IGZ1c2VPcHRpb25zLm1pbk1hdGNoQ2hhckxlbmd0aCkgcmV0dXJuO1xuICAgICQoXCIjc2VhcmNoLWhpdHNcIikuZW1wdHkoKTtcbiAgICAkKFwiI3NlYXJjaC1jb21tb24tcXVlcmllc1wiKS5oaWRlKCk7XG4gICAgc2VhcmNoU2l0ZShxdWVyeSwgZnVzZSk7XG4gICAgbGV0IG5ld1VSTCA9IHdpbmRvdy5sb2NhdGlvbi5wcm90b2NvbCArIFwiLy9cIiArIHdpbmRvdy5sb2NhdGlvbi5ob3N0ICsgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lICsgXCI/cT1cIiArIGVuY29kZVVSSUNvbXBvbmVudChxdWVyeSkgKyB3aW5kb3cubG9jYXRpb24uaGFzaDtcbiAgICB1cGRhdGVVUkwobmV3VVJMKTtcbiAgfVxuICBmdW5jdGlvbiBzZWFyY2hTaXRlKHF1ZXJ5LCBmdXNlKSB7XG4gICAgbGV0IHJlc3VsdHMgPSBmdXNlLnNlYXJjaChxdWVyeSk7XG4gICAgaWYgKHJlc3VsdHMubGVuZ3RoID4gMCkge1xuICAgICAgJChcIiNzZWFyY2gtaGl0c1wiKS5hcHBlbmQoJzxoMyBjbGFzcz1cIm10LTBcIj4nICsgcmVzdWx0cy5sZW5ndGggKyBcIiBcIiArIGkxOG4ucmVzdWx0cyArIFwiPC9oMz5cIik7XG4gICAgICBwYXJzZVJlc3VsdHMocXVlcnksIHJlc3VsdHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkKFwiI3NlYXJjaC1oaXRzXCIpLmFwcGVuZCgnPGRpdiBjbGFzcz1cInNlYXJjaC1uby1yZXN1bHRzXCI+JyArIGkxOG4ubm9fcmVzdWx0cyArIFwiPC9kaXY+XCIpO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBwYXJzZVJlc3VsdHMocXVlcnksIHJlc3VsdHMpIHtcbiAgICAkLmVhY2gocmVzdWx0cywgZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgbGV0IGNvbnRlbnRfa2V5ID0gdmFsdWUuaXRlbS5zZWN0aW9uO1xuICAgICAgbGV0IGNvbnRlbnQgPSBcIlwiO1xuICAgICAgbGV0IHNuaXBwZXQgPSBcIlwiO1xuICAgICAgbGV0IHNuaXBwZXRIaWdobGlnaHRzID0gW107XG4gICAgICBpZiAoW1wicHVibGljYXRpb25cIiwgXCJldmVudFwiXS5pbmNsdWRlcyhjb250ZW50X2tleSkpIHtcbiAgICAgICAgY29udGVudCA9IHZhbHVlLml0ZW0uc3VtbWFyeTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnRlbnQgPSB2YWx1ZS5pdGVtLmNvbnRlbnQ7XG4gICAgICB9XG4gICAgICBpZiAoZnVzZU9wdGlvbnMudG9rZW5pemUpIHtcbiAgICAgICAgc25pcHBldEhpZ2hsaWdodHMucHVzaChxdWVyeSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkLmVhY2godmFsdWUubWF0Y2hlcywgZnVuY3Rpb24obWF0Y2hLZXksIG1hdGNoVmFsdWUpIHtcbiAgICAgICAgICBpZiAobWF0Y2hWYWx1ZS5rZXkgPT0gXCJjb250ZW50XCIpIHtcbiAgICAgICAgICAgIGxldCBzdGFydCA9IG1hdGNoVmFsdWUuaW5kaWNlc1swXVswXSAtIHN1bW1hcnlMZW5ndGggPiAwID8gbWF0Y2hWYWx1ZS5pbmRpY2VzWzBdWzBdIC0gc3VtbWFyeUxlbmd0aCA6IDA7XG4gICAgICAgICAgICBsZXQgZW5kID0gbWF0Y2hWYWx1ZS5pbmRpY2VzWzBdWzFdICsgc3VtbWFyeUxlbmd0aCA8IGNvbnRlbnQubGVuZ3RoID8gbWF0Y2hWYWx1ZS5pbmRpY2VzWzBdWzFdICsgc3VtbWFyeUxlbmd0aCA6IGNvbnRlbnQubGVuZ3RoO1xuICAgICAgICAgICAgc25pcHBldCArPSBjb250ZW50LnN1YnN0cmluZyhzdGFydCwgZW5kKTtcbiAgICAgICAgICAgIHNuaXBwZXRIaWdobGlnaHRzLnB1c2goXG4gICAgICAgICAgICAgIG1hdGNoVmFsdWUudmFsdWUuc3Vic3RyaW5nKFxuICAgICAgICAgICAgICAgIG1hdGNoVmFsdWUuaW5kaWNlc1swXVswXSxcbiAgICAgICAgICAgICAgICBtYXRjaFZhbHVlLmluZGljZXNbMF1bMV0gLSBtYXRjaFZhbHVlLmluZGljZXNbMF1bMF0gKyAxXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGlmIChzbmlwcGV0Lmxlbmd0aCA8IDEpIHtcbiAgICAgICAgc25pcHBldCArPSB2YWx1ZS5pdGVtLnN1bW1hcnk7XG4gICAgICB9XG4gICAgICBsZXQgdGVtcGxhdGUgPSAkKFwiI3NlYXJjaC1oaXQtZnVzZS10ZW1wbGF0ZVwiKS5odG1sKCk7XG4gICAgICBpZiAoY29udGVudF9rZXkgaW4gY29udGVudF90eXBlKSB7XG4gICAgICAgIGNvbnRlbnRfa2V5ID0gY29udGVudF90eXBlW2NvbnRlbnRfa2V5XTtcbiAgICAgIH1cbiAgICAgIGxldCB0ZW1wbGF0ZURhdGEgPSB7XG4gICAgICAgIGtleSxcbiAgICAgICAgdGl0bGU6IHZhbHVlLml0ZW0udGl0bGUsXG4gICAgICAgIHR5cGU6IGNvbnRlbnRfa2V5LFxuICAgICAgICByZWxwZXJtYWxpbms6IHZhbHVlLml0ZW0ucmVscGVybWFsaW5rLFxuICAgICAgICBzbmlwcGV0XG4gICAgICB9O1xuICAgICAgbGV0IG91dHB1dCA9IHJlbmRlcih0ZW1wbGF0ZSwgdGVtcGxhdGVEYXRhKTtcbiAgICAgICQoXCIjc2VhcmNoLWhpdHNcIikuYXBwZW5kKG91dHB1dCk7XG4gICAgICAkLmVhY2goc25pcHBldEhpZ2hsaWdodHMsIGZ1bmN0aW9uKGhsS2V5LCBobFZhbHVlKSB7XG4gICAgICAgICQoXCIjc3VtbWFyeS1cIiArIGtleSkubWFyayhobFZhbHVlKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG4gIGZ1bmN0aW9uIHJlbmRlcih0ZW1wbGF0ZSwgZGF0YSkge1xuICAgIGxldCBrZXksIGZpbmQsIHJlO1xuICAgIGZvciAoa2V5IGluIGRhdGEpIHtcbiAgICAgIGZpbmQgPSBcIlxcXFx7XFxcXHtcXFxccypcIiArIGtleSArIFwiXFxcXHMqXFxcXH1cXFxcfVwiO1xuICAgICAgcmUgPSBuZXcgUmVnRXhwKGZpbmQsIFwiZ1wiKTtcbiAgICAgIHRlbXBsYXRlID0gdGVtcGxhdGUucmVwbGFjZShyZSwgZGF0YVtrZXldKTtcbiAgICB9XG4gICAgcmV0dXJuIHRlbXBsYXRlO1xuICB9XG4gIGlmICh0eXBlb2YgRnVzZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgJC5nZXRKU09OKHNlYXJjaF9jb25maWcuaW5kZXhVUkksIGZ1bmN0aW9uKHNlYXJjaF9pbmRleCkge1xuICAgICAgbGV0IGZ1c2UgPSBuZXcgRnVzZShzZWFyY2hfaW5kZXgsIGZ1c2VPcHRpb25zKTtcbiAgICAgIGxldCBxdWVyeSA9IGdldFNlYXJjaFF1ZXJ5KFwicVwiKTtcbiAgICAgIGlmIChxdWVyeSkge1xuICAgICAgICAkKFwiYm9keVwiKS5hZGRDbGFzcyhcInNlYXJjaGluZ1wiKTtcbiAgICAgICAgJChcIi5zZWFyY2gtcmVzdWx0c1wiKS5jc3MoeyBvcGFjaXR5OiAwLCB2aXNpYmlsaXR5OiBcInZpc2libGVcIiB9KS5hbmltYXRlKHsgb3BhY2l0eTogMSB9LCAyMDApO1xuICAgICAgICAkKFwiI3NlYXJjaC1xdWVyeVwiKS52YWwocXVlcnkpO1xuICAgICAgICAkKFwiI3NlYXJjaC1xdWVyeVwiKS5mb2N1cygpO1xuICAgICAgICBpbml0U2VhcmNoKHRydWUsIGZ1c2UpO1xuICAgICAgfVxuICAgICAgJChcIiNzZWFyY2gtcXVlcnlcIikua2V5dXAoZnVuY3Rpb24oZSkge1xuICAgICAgICBjbGVhclRpbWVvdXQoJC5kYXRhKHRoaXMsIFwic2VhcmNoVGltZXJcIikpO1xuICAgICAgICBpZiAoZS5rZXlDb2RlID09IDEzKSB7XG4gICAgICAgICAgaW5pdFNlYXJjaCh0cnVlLCBmdXNlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkKHRoaXMpLmRhdGEoXG4gICAgICAgICAgICBcInNlYXJjaFRpbWVyXCIsXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBpbml0U2VhcmNoKGZhbHNlLCBmdXNlKTtcbiAgICAgICAgICAgIH0sIDI1MClcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxufSkoKTtcbiJdLAogICJtYXBwaW5ncyI6ICI7O0FBQUEsR0FBQyxNQUFNO0FBRUwsUUFBSSxXQUFXLE9BQU8sVUFBVSxTQUFTLFFBQVE7QUFDL0MsZUFBUyxJQUFJLEdBQUcsSUFBSSxVQUFVLFFBQVEsS0FBSztBQUN6QyxZQUFJLFNBQVMsVUFBVSxDQUFDO0FBQ3hCLGlCQUFTLE9BQU8sUUFBUTtBQUN0QixjQUFJLE9BQU8sVUFBVSxlQUFlLEtBQUssUUFBUSxHQUFHLEdBQUc7QUFDckQsbUJBQU8sR0FBRyxJQUFJLE9BQU8sR0FBRztBQUFBLFVBQzFCO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFDQSxhQUFPO0FBQUEsSUFDVDtBQUNBLFFBQUksY0FBYyxTQUFTLGFBQWEsTUFBTTtBQUM1QyxhQUFPLEtBQUssWUFBWTtBQUFBLElBQzFCO0FBQ0EsUUFBSSxhQUFhLFNBQVMsWUFBWSxVQUFVO0FBQzlDLGFBQU8sU0FBUyxVQUFVLGNBQWMsUUFBUTtBQUFBLElBQ2xEO0FBQ0EsUUFBSSxTQUFTLFNBQVMsUUFBUSxVQUFVO0FBQ3RDLGFBQU8sWUFBWSxTQUFTLGFBQWE7QUFBQSxJQUMzQztBQUNBLFFBQUksUUFBUSxTQUFTLE9BQU8sT0FBTztBQUNqQyxVQUFJLFNBQVMsTUFBTSxjQUFjLE1BQU07QUFDdkMsYUFBTyxPQUFPLE9BQU8sRUFBRSxFQUFFLFlBQVksTUFBTTtBQUFBLElBQzdDO0FBQ0EsUUFBSSx3QkFBd0IsU0FBUyx1QkFBdUIsVUFBVTtBQUNwRSxVQUFJO0FBQ0YsWUFBSSxNQUFNLFFBQVEsUUFBUSxHQUFHO0FBQzNCLGlCQUFPLFNBQVMs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
