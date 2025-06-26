!function() {
    var r = function(e) {
        var t;
        this.options = w(r.defaults, e),
        this.element = this.options.element,
        this.input = this.element.getElementsByClassName("js-date-input__text")[0],
        this.trigger = this.element.getElementsByClassName("js-date-input__trigger")[0],
        this.triggerLabel = this.trigger.getAttribute("aria-label"),
        this.datePicker = this.element.getElementsByClassName("js-date-picker")[0],
        this.body = this.datePicker.getElementsByClassName("js-date-picker__dates")[0],
        this.navigation = this.datePicker.getElementsByClassName("js-date-picker__month-nav")[0],
        this.heading = this.datePicker.getElementsByClassName("js-date-picker__month-label")[0],
        this.pickerVisible = !1,
        this.dateIndexes = [(t = this.options.dateFormat.toLowerCase().replace(/-/g, "")).indexOf("d"), t.indexOf("m"), t.indexOf("y")],
        a(this),
        this.dateSelected = !1,
        this.selectedDay = !1,
        this.selectedMonth = !1,
        this.selectedYear = !1,
        this.firstFocusable = !1,
        this.lastFocusable = !1,
        this.dateValueEl = this.element.getElementsByClassName("js-date-input__value"),
        0 < this.dateValueEl.length && (this.dateValueLabelInit = this.dateValueEl[0].textContent),
        function(e) {
            k(e),
            0 < e.dateValueEl.length && (a(e),
            v(e));
            var t = document.createElement("div");
            t.setAttribute("aria-live", "polite"),
            t.classList.add("sr-only", "js-date-input__sr-live"),
            e.element.appendChild(t),
            e.srLiveReagion = e.element.getElementsByClassName("js-date-input__sr-live")[0]
        }(this),
        function(n) {
            n.input.addEventListener("focus", function(e) {
                h(n, !0)
            }),
            n.trigger && n.trigger.addEventListener("click", function(e) {
                e.preventDefault(),
                n.pickerVisible = !1,
                h(n),
                n.trigger.setAttribute("aria-expanded", "true")
            });
            n.body.addEventListener("click", function(e) {
                e.preventDefault();
                var t, r = e.target.closest("button");
                r && (n.dateSelected = !0,
                n.selectedDay = r.innerText,
                n.selectedMonth = n.currentMonth,
                n.selectedYear = n.currentYear,
                (t = n).input.value = p(t),
                n.input.focus(),
                k(n),
                v(n))
            }),
            n.navigation.addEventListener("click", function(e) {
                e.preventDefault();
                var t = e.target.closest(".js-date-picker__month-nav-btn");
                t && (t.classList.contains("js-date-picker__month-nav-btn--prev") ? s(n, !0) : o(n, !0))
            }),
            window.addEventListener("keydown", function(e) {
                (e.keyCode && 27 == e.keyCode || e.key && "escape" == e.key.toLowerCase()) && (document.activeElement.closest(".js-date-picker") ? n.input.focus() : d(n))
            }),
            window.addEventListener("click", function(e) {
                e.target.closest(".js-date-picker") || e.target.closest(".js-date-input") || !n.pickerVisible || d(n)
            }),
            n.body.addEventListener("keydown", function(e) {
                var t = n.currentDay;
                e.keyCode && 40 == e.keyCode || e.key && "arrowdown" == e.key.toLowerCase() ? g(t += 7, n) : e.keyCode && 39 == e.keyCode || e.key && "arrowright" == e.key.toLowerCase() ? g(t += 1, n) : e.keyCode && 37 == e.keyCode || e.key && "arrowleft" == e.key.toLowerCase() ? g(t -= 1, n) : e.keyCode && 38 == e.keyCode || e.key && "arrowup" == e.key.toLowerCase() ? g(t -= 7, n) : e.keyCode && 35 == e.keyCode || e.key && "end" == e.key.toLowerCase() ? (e.preventDefault(),
                g(t = t + 6 - f(n.currentYear, n.currentMonth, t), n)) : e.keyCode && 36 == e.keyCode || e.key && "home" == e.key.toLowerCase() ? (e.preventDefault(),
                g(t -= f(n.currentYear, n.currentMonth, t), n)) : e.keyCode && 34 == e.keyCode || e.key && "pagedown" == e.key.toLowerCase() ? (e.preventDefault(),
                o(n)) : (e.keyCode && 33 == e.keyCode || e.key && "pageup" == e.key.toLowerCase()) && (e.preventDefault(),
                s(n))
            }),
            n.datePicker.addEventListener("keydown", function(e) {
                (e.keyCode && 9 == e.keyCode || e.key && "Tab" == e.key) && function(e, t) {
                    t.firstFocusable == document.activeElement && e.shiftKey && (e.preventDefault(),
                    t.lastFocusable.focus());
                    t.lastFocusable != document.activeElement || e.shiftKey || (e.preventDefault(),
                    t.firstFocusable.focus())
                }(e, n)
            }),
            n.input.addEventListener("keydown", function(e) {
                e.keyCode && 13 == e.keyCode || e.key && "enter" == e.key.toLowerCase() ? (a(n),
                k(n),
                v(n),
                d(n)) : (e.keyCode && 40 == e.keyCode || e.key && "arrowdown" == e.key.toLowerCase() && n.pickerVisible) && n.body.querySelector('button[tabindex="0"]').focus()
            })
        }(this),
        C(this)
    };
    function c(e) {
        return e ? (t = parseInt(e.split("-")[2]),
        isNaN(t) ? c(!1) : t) : (new Date).getDate();
        var t
    }
    function l(e) {
        return e ? (t = parseInt(e.split("-")[1]) - 1,
        isNaN(t) ? l(!1) : t) : (new Date).getMonth();
        var t
    }
    function u(e) {
        return e ? (t = parseInt(e.split("-")[0]),
        isNaN(t) ? u(!1) : t) : (new Date).getFullYear();
        var t
    }
    function o(e, t) {
        e.currentYear = 11 === e.currentMonth ? e.currentYear + 1 : e.currentYear,
        e.currentMonth = (e.currentMonth + 1) % 12,
        e.currentDay = n(e),
        i(e, t),
        e.srLiveReagion.textContent = e.options.months[e.currentMonth] + " " + e.currentYear
    }
    function s(e, t) {
        e.currentYear = 0 === e.currentMonth ? e.currentYear - 1 : e.currentYear,
        e.currentMonth = 0 === e.currentMonth ? 11 : e.currentMonth - 1,
        e.currentDay = n(e),
        i(e, t),
        e.srLiveReagion.textContent = e.options.months[e.currentMonth] + " " + e.currentYear
    }
    function n(e) {
        return e.currentDay > y(e.currentYear, e.currentMonth) ? 1 : e.currentDay
    }
    function y(e, t) {
        return 32 - new Date(e,t,32).getDate()
    }
    function a(e) {
        var t, r, n = !1, a = e.input.value;
        if (e.dateSelected = !1,
        "" != a) {
            var i = (r = (t = e).input.value.split(t.options.dateSeparator))[t.dateIndexes[2]] + "-" + r[t.dateIndexes[1]] + "-" + r[t.dateIndexes[0]];
            e.dateSelected = !0,
            n = i
        }
        e.currentDay = c(n),
        e.currentMonth = l(n),
        e.currentYear = u(n),
        e.selectedDay = !!e.dateSelected && e.currentDay,
        e.selectedMonth = !!e.dateSelected && e.currentMonth,
        e.selectedYear = !!e.dateSelected && e.currentYear
    }
    function i(e, t) {
        var r = f(e.currentYear, e.currentMonth, "01");
        e.body.innerHTML = "",
        e.heading.innerHTML = e.options.months[e.currentMonth] + " " + e.currentYear;
        for (var n = 1, a = "", i = 0; i < 6; i++)
            for (var o = 0; o < 7; o++)
                if (0 === i && o < r)
                    a += "<li></li>";
                else {
                    if (n > y(e.currentYear, e.currentMonth))
                        break;
                    var s = ""
                      , d = "-1";
                    n === e.currentDay && (d = "0"),
                    e.dateSelected || l() != e.currentMonth || u() != e.currentYear || n != c() || (s += " date-picker__date--today"),
                    e.dateSelected && n === e.selectedDay && e.currentYear === e.selectedYear && e.currentMonth === e.selectedMonth && (s += "  date-picker__date--selected"),
                    a = a + '<li><button class="date-picker__date' + s + '" tabindex="' + d + '" type="button">' + n + "</button></li>",
                    n++
                }
        e.body.innerHTML = a,
        e.pickerVisible || e.datePicker.classList.add("date-picker--is-visible"),
        e.pickerVisible = !0,
        t || e.body.querySelector('button[tabindex="0"]').focus(),
        m(e),
        C(e)
    }
    function d(e) {
        e.datePicker.classList.remove("date-picker--is-visible"),
        e.pickerVisible = !1,
        e.firstFocusable = !1,
        e.lastFocusable = !1,
        e.trigger && e.trigger.setAttribute("aria-expanded", "false")
    }
    function h(e, t) {
        e.pickerVisible ? d(e) : (a(e),
        i(e, t))
    }
    function f(e, t, r) {
        var n = new Date(e,t,r).getDay() - 1;
        return n < 0 && (n = 6),
        n
    }
    function p(e) {
        var t = [];
        return t[e.dateIndexes[0]] = b(e.selectedDay),
        t[e.dateIndexes[1]] = b(e.selectedMonth + 1),
        t[e.dateIndexes[2]] = e.selectedYear,
        t[0] + e.options.dateSeparator + t[1] + e.options.dateSeparator + t[2]
    }
    function b(e) {
        return e < 10 ? "0" + e : e
    }
    function g(e, t) {
        var r = y(t.currentYear, t.currentMonth);
        if (r < e)
            t.currentDay = e - r,
            o(t, !1);
        else if (e < 1) {
            var n = 0 == t.currentMonth ? 11 : t.currentMonth - 1;
            t.currentDay = y(t.currentYear, n) + e,
            s(t, !1)
        } else {
            t.currentDay = e,
            t.body.querySelector('button[tabindex="0"]').setAttribute("tabindex", "-1");
            for (var a = t.body.getElementsByTagName("button"), i = 0; i < a.length; i++)
                if (a[i].textContent == t.currentDay) {
                    a[i].setAttribute("tabindex", "0"),
                    a[i].focus();
                    break
                }
            m(t)
        }
    }
    function k(e) {
        e.trigger && (e.selectedYear && !1 !== e.selectedMonth && e.selectedDay ? e.trigger.setAttribute("aria-label", e.triggerLabel + ", selected date is " + new Date(e.selectedYear,e.selectedMonth,e.selectedDay).toDateString()) : e.trigger.setAttribute("aria-label", e.triggerLabel))
    }
    function v(e) {
        e.dateValueEl.length < 1 || (e.selectedYear && !1 !== e.selectedMonth && e.selectedDay ? e.dateValueEl[0].textContent = p(e) : e.dateValueEl[0].textContent = e.dateValueLabelInit)
    }
    function m(e) {
        var t = e.datePicker.querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary');
        !function(e, t) {
            for (var r = 0; r < e.length; r++)
                if ((e[r].offsetWidth || e[r].offsetHeight || e[r].getClientRects().length) && "-1" != e[r].getAttribute("tabindex"))
                    return t.firstFocusable = e[r]
        }(t, e),
        function(e, t) {
            for (var r = e.length - 1; 0 <= r; r--)
                if ((e[r].offsetWidth || e[r].offsetHeight || e[r].getClientRects().length) && "-1" != e[r].getAttribute("tabindex"))
                    return t.lastFocusable = e[r]
        }(t, e)
    }
    function C(e) {
        e.datePicker.style.left = "0px",
        e.datePicker.style.right = "auto",
        e.datePicker.getBoundingClientRect().right > window.innerWidth && (e.datePicker.style.left = "auto",
        e.datePicker.style.right = "0px")
    }
    r.prototype.showCalendar = function() {
        i(this)
    }
    ,
    r.prototype.showNextMonth = function() {
        o(this, !0)
    }
    ,
    r.prototype.showPrevMonth = function() {
        s(this, !0)
    }
    ;
    var w = function() {
        var r = {}
          , n = !1
          , e = 0
          , t = arguments.length;
        "[object Boolean]" === Object.prototype.toString.call(arguments[0]) && (n = arguments[0],
        e++);
        for (var a = function(e) {
            for (var t in e)
                Object.prototype.hasOwnProperty.call(e, t) && (n && "[object Object]" === Object.prototype.toString.call(e[t]) ? r[t] = extend(!0, r[t], e[t]) : r[t] = e[t])
        }; e < t; e++) {
            a(arguments[e])
        }
        return r
    };
    r.defaults = {
        element: "",
        months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        dateFormat: "d-m-y",
        dateSeparator: "/"
    },
    window.DatePicker = r;
    var D = document.getElementsByClassName("js-date-input")
      , M = CSS.supports("align-items", "stretch");
    if (0 < D.length)
        for (var e = 0; e < D.length; e++)
            !function(e) {
                if (M) {
                    var t = {
                        element: D[e]
                    };
                    D[e].getAttribute("data-date-format") && (t.dateFormat = D[e].getAttribute("data-date-format")),
                    D[e].getAttribute("data-date-separator") && (t.dateSeparator = D[e].getAttribute("data-date-separator")),
                    D[e].getAttribute("data-months") && (t.months = D[e].getAttribute("data-months").split(",").map(function(e) {
                        return e.trim()
                    })),
                    new r(t)
                } else
                    D[e].classList.add("date-input--hide-calendar")
            }(e)
}();