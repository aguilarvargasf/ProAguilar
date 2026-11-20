/**
 * PORTAFOLIO WEB PROFESIONAL - FRANCO AGUILAR
 * JavaScript moderno (Vanilla ES6+, W3C WAI-ARIA, Modern Web Guidance)
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initAccessibleTabs();
  initSkillsFilter();
  initCertModal();
  initClipboardAndToasts();
  initContactForm();
});

/* ==========================================================================
   1. GESTIÓN DE TEMA (DARK / LIGHT MODE)
   ========================================================================== */
function initThemeToggle() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  const root = document.documentElement;

  // Comprobar preferencia guardada o preferencia del sistema
  const savedTheme = localStorage.getItem('theme');
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

  const currentTheme = savedTheme || (prefersLight ? 'light' : 'dark');
  applyTheme(currentTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const activeTheme = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(activeTheme);
      localStorage.setItem('theme', activeTheme);
      showToast(`Tema cambiado a ${activeTheme === 'light' ? 'Modo Claro' : 'Modo Oscuro'}`);
    });
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeToggleBtn) {
      themeToggleBtn.setAttribute(
        'aria-label',
        theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'
      );
    }
  }
}

/* ==========================================================================
   2. SISTEMA DE PESTAÑAS (TABS) ACCESIBLE - MODERN WEB GUIDANCE COMPLIANT
   - Roving tabindex
   - Soporte para navegación con flechas de teclado (ArrowLeft, ArrowRight, Home, End)
   - Sincronización con "Find in page" mediante el evento 'beforematch'
   - Scroll suave para tabs que desbordan en móviles
   ========================================================================== */
function initAccessibleTabs() {
  const tablist = document.querySelector('[role="tablist"]');
  if (!tablist) return;

  const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
  const panels = Array.from(document.querySelectorAll('[role="tabpanel"]'));

  // Detección de soporte para hidden="until-found"
  const supportsUntilFound = 'onbeforematch' in HTMLElement.prototype;

  /**
   * Cambia la pestaña activa y sincroniza roles ARIA y visibilidad
   * @param {HTMLElement} selectedTab 
   * @param {boolean} shouldFocus - Si debe colocarse el foco en la pestaña
   */
  function selectTab(selectedTab, shouldFocus = true) {
    const targetPanelId = selectedTab.getAttribute('aria-controls');

    tabs.forEach(tab => {
      const isSelected = tab === selectedTab;
      tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      tab.setAttribute('tabindex', isSelected ? '0' : '-1');
    });

    panels.forEach(panel => {
      const isTarget = panel.id === targetPanelId;
      if (isTarget) {
        panel.removeAttribute('hidden');
        panel.setAttribute('tabindex', '0');
      } else {
        if (supportsUntilFound) {
          panel.setAttribute('hidden', 'until-found');
        } else {
          panel.setAttribute('hidden', '');
        }
        panel.removeAttribute('tabindex');
      }
    });

    // Desplazar el tab visible en caso de desbordamiento horizontal en móviles
    selectedTab.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest'
    });

    if (shouldFocus) {
      selectedTab.focus();
    }
  }

  // Interacción de clic en cada pestaña
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      selectTab(tab, false);
    });
  });

  // Navegación por teclado dentro del tablist (WAI-ARIA Tabs Pattern)
  tablist.addEventListener('keydown', (e) => {
    const focusedTab = document.activeElement;
    const currentIndex = tabs.indexOf(focusedTab);
    if (currentIndex === -1) return;

    let targetIndex = null;

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        targetIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        targetIndex = (currentIndex + 1) % tabs.length;
        break;
      case 'Home':
        e.preventDefault();
        targetIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        targetIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    if (targetIndex !== null) {
      selectTab(tabs[targetIndex], true);
    }
  });

  // Soporte para búsqueda nativa del navegador (Ctrl+F) con hidden="until-found"
  panels.forEach(panel => {
    panel.addEventListener('beforematch', (e) => {
      const associatedTab = tabs.find(
        t => t.getAttribute('aria-controls') === panel.id
      );
      if (associatedTab) {
        selectTab(associatedTab, false);
      }
    });
  });

  // Fallback si no soporta hidden="until-found"
  if (!supportsUntilFound) {
    panels.forEach(panel => {
      if (panel.getAttribute('hidden') === 'until-found') {
        panel.setAttribute('hidden', '');
      }
    });
  }

  // Enlace directo en el Hero hacia el panel de contacto
  const heroContactTrigger = document.getElementById('hero-contact-trigger');
  if (heroContactTrigger) {
    heroContactTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      const contactTab = document.getElementById('tab-contacto');
      if (contactTab) {
        selectTab(contactTab, true);
        const contactPanel = document.getElementById('panel-contacto');
        if (contactPanel) {
          contactPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  }
}

/* ==========================================================================
   3. FILTRADO INTERACTIVO DE HABILIDADES TÉCNICAS
   ========================================================================== */
function initSkillsFilter() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const skillCards = document.querySelectorAll('.skill-category-card');

  if (!filterButtons.length || !skillCards.length) return;

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      // Actualizar estado activo en botones
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Filtrar tarjetas
      skillCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          card.style.animation = 'fadeInPanel 0.3s ease-out';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   4. MODAL VISOR DE CERTIFICADO (<dialog> Nativo)
   ========================================================================== */
function initCertModal() {
  const modal = document.getElementById('cert-modal');
  const certBox = document.getElementById('cert-box');
  const closeBtn = document.getElementById('modal-close-btn');

  if (!modal || !certBox) return;

  // Abrir modal con clic o Enter en la tarjeta de vista previa
  const openModal = () => {
    if (typeof modal.showModal === 'function') {
      modal.showModal();
    } else {
      modal.setAttribute('open', '');
    }
  };

  certBox.addEventListener('click', openModal);
  certBox.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openModal();
    }
  });

  // Cerrar modal con botón
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.close();
    });
  }

  // Cerrar modal al hacer clic en el backdrop
  modal.addEventListener('click', (e) => {
    const dialogDimensions = modal.getBoundingClientRect();
    if (
      e.clientX < dialogDimensions.left ||
      e.clientX > dialogDimensions.right ||
      e.clientY < dialogDimensions.top ||
      e.clientY > dialogDimensions.bottom
    ) {
      modal.close();
    }
  });
}

/* ==========================================================================
   5. PORTAPAPELES Y SISTEMA DE TOASTS
   ========================================================================== */
function initClipboardAndToasts() {
  const copyEmailBtn = document.getElementById('copy-email-btn');

  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', async () => {
      const textToCopy = copyEmailBtn.getAttribute('data-clipboard');
      if (!textToCopy) return;

      try {
        await navigator.clipboard.writeText(textToCopy);
        showToast(`✔ Correo ${textToCopy} copiado al portapapeles`);
      } catch (err) {
        // Fallback clásico si la API clipboard falla
        const tempInput = document.createElement('input');
        tempInput.value = textToCopy;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        showToast(`✔ Correo copiado: ${textToCopy}`);
      }
    });
  }
}

/**
 * Muestra una notificación Toast accesible y auto-desvanecible
 * @param {string} message 
 * @param {number} duration 
 */
function showToast(message, duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, duration);
}

/* ==========================================================================
   6. VALIDACIÓN Y ENVÍO DE FORMULARIO DE CONTACTO
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const subjectInput = document.getElementById('contact-subject');
    const messageInput = document.getElementById('contact-message');

    if (!nameInput.value.trim() || !emailInput.value.trim() || !messageInput.value.trim()) {
      showToast('⚠️ Por favor completa todos los campos requeridos.');
      return;
    }

    // Validación básica de formato de correo
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailInput.value.trim())) {
      showToast('⚠️ Ingresa un correo electrónico válido.');
      emailInput.focus();
      return;
    }

    // Simulación de envío exitoso
    showToast(`✉️ ¡Mensaje enviado con éxito por ${nameInput.value}! Franco te responderá pronto.`);
    form.reset();
  });
}
