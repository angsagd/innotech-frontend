document.addEventListener("DOMContentLoaded", () => {
  const banner = document.getElementById("cookie-consent");
  const acceptButton = document.getElementById("cookie-accept");
  if (banner && acceptButton) {
    const key = "cookieConsentAccepted";
    if (localStorage.getItem(key) !== "true") {
      banner.classList.remove("hidden");
      acceptButton.addEventListener("click", () => {
        localStorage.setItem(key, "true");
        banner.classList.add("hidden");
      });
    }
  }

  const updateCapacityBadges = (root = document) => {
    const badges = root.querySelectorAll("[data-enrolled][data-capacity]");
    badges.forEach((badge) => {
      const enrolled = Number(badge.dataset.enrolled);
      const capacity = Number(badge.dataset.capacity);
      if (Number.isNaN(enrolled) || Number.isNaN(capacity) || capacity <= 0) {
        return;
      }

      const remaining = capacity - enrolled;
      badge.textContent = `(${enrolled}/${capacity})`;
      badge.classList.toggle("capacity-low", remaining < 6);
      badge.classList.toggle("capacity-available", remaining >= 6);
    });
  };

  updateCapacityBadges();

  const dataScript = document.getElementById("session-workshop-data");
  if (dataScript) {
    try {
      const workshops = JSON.parse(dataScript.textContent.trim());
      if (Array.isArray(workshops) && workshops.length > 0) {
        const workshopCards = document.querySelectorAll("[data-workshop-id]");
        workshopCards.forEach((card) => {
          const workshop = workshops.find(
            (item) => String(item.id) === String(card.dataset.workshopId)
          );
          if (!workshop) return;
          const capacity = Number(workshop.kapasitas);
          const sessions = Array.isArray(workshop.sesi) ? workshop.sesi : [];

          const setText = (selector, value) => {
            const el = card.querySelector(selector);
            if (el && value != null) {
              el.textContent = value;
            }
          };

          setText(".nama-workshop", workshop.nama);
          setText(".instruktur-workshop", workshop.instruktur);
          setText(".afiliasi-workshop", workshop.afiliasi);
          setText(".tempat-workshop", workshop.tempat);

          card.querySelectorAll("[data-session-id]").forEach((span) => {
            const session = sessions.find(
              (item) => String(item.id) === String(span.dataset.sessionId)
            );
            if (!session) return;
            if (span.hasAttribute("data-session-time")) {
              span.textContent = `Sesi ${session.id} (${session.waktu})`;
            }
            if (span.hasAttribute("data-session-count")) {
              span.dataset.enrolled = String(session.peserta);
              span.dataset.capacity = String(capacity);
              span.textContent = `(${session.peserta}/${capacity})`;
            }
          });

          updateCapacityBadges(card);
        });

        const workshopInputs = document.querySelectorAll('input[name="workshop"]');
        workshopInputs.forEach((input) => {
          const workshop = workshops.find(
            (item) => String(item.id) === String(input.value)
          );
          if (!workshop) return;
          const labelSpan =
            input.closest("label")?.querySelector("[data-workshop-label]") ||
            input.closest("label")?.querySelector("span");
          if (labelSpan) {
            labelSpan.textContent = workshop.nama;
          }
          const capacity = Number(workshop.kapasitas);
          const sessions = Array.isArray(workshop.sesi) ? workshop.sesi : [];
          const allFull =
            capacity > 0 &&
            sessions.length > 0 &&
            sessions.every((session) => Number(session.peserta) >= capacity);
          if (allFull) {
            input.disabled = true;
            input.checked = false;
          }
        });

        const updateSessions = (workshopId) => {
          const workshop = workshops.find(
            (item) => String(item.id) === String(workshopId)
          );
          if (!workshop || !Array.isArray(workshop.sesi)) return;
          const capacity = Number(workshop.kapasitas);
          document.querySelectorAll("[data-session-id]").forEach((span) => {
            const sessionId = Number(span.dataset.sessionId);
            const session = workshop.sesi.find(
              (item) => Number(item.id) === sessionId
            );
            if (!session) return;
            span.textContent = `(${session.peserta}/${capacity})`;
            const sessionInput = document.querySelector(
              `input[name="session"][value="${sessionId}"]`
            );
            if (sessionInput) {
              sessionInput.disabled = Number(session.peserta) >= capacity;
              if (sessionInput.disabled) {
                sessionInput.checked = false;
              }
            }
          });
        };

        workshopInputs.forEach((input) => {
          input.addEventListener("change", () => updateSessions(input.value));
        });
      }
    } catch (error) {
      // Ignore invalid JSON to avoid breaking the page.
    }
  }

  const registrationForm = document.getElementById("registration-form");
  if (registrationForm) {
    const modal = document.getElementById("registration-modal");
    const modalIcon = document.getElementById("registration-modal-icon");
    const modalTitle = document.getElementById("registration-modal-title");
    const modalMessage = document.getElementById("registration-modal-message");
    const modalClose = document.getElementById("registration-modal-close");
    const successState = {
      icon: modalIcon?.textContent || "check_circle",
      title: modalTitle?.textContent || "Pendaftaran Berhasil!",
      message:
        modalMessage?.textContent ||
        "Terima kasih telah mendaftar. Kami akan mengirimkan detail konfirmasi melalui WhatsApp dan Email dalam 1x24 jam.",
      href: modalClose?.getAttribute("href"),
    };

    const showModal = () => {
      if (modal) {
        modal.classList.remove("hidden");
      }
    };

    if (modalClose) {
      modalClose.addEventListener("click", (event) => {
        event.preventDefault();
        if (modal) {
          modal.classList.add("hidden");
        }
      });
    }

    const setSuccess = () => {
      if (modalIcon) modalIcon.textContent = successState.icon;
      if (modalTitle) modalTitle.textContent = successState.title;
      if (modalMessage) modalMessage.textContent = successState.message;
      if (modalClose && successState.href) {
        modalClose.setAttribute("href", successState.href);
      }
    };

    const setError = () => {
      if (modalIcon) modalIcon.textContent = "close";
      if (modalTitle) modalTitle.textContent = "Pendaftaran Gagal";
      if (modalMessage) {
        modalMessage.textContent =
          "Kemungkinan kapasitas telah penuh, atau terdapat kesalahan pada server. Reload halaman. Registrasi kembali. Jika masih gagal, cek kembali dalam waktu kurang dari 24 jam";
      }
      if (modalClose) {
        modalClose.removeAttribute("href");
      }
    };

    registrationForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      setSuccess();

      try {
        // Simulate form submission to a dummy endpoint. change to simpan-pendaftaran.php when go live
        const response = await fetch("simpan-pendaftaran-dummy.json", {
          method: "POST",
          body: new FormData(registrationForm),
        });
        const data = await response.json();
        if (data && data.status === "success") {
          setSuccess();
        } else {
          setError();
        }
      } catch (error) {
        setError();
      }

      showModal();
    });
  }

  const menu = document.getElementById("mobile-menu");
  const toggle = document.getElementById("mobile-menu-toggle");
  if (!menu || !toggle) return;

  const closeMenu = () => {
    menu.classList.add("hidden");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const isHidden = menu.classList.contains("hidden");
    menu.classList.toggle("hidden");
    toggle.setAttribute("aria-expanded", isHidden ? "true" : "false");
  });

  menu.querySelectorAll("[data-mobile-close]").forEach((el) => {
    el.addEventListener("click", closeMenu);
  });

  menu.querySelectorAll("[data-mobile-link]").forEach((el) => {
    el.addEventListener("click", closeMenu);
  });
});
