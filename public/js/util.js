//based on https://codyhouse.co/gem/schedule-template
//licence : https://codyhouse.co/license
// ---------- Utility Functions ----------
function Util() { }

Util.hasClass = function (element, className) {
    return element.classList.contains(className);
};

Util.addClass = function (element, className) {
    const classes = className.split(" ");
    element.classList.add(classes[0]);
    if (classes.length > 1) {
        Util.addClass(element, classes.slice(1).join(" "));
    }
};

Util.removeClass = function (element, className) {
    const classes = className.split(" ");
    element.classList.remove(classes[0]);
    if (classes.length > 1) {
        Util.removeClass(element, classes.slice(1).join(" "));
    }
};

Util.toggleClass = function (element, className, shouldHaveClass) {
  if (shouldHaveClass) {
    Util.addClass(element, className);
  } else {
    Util.removeClass(element, className);
  }
};

Util.extend = function () {
  let extended = {};
  let deep = false;
  let startIndex = 0;
  const argsCount = arguments.length;

  if (Object.prototype.toString.call(arguments[0]) === "[object Boolean]") {
    deep = arguments[0];
    startIndex++;
  }

  function copyProperties(obj) {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (deep && Object.prototype.toString.call(obj[key]) === "[object Object]") {
          extended[key] = Util.extend(true, extended[key], obj[key]);
        } else {
          extended[key] = obj[key];
        }
      }
    }
  }

  for (let i = startIndex; i < argsCount; i++) {
    copyProperties(arguments[i]);
  }

  return extended;
};

Util.osHasReducedMotion = function () {
  if (!window.matchMedia) return false;
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  return mediaQuery && mediaQuery.matches;
};

Math.easeOutQuart = function (timeElapsed, startValue, changeInValue, duration) {
  timeElapsed /= duration;
  return -changeInValue * ( --timeElapsed * timeElapsed * timeElapsed * timeElapsed - 1) + startValue;
};