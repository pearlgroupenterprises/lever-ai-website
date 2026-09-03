(() => {
  "use strict";

  document.documentElement.classList.add("has-js");

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  const selectField = document.querySelector("[data-custom-select]");
  const nativeSelect = selectField?.querySelector(".native-select");
  const control = selectField?.querySelector(".custom-select-control");
  const trigger = selectField?.querySelector(".assessment-select-trigger");
  const valueLabel = selectField?.querySelector("[data-select-value]");
  const menu = selectField?.querySelector("[role='listbox']");
  const options = menu ? Array.from(menu.querySelectorAll("[role='option']")) : [];
  const selectError = document.querySelector("#assessment-select-error");
  const selectLabel = document.querySelector("#explore-label");
  let highlightedIndex = -1;
  let typeahead = "";
  let typeaheadTimer;

  const setHighlighted = (index) => {
    if (!options.length) return;
    highlightedIndex = (index + options.length) % options.length;
    options.forEach((option, optionIndex) => {
      if (optionIndex === highlightedIndex) {
        option.setAttribute("data-highlighted", "");
      } else {
        option.removeAttribute("data-highlighted");
      }
    });
    options[highlightedIndex].focus({ preventScroll: true });
    options[highlightedIndex].scrollIntoView({ block: "nearest" });
  };

  const closeMenu = (returnFocus = false) => {
    if (!trigger || !menu) return;
    menu.hidden = true;
    menu.dataset.state = "closed";
    trigger.dataset.state = "closed";
    trigger.setAttribute("aria-expanded", "false");
    options.forEach((option) => option.removeAttribute("data-highlighted"));
    if (returnFocus) trigger.focus();
  };

  const moveFocusFromTrigger = (direction) => {
    if (!trigger) return;
    const focusableElements = Array.from(document.querySelectorAll(
      'a[href], button:not([disabled]), input:not([type="hidden"]):not([disabled]):not([tabindex="-1"]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
    )).filter((element) => !element.closest("[hidden]") && element.getClientRects().length);
    const triggerIndex = focusableElements.indexOf(trigger);
    focusableElements[triggerIndex + direction]?.focus();
  };

  const openMenu = () => {
    if (!trigger || !menu) return;
    menu.hidden = false;
    menu.dataset.state = "open";
    trigger.dataset.state = "open";
    trigger.setAttribute("aria-expanded", "true");
    const selectedIndex = options.findIndex((option) => option.getAttribute("aria-selected") === "true");
    requestAnimationFrame(() => setHighlighted(selectedIndex >= 0 ? selectedIndex : 0));
  };

  const chooseOption = (index) => {
    const option = options[index];
    if (!option || !nativeSelect || !trigger || !valueLabel) return;

    const selectedValue = option.dataset.value || "";
    nativeSelect.value = selectedValue;
    nativeSelect.dispatchEvent(new Event("change", { bubbles: true }));
    valueLabel.textContent = selectedValue;
    trigger.removeAttribute("data-placeholder");
    trigger.setAttribute("aria-invalid", "false");
    if (selectError) selectError.hidden = true;

    options.forEach((item, optionIndex) => {
      const isSelected = optionIndex === index;
      item.setAttribute("aria-selected", String(isSelected));
      if (isSelected) item.dataset.state = "checked";
      else delete item.dataset.state;
      const indicator = item.querySelector("[data-select-indicator]");
      if (indicator) indicator.hidden = !isSelected;
    });

    closeMenu(true);
  };

  if (selectField && nativeSelect && control && trigger && menu && options.length) {
    nativeSelect.required = false;
    nativeSelect.hidden = true;
    control.hidden = false;

    trigger.addEventListener("click", () => {
      if (trigger.getAttribute("aria-expanded") === "true") closeMenu();
      else openMenu();
    });

    selectLabel?.addEventListener("click", (event) => {
      event.preventDefault();
      trigger.focus();
    });

    trigger.addEventListener("keydown", (event) => {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        openMenu();
      }
    });

    options.forEach((option, index) => {
      option.addEventListener("click", () => chooseOption(index));
      option.addEventListener("pointermove", () => {
        if (highlightedIndex !== index) setHighlighted(index);
      });
      option.addEventListener("keydown", (event) => {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          setHighlighted(index + 1);
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          setHighlighted(index - 1);
        } else if (event.key === "Home") {
          event.preventDefault();
          setHighlighted(0);
        } else if (event.key === "End") {
          event.preventDefault();
          setHighlighted(options.length - 1);
        } else if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          chooseOption(index);
        } else if (event.key === "Escape") {
          event.preventDefault();
          closeMenu(true);
        } else if (event.key === "Tab") {
          event.preventDefault();
          closeMenu();
          moveFocusFromTrigger(event.shiftKey ? -1 : 1);
        } else if (event.key.length === 1 && /\S/.test(event.key)) {
          typeahead += event.key.toLowerCase();
          window.clearTimeout(typeaheadTimer);
          typeaheadTimer = window.setTimeout(() => { typeahead = ""; }, 500);
          const matchIndex = options.findIndex((item) => item.dataset.value?.toLowerCase().startsWith(typeahead));
          if (matchIndex >= 0) setHighlighted(matchIndex);
        }
      });
    });

    document.addEventListener("pointerdown", (event) => {
      if (!selectField.contains(event.target) && trigger.getAttribute("aria-expanded") === "true") closeMenu();
    });
  }

  const form = document.querySelector("#inquiry-form");
  const submitButton = form?.querySelector("button[type='submit']");
  const submitLabel = form?.querySelector("[data-submit-label]");
  const formError = document.querySelector("#form-error");
  const success = document.querySelector("#inquiry-success");

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (nativeSelect && !nativeSelect.value) {
      if (selectError) selectError.hidden = false;
      if (trigger) {
        trigger.setAttribute("aria-invalid", "true");
        trigger.focus();
        openMenu();
      } else {
        nativeSelect.required = true;
        nativeSelect.reportValidity();
      }
      return;
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (formError) formError.hidden = true;
    if (submitButton) submitButton.disabled = true;
    if (submitLabel) submitLabel.textContent = "Sending…";

    try {
      const isLocalPreview = location.protocol === "file:" || ["localhost", "127.0.0.1"].includes(location.hostname);

      if (isLocalPreview) {
        await new Promise((resolve) => window.setTimeout(resolve, 300));
      } else {
        const response = await fetch(form.action, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(new FormData(form)).toString(),
        });
        if (!response.ok) throw new Error("Submission failed");
      }

      form.hidden = true;
      if (success) {
        success.hidden = false;
        success.focus({ preventScroll: true });
      }
    } catch {
      if (formError) formError.hidden = false;
      if (submitButton) submitButton.disabled = false;
      if (submitLabel) submitLabel.textContent = "Send inquiry";
    }
  });
})();
