(function () {
    function DatePicker(options) {
        let formatKey;
        this.options = extend(DatePicker.defaults, options);
        this.element = this.options.element;
        this.input = this.element.getElementsByClassName("js-date-input__text")[0];
        this.trigger = this.element.getElementsByClassName("js-date-input__trigger")[0];
        this.triggerLabel = this.trigger.getAttribute("aria-label");
        this.datePicker = this.element.getElementsByClassName("js-date-picker")[0];
        this.body = this.datePicker.getElementsByClassName("js-date-picker__dates")[0];
        this.navigation = this.datePicker.getElementsByClassName("js-date-picker__month-nav")[0];
        this.heading = this.datePicker.getElementsByClassName("js-date-picker__month-label")[0];
        this.pickerVisible = false;

        formatKey = this.options.dateFormat.toLowerCase().replace(/-/g, "");
        this.dateIndexes = [formatKey.indexOf("d"), formatKey.indexOf("m"), formatKey.indexOf("y")];

        initializeDate(this);

        this.dateSelected = false;
        this.selectedDay = false;
        this.selectedMonth = false;
        this.selectedYear = false;
        this.firstFocusable = false;
        this.lastFocusable = false;

        this.dateValueEl = this.element.getElementsByClassName("js-date-input__value");
        if (this.dateValueEl.length > 0) {
            this.dateValueLabelInit = this.dateValueEl[0].textContent;
        }

        initScreenReader(this);
        initEvents(this);
        adjustCalendarPosition(this);
    }

    // ---- UTILS ----

    function parseDay(dateStr) {
        if (!dateStr) return new Date().getDate();
        const day = parseInt(dateStr.split("-")[2]);
        return isNaN(day) ? new Date().getDate() : day;
    }

    function parseMonth(dateStr) {
        if (!dateStr) return new Date().getMonth();
        const month = parseInt(dateStr.split("-")[1]) - 1;
        return isNaN(month) ? new Date().getMonth() : month;
    }

    function parseYear(dateStr) {
        if (!dateStr) return new Date().getFullYear();
        const year = parseInt(dateStr.split("-")[0]);
        return isNaN(year) ? new Date().getFullYear() : year;
    }

    function daysInMonth(year, month) {
        return 32 - new Date(year, month, 32).getDate();
    }

    function getWeekdayOffset(year, month, day = 1) {
        let offset = new Date(year, month, day).getDay() - 1;
        return offset < 0 ? 6 : offset;
    }

    function pad(value) {
        return value < 10 ? "0" + value : value;
    }

    function formatDate(obj) {
        const parts = [];
        parts[obj.dateIndexes[0]] = pad(obj.selectedDay);
        parts[obj.dateIndexes[1]] = pad(obj.selectedMonth + 1);
        parts[obj.dateIndexes[2]] = obj.selectedYear;
        return parts.join(obj.options.dateSeparator);
    }

    function extend() {
        let result = {};
        let deep = false;
        let i = 0;

        if (typeof arguments[0] === "boolean") {
            deep = arguments[0];
            i++;
        }

        for (; i < arguments.length; i++) {
            const obj = arguments[i];
            for (let key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    if (deep && typeof obj[key] === "object") {
                        result[key] = extend(true, result[key], obj[key]);
                    } else {
                        result[key] = obj[key];
                    }
                }
            }
        }

        return result;
    }

    // ---- CORE ----

    function initializeDate(obj) {
        let iso = null;
        const value = obj.input.value;
        obj.dateSelected = false;

        if (value !== "") {
            const parts = value.split(obj.options.dateSeparator);
            iso = `${parts[obj.dateIndexes[2]]}-${parts[obj.dateIndexes[1]]}-${parts[obj.dateIndexes[0]]}`;
            obj.dateSelected = true;
        }

        obj.currentDay = parseDay(iso);
        obj.currentMonth = parseMonth(iso);
        obj.currentYear = parseYear(iso);
        obj.selectedDay = obj.dateSelected ? obj.currentDay : false;
        obj.selectedMonth = obj.dateSelected ? obj.currentMonth : false;
        obj.selectedYear = obj.dateSelected ? obj.currentYear : false;
    }

    function renderCalendar(obj, skipFocus = false) {
        const startOffset = getWeekdayOffset(obj.currentYear, obj.currentMonth);
        let html = "";
        let day = 1;

        obj.body.innerHTML = "";
        obj.heading.innerHTML = `${obj.options.months[obj.currentMonth]} ${obj.currentYear}`;

        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 7; j++) {
                if (i === 0 && j < startOffset) {
                    html += "<li></li>";
                } else if (day <= daysInMonth(obj.currentYear, obj.currentMonth)) {
                    let classList = "";
                    let tabIndex = "-1";

                    if (day === obj.currentDay) tabIndex = "0";
                    if (
                        !obj.dateSelected &&
                        obj.currentMonth === new Date().getMonth() &&
                        obj.currentYear === new Date().getFullYear() &&
                        day === new Date().getDate()
                    ) {
                        classList += " date-picker__date--today";
                    }
                    if (
                        obj.dateSelected &&
                        day === obj.selectedDay &&
                        obj.currentMonth === obj.selectedMonth &&
                        obj.currentYear === obj.selectedYear
                    ) {
                        classList += " date-picker__date--selected";
                    }

                    html += `<li><button class="date-picker__date${classList}" tabindex="${tabIndex}" type="button">${day}</button></li>`;
                    day++;
                }
            }
        }

        obj.body.innerHTML = html;

        if (!obj.pickerVisible) {
            obj.datePicker.classList.add("date-picker--is-visible");
            obj.pickerVisible = true;
        }

        if (!skipFocus) {
            const focusBtn = obj.body.querySelector('button[tabindex="0"]');
            focusBtn && focusBtn.focus();
        }

        updateFocusable(obj);
        adjustCalendarPosition(obj);
    }

    function hideCalendar(obj) {
        obj.datePicker.classList.remove("date-picker--is-visible");
        obj.pickerVisible = false;
        obj.firstFocusable = false;
        obj.lastFocusable = false;
        if (obj.trigger) obj.trigger.setAttribute("aria-expanded", "false");
    }

    function toggleCalendar(obj, skipFocus = false) {
        if (obj.pickerVisible) {
            hideCalendar(obj);
        } else {
            initializeDate(obj);
            renderCalendar(obj, skipFocus);
        }
    }

    function updateAria(obj) {
        if (obj.trigger) {
            if (obj.selectedYear !== false && obj.selectedMonth !== false && obj.selectedDay !== false) {
                obj.trigger.setAttribute("aria-label", `${obj.triggerLabel}, selected date is ${new Date(obj.selectedYear, obj.selectedMonth, obj.selectedDay).toDateString()}`);
            } else {
                obj.trigger.setAttribute("aria-label", obj.triggerLabel);
            }
        }
    }

    function updateLabel(obj) {
        if (obj.dateValueEl.length > 0) {
            obj.dateValueEl[0].textContent =
                obj.selectedYear !== false && obj.selectedMonth !== false && obj.selectedDay !== false
                    ? formatDate(obj)
                    : obj.dateValueLabelInit;
        }
    }

    function moveFocusToDay(dayIndex, obj) {
        const max = daysInMonth(obj.currentYear, obj.currentMonth);
        if (dayIndex > max) {
            obj.currentDay = dayIndex - max;
            showNextMonth(obj, false);
        } else if (dayIndex < 1) {
            const prevMonth = obj.currentMonth === 0 ? 11 : obj.currentMonth - 1;
            obj.currentDay = daysInMonth(obj.currentYear, prevMonth) + dayIndex;
            showPrevMonth(obj, false);
        } else {
            obj.currentDay = dayIndex;
            const prev = obj.body.querySelector('button[tabindex="0"]');
            if (prev) prev.setAttribute("tabindex", "-1");

            const buttons = obj.body.getElementsByTagName("button");
            for (let btn of buttons) {
                if (parseInt(btn.textContent) === obj.currentDay) {
                    btn.setAttribute("tabindex", "0");
                    btn.focus();
                    break;
                }
            }

            updateFocusable(obj);
        }
    }

    function showNextMonth(obj, updateLive = true) {
        obj.currentMonth = (obj.currentMonth + 1) % 12;
        if (obj.currentMonth === 0) obj.currentYear++;
        obj.currentDay = correctCurrentDay(obj);
        renderCalendar(obj, false);
        if (updateLive) updateLiveRegion(obj);
    }

    function showPrevMonth(obj, updateLive = true) {
        obj.currentMonth = (obj.currentMonth - 1 + 12) % 12;
        if (obj.currentMonth === 11) obj.currentYear--;
        obj.currentDay = correctCurrentDay(obj);
        renderCalendar(obj, false);
        if (updateLive) updateLiveRegion(obj);
    }

    function correctCurrentDay(obj) {
        return obj.currentDay > daysInMonth(obj.currentYear, obj.currentMonth) ? 1 : obj.currentDay;
    }

    function updateLiveRegion(obj) {
        obj.srLiveReagion.textContent = `${obj.options.months[obj.currentMonth]} ${obj.currentYear}`;
    }

    function updateFocusable(obj) {
        const elements = obj.datePicker.querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable]');
        obj.firstFocusable = Array.from(elements).find(el => el.offsetWidth || el.offsetHeight || el.getClientRects().length);
        obj.lastFocusable = Array.from(elements).reverse().find(el => el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    }

    function adjustCalendarPosition(obj) {
        obj.datePicker.style.left = "0px";
        obj.datePicker.style.right = "auto";
        if (obj.datePicker.getBoundingClientRect().right > window.innerWidth) {
            obj.datePicker.style.left = "auto";
            obj.datePicker.style.right = "0px";
        }
    }

    function initScreenReader(obj) {
        updateAria(obj);
        if (obj.dateValueEl.length > 0) {
            initializeDate(obj);
            updateLabel(obj);
        }

        const live = document.createElement("div");
        live.setAttribute("aria-live", "polite");
        live.classList.add("sr-only", "js-date-input__sr-live");
        obj.element.appendChild(live);
        obj.srLiveReagion = obj.element.getElementsByClassName("js-date-input__sr-live")[0];
    }

    function initEvents(obj) {
        obj.input.addEventListener("focus", () => toggleCalendar(obj, true));
        obj.trigger?.addEventListener("click", (e) => {
            e.preventDefault();
            obj.pickerVisible = false;
            toggleCalendar(obj);
            obj.trigger.setAttribute("aria-expanded", "true");
        });

        obj.body.addEventListener("click", (e) => {
            e.preventDefault();
            const btn = e.target.closest("button");
            if (btn) {
                obj.dateSelected = true;
                obj.selectedDay = btn.innerText;
                obj.selectedMonth = obj.currentMonth;
                obj.selectedYear = obj.currentYear;
                obj.input.value = formatDate(obj);
                obj.input.focus();
                updateAria(obj);
                updateLabel(obj);

                // Dispatch custom event with the new date
                const changeEvent = new CustomEvent("dateChange", {
                    detail: { value: formatDate(obj) }
                });
                obj.element.dispatchEvent(changeEvent);
            }
        });

        obj.navigation.addEventListener("click", (e) => {
            e.preventDefault();
            const btn = e.target.closest(".js-date-picker__month-nav-btn");
            if (!btn) return;
            btn.classList.contains("js-date-picker__month-nav-btn--prev") ? showPrevMonth(obj, true) : showNextMonth(obj, true);
        });

        // Global key handler
        window.addEventListener("keydown", (e) => {
            if (e.key === "Escape" || e.keyCode === 27) {
                document.activeElement.closest(".js-date-picker") ? obj.input.focus() : hideCalendar(obj);
            }
        });

        window.addEventListener("click", (e) => {
            if (!e.target.closest(".js-date-picker") && !e.target.closest(".js-date-input") && obj.pickerVisible) {
                hideCalendar(obj);
            }
        });

        obj.body.addEventListener("keydown", (e) => {
            const day = obj.currentDay;
            const key = e.key.toLowerCase();

            if (["arrowdown", "arrowright", "arrowleft", "arrowup", "end", "home", "pagedown", "pageup"].includes(key)) {
                e.preventDefault();
            }

            switch (key) {
                case "arrowdown": moveFocusToDay(day + 7, obj); break;
                case "arrowup": moveFocusToDay(day - 7, obj); break;
                case "arrowright": moveFocusToDay(day + 1, obj); break;
                case "arrowleft": moveFocusToDay(day - 1, obj); break;
                case "end": moveFocusToDay(day + 6 - getWeekdayOffset(obj.currentYear, obj.currentMonth, day), obj); break;
                case "home": moveFocusToDay(day - getWeekdayOffset(obj.currentYear, obj.currentMonth, day), obj); break;
                case "pagedown": showNextMonth(obj); break;
                case "pageup": showPrevMonth(obj); break;
            }
        });

        obj.datePicker.addEventListener("keydown", (e) => {
            if (e.key === "Tab" || e.keyCode === 9) {
                if (document.activeElement === obj.firstFocusable && e.shiftKey) {
                    e.preventDefault();
                    obj.lastFocusable.focus();
                } else if (document.activeElement === obj.lastFocusable && !e.shiftKey) {
                    e.preventDefault();
                    obj.firstFocusable.focus();
                }
            }
        });

        obj.input.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.keyCode === 13) {
                initializeDate(obj);
                updateAria(obj);
                updateLabel(obj);
                hideCalendar(obj);
            } else if ((e.key === "ArrowDown" || e.keyCode === 40) && obj.pickerVisible) {
                obj.body.querySelector('button[tabindex="0"]').focus();
            }
        });
    }

    // ---- PROTOTYPE API ----

    DatePicker.prototype.showCalendar = function () {
        renderCalendar(this);
    };

    DatePicker.prototype.showNextMonth = function () {
        showNextMonth(this, true);
    };

    DatePicker.prototype.showPrevMonth = function () {
        showPrevMonth(this, true);
    };

    DatePicker.prototype.setDate = function (date) {
        let dateStr;

        // ✅ Si c’est un objet Date, on le formate
        if (date instanceof Date) {
            const day = String(date.getDate()).padStart(2, "0");
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const year = date.getFullYear();

            const d = [];
            d[this.dateIndexes[0]] = day;
            d[this.dateIndexes[1]] = month;
            d[this.dateIndexes[2]] = year;
            dateStr = d.join(this.options.dateSeparator);
        }
        // ✅ Sinon on considère que c’est déjà une chaîne
        else {
            dateStr = date;
        }

        this.input.value = dateStr;

        this.dateSelected = false;
        initializeDate(this);
        updateAria(this);
        updateLabel(this);

        if (this.pickerVisible) {
            renderCalendar(this);
        }

        const changeEvent = new CustomEvent("dateChange", {
            detail: { value: formatDate(this) }
        });
        this.element.dispatchEvent(changeEvent);
    };

    DatePicker.prototype.getDate = function () {
        if(!this.selectedDay || this.selectedMonth === false || !this.selectedYear) return new Date();
        const [day, month, year] = formatDate(this).split('/');
        return new Date(year, month - 1, day);
    };

    DatePicker.prototype.addDays = function (n) {
        if (!this.selectedDay || this.selectedMonth === false || !this.selectedYear) return;

        const d = new Date(this.selectedYear, this.selectedMonth, this.selectedDay);
        d.setDate(d.getDate() + n);

        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();

        this.setDate(`${day}${this.options.dateSeparator}${month}${this.options.dateSeparator}${year}`);
    };

    // ---- INIT SCRIPT ----

    DatePicker.defaults = {
        element: "",
        months: [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ],
        dateFormat: "d-m-y",
        dateSeparator: "/"
    };

    window.DatePicker = DatePicker;

    const inputs = document.getElementsByClassName("js-date-input");
    const cssSupported = CSS.supports("align-items", "stretch");

    for (let i = 0; i < inputs.length; i++) {
        const el = inputs[i];

        if (cssSupported) {
            const opts = { element: el };

            if (el.getAttribute("data-date-format"))
                opts.dateFormat = el.getAttribute("data-date-format");

            if (el.getAttribute("data-date-separator"))
                opts.dateSeparator = el.getAttribute("data-date-separator");

            if (el.getAttribute("data-months"))
                opts.months = el.getAttribute("data-months").split(",").map(m => m.trim());

            // ✅ Crée l’instance et la stocke sur l'élément DOM
            const instance = new DatePicker(opts);
            el.datepickerInstance = instance;

        } else {
            el.classList.add("date-input--hide-calendar");
        }
    }
})();