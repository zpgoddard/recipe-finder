/*
Unobtrusive JavaScript
https://github.com/rails/rails/blob/main/actionview/app/javascript
Released under the MIT license
 */
(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, 
  global.Rails = factory());
})(this, (function() {
  "use strict";
  const linkClickSelector = "a[data-confirm], a[data-method], a[data-remote]:not([disabled]), a[data-disable-with], a[data-disable]";
  const buttonClickSelector = {
    selector: "button[data-remote]:not([form]), button[data-confirm]:not([form])",
    exclude: "form button"
  };
  const inputChangeSelector = "select[data-remote], input[data-remote], textarea[data-remote]";
  const formSubmitSelector = "form:not([data-turbo=true])";
  const formInputClickSelector = "form:not([data-turbo=true]) input[type=submit], form:not([data-turbo=true]) input[type=image], form:not([data-turbo=true]) button[type=submit], form:not([data-turbo=true]) button:not([type]), input[type=submit][form], input[type=image][form], button[type=submit][form], button[form]:not([type])";
  const formDisableSelector = "input[data-disable-with]:enabled, button[data-disable-with]:enabled, textarea[data-disable-with]:enabled, input[data-disable]:enabled, button[data-disable]:enabled, textarea[data-disable]:enabled";
  const formEnableSelector = "input[data-disable-with]:disabled, button[data-disable-with]:disabled, textarea[data-disable-with]:disabled, input[data-disable]:disabled, button[data-disable]:disabled, textarea[data-disable]:disabled";
  const fileInputSelector = "input[name][type=file]:not([disabled])";
  const linkDisableSelector = "a[data-disable-with], a[data-disable]";
  const buttonDisableSelector = "button[data-remote][data-disable-with], button[data-remote][data-disable]";
  let nonce = null;
  const loadCSPNonce = () => {
    const metaTag = document.querySelector("meta[name=csp-nonce]");
    return nonce = metaTag && metaTag.content;
  };
  const cspNonce = () => nonce || loadCSPNonce();
  const m = Element.prototype.matches || Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector;
  const matches = function(element, selector) {
    if (selector.exclude) {
      return m.call(element, selector.selector) && !m.call(element, selector.exclude);
    } else {
      return m.call(element, selector);
    }
  };
  const EXPANDO = "_ujsData";
  const getData = (element, key) => element[EXPANDO] ? element[EXPANDO][key] : undefined;
  const setData = function(element, key, value) {
    if (!element[EXPANDO]) {
      element[EXPANDO] = {};
    }
    return element[EXPANDO][key] = value;
  };
  const $ = selector => Array.prototype.slice.call(document.querySelectorAll(selector));
  const isContentEditable = function(element) {
    var isEditable = false;
    do {
      if (element.isContentEditable) {
        isEditable = true;
        break;
      }
      element = element.parentElement;
    } while (element);
    return isEditable;
  };
  const csrfToken = () => {
    const meta = document.querySelector("meta[name=csrf-token]");
    return meta && meta.content;
  };
  const csrfParam = () => {
    const meta = document.querySelector("meta[name=csrf-param]");
    return meta && meta.content;
  };
  const CSRFProtection = xhr => {
    const token = csrfToken();
    if (token) {
      return xhr.setRequestHeader("X-CSRF-Token", token);
    }
  };
  const refreshCSRFTokens = () => {
    const token = csrfToken();
    const param = csrfParam();
    if (token && param) {
      return $('form input[name="' + param + '"]').forEach((input => input.value = token));
    }
  };
  const AcceptHeaders = {
    "*": "*/*",
    text: "text/plain",
    html: "text/html",
    xml: "application/xml, text/xml",
    json: "application/json, text/javascript",
    script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
  };
  const ajax = options => {
    options = prepareOptions(options);
    var xhr = createXHR(options, (function() {
      const response = processResponse(xhr.response != null ? xhr.response : xhr.responseText, xhr.getResponseHeader("Content-Type"));
      if (Math.floor(xhr.status / 100) === 2) {
        if (typeof options.success === "function") {
          options.success(response, xhr.statusText, xhr);
        }
      } else {
        if (typeof options.error === "function") {
          options.error(response, xhr.statusText, xhr);
        }
      }
      return typeof options.complete === "function" ? options.complete(xhr, xhr.statusText) : undefined;
    }));
    if (options.beforeSend && !options.beforeSend(xhr, options)) {
      return false;
    }
    if (xhr.readyState === XMLHttpRequest.OPENED) {
      return xhr.send(options.data);
    }
  };
  var prepareOptions = function(options) {
    options.url = options.url || location.href;
    options.type = options.type.toUpperCase();
    if (options.type === "GET" && options.data) {
      if (options.url.indexOf("?") < 0) {
        options.url += "?" + options.data;
      } else {
        options.url += "&" + options.data;
      }
    }
    if (!(options.dataType in AcceptHeaders)) {
      options.dataType = "*";
    }
    options.accept = AcceptHeaders[options.dataType];
    if (options.dataType !== "*") {
      options.accept += ", */*; q=0.01";
    }
    return options;
  };
  var createXHR = function(options, done) {
    const xhr = new XMLHttpRequest;
    xhr.open(options.type, options.url, true);
    xhr.setRequestHeader("Accept", options.accept);
    if (typeof options.data === "string") {
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    }
    if (!options.crossDomain) {
      xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
      CSRFProtection(xhr);
    }
    xhr.withCredentials = !!options.withCredentials;
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        return done(xhr);
      }
    };
    return xhr;
  };
  var processResponse = function(response, type) {
    if (typeof response === "string" && typeof type === "string") {
      if (type.match(/\bjson\b/)) {
        try {
          response = JSON.parse(response);
        } catch (error) {}
      } else if (type.match(/\b(?:java|ecma)script\b/)) {
        const script = document.createElement("script");
        script.setAttribute("nonce", cspNonce());
        script.text = response;
        document.head.appendChild(script).parentNode.removeChild(script);
      } else if (type.match(/\b(xml|html|svg)\b/)) {
        const parser = new DOMParser;
        type = type.replace(/;.+/, "");
        try {
          response = parser.parseFromString(response, type);
        } catch (error1) {}
      }
    }
    return response;
  };
  const href = element => element.href;
  const isCrossDomain = function(url) {
    const originAnchor = document.createElement("a");
    originAnchor.href = location.href;
    const urlAnchor = document.createElement("a");
    try {
      urlAnchor.href = url;
      return !((!urlAnchor.protocol || urlAnchor.protocol === ":") && !urlAnchor.host || originAnchor.protocol + "//" + originAnchor.host === urlAnchor.protocol + "//" + urlAnchor.host);
    } catch (e) {
      return true;
    }
  };
  let preventDefault;
  let {CustomEvent: CustomEvent} = window;
  if (typeof CustomEvent !== "function") {
    CustomEvent = function(event, params) {
      const evt = document.createEvent("CustomEvent");
      evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
      return evt;
    };
    CustomEvent.prototype = window.Event.prototype;
    ({preventDefault: preventDefault} = CustomEvent.prototype);
    CustomEvent.prototype.preventDefault = function() {
      const result = preventDefault.call(this);
      if (this.cancelable && !this.defaultPrevented) {
        Object.defineProperty(this, "defaultPrevented", {
          get() {
            return true;
          }
        });
      }
      return result;
    };
  }
  const fire = (obj, name, data) => {
    const event = new CustomEvent(name, {
      bubbles: true,
      cancelable: true,
      detail: data
    });
    obj.dispatchEvent(event);
    return !event.defaultPrevented;
  };
  const stopEverything = e => {
    fire(e.target, "ujs:everythingStopped");
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  };
  const delegate = (element, selector, eventType, handler) => element.addEventListener(eventType, (function(e) {
    let {target: target} = e;
    while (!!(target instanceof Element) && !matches(target, selector)) {
      target = target.parentNode;
    }
    if (target instanceof Element && handler.call(target, e) === false) {
      e.preventDefault();
      e.stopPropagation();
    }
  }));
  const toArray = e => Array.prototype.slice.call(e);
  const serializeElement = (element, additionalParam) => {
    let inputs = [ element ];
    if (matches(element, "form")) {
      inputs = toArray(element.elements);
    }
    const params = [];
    inputs.forEach((function(input) {
      if (!input.name || input.disabled) {
        return;
      }
      if (matches(input, "fieldset[disabled] *")) {
        return;
      }
      if (matches(input, "select")) {
        toArray(input.options).forEach((function(option) {
          if (option.selected) {
            params.push({
              name: input.name,
              value: option.value
            });
          }
        }));
      } else if (input.checked || [ "radio", "checkbox", "submit" ].indexOf(input.type) === -1) {
        params.push({
          name: input.name,
          value: input.value
        });
      }
    }));
    if (additionalParam) {
      params.push(additionalParam);
    }
    return params.map((function(param) {
      if (param.name) {
        return `${encodeURIComponent(param.name)}=${encodeURIComponent(param.value)}`;
      } else {
        return param;
      }
    })).join("&");
  };
  const formElements = (form, selector) => {
    if (matches(form, "form")) {
      return toArray(form.elements).filter((el => matches(el, selector)));
    } else {
      return toArray(form.querySelectorAll(selector));
    }
  };
  const handleConfirmWithRails = rails => function(e) {
    if (!allowAction(this, rails)) {
      stopEverything(e);
    }
  };
  const confirm = (message, element) => window.confirm(message);
  var allowAction = function(element, rails) {
    let callback;
    const message = element.getAttribute("data-confirm");
    if (!message) {
      return true;
    }
    let answer = false;
    if (fire(element, "confirm")) {
      try {
        answer = rails.confirm(message, element);
      } catch (error) {}
      callback = fire(element, "confirm:complete", [ answer ]);
    }
    return answer && callback;
  };
  const handleDisabledElement = function(e) {
    const element = this;
    if (element.disabled) {
      stopEverything(e);
    }
  };
  const enableElement = e => {
    let element;
    if (e instanceof Event) {
      if (isXhrRedirect(e)) {
        return;
      }
      element = e.target;
    } else {
      element = e;
    }
    if (isContentEditable(element)) {
      return;
    }
    if (matches(element, linkDisableSelector)) {
      return enableLinkElement(element);
    } else if (matches(element, buttonDisableSelector) || matches(element, formEnableSelector)) {
      return enableFormElement(element);
    } else if (matches(element, formSubmitSelector)) {
      return enableFormElements(element);
    }
  };
  const disableElement = e => {
    const element = e instanceof Event ? e.target : e;
    if (isContentEditable(element)) {
      return;
    }
    if (matches(element, linkDisableSelector)) {
      return disableLinkElement(element);
    } else if (matches(element, buttonDisableSelector) || matches(element, formDisableSelector)) {
      return disableFormElement(element);
    } else if (matches(element, formSubmitSelector)) {
      return disableFormElements(element);
    }
  };
  var disableLinkElement = function(element) {
    if (getData(element, "ujs:disabled")) {
      return;
    }
    const replacement = element.getAttribute("data-disable-with");
    if (replacement != null) {
      setData(element, "ujs:enable-with", element.innerHTML);
      element.innerHTML = replacement;
    }
    element.addEventListener("click", stopEverything);
    return setData(element, "ujs:disabled", true);
  };
  var enableLinkElement = function(element) {
    const originalText = getData(element, "ujs:enable-with");
    if (originalText != null) {
      element.innerHTML = originalText;
      setData(element, "ujs:enable-with", null);
    }
    element.removeEventListener("click", stopEverything);
    return setData(element, "ujs:disabled", null);
  };
  var disableFormElements = form => formElements(form, formDisableSelector).forEach(disableFormElement);
  var disableFormElement = function(element) {
    if (getData(element, "ujs:disabled")) {
      return;
    }
    const replacement = element.getAttribute("data-disable-with");
    if (replacement != null) {
      if (matches(element, "button")) {
        setData(element, "ujs:enable-with", element.innerHTML);
        element.innerHTML = replacement;
      } else {
        setData(element, "ujs:enable-with", element.value);
        element.value = replacement;
      }
    }
    element.disabled = true;
    return setData(element, "ujs:disabled", true);
  };
  var enableFormElements = form => formElements(form, formEnableSelector).forEach((element => enableFormElement(element)));
  var enableFormElement = function(element) {
    const originalText = getData(element, "ujs:enable-with");
    if (originalText != null) {
      if (matches(element, "button")) {
        element.innerHTML = originalText;
      } else {
        element.value = originalText;
      }
      setData(element, "ujs:enable-with", null);
    }
    element.disabled = false;
    return setData(element, "ujs:disabled", null);
  };
  var isXhrRedirect = function(event) {
    const xhr = event.detail ? event.detail[0] : undefined;
    return xhr && xhr.getResponseHeader("X-Xhr-Redirect");
  };
  const handleMethodWithRails = rails => function(e) {
    const link = this;
    const method = link.getAttribute("data-method");
    if (!method) {
      return;
    }
    if (isContentEditable(this)) {
      return;
    }
    const href = rails.href(link);
    const csrfToken$1 = csrfToken();
    const csrfParam$1 = csrfParam();
    const form = document.createElement("form");
    let formContent = `<input name='_method' value='${method}' type='hidden' />`;
    if (csrfParam$1 && csrfToken$1 && !isCrossDomain(href)) {
      formContent += `<input name='${csrfParam$1}' value='${csrfToken$1}' type='hidden' />`;
    }
    formContent += '<input type="submit" />';
    form.method = "post";
    form.action = href;
    form.target = link.target;
    form.innerHTML = formContent;
    form.style.display = "none";
    document.body.appendChild(form);
    form.querySelector('[type="submit"]').click();
    stopEverything(e);
  };
  const isRemote = function(element) {
    const value = element.getAttribute("data-remote");
    return value != null && value !== "false";
  };
  const handleRemoteWithRails = rails => function(e) {
    let data, method, url;
    const element = this;
    if (!isRemote(element)) {
      return true;
    }
    if (!fire(element, "ajax:before")) {
      fire(element, "ajax:stopped");
      return false;
    }
    if (isContentEditable(element)) {
      fire(element, "ajax:stopped");
      return false;
    }
    const withCredentials = element.getAttribute("data-with-credentials");
    const dataType = element.getAttribute("data-type") || "script";
    if (matches(element, formSubmitSelector)) {
      const button = getData(element, "ujs:submit-button");
      method = getData(element, "ujs:submit-button-formmethod") || element.getAttribute("method") || "get";
      url = getData(element, "ujs:submit-button-formaction") || element.getAttribute("action") || location.href;
      if (method.toUpperCase() === "GET") {
        url = url.replace(/\?.*$/, "");
      }
      if (element.enctype === "multipart/form-data") {
        data = new FormData(element);
        if (button != null) {
          data.append(button.name, button.value);
        }
      } else {
        data = serializeElement(element, button);
      }
      setData(element, "ujs:submit-button", null);
      setData(element, "ujs:submit-button-formmethod", null);
      setData(element, "ujs:submit-button-formaction", null);
    } else if (matches(element, buttonClickSelector) || matches(element, inputChangeSelector)) {
      method = element.getAttribute("data-method");
      url = element.getAttribute("data-url");
      data = serializeElement(element, element.getAttribute("data-params"));
    } else {
      method = element.getAttribute("data-method");
      url = rails.href(element);
      data = element.getAttribute("data-params");
    }
    ajax({
      type: method || "GET",
      url: url,
      data: data,
      dataType: dataType,
      beforeSend(xhr, options) {
        if (fire(element, "ajax:beforeSend", [ xhr, options ])) {
          return fire(element, "ajax:send", [ xhr ]);
        } else {
          fire(element, "ajax:stopped");
          return false;
        }
      },
      success(...args) {
        return fire(element, "ajax:success", args);
      },
      error(...args) {
        return fire(element, "ajax:error", args);
      },
      complete(...args) {
        return fire(element, "ajax:complete", args);
      },
      crossDomain: isCrossDomain(url),
      withCredentials: withCredentials != null && withCredentials !== "false"
    });
    stopEverything(e);
  };
  const formSubmitButtonClick = function(e) {
    const button = this;
    const {form: form} = button;
    if (!form) {
      return;
    }
    if (button.name) {
      setData(form, "ujs:submit-button", {
        name: button.name,
        value: button.value
      });
    }
    setData(form, "ujs:formnovalidate-button", button.formNoValidate);
    setData(form, "ujs:submit-button-formaction", button.getAttribute("formaction"));
    return setData(form, "ujs:submit-button-formmethod", button.getAttribute("formmethod"));
  };
  const preventInsignificantClick = function(e) {
    const link = this;
    const method = (link.getAttribute("data-method") || "GET").toUpperCase();
    const data = link.getAttribute("data-params");
    const metaClick = e.metaKey || e.ctrlKey;
    const insignificantMetaClick = metaClick && method === "GET" && !data;
    const nonPrimaryMouseClick = e.button != null && e.button !== 0;
    if (nonPrimaryMouseClick || insignificantMetaClick) {
      e.stopImmediatePropagation();
    }
  };
  const Rails = {
    $: $,
    ajax: ajax,
    buttonClickSelector: buttonClickSelector,
    buttonDisableSelector: buttonDisableSelector,
    confirm: confirm,
    cspNonce: cspNonce,
    csrfToken: csrfToken,
    csrfParam: csrfParam,
    CSRFProtection: CSRFProtection,
    delegate: delegate,
    disableElement: disableElement,
    enableElement: enableElement,
    fileInputSelector: fileInputSelector,
    fire: fire,
    formElements: formElements,
    formEnableSelector: formEnableSelector,
    formDisableSelector: formDisableSelector,
    formInputClickSelector: formInputClickSelector,
    formSubmitButtonClick: formSubmitButtonClick,
    formSubmitSelector: formSubmitSelector,
    getData: getData,
    handleDisabledElement: handleDisabledElement,
    href: href,
    inputChangeSelector: inputChangeSelector,
    isCrossDomain: isCrossDomain,
    linkClickSelector: linkClickSelector,
    linkDisableSelector: linkDisableSelector,
    loadCSPNonce: loadCSPNonce,
    matches: matches,
    preventInsignificantClick: preventInsignificantClick,
    refreshCSRFTokens: refreshCSRFTokens,
    serializeElement: serializeElement,
    setData: setData,
    stopEverything: stopEverything
  };
  const handleConfirm = handleConfirmWithRails(Rails);
  Rails.handleConfirm = handleConfirm;
  const handleMethod = handleMethodWithRails(Rails);
  Rails.handleMethod = handleMethod;
  const handleRemote = handleRemoteWithRails(Rails);
  Rails.handleRemote = handleRemote;
  const start = function() {
    if (window._rails_loaded) {
      throw new Error("rails-ujs has already been loaded!");
    }
    window.addEventListener("pageshow", (function() {
      $(formEnableSelector).forEach((function(el) {
        if (getData(el, "ujs:disabled")) {
          enableElement(el);
        }
      }));
      $(linkDisableSelector).forEach((function(el) {
        if (getData(el, "ujs:disabled")) {
          enableElement(el);
        }
      }));
    }));
    delegate(document, linkDisableSelector, "ajax:complete", enableElement);
    delegate(document, linkDisableSelector, "ajax:stopped", enableElement);
    delegate(document, buttonDisableSelector, "ajax:complete", enableElement);
    delegate(document, buttonDisableSelector, "ajax:stopped", enableElement);
    delegate(document, linkClickSelector, "click", preventInsignificantClick);
    delegate(document, linkClickSelector, "click", handleDisabledElement);
    delegate(document, linkClickSelector, "click", handleConfirm);
    delegate(document, linkClickSelector, "click", disableElement);
    delegate(document, linkClickSelector, "click", handleRemote);
    delegate(document, linkClickSelector, "click", handleMethod);
    delegate(document, buttonClickSelector, "click", preventInsignificantClick);
    delegate(document, buttonClickSelector, "click", handleDisabledElement);
    delegate(document, buttonClickSelector, "click", handleConfirm);
    delegate(document, buttonClickSelector, "click", disableElement);
    delegate(document, buttonClickSelector, "click", handleRemote);
    delegate(document, inputChangeSelector, "change", handleDisabledElement);
    delegate(document, inputChangeSelector, "change", handleConfirm);
    delegate(document, inputChangeSelector, "change", handleRemote);
    delegate(document, formSubmitSelector, "submit", handleDisabledElement);
    delegate(document, formSubmitSelector, "submit", handleConfirm);
    delegate(document, formSubmitSelector, "submit", handleRemote);
    delegate(document, formSubmitSelector, "submit", (e => setTimeout((() => disableElement(e)), 13)));
    delegate(document, formSubmitSelector, "ajax:send", disableElement);
    delegate(document, formSubmitSelector, "ajax:complete", enableElement);
    delegate(document, formInputClickSelector, "click", preventInsignificantClick);
    delegate(document, formInputClickSelector, "click", handleDisabledElement);
    delegate(document, formInputClickSelector, "click", handleConfirm);
    delegate(document, formInputClickSelector, "click", formSubmitButtonClick);
    document.addEventListener("DOMContentLoaded", refreshCSRFTokens);
    document.addEventListener("DOMContentLoaded", loadCSPNonce);
    return window._rails_loaded = true;
  };
  Rails.start = start;
  if (typeof jQuery !== "undefined" && jQuery && jQuery.ajax) {
    if (jQuery.rails) {
      throw new Error("If you load both jquery_ujs and rails-ujs, use rails-ujs only.");
    }
    jQuery.rails = Rails;
    jQuery.ajaxPrefilter((function(options, originalOptions, xhr) {
      if (!options.crossDomain) {
        return CSRFProtection(xhr);
      }
    }));
  }
  if (typeof exports !== "object" && typeof module === "undefined") {
    window.Rails = Rails;
    if (fire(document, "rails:attachBindings")) {
      start();
    }
  }
  return Rails;
}));



let currentPage = 1; // Page number for paginated results
let loading = false; // Flag to prevent multiple simultaneous requests and provide user feedback that data is loading
let myIngredients = []; // Array to store user's ingredients
let selectedRecipeWrapper = null; // Reference to the currently selected recipe wrapper, avoids duplicates

// Add event listeners to the buttons and input fields
document.addEventListener('DOMContentLoaded', function() {
  const addButton = document.getElementById('add-button');
  const findRecipesButton = document.getElementById('find-recipes-button');
  const ingredientsInput = document.getElementById('ingredients');
  const recipesListBox = document.getElementById('recipes-list-box');

  if (addButton) {
    addButton.addEventListener('click', addIngredient);
  }
  if (findRecipesButton) {
    findRecipesButton.addEventListener('click', () => fetchRecipes(false));
  }
  if (ingredientsInput) {
    ingredientsInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        addIngredient();
      }
    });
  }
  if (recipesListBox) {
    recipesListBox.addEventListener('scroll', () => {
      if (recipesListBox.scrollTop + recipesListBox.clientHeight >= recipesListBox.scrollHeight) {
        fetchRecipes(true);
      }
    });
  }
  window.addEventListener('scroll', () => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
      fetchRecipes(true);
    }
  });
});

// Function to add an ingredient to the list of user's ingredients
const addIngredient = () => {
  const ingredientInput = document.getElementById('ingredients');
  if (ingredientInput.value.trim().length < 3) {
    alert('Please enter at least 3 characters.'); // If ingridient is too short show alert and disallow adding
  } else {
    myIngredients.push(ingredientInput.value.trim());
    ingredientInput.value = '';
    renderIngredients();
  }
}

// Function to remove an ingredient from the list of user's ingredients
const removeIngredient = (index) => {
  myIngredients.splice(index, 1);
  renderIngredients();
}

// Function to clear then re-render the list of user's ingredients
const renderIngredients = () => {
  const ingredientsRow = document.getElementById('my-ingredients-row');
  ingredientsRow.innerHTML = '';
  myIngredients.forEach((ingredient, index) => {
    const ingredientDiv = document.createElement('div');
    ingredientDiv.className = 'my-ingredient';
    ingredientDiv.textContent = ingredient;
    ingredientDiv.onclick = () => removeIngredient(index);
    ingredientsRow.appendChild(ingredientDiv);
  });
}

// Function to search for recipes based on the user's ingredients or load more recipes
const fetchRecipes = async(loadMore = false) => {
  const ingredientInput = document.getElementById('ingredients');
  const ingredientValue = ingredientInput.value.trim();

  // Check if the input field has a value and trigger the addIngredient function
  if (!loadMore && ingredientValue.length >= 3) {
    addIngredient();
  }

  if (!loadMore) {
    currentPage = 1; // Reset page number to 1 for a new search
  } else {
    currentPage++; // Increment page number for loading more recipes
  }

  const spinner = document.getElementById('spinner');
  const noResults = document.getElementById('no-results');
  const recipesListBox = document.getElementById('recipes');
  spinner.style.display = 'block';
  if (!loadMore) {
    noResults.style.display = 'none';
    recipesListBox.innerHTML = ''; // Clear previous results for a new search
  }

  try {
    const response = await fetch(`/recipes/search?ingredients=${encodeURIComponent(myIngredients.join(","))}&page=${currentPage}`); // Fetch recipes from the server
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const recipes = await response.json();

    if (recipes.length === 0 && !loadMore) {
      noResults.style.display = 'block'; // Display a message if no recipes are found
    } else {
      appendRecipes(recipes, myIngredients); // Append the recipes to the recipes list
    }
  } catch (error) {
    console.error('Error fetching recipes:', error); // Log any errors to the console
    if (!loadMore) {
      noResults.style.display = 'block';
    }
  } finally {
    spinner.style.display = 'none';
    loading = false;
  }
}

// Function to append recipes to the recipes list
const appendRecipes = (recipes) => {
  const recipesContainer = document.getElementById('recipes');
  recipes.forEach(recipe => { // Loop through each recipe and create a recipe div
    const recipeDiv = document.createElement('div');
    recipeDiv.className = 'recipe';

    const imageUrl = recipe.image_url;
    const fullStars = Math.floor(recipe.ratings); // Calculate the number of full stars
    const partialStar = (recipe.ratings - fullStars) * 100; // Calculate the percentage of the partial star by multiplying the reamaining decimal part of the rating by 100

    // Create the recipe div with the recipe details
    recipeDiv.innerHTML = `
      <div id="recipe-wrapper" class="recipe-wrapper">
        <div style="display: flex;">
          <div id="recipe-img-wrapper" class="recipe-img-wrapper">
            <img id="recipe-img" class="recipe-img" src="${imageUrl}" alt="${recipe.title}">
          </div>
          <div id="recipe-text-wrapper" class="recipe-text-wrapper">
            <div id="recipe-title" class="recipe-title">${recipe.title}</div>
            <div id="recipe-time" class="recipe-time"><strong>${parseInt(recipe.prep_time) + parseInt(recipe.cook_time)} mins</strong></div>
          </div>
        </div>
        <div id="recipe-rating-wrapper" class="recipe-rating-wrapper">
          <div id="recipe-rating-stars" class="recipe-rating-stars">
            ${[...Array(5)].map((_, i) => {
              if (i < fullStars) {
                return `
                  <div class="recipe-circle">
                    <div class="recipe-circle-filled" style="width: 100%;"></div>
                  </div>`;
              } else if (i === fullStars) {
                return `
                  <div class="recipe-circle">
                    <div class="recipe-circle-filled" style="width: ${partialStar}%;"></div>
                  </div>`;
              } else {
                return `
                  <div class="recipe-circle">
                    <div class="recipe-circle-filled" style="width: 0%;"></div>
                  </div>`;
              }
            }).join('')}
          </div>
          <div id="recipe-rating-text" class="recipe-rating-text">${recipe.ratings} / 5</div>
        </div>
      </div>
    `;

    // Add event listeners to the recipe div to display the recipe details when clicked
    recipeDiv.addEventListener('click', () => {
      const recipeBox = document.getElementById('recipe-box');

      recipeBox.innerHTML = `
        <div id="recipe-panel-category" class="recipe-panel-category">Category: ${recipe.category}</div>
        <div id="recipe-panel-header" class="recipe-panel-header">
          <div id="recipe-panel-img" class="recipe-panel-img">
            <img id="recipe-img" class="recipe-img" src="${imageUrl}" alt="${recipe.title}">
          </div>
          <div id="recipe-panel-header-info" class="recipe-panel-header-info">
            <div id="recipe-panel-titles" class="recipe-panel-titles">
              <div id="recipe-panel-title" class="recipe-panel-title">${recipe.title}</div>
              <div id="recipe-panel-author" class="recipe-panel-author">By ${recipe.author}</div>
            </div>
            <div id="recipe-panel-other-info" class="recipe-panel-other-info">
              <div id="recipe-panel-times" class="recipe-panel-times">
                <div id="recipe-panel-prep-time" class="recipe-panel-prep-time"><strong>Prep Time:</strong> ${recipe.prep_time} mins</div>
                <div id="recipe-panel-cook-time" class="recipe-panel-cook-time"><strong>Cook Time:</strong> ${recipe.cook_time} mins</div>
              </div>
              <div id="recipe-panel-ratings-wrapper" class="recipe-panel-ratings-wrapper">
                <div id="recipe-panel-stars" class="recipe-panel-stars">
                    ${[...Array(5)].map((_, i) => {
                    if (i < fullStars) {
                        return `
                        <div class="recipe-circle">
                            <div class="recipe-circle-filled" style="width: 100%;"></div>
                        </div>`;
                    } else if (i === fullStars) {
                        return `
                        <div class="recipe-circle">
                            <div class="recipe-circle-filled" style="width: ${partialStar}%;"></div>
                        </div>`;
                    } else {
                        return `
                        <div class="recipe-circle">
                            <div class="recipe-circle-filled" style="width: 0%;"></div>
                        </div>`;
                    }
                    }).join('')}
                  </div>
                <div id="recipe-panel-rating" class="recipe-panel-rating">${recipe.ratings} / 5</div>
              </div>
            </div>
          </div>
        </div>
        <div id="recipe-panel-ingredients" class="recipe-panel-ingredients">
          <div><strong>INGREDIENTS</strong></div>
          ${recipe.recipe_ingredients.map(ingredient => `
            <li id="ingredient" class="ingredient">${ingredient.amount ? ingredient.amount : ""}${ingredient.measurement ? " " + ingredient.measurement : ""} ${ingredient.ingredient_name}</li>
          `).join('')}
        </div>
      `;
    });

    // Add event listener to the recipe wrapper to highlight the selected recipe
    recipeDiv.querySelector('#recipe-wrapper').addEventListener('click', () => {
      if (selectedRecipeWrapper) {
        selectedRecipeWrapper.classList.remove('recipe-wrapper-selected'); // Remove the selected class from the previously selected recipe
        selectedRecipeWrapper.classList.add('recipe-wrapper'); // Add the default class to the previously selected recipe
      }
      recipeDiv.querySelector('#recipe-wrapper').classList.remove('recipe-wrapper'); // Remove the default class from the selected recipe
      recipeDiv.querySelector('#recipe-wrapper').classList.add('recipe-wrapper-selected'); // Add the selected class to the selected
      selectedRecipeWrapper = recipeDiv.querySelector('#recipe-wrapper'); // Update the reference to the selected recipe wrapper
    });

    recipesContainer.appendChild(recipeDiv); // Append the recipe div to the recipes list
  });
};
