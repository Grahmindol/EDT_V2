//based on https://codyhouse.co/gem/schedule-template
//licence : https://codyhouse.co/license
(function () {
  // Constructor de la classe WScheduler
  function WSchedule(options) {
    // Merge options par défaut et options fournies
    this.options = Util.extend(WSchedule.defaults, options);
    this.element = this.options.element;
    this.timeline = this.element.getAttribute("data-w-schedule-timeline");
    this.startTime = parseTime(this.timeline.split("-")[0]);
    this.endTime = parseTime(this.timeline.split("-")[1]);
    this.gridRows = 1;
    this.grid = this.element.getElementsByClassName("js-w-schedule__grid");
    this.hourGridHTML = '<div class="w-schedule__grid-row"></div>';
    this.animationDuration = 1000 * parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--w-schedule-modal-anim-duration")
    ) || 300;
    this.modal = document.getElementsByClassName("js-w-schedule-modal");
    this.morphBg = document.getElementsByClassName("js-w-schedule-morph-bg");
    this.modalCloseBtn = document.getElementsByClassName("js-w-schedule-close-btn");

    // Initialisation de la grille horaire
    (function initializeGrid(schedule) {
      let gridHTML = "";

      // Si minutes de startTime non nulles, on décale d’une heure
      if (schedule.startTime[1] !== 0) {
        schedule.startTime[0]++;
        schedule.gridRows++;
      }

      // Nombre d’heures entre début et fin
      const hoursCount = schedule.endTime[0] - schedule.startTime[0];

      for (let i = 0; i < hoursCount; i++) {
        gridHTML += schedule.hourGridHTML;
      }
      gridHTML += schedule.hourGridHTML;

      schedule.gridRows += hoursCount;
      schedule.grid[0].innerHTML = gridHTML;
      schedule.element.style.setProperty("--w-schedule-row-nr", schedule.gridRows);
    })(this);

    // Initialisation des événements dans la grille
    (function initializeEvents(schedule) {
      const events = schedule.element.getElementsByClassName("js-w-schedule__event");
      for (let i = 0; i < events.length; i++) {
        setEventPosition(schedule, events[i]);
      }
    })(this);

    // Setup modale et animations si modale existante
    if (this.modal.length > 0 && this.morphBg.length > 0) {
      this.modalContent = this.modal[0].getElementsByClassName("js-w-schedule-modal__content")[0];
      this.skeletonContent = this.modalContent.innerHTML;
      this.modalId = this.modal[0].getAttribute("id");

      this.modal[0].addEventListener("modalIsOpen", (event) => {
        this.target = event.detail.closest(`[aria-controls="${this.modalId}"]`);

        animateMorphBg(this, () => {
          Util.addClass(this.morphBg[0], "hide");
          this.morphBg[0].style = "";
          Util.removeClass(this.modalContent, "opacity-0");
        });

        // Charge le contenu dynamique
        this.options.searchData(this.target, (content) => {
          Util.addClass(this.modalContent, "w-schedule-modal__content--loaded");
          this.modalContent.innerHTML = content;

          // Exécute les scripts inclus dans le HTML injecté
          const scripts = this.modalContent.querySelectorAll("script");
          scripts.forEach((oldScript) => {
            const newScript = document.createElement("script");
            if (oldScript.src) {
              newScript.src = oldScript.src;
              newScript.async = oldScript.async;
            } else {
              newScript.textContent = oldScript.textContent;
            }
            oldScript.replaceWith(newScript);
          });
        });

        toggleCloseBtn(this, true);
      });

      this.modal[0].addEventListener("modalIsClose", () => {
        this.modal[0].addEventListener("transitionend", function onTransitionEnd(e) {
          if (e.propertyName === "opacity") {
            resetModalContent(this);
            this.modal[0].removeEventListener("transitionend", onTransitionEnd);
          }
        }.bind(this));

        this.target = false;
        toggleCloseBtn(this, false);

        if (reducedMotion) resetModalContent(this);
      });

      if (this.modalCloseBtn.length > 0) {
        this.modalCloseBtn[0].addEventListener("click", () => {
          this.modal[0].click();
        });
      }
    }
  }

  // Recalcule la grille et met à jour tous les événements
  WSchedule.prototype.update = function () {
    // Recalcule la grille horaire
    (function updateGrid(schedule) {
      schedule.gridRows = 0;
      let gridHTML = "";

      if (schedule.startTime[1] !== 0) {
        schedule.startTime[0]++;
      }

      const hoursCount = schedule.endTime[0] - schedule.startTime[0];
      for (let i = 0; i < hoursCount; i++) {
        gridHTML += schedule.hourGridHTML;
      }
      gridHTML += schedule.hourGridHTML;
      schedule.gridRows += hoursCount;
      schedule.grid[0].innerHTML = gridHTML;
      schedule.element.style.setProperty("--w-schedule-row-nr", schedule.gridRows);
    })(this);

    // Met à jour chaque événement
    const events = this.element.getElementsByClassName("js-w-schedule__event");
    for (let i = 0; i < events.length; i++) {
      setEventPosition(this, events[i]);
    }

    // Si modale visible, la réinitialiser
    if (this.modal.length > 0 && Util.hasClass(this.modal[0], "modal--is-visible")) {
      this.modal[0].dispatchEvent(new CustomEvent("modalIsClose"));
      this.modal[0].dispatchEvent(new CustomEvent("modalIsOpen"));
    }

    // Réattache les listeners click des triggers dynamiques
    if (this.modal.length > 0) {
      const modalId = this.modal[0].getAttribute("id");
      const triggers = document.querySelectorAll(`[aria-controls="${modalId}"]`);
      const modal = this.modal[0];
      for (let j = 0; j < triggers.length; j++) {
        // Retire ancien listener si présent
        triggers[j].removeEventListener("click", triggers[j].__modalClickListener);
        triggers[j].__modalClickListener = function (e) {
          e.preventDefault();
          modal.dispatchEvent(new CustomEvent("openModal", { detail: e.currentTarget }));
        };
        triggers[j].addEventListener("click", triggers[j].__modalClickListener);
      }
    }
  };

  // -----------------------------------
  // Helpers internes
  // -----------------------------------

  // Positionne un événement dans la grille selon son heure de début et sa durée
  function setEventPosition(schedule, eventElem) {
    const timeElem = eventElem.getElementsByTagName("time")[0];
    const datetime = timeElem.getAttribute("datetime"); // Ex: "PT1H30M"

    // Parse le temps de début (hh:mm)
    const start = parseTime(datetime.split("PT")[0]);
    // Parse la durée (ex: "1H30M")
    const duration = parseDuration(datetime.split("PT")[1]);

    // Calcule position et hauteur en nombre d'heures décimales
    const topPosition = toDecimalHours(start[0] - schedule.startTime[0], start[1] - schedule.startTime[1]);
    const eventHeight = toDecimalHours(duration[0], duration[1]);

    eventElem.style.setProperty("--w-schedule-event-top", `calc(var(--w-schedule-row-height) * ${topPosition})`);
    eventElem.style.setProperty("--w-schedule-event-height", `calc(var(--w-schedule-row-height) * ${eventHeight})`);

    timeElem.innerHTML = formatTime(start) + " - " + formatTime([start[0] + duration[0], start[1] + duration[1]]);
  }

  // Parse une chaîne hh:mm en [heures, minutes]
  function parseTime(str) {
    const parts = str.split(":");
    return [parseInt(parts[0]), parseInt(parts[1])];
  }

  // Parse une durée "1H30M" en [heures, minutes]
  function parseDuration(str) {
    let hours = 0, minutes = 0;
    if (str.indexOf("H") > -1) {
      const parts = str.split("H");
      hours = parseInt(parts[0]);
      str = parts[1];
    }
    if (str.indexOf("M") > -1) {
      minutes = parseInt(str.split("M")[0]);
    }
    return [hours, minutes];
  }

  // Convertit heures + minutes en nombre décimal d’heures (ex: 1h30 -> 1.5)
  function toDecimalHours(hours, minutes) {
    return hours + minutes / 60;
  }

  // Formatte l’heure en chaîne "HH:mm" avec gestion des dépassements
  function formatTime(timeArr) {
    // Corrige minutes > 60
    if (timeArr[1] >= 60) {
      const extraHours = Math.floor(timeArr[1] / 60);
      timeArr[0] += extraHours;
      timeArr[1] = timeArr[1] % 60;
    }
    return pad(timeArr[0]) + ":" + padTime(timeArr[1]);
  }

  // Pad un nombre pour avoir toujours 2 chiffres (ex: 5 -> 05)
  function pad(num) {
    if (num < 10) return "0" + num;
    if (num > 24) return pad(num - 24); // Supporte l'heure > 24
    return num.toString();
  }

  // Pad minutes avec récursivité pour valeurs > 60
  function padTime(min) {
    if (min < 10) return "0" + min;
    if (min > 60) return padTime(min - 60);
    return min.toString();
  }

  // Affiche ou cache le bouton fermer modale
  function toggleCloseBtn(schedule, show) {
    if (schedule.modalCloseBtn.length > 0) {
      Util.toggleClass(schedule.modalCloseBtn[0], "w-schedule-close-btn--is-visible", show);
    }
  }

  // Réinitialise le contenu de la modale à son squelette initial
  function resetModalContent(schedule) {
    Util.addClass(schedule.modalContent, "opacity-0");
    schedule.modalContent.innerHTML = schedule.skeletonContent;
    Util.removeClass(schedule.modalContent, "w-schedule-modal__content--loaded");
  }

  // Anime la transition morphing du fond de la modale
  function animateMorphBg(schedule, onComplete) {
    if (reducedMotion) {
      onComplete();
      return;
    }

    const triggerRect = schedule.target.getBoundingClientRect();
    const modalRect = schedule.modalContent.getBoundingClientRect();

    const deltaX = modalRect.left - triggerRect.left;
    const deltaY = modalRect.top - triggerRect.top;
    const scaleX = triggerRect.width / modalRect.width;
    const scaleY = triggerRect.height / modalRect.height;
    let startTime = null;
    const duration = schedule.animationDuration;

    schedule.morphBg[0].style = `
      top: ${triggerRect.top}px;
      left: ${triggerRect.left}px;
      width: ${modalRect.width}px;
      height: ${modalRect.height}px;
      transform: scaleX(${scaleX}) scaleY(${scaleY});
    `;
    Util.removeClass(schedule.morphBg[0], "hide");

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      let elapsed = timestamp - startTime;
      if (elapsed > duration) elapsed = duration;

      const currentScaleX = Math.easeOutQuart(elapsed, scaleX, 1 - scaleX, duration);
      const currentScaleY = Math.easeOutQuart(elapsed, scaleY, 1 - scaleY, duration);
      const currentX = Math.easeOutQuart(elapsed, 0, deltaX, duration);
      const currentY = Math.easeOutQuart(elapsed, 0, deltaY, duration);

      schedule.morphBg[0].style.transform = `
        translateX(${currentX}px) translateY(${currentY}px)
        scaleX(${currentScaleX}) scaleY(${currentScaleY})
      `;

      if (elapsed < duration) {
        window.requestAnimationFrame(step);
      } else {
        onComplete && onComplete();
      }
    }

    window.requestAnimationFrame(step);
  }

  // Default options
  WSchedule.defaults = {
    element: "",
    searchData: false // fonction de récupération du contenu dynamique
  };

  // Détection préférence réduit mouvement
  const reducedMotion = Util.osHasReducedMotion();

  // Expose dans l’espace global
  window.WSchedule = WSchedule;
})();

