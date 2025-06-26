//based on https://codyhouse.co/gem/schedule-template
//licence : https://codyhouse.co/license

(function () {
  const focusableSelectors = `
    [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]),
    button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]),
    [contenteditable], audio[controls], video[controls], summary
  `;

  function isVisible(element) {
    return element.offsetWidth || element.offsetHeight || element.getClientRects().length;
  }

  class Modal {
    constructor(element) {
      this.element = element;
      this.triggers = document.querySelectorAll(`[aria-controls="${this.element.getAttribute("id")}"]`);
      this.firstFocusable = null;
      this.lastFocusable = null;
      this.moveFocusEl = null;

      this.modalFocus = this.element.getAttribute("data-modal-first-focus")
        ? this.element.querySelector(this.element.getAttribute("data-modal-first-focus"))
        : null;

      this.selectedTrigger = null;
      this.preventScrollEl = this.getPreventScrollEl();
      this.showClass = "modal--is-visible";

      this.initModal();
    }

    getPreventScrollEl() {
      const selector = this.element.getAttribute("data-modal-prevent-scroll");
      return selector ? document.querySelector(selector) : false;
    }

    initModal() {
      this.triggers.forEach(trigger => {
        trigger.addEventListener("click", (event) => {
          event.preventDefault();
          this.selectedTrigger = event.currentTarget;

          if (Util.hasClass(this.element, this.showClass)) {
            this.closeModal();
          } else {
            this.showModal();
            this.initModalEvents();
          }
        });
      });

      this.element.addEventListener("openModal", (event) => {
        if (event.detail) this.selectedTrigger = event.detail;
        this.showModal();
        this.initModalEvents();
      });

      this.element.addEventListener("closeModal", (event) => {
        if (event.detail) this.selectedTrigger = event.detail;
        this.closeModal();
      });

      if (Util.hasClass(this.element, this.showClass)) {
        this.initModalEvents();
      }
    }

    showModal() {
      Util.addClass(this.element, this.showClass);
      this.getFocusableElements();

      if (this.moveFocusEl) {
        this.moveFocusEl.focus();

        this.element.addEventListener("transitionend", function onEnd() {
          this.moveFocusEl.focus();
          this.element.removeEventListener("transitionend", onEnd);
        }.bind(this));
      }

      this.emitModalEvents("modalIsOpen");

      if (this.preventScrollEl) {
        this.preventScrollEl.style.overflow = "hidden";
      }
    }

    closeModal() {
      if (!Util.hasClass(this.element, this.showClass)) return;

      Util.removeClass(this.element, this.showClass);

      this.firstFocusable = null;
      this.lastFocusable = null;
      this.moveFocusEl = null;

      if (this.selectedTrigger) {
        this.selectedTrigger.focus();
      }

      this.cancelModalEvents();
      this.emitModalEvents("modalIsClose");

      if (this.preventScrollEl) {
        this.preventScrollEl.style.overflow = "";
      }
    }

    initModalEvents() {
      this.element.addEventListener("keydown", this);
      this.element.addEventListener("click", this);
    }

    cancelModalEvents() {
      this.element.removeEventListener("keydown", this);
      this.element.removeEventListener("click", this);
    }

    handleEvent(event) {
      switch (event.type) {
        case "click":
          this.initClick(event);
          break;
        case "keydown":
          this.initKeyDown(event);
          break;
      }
    }

    initClick(event) {
      if (
        event.target.closest(".js-modal__close") ||
        Util.hasClass(event.target, "js-modal")
      ) {
        event.preventDefault();
        this.closeModal();
      }
    }

    initKeyDown(event) {
      const isTab = event.key === "Tab" || event.keyCode === 9;
      const isEnterOnClose = (event.key === "Enter" || event.keyCode === 13) &&
        event.target.closest(".js-modal__close");

      if (isTab) {
        this.trapFocus(event);
      } else if (isEnterOnClose) {
        event.preventDefault();
        this.closeModal();
      }
    }

    trapFocus(event) {
      if (document.activeElement === this.firstFocusable && event.shiftKey) {
        event.preventDefault();
        this.lastFocusable.focus();
      } else if (document.activeElement === this.lastFocusable && !event.shiftKey) {
        event.preventDefault();
        this.firstFocusable.focus();
      }
    }

    getFocusableElements() {
      const focusable = this.element.querySelectorAll(focusableSelectors);

      this.getFirstVisible(focusable);
      this.getLastVisible(focusable);
      this.getFirstFocusable();
    }

    getFirstVisible(elements) {
      for (let el of elements) {
        if (isVisible(el)) {
          this.firstFocusable = el;
          break;
        }
      }
    }

    getLastVisible(elements) {
      for (let i = elements.length - 1; i >= 0; i--) {
        if (isVisible(elements[i])) {
          this.lastFocusable = elements[i];
          break;
        }
      }
    }

    getFirstFocusable() {
      if (this.modalFocus && Element.prototype.matches) {
        if (this.modalFocus.matches(focusableSelectors)) {
          this.moveFocusEl = this.modalFocus;
        } else {
          const candidates = this.modalFocus.querySelectorAll(focusableSelectors);
          for (let el of candidates) {
            if (isVisible(el)) {
              this.moveFocusEl = el;
              return;
            }
          }
          this.moveFocusEl = this.firstFocusable;
        }
      } else {
        this.moveFocusEl = this.firstFocusable;
      }
    }

    emitModalEvents(eventName) {
      const event = new CustomEvent(eventName, {
        detail: this.selectedTrigger
      });
      this.element.dispatchEvent(event);
    }
  }

  window.Modal = Modal;

  // ---------- Init all .js-modal on page ----------
  const modals = document.getElementsByClassName("js-modal");

  if (modals.length > 0) {
    const modalInstances = [];

    for (let i = 0; i < modals.length; i++) {
      modalInstances.push(new Modal(modals[i]));
    }

    // Global "ESC" key to close all modals
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" || event.keyCode === 27) {
        modalInstances.forEach(modal => modal.closeModal());
      }
    });
  }
})();


window.showCustomModal = function (content) {
  const e = my_schedule.modal[0];

  // Crée un fake trigger
  const mockTrigger = {
    closest(selector) {
      return {
        getBoundingClientRect() {
          return {
            top: 100, left: 100, width: 200, height: 100, right: 300, bottom: 200
          };
        },
        getAttribute(attr) {
          return null;
        },
        getModalContent() {
          return content;
        },
        isFakeTrigger: true
      };
    },
    focus() {
      return null;
    }
  };

  e.dispatchEvent(new CustomEvent("openModal", { detail: mockTrigger }));
};

window.loadModalFromURL = async function (url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);

    const html = await res.text();
    window.showCustomModal(html);
  } catch (err) {
    console.error("Erreur chargement modal HTML:", err);
    alert("Erreur chargement contenu");
  }
};

// Active les liens avec target="modal"
document.addEventListener("click", function (e) {
  const link = e.target.closest('a[target="modal"]');
  if (link) {
    e.preventDefault();
    const url = link.getAttribute("href");
    if (url) window.loadModalFromURL(url);
  }
});