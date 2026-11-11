(() => {
  "use strict";

  const LOADING_MIN_MS = 3000;
  const loadingStart = Date.now();

  const STORAGE = {
    lang: "projectus.lang",
    theme: "projectus.theme",
    favorites: "projectus.favorites"
  };

  const TABS = ["projects", "sources", "news"];

  const CATEGORY_ORDER = [
    "maker",
    "electronica",
    "hardware",
    "mecanica",
    "soldadura",
    "maquinado",
    "robotica",
    "raspberry",
    "instrumentacion",
    "audio",
    "iot",
    "seguridad",
    "busquedas"
  ];

  const CATEGORY_THUMBS = {
    maker: "assets/thumb-maker.svg",
    electronica: "assets/thumb-electronics.svg",
    hardware: "assets/thumb-electronics.svg",
    mecanica: "assets/thumb-cnc.svg",
    soldadura: "assets/thumb-welding.svg",
    maquinado: "assets/thumb-machining.svg",
    robotica: "assets/thumb-robotics.svg",
    raspberry: "assets/thumb-raspberry.svg",
    instrumentacion: "assets/thumb-instrumentation.svg",
    audio: "assets/thumb-audio.svg",
    iot: "assets/thumb-iot.svg",
    seguridad: "assets/thumb-safety.svg",
    busquedas: "assets/thumb-default.svg"
  };

  const CATEGORY_LABELS = {
    maker: { es: "Comunidades maker", en: "Maker communities" },
    electronica: { es: "Electrónica y Arduino", en: "Electronics & Arduino" },
    hardware: { es: "Hardware open source", en: "Open-source hardware" },
    mecanica: { es: "Mecánica, CNC y 3D", en: "Mechanics, CNC & 3D" },
    soldadura: { es: "Soldadura", en: "Welding" },
    maquinado: { es: "Maquinado y tornería", en: "Machining & lathe" },
    robotica: { es: "Robótica", en: "Robotics" },
    raspberry: { es: "Raspberry Pi", en: "Raspberry Pi" },
    instrumentacion: { es: "Instrumentación", en: "Instrumentation" },
    audio: { es: "Audio y acústica", en: "Audio & acoustics" },
    iot: { es: "IoT", en: "IoT" },
    seguridad: { es: "Seguridad crítica", en: "Safety-critical" },
    busquedas: { es: "Búsquedas directas", en: "Direct searches" }
  };

  const DIFFICULTY_ORDER = {
    principiante: 0,
    intermedio: 1,
    avanzado: 2,
    profesional: 3,
    no_especificado: 4
  };

  const DOC_FIELDS = [
    { key: "bom", flag: "materials_list_available" },
    { key: "schematics", flag: "schematics_available" },
    { key: "cad", flag: "cad_files_available" },
    { key: "code", flag: "source_code_available" },
    { key: "instructions", flag: "build_instructions_available" },
    { key: "tests", flag: "test_results_available" }
  ];

  const JSON_CATEGORY_TO_KEY = {
    "Repositorios y comunidades de proyectos maker": "maker",
    "Electrónica, Arduino, sensores e instrumentación": "electronica",
    "Hardware open source, código y documentación técnica": "hardware",
    "Mecánica, CNC, impresión 3D y fabricación digital": "mecanica",
    "Computación física y Raspberry Pi": "raspberry",
    "Audio, acústica y electrónica aplicada": "audio",
    "Búsquedas directas de proyectos y documentación": "busquedas"
  };

  const SOURCE_META = {
    "Hackaday.io": { key: "maker", lang: "en", search: "https://hackaday.io/search?term={q}", tags: ["maker", "hardware"] },
    "Instructables": { key: "maker", lang: "en", search: "https://www.instructables.com/search/?q={q}", tags: ["diy", "maker"] },
    "Hackster.io": { key: "maker", lang: "en", search: "https://www.hackster.io/search?q={q}", tags: ["iot", "hardware"] },
    "Make:": { key: "maker", lang: "en", search: "https://makezine.com/?s={q}", tags: ["maker"] },
    "MakersUP": { key: "maker", lang: "es", search: "https://makersup.com/?s={q}", tags: ["maker", "es"] },
    "Arduino Project Hub": { key: "electronica", lang: "en", search: null, tags: ["arduino"] },
    "Adafruit Learning System": { key: "electronica", lang: "en", search: null, tags: ["adafruit", "electronica"] },
    "SparkFun": { key: "electronica", lang: "en", search: null, tags: ["electronica"] },
    "All About Circuits": { key: "electronica", lang: "en", search: null, tags: ["electronica", "teoria"] },
    "BricoGeek": { key: "electronica", lang: "es", search: "https://blog.bricogeek.com/?s={q}", tags: ["electronica", "es"] },
    "Electrogeek": { key: "electronica", lang: "es", search: "https://electrogeek.com/?s={q}", tags: ["electronica", "es"] },
    "Prometec": { key: "electronica", lang: "es", search: "https://www.prometec.net/?s={q}", tags: ["arduino", "es"] },
    "Inventable": { key: "electronica", lang: "es", search: "https://www.inventable.eu/?s={q}", tags: ["electronica", "es"] },
    "Luis Llamas": { key: "electronica", lang: "es", search: "https://www.luisllamas.es/?s={q}", tags: ["arduino", "es"] },
    "Foros de Electrónica": { key: "electronica", lang: "es", search: null, tags: ["foro", "es"] },
    "Arduino": { key: "electronica", lang: "multi", search: null, tags: ["arduino"] },
    "GitHub": { key: "hardware", lang: "multi", search: "https://github.com/search?q={q}&type=repositories", tags: ["codigo", "hardware"] },
    "OpenBuilds": { key: "mecanica", lang: "en", search: null, tags: ["cnc", "mecanica"] },
    "Thingiverse": { key: "mecanica", lang: "en", search: "https://www.thingiverse.com/search?q={q}", tags: ["3d", "modelos"] },
    "Printables": { key: "mecanica", lang: "multi", search: "https://www.printables.com/search/models?q={q}", tags: ["3d", "modelos"] },
    "3DPoder": { key: "mecanica", lang: "es", search: "https://www.3dpoder.com/?s={q}", tags: ["3d", "es"] },
    "Raspberry Pi Tutorials": { key: "raspberry", lang: "en", search: null, tags: ["raspberry-pi"] },
    "Hispasonic": { key: "audio", lang: "es", search: null, tags: ["audio", "es"] }
  };

  const LANGUAGE_NOTE_TRANSLATIONS = {
    "Principalmente inglés": { es: "Principalmente inglés", en: "Mainly English" },
    "Español": { es: "Español", en: "Spanish" },
    "Multilingüe / principalmente inglés": { es: "Multilingüe / principalmente inglés", en: "Multilingual / mainly English" },
    "Inglés": { es: "Inglés", en: "English" },
    "Multilingüe": { es: "Multilingüe", en: "Multilingual" },
    "Multilingüe / documentación frecuentemente en inglés": { es: "Multilingüe / documentación frecuentemente en inglés", en: "Multilingual / documentation often in English" },
    "Búsqueda web": { es: "Búsqueda web", en: "Web search" },
    "Búsqueda web en español": { es: "Búsqueda web en español", en: "Web search in Spanish" }
  };

  const I18N = {
    es: {
      appTitle: "PROJECTUS",
      appSubtitle: "Encuentra proyectos documentados, desde nivel inicial hasta ingeniería.",
      heroTitle: "Buscar proyectos",
      searchPlaceholder: "Busca por tema, tecnología o material (ej. Geiger, CNC, Arduino)...",
      search: "Buscar",
      searchAll: "Buscar en todas las fuentes",
      filters: "Filtros",
      category: "Categoría",
      language: "Idioma",
      difficulty: "Nivel",
      documentation: "Documentación",
      allCategories: "Todas las categorías",
      allLanguages: "Todos los idiomas",
      allDifficulties: "Todos los niveles",
      allDocs: "Cualquier documentación",
      sort: "Ordenar",
      sortRelevance: "Relevancia",
      sortTitle: "Título A-Z",
      sortDifficulty: "Dificultad",
      favoritesOnly: "Solo favoritos",
      clearFilters: "Limpiar filtros",
      projects: "Proyectos",
      projectsHint: "Fichas con enlace a la fuente original y estado de su documentación.",
      sources: "Fuentes",
      sourcesHint: "Cada tarjeta genera una búsqueda en el sitio original. La herramienta no extrae contenido automáticamente.",
      suggestedSearches: "Búsquedas sugeridas",
      suggestedHint: "Consultas directas en buscadores para localizar documentación, BOM y planos.",
      sections: "Secciones",
      news: "Novedades",
      newsHint: "Ítems recientes obtenidos de APIs y RSS. El índice se actualiza una vez al día.",
      totalNews: "novedades indexadas",
      sortNewest: "Más recientes",
      allSources: "Todas las fuentes",
      sourcesOk: "fuentes OK",
      sourcesError: "con error",
      lastUpdate: "Actualizado",
      refreshIndex: "Recargar índice",
      refreshingIndex: "Actualizando...",
      indexRefreshed: "Índice recargado",
      indexRefreshError: "No se pudo recargar el índice. Verifica que indice.json exista.",
      noNews: "No hay novedades con estos filtros.",
      noNewsHint: "Prueba con otra palabra o limpia los filtros.",
      indexMissing: "El índice de novedades aún no está disponible.",
      indexMissingHint: "Ejecuta scripts\\actualizar_indice.bat o actualizar_indice.py para generarlo.",
      stale: "Sin actualizar",
      noResults: "No se encontraron proyectos con estos filtros.",
      noResultsHint: "Prueba con otra palabra, elimina filtros o busca directamente en las fuentes.",
      totalProjects: "proyectos en el catálogo",
      totalSources: "fuentes disponibles",
      viewProject: "Ver ficha",
      openSource: "Abrir fuente",
      searchThisSite: "Buscar en este sitio",
      searchOnGoogle: "Buscar en Google",
      openSite: "Abrir sitio",
      documentationAvailable: "Documentación disponible",
      notConfirmed: "No confirmado",
      yes: "Sí",
      no: "No",
      unknown: "Sin datos",
      budget: "Presupuesto estimado",
      difficultyEstimated: "Nivel estimado por esta herramienta; la fuente no lo especifica.",
      difficultyFromSource: "Nivel indicado por la fuente.",
      safety: "Advertencia de seguridad",
      notes: "Notas",
      lastChecked: "Última revisión",
      source: "Fuente",
      categories: "Categorías",
      tags: "Etiquetas",
      close: "Cerrar",
      addFavorite: "Añadir a favoritos",
      removeFavorite: "Quitar de favoritos",
      searchLinksTitle: "Buscar en las fuentes",
      searchLinksHint: "Se abrirán enlaces de búsqueda en cada sitio. Usa la fuente original para leer la documentación completa.",
      queryLabel: "Consulta",
      copy: "Copiar",
      copied: "Consulta copiada",
      footerDisclaimer: "Herramienta estática de descubrimiento. No extrae contenido: enlaza a las fuentes originales y respeta sus licencias y condiciones de uso.",
      footerData: "Los campos desconocidos se muestran como «No confirmado». Las clasificaciones estimadas están marcadas.",
      footerPurpose: "He decidido crear esta herramienta con el objetivo de ordenar un poco la información y que todo se pueda buscar en un solo lugar.",
      suggestionsTitle: "Sugerencias",
      suggestionsName: "Tu nombre",
      suggestionsEmail: "Tu correo",
      suggestionsMessage: "Tu sugerencia",
      suggestionsSubmit: "Enviar",
      sending: "Enviando...",
      footerDonate: "Tu apoyo impulsa nuevas funciones y mejoras.",
      footerCvuLabel: "CVU MercadoPago:",
      donationVerify: "Antes de transferir, verificá que el destinatario sea [Tu Nombre].",
      donationOfficial: "Sitio oficial: https://github.com/cgrigstd/projectus",
      donationLinkLabel: "Link de pago:",
      donateButton: "Donar",
      themeLight: "Cambiar a tema claro",
      themeDark: "Cambiar a tema oscuro",
      switchToEnglish: "Switch to English",
      switchToSpanish: "Cambiar a español",
      dataErrorTitle: "No se pudieron cargar los datos.",
      dataErrorBody: "Abre la herramienta desde un servidor local (por ejemplo, python -m http.server) o verifica que data.js esté presente.",
      langEs: "Español",
      langEn: "Inglés",
      langMulti: "Multilingüe",
      langOther: "Otros",
      diffBeginner: "Principiante",
      diffIntermediate: "Intermedio",
      diffAdvanced: "Avanzado",
      diffProfessional: "Profesional",
      diffUnknown: "No especificado",
      docBom: "Lista de materiales",
      docSchematics: "Esquemas",
      docCad: "CAD / PCB / 3D",
      docCode: "Código / firmware",
      docInstructions: "Instrucciones",
      docTests: "Pruebas / resultados",
      quickTopicsLabel: "Temas rápidos",
      skipToContent: "Saltar al contenido",
      quickTopics: "Arduino|Raspberry Pi|CNC|Impresión 3D|Robótica|Sensores|Audio|Radiación|IoT|Meteorología|Soldadura|Maquinado"
    },
    en: {
      appTitle: "PROJECTUS",
      appSubtitle: "Find documented projects, from beginner level to engineering.",
      heroTitle: "Search projects",
      searchPlaceholder: "Search by topic, technology, or material (e.g. Geiger, CNC, Arduino)...",
      search: "Search",
      searchAll: "Search all sources",
      filters: "Filters",
      category: "Category",
      language: "Language",
      difficulty: "Level",
      documentation: "Documentation",
      allCategories: "All categories",
      allLanguages: "All languages",
      allDifficulties: "All levels",
      allDocs: "Any documentation",
      sort: "Sort",
      sortRelevance: "Relevance",
      sortTitle: "Title A-Z",
      sortDifficulty: "Difficulty",
      favoritesOnly: "Favorites only",
      clearFilters: "Clear filters",
      projects: "Projects",
      projectsHint: "Cards with a link to the original source and the status of its documentation.",
      sources: "Sources",
      sourcesHint: "Each card generates a search on the original site. The tool does not scrape content automatically.",
      suggestedSearches: "Suggested searches",
      suggestedHint: "Direct search queries to find documentation, BOMs, and drawings.",
      sections: "Sections",
      news: "Latest",
      newsHint: "Recent items from APIs and RSS. The index updates once a day.",
      totalNews: "indexed items",
      sortNewest: "Newest first",
      allSources: "All sources",
      sourcesOk: "sources OK",
      sourcesError: "with errors",
      lastUpdate: "Updated",
      refreshIndex: "Reload index",
      refreshingIndex: "Reloading...",
      indexRefreshed: "Index reloaded",
      indexRefreshError: "Could not reload the index. Make sure indice.json exists.",
      noNews: "No news matched these filters.",
      noNewsHint: "Try another keyword or clear the filters.",
      indexMissing: "The news index is not available yet.",
      indexMissingHint: "Run scripts\\actualizar_indice.bat or actualizar_indice.py to generate it.",
      stale: "Not updated",
      noResults: "No projects matched these filters.",
      noResultsHint: "Try another keyword, remove filters, or search the sources directly.",
      totalProjects: "projects in the catalog",
      totalSources: "available sources",
      viewProject: "View details",
      openSource: "Open source",
      searchThisSite: "Search this site",
      searchOnGoogle: "Search on Google",
      openSite: "Open site",
      documentationAvailable: "Available documentation",
      notConfirmed: "Not confirmed",
      yes: "Yes",
      no: "No",
      unknown: "No data",
      budget: "Estimated budget",
      difficultyEstimated: "Level estimated by this tool; the source does not specify it.",
      difficultyFromSource: "Level stated by the source.",
      safety: "Safety warning",
      notes: "Notes",
      lastChecked: "Last checked",
      source: "Source",
      categories: "Categories",
      tags: "Tags",
      close: "Close",
      addFavorite: "Add to favorites",
      removeFavorite: "Remove from favorites",
      searchLinksTitle: "Search the sources",
      searchLinksHint: "Search links will open on each site. Use the original source to read the full documentation.",
      queryLabel: "Query",
      copy: "Copy",
      copied: "Query copied",
      footerDisclaimer: "Static discovery tool. It does not scrape content: it links to original sources and respects their licenses and terms of use.",
      footerData: "Unknown fields are shown as \"Not confirmed\". Estimated classifications are marked.",
      footerPurpose: "I created this tool to organize information a bit and make everything searchable in one place.",
      suggestionsTitle: "Suggestions",
      suggestionsName: "Your name",
      suggestionsEmail: "Your email",
      suggestionsMessage: "Your suggestion",
      suggestionsSubmit: "Send",
      sending: "Sending...",
      footerDonate: "Your support drives new features and improvements.",
      footerCvuLabel: "MercadoPago CVU:",
      donationVerify: "Before transferring, verify the recipient is [Your Name].",
      donationOfficial: "Official site: https://github.com/cgrigstd/projectus",
      donationLinkLabel: "Payment link:",
      donateButton: "Donate",
      themeLight: "Switch to light theme",
      themeDark: "Switch to dark theme",
      switchToEnglish: "Switch to English",
      switchToSpanish: "Cambiar a español",
      dataErrorTitle: "Could not load the data.",
      dataErrorBody: "Open the tool from a local server (for example, python -m http.server) or make sure data.js is present.",
      langEs: "Spanish",
      langEn: "English",
      langMulti: "Multilingual",
      langOther: "Other",
      diffBeginner: "Beginner",
      diffIntermediate: "Intermediate",
      diffAdvanced: "Advanced",
      diffProfessional: "Professional",
      diffUnknown: "Not specified",
      docBom: "Bill of materials",
      docSchematics: "Schematics",
      docCad: "CAD / PCB / 3D",
      docCode: "Code / firmware",
      docInstructions: "Instructions",
      docTests: "Tests / results",
      quickTopicsLabel: "Quick topics",
      skipToContent: "Skip to content",
      quickTopics: "Arduino|Raspberry Pi|CNC|3D printing|Robotics|Sensors|Audio|Radiation|IoT|Weather|Welding|Machining"
    }
  };

  const ICONS = {
    external: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3h7v7"/><path d="M10 14 21 3"/><path d="M21 14v7H3V3h7"/></svg>',
    star: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.4l6.1-.9L12 3Z"/></svg>',
    warning: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 2 21h20L12 3Z"/><path d="M12 9v5"/><path d="M12 17h.01"/></svg>',
    close: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>'
  };

  function readStorage(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value == null ? fallback : value;
    } catch (error) {
      return fallback;
    }
  }

  const initialTab = (location.hash || "").replace("#", "");

  const state = {
    lang: readStorage(STORAGE.lang, (navigator.language || "es").toLowerCase().startsWith("es") ? "es" : "en"),
    theme: readStorage(STORAGE.theme, "dark"),
    activeTab: TABS.includes(initialTab) ? initialTab : "projects",
    query: "",
    category: "all",
    language: "all",
    difficulty: "all",
    doc: "all",
    sort: "relevance",
    newsSort: "newest",
    newsSource: "all",
    favoritesOnly: false,
    favorites: new Set(),
    projects: [],
    sources: [],
    suggested: [],
    index: {
      loaded: false,
      generated_at: null,
      sources: [],
      items: []
    },
    dataLoaded: false
  };

  let lastFocused = null;
  let searchTimer = null;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function t(key) {
    return (I18N[state.lang] && I18N[state.lang][key]) || key;
  }

  function normalize(value) {
    return String(value == null ? "" : value)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, (char) => {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }

  function safeUrl(value) {
    const text = String(value == null ? "" : value).trim();
    if (!text) return "";
    if (/^[a-z][a-z0-9+.-]*:/i.test(text)) {
      try {
        const url = new URL(text);
        if (url.protocol === "http:" || url.protocol === "https:" || url.protocol === "mailto:") return text;
      } catch (error) {
        /* invalid absolute URL */
      }
      return "";
    }
    if (/[<>"']/.test(text)) return "";
    return text;
  }

  function categoryLabel(key) {
    return (CATEGORY_LABELS[key] && CATEGORY_LABELS[key][state.lang]) || key;
  }

  function difficultyLabel(key) {
    const map = {
      principiante: "diffBeginner",
      intermedio: "diffIntermediate",
      avanzado: "diffAdvanced",
      profesional: "diffProfessional",
      no_especificado: "diffUnknown"
    };
    return t(map[key] || "diffUnknown");
  }

  function languageLabel(code) {
    if (code === "es") return t("langEs");
    if (code === "en") return t("langEn");
    if (code === "multi" || code === "multilingual") return t("langMulti");
    return t("langOther");
  }

  function docLabel(key) {
    const map = {
      bom: "docBom",
      schematics: "docSchematics",
      cad: "docCad",
      code: "docCode",
      instructions: "docInstructions",
      tests: "docTests"
    };
    return t(map[key] || key);
  }

  function languageNoteLabel(note) {
    const entry = LANGUAGE_NOTE_TRANSLATIONS[note];
    return entry ? entry[state.lang] : note;
  }

  function sourceLangFromNote(note) {
    const value = normalize(note);
    if (value.includes("espanol")) return "es";
    if (value.includes("ingles")) return "en";
    if (value.includes("multiling")) return "multi";
    return "other";
  }

  function categoryThumb(category) {
    return CATEGORY_THUMBS[category] || CATEGORY_THUMBS.maker;
  }

  function projectThumb(project) {
    const categories = project.categories || [];
    const tags = (project.tags || []).map(normalize);
    if (categories.includes("seguridad")) return CATEGORY_THUMBS.seguridad;
    if (categories.includes("robotica")) return CATEGORY_THUMBS.robotica;
    if (categories.includes("audio")) return CATEGORY_THUMBS.audio;
    if (categories.includes("raspberry")) return CATEGORY_THUMBS.raspberry;
    if (categories.includes("instrumentacion")) return CATEGORY_THUMBS.instrumentacion;
    if (categories.includes("iot")) return CATEGORY_THUMBS.iot;
    if (categories.includes("soldadura")) return CATEGORY_THUMBS.soldadura;
    if (categories.includes("maquinado")) return CATEGORY_THUMBS.maquinado;
    if (categories.includes("mecanica")) {
      if (tags.some((tag) => tag.includes("3d") || tag.includes("impresion"))) return "assets/thumb-3d.svg";
      return CATEGORY_THUMBS.mecanica;
    }
    if (categories.includes("hardware") || categories.includes("electronica")) return CATEGORY_THUMBS.electronica;
    if (categories.includes("maker")) return CATEGORY_THUMBS.maker;
    return "assets/thumb-default.svg";
  }

  function formatDate(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    try {
      return new Intl.DateTimeFormat(state.lang === "es" ? "es-ES" : "en-US", { dateStyle: "medium" }).format(date);
    } catch (error) {
      return date.toLocaleDateString();
    }
  }

  function formatDateTime(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    try {
      return new Intl.DateTimeFormat(state.lang === "es" ? "es-ES" : "en-US", {
        dateStyle: "medium",
        timeStyle: "short"
      }).format(date);
    } catch (error) {
      return date.toLocaleString();
    }
  }

  function prepareIndex(index) {
    const sources = index && Array.isArray(index.sources) ? index.sources : [];
    const items = index && Array.isArray(index.items) ? index.items : [];
    state.index = {
      loaded: Boolean(index && (sources.length > 0 || items.length > 0)),
      generated_at: index && index.generated_at ? index.generated_at : null,
      sources,
      items
    };
  }

  function loadFavorites() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE.favorites) || "[]");
      if (Array.isArray(raw)) state.favorites = new Set(raw);
    } catch (error) {
      state.favorites = new Set();
    }
  }

  function saveFavorites() {
    try {
      localStorage.setItem(STORAGE.favorites, JSON.stringify(Array.from(state.favorites)));
    } catch (error) {
      /* storage may be unavailable */
    }
  }

  function applyTheme() {
    document.documentElement.dataset.theme = state.theme;
    const button = $("#themeToggle");
    if (button) {
      button.setAttribute("aria-label", state.theme === "dark" ? t("themeLight") : t("themeDark"));
    }
  }

  function applyI18n() {
    document.documentElement.lang = state.lang;
    $$("[data-i18n]").forEach((element) => {
      element.textContent = t(element.dataset.i18n);
    });
    $$("[data-i18n-placeholder]").forEach((element) => {
      element.setAttribute("placeholder", t(element.dataset.i18nPlaceholder));
    });
    $$("[data-i18n-aria-label]").forEach((element) => {
      element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
    });
    const input = $("#searchInput");
    if (input) input.setAttribute("aria-label", t("search"));
    const quick = $("#quickTags");
    if (quick) quick.setAttribute("aria-label", t("quickTopicsLabel"));
    const langButton = $("#langToggle");
    if (langButton) {
      langButton.textContent = state.lang === "es" ? "EN" : "ES";
      langButton.setAttribute("aria-label", state.lang === "es" ? t("switchToEnglish") : t("switchToSpanish"));
    }
    applyTheme();
  }

  function setSelectOptions(select, options, selected) {
    if (!select) return selected;
    select.innerHTML = options
      .map((option) => `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`)
      .join("");
    select.value = selected;
    if (select.value !== selected) select.value = options[0] ? options[0].value : "all";
    return select.value;
  }

  function populateSelects() {
    const categoryKeys = new Set();
    state.projects.forEach((project) => (project.categories || []).forEach((key) => categoryKeys.add(key)));
    state.sources.forEach((source) => categoryKeys.add(source.categoryKey));
    state.index.items.forEach((item) => {
      if (item.category) categoryKeys.add(item.category);
    });

    const orderedCategories = Array.from(categoryKeys).sort((a, b) => {
      const ia = CATEGORY_ORDER.indexOf(a);
      const ib = CATEGORY_ORDER.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });

    state.category = setSelectOptions(
      $("#categoryFilter"),
      [{ value: "all", label: t("allCategories") }].concat(
        orderedCategories.map((key) => ({ value: key, label: categoryLabel(key) }))
      ),
      state.category
    );

    state.language = setSelectOptions(
      $("#languageFilter"),
      [
        { value: "all", label: t("allLanguages") },
        { value: "es", label: t("langEs") },
        { value: "en", label: t("langEn") },
        { value: "multi", label: t("langMulti") },
        { value: "other", label: t("langOther") }
      ],
      state.language
    );

    state.difficulty = setSelectOptions(
      $("#difficultyFilter"),
      [
        { value: "all", label: t("allDifficulties") },
        { value: "principiante", label: t("diffBeginner") },
        { value: "intermedio", label: t("diffIntermediate") },
        { value: "avanzado", label: t("diffAdvanced") },
        { value: "profesional", label: t("diffProfessional") },
        { value: "no_especificado", label: t("diffUnknown") }
      ],
      state.difficulty
    );

    state.doc = setSelectOptions(
      $("#docFilter"),
      [{ value: "all", label: t("allDocs") }].concat(
        DOC_FIELDS.map((field) => ({ value: field.key, label: docLabel(field.key) }))
      ),
      state.doc
    );

    state.sort = setSelectOptions(
      $("#sortSelect"),
      [
        { value: "relevance", label: t("sortRelevance") },
        { value: "title", label: t("sortTitle") },
        { value: "difficulty", label: t("sortDifficulty") }
      ],
      state.sort
    );

    state.newsSource = setSelectOptions(
      $("#sourceFilter"),
      [{ value: "all", label: t("allSources") }].concat(
        state.index.sources
          .slice()
          .sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), state.lang))
          .map((source) => ({ value: source.id, label: source.name }))
      ),
      state.newsSource
    );
  }

  function populateSortOptions() {
    const isNews = state.activeTab === "news";
    const options = isNews
      ? [
          { value: "newest", label: t("sortNewest") },
          { value: "title", label: t("sortTitle") }
        ]
      : [
          { value: "relevance", label: t("sortRelevance") },
          { value: "title", label: t("sortTitle") },
          { value: "difficulty", label: t("sortDifficulty") }
        ];
    if (isNews) {
      state.newsSort = setSelectOptions($("#sortSelect"), options, state.newsSort);
    } else {
      state.sort = setSelectOptions($("#sortSelect"), options, state.sort);
    }
  }

  function updateFilterVisibility() {
    $$("[data-tab-filter]").forEach((element) => {
      const tabs = element.dataset.tabFilter.split(/\s+/);
      element.hidden = !tabs.includes(state.activeTab);
    });
  }

  function prepareData(directorio, proyectos, index) {
    const sources = [];
    const suggested = [];

    if (directorio && Array.isArray(directorio.categories)) {
      directorio.categories.forEach((category) => {
        const categoryKey = JSON_CATEGORY_TO_KEY[category.category] || "maker";
        (category.links || []).forEach((link) => {
          const meta = SOURCE_META[link.name] || {};
          const item = {
            name: link.name,
            url: link.url,
            languageNote: link.language || "",
            categoryName: category.category,
            categoryKey: meta.key || categoryKey,
            lang: meta.lang || sourceLangFromNote(link.language),
            search: meta.search || null,
            tags: meta.tags || []
          };
          if (categoryKey === "busquedas") {
            suggested.push(item);
          } else {
            sources.push(item);
          }
        });
      });
    }

    state.sources = sources;
    state.suggested = suggested;
    state.projects = proyectos && Array.isArray(proyectos.projects) ? proyectos.projects : [];
    prepareIndex(index);
    state.dataLoaded = sources.length > 0 || state.projects.length > 0;
  }

  async function loadData() {
    let directorio = window.DIRECTORIO_DATA || null;
    let proyectos = window.PROYECTOS_DATA || null;

    try {
      const response = await fetch("directorio_proyectos.json", { cache: "no-store" });
      if (response.ok) directorio = await response.json();
    } catch (error) {
      /* file:// or offline: use embedded fallback */
    }

    try {
      const response = await fetch("proyectos.json", { cache: "no-store" });
      if (response.ok) proyectos = await response.json();
    } catch (error) {
      /* file:// or offline: use embedded fallback */
    }

    return { directorio, proyectos };
  }

  async function loadIndex() {
    let index = window.INDICE_DATA || null;
    try {
      const response = await fetch("indice.json", { cache: "no-store" });
      if (response.ok) index = await response.json();
    } catch (error) {
      /* file:// or offline: use embedded fallback */
    }
    return index;
  }

  function googleSiteSearchUrl(source, query) {
    let host = "";
    try {
      host = new URL(source.url).hostname.replace(/^www\./, "");
    } catch (error) {
      host = "";
    }
    const text = query ? `site:${host} ${query}` : `site:${host}`;
    return `https://www.google.com/search?q=${encodeURIComponent(text)}`;
  }

  function sourceSearchUrl(source, query) {
    if (query && source.search) return source.search.replace("{q}", encodeURIComponent(query));
    if (query) return googleSiteSearchUrl(source, query);
    return source.url;
  }

  function projectHaystack(project) {
    return normalize(
      [
        project.title,
        project.summary_es,
        project.summary_en,
        project.source_name,
        (project.tags || []).join(" "),
        (project.categories || []).map((key) => categoryLabel(key)).join(" ")
      ].join(" ")
    );
  }

  function matchesProject(project) {
    if (state.favoritesOnly && !state.favorites.has(project.id)) return false;
    if (state.category !== "all" && !(project.categories || []).includes(state.category)) return false;
    if (state.language !== "all") {
      if (state.language === "multi") {
        if (project.language !== "multilingual" && project.language !== "multi") return false;
      } else if (project.language !== state.language) {
        return false;
      }
    }
    if (state.difficulty !== "all" && project.difficulty !== state.difficulty) return false;
    if (state.doc !== "all") {
      const field = DOC_FIELDS.find((item) => item.key === state.doc);
      if (!field || project[field.flag] !== true) return false;
    }
    const query = normalize(state.query).trim();
    if (!query) return true;
    const haystack = projectHaystack(project);
    return query.split(/\s+/).every((term) => haystack.includes(term));
  }

  function matchesSource(source) {
    if (state.category !== "all" && source.categoryKey !== state.category) return false;
    if (state.language !== "all") {
      if (state.language === "multi") {
        if (source.lang !== "multi") return false;
      } else if (source.lang !== state.language) {
        return false;
      }
    }
    return true;
  }

  function newsHaystack(item) {
    return normalize(
      [
        item.title,
        item.summary,
        item.source_name,
        (item.tags || []).join(" "),
        categoryLabel(item.category)
      ].join(" ")
    );
  }

  function matchesNews(item) {
    if (state.category !== "all" && item.category !== state.category) return false;
    if (state.language !== "all") {
      if (state.language === "multi") {
        if (item.language !== "multi" && item.language !== "multilingual") return false;
      } else if (item.language !== state.language) {
        return false;
      }
    }
    if (state.newsSource !== "all" && item.source_id !== state.newsSource) return false;
    const query = normalize(state.query).trim();
    if (!query) return true;
    const haystack = newsHaystack(item);
    return query.split(/\s+/).every((term) => haystack.includes(term));
  }

  function sortNews(a, b) {
    if (state.newsSort === "title") return a.title.localeCompare(b.title, state.lang);
    const dateA = a.published_at || "";
    const dateB = b.published_at || "";
    if (dateA !== dateB) return dateB.localeCompare(dateA);
    return a.title.localeCompare(b.title, state.lang);
  }

  function scoreProject(project, query) {
    if (!query) return 0;
    let score = 0;
    const title = normalize(project.title);
    const tags = normalize((project.tags || []).join(" "));
    const summary = normalize(`${project.summary_es || ""} ${project.summary_en || ""}`);
    const source = normalize(project.source_name);
    query.split(/\s+/).forEach((term) => {
      if (title.includes(term)) score += 6;
      if (tags.includes(term)) score += 4;
      if (summary.includes(term)) score += 2;
      if (source.includes(term)) score += 1;
    });
    return score;
  }

  function sortProjects(a, b) {
    if (state.sort === "title") return a.title.localeCompare(b.title, state.lang);
    if (state.sort === "difficulty") {
      const difference =
        (DIFFICULTY_ORDER[a.difficulty] == null ? 9 : DIFFICULTY_ORDER[a.difficulty]) -
        (DIFFICULTY_ORDER[b.difficulty] == null ? 9 : DIFFICULTY_ORDER[b.difficulty]);
      if (difference !== 0) return difference;
      return a.title.localeCompare(b.title, state.lang);
    }
    const query = normalize(state.query).trim();
    const difference = scoreProject(b, query) - scoreProject(a, query);
    if (difference !== 0) return difference;
    return a.title.localeCompare(b.title, state.lang);
  }

  function renderStats() {
    const stats = $("#stats");
    if (!stats) return;
    stats.innerHTML =
      `<span><strong>${state.projects.length}</strong> ${escapeHtml(t("totalProjects"))}</span>` +
      `<span class="dot" aria-hidden="true"></span>` +
      `<span><strong>${state.sources.length}</strong> ${escapeHtml(t("totalSources"))}</span>` +
      (state.index.loaded
        ? `<span class="dot" aria-hidden="true"></span><span><strong>${state.index.items.length}</strong> ${escapeHtml(t("totalNews"))}</span>`
        : "");
  }

  function renderTabs() {
    const counts = {
      tabProjectCount: state.projects.length,
      tabSourceCount: state.sources.length,
      tabNewsCount: state.index.items.length
    };
    Object.entries(counts).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });
  }

  function renderQuickTags() {
    const container = $("#quickTags");
    if (!container) return;
    const topics = t("quickTopics").split("|");
    container.innerHTML = topics
      .map((topic) => `<button class="chip" type="button" data-query="${escapeHtml(topic)}">${escapeHtml(topic)}</button>`)
      .join("");
  }

  function projectCard(project) {
    const isFavorite = state.favorites.has(project.id);
    const summary = state.lang === "es" ? project.summary_es : project.summary_en;
    const docs = DOC_FIELDS.filter((field) => project[field.flag] === true);
    const docBadges = docs.map((field) => `<span class="badge badge-doc">${escapeHtml(docLabel(field.key))}</span>`).join("");
    const safety = project.safety_warning
      ? `<div class="safety-inline">${ICONS.warning}<span>${escapeHtml(t("safety"))}</span></div>`
      : "";
    const budget = project.estimated_budget
      ? `<span class="badge badge-budget">${escapeHtml(project.estimated_budget)}</span>`
      : "";

    return `
      <article class="card project-card" data-id="${escapeHtml(project.id)}">
        <div class="card-media">
          <img src="${escapeHtml(projectThumb(project))}" data-fallback="assets/thumb-default.svg" alt="" loading="lazy" />
        </div>
        <div class="card-top">
          <span class="badge badge-source">${escapeHtml(project.source_name)}</span>
          <button class="icon-btn favorite${isFavorite ? " is-active" : ""}" type="button" data-action="toggle-favorite" data-id="${escapeHtml(project.id)}" aria-label="${escapeHtml(isFavorite ? t("removeFavorite") : t("addFavorite"))}" title="${escapeHtml(isFavorite ? t("removeFavorite") : t("addFavorite"))}">
            ${ICONS.star}
          </button>
        </div>
        <h3 class="card-title">${escapeHtml(project.title)}</h3>
        <p class="card-summary">${escapeHtml(summary)}</p>
        <div class="badge-row">
          <span class="badge badge-lang">${escapeHtml(languageLabel(project.language))}</span>
          <span class="badge badge-difficulty" data-level="${escapeHtml(project.difficulty)}">${escapeHtml(difficultyLabel(project.difficulty))}</span>
          ${budget}
        </div>
        ${
          docBadges
            ? `<div class="doc-row">${docBadges}</div>`
            : `<div class="doc-row"><span class="muted small">${escapeHtml(t("notConfirmed"))}</span></div>`
        }
        ${safety}
        <div class="card-actions">
          <button class="btn btn-ghost" type="button" data-action="open-project" data-id="${escapeHtml(project.id)}">${escapeHtml(t("viewProject"))}</button>
          <a class="btn btn-primary" href="${escapeHtml(safeUrl(project.source_url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(t("openSource"))} ${ICONS.external}</a>
        </div>
      </article>
    `;
  }

  function sourceCard(source) {
    const query = state.query.trim();
    const primaryUrl = sourceSearchUrl(source, query);
    const primaryLabel = query ? t("searchThisSite") : t("openSite");
    const googleUrl = googleSiteSearchUrl(source, query);
    const queryBadge = query ? `<span class="badge badge-query">${escapeHtml(query)}</span>` : "";

    return `
      <article class="card source-card">
        <div class="source-head">
          <div class="source-avatar">
            <img src="${escapeHtml(categoryThumb(source.categoryKey))}" data-fallback="assets/thumb-default.svg" alt="" loading="lazy" />
          </div>
          <div class="source-head-text">
            <h3 class="card-title">${escapeHtml(source.name)}</h3>
            <p class="source-note muted">${escapeHtml(languageNoteLabel(source.languageNote))}</p>
          </div>
        </div>
        <div class="badge-row">
          <span class="badge badge-category">${escapeHtml(categoryLabel(source.categoryKey))}</span>
          <span class="badge badge-lang">${escapeHtml(languageLabel(source.lang))}</span>
          ${queryBadge}
        </div>
        <div class="card-actions">
          <a class="btn btn-primary" href="${escapeHtml(safeUrl(primaryUrl))}" target="_blank" rel="noopener noreferrer">${escapeHtml(primaryLabel)} ${ICONS.external}</a>
          <a class="btn btn-ghost" href="${escapeHtml(safeUrl(googleUrl))}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(t("searchOnGoogle"))}">Google</a>
        </div>
      </article>
    `;
  }

  function newsCard(item) {
    const fallback = categoryThumb(item.category);
    const image = safeUrl(item.image) || fallback;
    const summary = item.summary ? `<p class="card-summary">${escapeHtml(item.summary)}</p>` : "";
    const tags = (item.tags || [])
      .slice(0, 4)
      .map((tag) => `<span class="badge badge-tag">${escapeHtml(tag)}</span>`)
      .join("");
    const date = formatDate(item.published_at);
    const stale = item.stale ? `<span class="badge badge-stale">${escapeHtml(t("stale"))}</span>` : "";

    return `
      <article class="card news-card">
        <div class="card-media">
          <img src="${escapeHtml(safeUrl(image))}" data-fallback="${escapeHtml(fallback)}" alt="" loading="lazy" referrerpolicy="no-referrer" />
        </div>
        <div class="card-body">
          <div class="card-top">
            <span class="badge badge-source">${escapeHtml(item.source_name)}</span>
            ${date ? `<span class="news-date">${escapeHtml(date)}</span>` : ""}
          </div>
          <h3 class="card-title"><a href="${escapeHtml(safeUrl(item.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title)}</a></h3>
          ${summary}
          <div class="badge-row">
            <span class="badge badge-category">${escapeHtml(categoryLabel(item.category))}</span>
            <span class="badge badge-lang">${escapeHtml(languageLabel(item.language))}</span>
            ${stale}
            ${tags}
          </div>
          <div class="card-actions">
            <a class="btn btn-primary" href="${escapeHtml(safeUrl(item.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(t("openSource"))} ${ICONS.external}</a>
          </div>
        </div>
      </article>
    `;
  }

  function renderProjects() {
    const grid = $("#projectsGrid");
    const empty = $("#projectsEmpty");
    const count = $("#projectCount");
    if (!grid) return;

    const projects = state.projects.filter(matchesProject).sort(sortProjects);
    if (count) count.textContent = `(${projects.length})`;
    grid.innerHTML = projects.map(projectCard).join("");
    if (empty) empty.hidden = projects.length > 0;
  }

  function renderSources() {
    const grid = $("#sourcesGrid");
    const count = $("#sourceCount");
    if (!grid) return;

    const sources = state.sources
      .filter(matchesSource)
      .sort((a, b) => {
        const ia = CATEGORY_ORDER.indexOf(a.categoryKey);
        const ib = CATEGORY_ORDER.indexOf(b.categoryKey);
        const difference = (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
        if (difference !== 0) return difference;
        return a.name.localeCompare(b.name, state.lang);
      });

    if (count) count.textContent = `(${sources.length})`;
    grid.innerHTML = sources.map(sourceCard).join("");
  }

  function renderSuggested() {
    const grid = $("#suggestedGrid");
    if (!grid) return;
    grid.innerHTML = state.suggested
      .map(
        (item) =>
          `<a class="suggested-link" href="${escapeHtml(safeUrl(item.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.name)} ${ICONS.external}</a>`
      )
      .join("");
  }

  function renderNewsStatus() {
    const status = $("#newsStatus");
    if (!status) return;
    const sources = state.index.sources || [];
    const indexable = sources.filter((source) => source.method !== "deep_link");
    const ok = indexable.filter((source) => source.status === "ok").length;
    const errors = indexable.filter((source) => source.status === "error");
    const updated = state.index.generated_at ? formatDateTime(state.index.generated_at) : "—";
    const pills = state.index.loaded
      ? `<span class="status-pill is-ok">${ok}/${indexable.length} ${escapeHtml(t("sourcesOk"))}</span>` +
        (errors.length
          ? `<span class="status-pill is-error">${errors.length} ${escapeHtml(t("sourcesError"))}</span>`
          : "") +
        `<span class="index-updated">${escapeHtml(t("lastUpdate"))}: ${escapeHtml(updated)}</span>`
      : `<span class="status-pill">${escapeHtml(t("indexMissing"))}</span>`;

    status.innerHTML =
      `<div class="index-meta">${pills}</div>` +
      `<button class="btn btn-ghost" type="button" data-action="refresh-index">${escapeHtml(t("refreshIndex"))}</button>`;

    const errorsBox = $("#newsErrors");
    if (!errorsBox) return;
    if (errors.length) {
      errorsBox.hidden = false;
      errorsBox.innerHTML =
        `<strong>${escapeHtml(t("sourcesError"))}:</strong> ` +
        errors
          .map(
            (source) =>
              `<span title="${escapeHtml(source.error || "")}">${escapeHtml(source.name)}${
                source.http_status ? ` (${escapeHtml(source.http_status)})` : ""
              }</span>`
          )
          .join(", ");
    } else {
      errorsBox.hidden = true;
      errorsBox.innerHTML = "";
    }
  }

  function renderNews() {
    const grid = $("#newsGrid");
    const empty = $("#newsEmpty");
    const count = $("#newsCount");
    if (!grid) return;
    const items = state.index.items.filter(matchesNews).sort(sortNews);
    if (count) count.textContent = `(${items.length})`;
    grid.innerHTML = items.map(newsCard).join("");
    if (!empty) return;

    const show = items.length === 0;
    empty.hidden = !show;
    if (!show) return;
    const title = $("#newsEmptyTitle");
    const hint = $("#newsEmptyHint");
    const refresh = $("#newsEmptyRefresh");
    if (title) title.textContent = state.index.loaded ? t("noNews") : t("indexMissing");
    if (hint) hint.textContent = state.index.loaded ? t("noNewsHint") : t("indexMissingHint");
    if (refresh) refresh.hidden = state.index.loaded;
  }

  function render() {
    renderTabs();
    renderStats();
    renderProjects();
    renderSources();
    renderSuggested();
    renderNewsStatus();
    renderNews();
  }

  function setActiveTab(tab, options = {}) {
    const nextTab = TABS.includes(tab) ? tab : "projects";
    state.activeTab = nextTab;
    $$(".tab").forEach((button) => {
      const active = button.dataset.tab === nextTab;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", active ? "true" : "false");
      button.tabIndex = active ? 0 : -1;
    });
    $$(".tab-panel").forEach((panel) => {
      panel.hidden = panel.id !== `panel-${nextTab}`;
    });
    populateSortOptions();
    updateFilterVisibility();
    render();
    if (options.updateHash !== false) {
      try {
        history.replaceState(null, "", `#${nextTab}`);
      } catch (error) {
        /* file:// or restricted history */
      }
    }
    if (options.scroll) {
      const tabs = $(".tabs");
      if (tabs) tabs.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  async function refreshIndex() {
    const button = $("#newsStatus [data-action='refresh-index']") || $("#newsEmptyRefresh");
    if (button) {
      button.disabled = true;
      button.textContent = t("refreshingIndex");
    }
    try {
      const response = await fetch(`indice.json?ts=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      prepareIndex(await response.json());
      populateSelects();
      populateSortOptions();
      render();
      showToast(t("indexRefreshed"));
    } catch (error) {
      showToast(t("indexRefreshError"));
    } finally {
      const currentButton = $("#newsStatus [data-action='refresh-index']") || $("#newsEmptyRefresh");
      if (currentButton) {
        currentButton.disabled = false;
        currentButton.textContent = t("refreshIndex");
      }
    }
  }

  function openDonationModal() {
    const root = $("#modalRoot");
    if (!root) return;
    lastFocused = document.activeElement;
    const alias = $("#donationAlias") ? $("#donationAlias").textContent.trim() : "";
    const cvu = $("#donationCvu") ? $("#donationCvu").textContent.trim() : "";
    const holder = $("#donationHolder") ? $("#donationHolder").textContent.trim() : "";
    root.innerHTML = `
      <div class="modal-backdrop" data-action="close-backdrop">
        <div class="modal donation-modal" role="dialog" aria-modal="true" aria-labelledby="donationModalTitle">
          <div class="modal-head">
            <div class="donation-modal-head">
              <h2 id="donationModalTitle" class="donation-modal-title">${escapeHtml(t("footerDonate"))}</h2>
            </div>
            <button class="icon-btn" type="button" data-action="close-modal" aria-label="${escapeHtml(t("close"))}">${ICONS.close}</button>
          </div>
          <div class="donation-modal-body">
            ${holder ? `<p class="donation-holder"><strong>Titular:</strong> ${escapeHtml(holder)}</p>` : ""}
            <p class="donation-row"><span>Alias:</span> <code>${escapeHtml(alias)}</code> <button class="btn btn-ghost btn-sm" type="button" data-action="copy-alias">${escapeHtml(t("copy"))}</button></p>
            <p class="donation-row"><span>CVU:</span> <code>${escapeHtml(cvu)}</code> <button class="btn btn-ghost btn-sm" type="button" data-action="copy-cvu">${escapeHtml(t("copy"))}</button></p>
            <p class="muted small">${escapeHtml(t("donationOfficial"))}</p>
          </div>
          <div class="modal-actions">
            <button class="btn btn-ghost" type="button" data-action="close-modal">${escapeHtml(t("close"))}</button>
          </div>
        </div>
      </div>
    `;
    document.body.classList.add("modal-open");
    const aliasBtn = root.querySelector("[data-action='copy-alias']");
    if (aliasBtn) aliasBtn.addEventListener("click", () => {
      if (navigator.clipboard) navigator.clipboard.writeText(alias).then(() => showToast(t("copied")));
    });
    const cvuBtn = root.querySelector("[data-action='copy-cvu']");
    if (cvuBtn) cvuBtn.addEventListener("click", () => {
      if (navigator.clipboard) navigator.clipboard.writeText(cvu).then(() => showToast(t("copied")));
    });
  }

  function openProjectModal(id, keepFocus) {
    const project = state.projects.find((item) => item.id === id);
    if (!project) return;

    if (!keepFocus) lastFocused = document.activeElement;
    const isFavorite = state.favorites.has(project.id);
    const summary = state.lang === "es" ? project.summary_es : project.summary_en;
    const notes = state.lang === "es" ? project.notes_es : project.notes_en;
    const safetyNote = state.lang === "es" ? project.safety_note_es : project.safety_note_en;
    const docRows = DOC_FIELDS.map((field) => {
      const value = project[field.flag];
      const status = value === true ? t("yes") : value === false ? t("no") : t("unknown");
      const cssClass = value === true ? "is-yes" : value === false ? "is-no" : "is-unknown";
      return `<li class="doc-item ${cssClass}"><span>${escapeHtml(docLabel(field.key))}</span><strong>${escapeHtml(status)}</strong></li>`;
    }).join("");
    const categories = (project.categories || [])
      .map((key) => `<span class="badge badge-category">${escapeHtml(categoryLabel(key))}</span>`)
      .join("");
    const tags = (project.tags || [])
      .map((tag) => `<span class="badge badge-tag">${escapeHtml(tag)}</span>`)
      .join("");
    const budget = project.estimated_budget
      ? `<div class="detail-row"><span class="detail-label">${escapeHtml(t("budget"))}</span><span>${escapeHtml(project.estimated_budget)}</span></div>`
      : "";
    const safety = project.safety_warning
      ? `<div class="safety-box"><strong>${escapeHtml(t("safety"))}</strong><p>${escapeHtml(safetyNote || "")}</p></div>`
      : "";
    const difficultyNote = project.difficulty_estimated ? t("difficultyEstimated") : t("difficultyFromSource");

    $("#modalRoot").innerHTML = `
      <div class="modal-backdrop" data-action="close-backdrop">
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="projectModalTitle">
          <div class="modal-head">
            <div>
              <span class="badge badge-source">${escapeHtml(project.source_name)}</span>
              <h2 id="projectModalTitle">${escapeHtml(project.title)}</h2>
            </div>
            <button class="icon-btn" type="button" data-action="close-modal" aria-label="${escapeHtml(t("close"))}">${ICONS.close}</button>
          </div>
          <p class="modal-summary">${escapeHtml(summary)}</p>
          <div class="badge-row">${categories}</div>
          <div class="detail-grid">
            <div class="detail-row"><span class="detail-label">${escapeHtml(t("difficulty"))}</span><span>${escapeHtml(difficultyLabel(project.difficulty))}</span></div>
            <div class="detail-row"><span class="detail-label">${escapeHtml(t("language"))}</span><span>${escapeHtml(languageLabel(project.language))}</span></div>
            ${budget}
            <div class="detail-row"><span class="detail-label">${escapeHtml(t("lastChecked"))}</span><span>${escapeHtml(project.last_checked || "—")}</span></div>
          </div>
          <p class="muted small">${escapeHtml(difficultyNote)}</p>
          <h3>${escapeHtml(t("documentationAvailable"))}</h3>
          <ul class="doc-list">${docRows}</ul>
          ${safety}
          ${notes ? `<h3>${escapeHtml(t("notes"))}</h3><p class="muted">${escapeHtml(notes)}</p>` : ""}
          ${tags ? `<h3>${escapeHtml(t("tags"))}</h3><div class="badge-row">${tags}</div>` : ""}
          <div class="modal-actions">
          <a class="btn btn-primary" href="${escapeHtml(safeUrl(project.source_url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(t("openSource"))} ${ICONS.external}</a>
            <button class="btn btn-ghost" type="button" data-action="toggle-favorite" data-id="${escapeHtml(project.id)}">${escapeHtml(isFavorite ? t("removeFavorite") : t("addFavorite"))}</button>
            <button class="btn btn-ghost" type="button" data-action="close-modal">${escapeHtml(t("close"))}</button>
          </div>
        </div>
      </div>
    `;

    document.body.classList.add("modal-open");
    const closeButton = $("#modalRoot .modal .icon-btn");
    if (closeButton) closeButton.focus();
  }

  function openSearchModal() {
    lastFocused = document.activeElement;
    const query = state.query.trim();
    const sources = state.sources.slice().sort((a, b) => a.name.localeCompare(b.name, state.lang));
    const rows = sources
      .map((source) => {
        const url = sourceSearchUrl(source, query);
        const label = query ? t("search") : t("openSite");
        return `
          <li class="search-link-row">
            <div>
              <strong>${escapeHtml(source.name)}</strong>
              <span class="muted small">${escapeHtml(categoryLabel(source.categoryKey))} · ${escapeHtml(languageLabel(source.lang))}</span>
            </div>
            <a class="btn btn-ghost" href="${escapeHtml(safeUrl(url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)} ${ICONS.external}</a>
          </li>
        `;
      })
      .join("");
    const suggested = state.suggested
      .map(
        (item) =>
          `<a class="suggested-link" href="${escapeHtml(safeUrl(item.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.name)} ${ICONS.external}</a>`
      )
      .join("");
    const queryBox = query
      ? `<div class="query-box"><span class="detail-label">${escapeHtml(t("queryLabel"))}</span><strong>${escapeHtml(query)}</strong><button class="btn btn-ghost" type="button" data-action="copy-query">${escapeHtml(t("copy"))}</button></div>`
      : "";

    $("#modalRoot").innerHTML = `
      <div class="modal-backdrop" data-action="close-backdrop">
        <div class="modal modal-wide" role="dialog" aria-modal="true" aria-labelledby="searchModalTitle">
          <div class="modal-head">
            <div>
              <h2 id="searchModalTitle">${escapeHtml(t("searchLinksTitle"))}</h2>
              <p class="muted small">${escapeHtml(t("searchLinksHint"))}</p>
            </div>
            <button class="icon-btn" type="button" data-action="close-modal" aria-label="${escapeHtml(t("close"))}">${ICONS.close}</button>
          </div>
          ${queryBox}
          <ul class="search-link-list">${rows}</ul>
          <h3>${escapeHtml(t("suggestedSearches"))}</h3>
          <div class="suggested-grid">${suggested}</div>
          <div class="modal-actions">
            <button class="btn btn-ghost" type="button" data-action="close-modal">${escapeHtml(t("close"))}</button>
          </div>
        </div>
      </div>
    `;

    document.body.classList.add("modal-open");
    const closeButton = $("#modalRoot .modal .icon-btn");
    if (closeButton) closeButton.focus();
  }

  function closeModal() {
    $("#modalRoot").innerHTML = "";
    document.body.classList.remove("modal-open");
    if (lastFocused && lastFocused.isConnected && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
    lastFocused = null;
  }

  function toggleFavorite(id) {
    if (!id) return;
    if (state.favorites.has(id)) {
      state.favorites.delete(id);
    } else {
      state.favorites.add(id);
    }
    saveFavorites();
    renderProjects();

    const modal = $("#modalRoot .modal");
    if (modal) {
      const scrollTop = modal.scrollTop;
      openProjectModal(id, true);
      const reopened = $("#modalRoot .modal");
      if (reopened) {
        reopened.scrollTop = scrollTop;
        const favoriteButton = reopened.querySelector('[data-action="toggle-favorite"]');
        if (favoriteButton) favoriteButton.focus();
      }
    }
  }

  function setQuery(query) {
    state.query = query;
    const input = $("#searchInput");
    if (input && input.value !== query) input.value = query;
    render();
  }

  function clearFilters() {
    state.query = "";
    state.category = "all";
    state.language = "all";
    state.difficulty = "all";
    state.doc = "all";
    state.newsSource = "all";
    state.newsSort = "newest";
    state.favoritesOnly = false;
    const input = $("#searchInput");
    if (input) input.value = "";
    const favorites = $("#favoritesOnly");
    if (favorites) favorites.checked = false;
    populateSelects();
    populateSortOptions();
    render();
  }

  function setLanguage(lang) {
    state.lang = lang;
    try {
      localStorage.setItem(STORAGE.lang, lang);
    } catch (error) {
      /* storage may be unavailable */
    }
    applyI18n();
    populateSelects();
    populateSortOptions();
    renderQuickTags();
    render();
    if ($("#modalRoot").children.length > 0) closeModal();
  }

  function setTheme(theme) {
    state.theme = theme;
    try {
      localStorage.setItem(STORAGE.theme, theme);
    } catch (error) {
      /* storage may be unavailable */
    }
    applyTheme();
  }

  function showToast(message) {
    const toast = $("#toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("is-visible"), 1800);
  }

  function showBanner() {
    const banner = $("#appBanner");
    if (!banner) return;
    banner.hidden = false;
    banner.innerHTML = `<div><strong>${escapeHtml(t("dataErrorTitle"))}</strong> ${escapeHtml(t("dataErrorBody"))}</div>`;
  }

  function bindEvents() {
    const searchInput = $("#searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => setQuery(searchInput.value), 120);
      });
      searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          clearTimeout(searchTimer);
          setQuery(searchInput.value);
        }
      });
    }

    const searchAll = $("#searchAllBtn");
    if (searchAll) searchAll.addEventListener("click", openSearchModal);

    const langToggle = $("#langToggle");
    if (langToggle) langToggle.addEventListener("click", () => setLanguage(state.lang === "es" ? "en" : "es"));

    const themeToggle = $("#themeToggle");
    if (themeToggle) themeToggle.addEventListener("click", () => setTheme(state.theme === "dark" ? "light" : "dark"));

    const suggestionsForm = $(".suggestions-form");
    if (suggestionsForm) {
      suggestionsForm.addEventListener("submit", () => {
        const button = suggestionsForm.querySelector('button[type="submit"]');
        if (button) {
          button.disabled = true;
          button.textContent = t("sending");
          setTimeout(() => {
            button.disabled = false;
            button.textContent = t("suggestionsSubmit");
          }, 5000);
        }
      });
    }

    const clearButton = $("#clearFilters");
    if (clearButton) clearButton.addEventListener("click", clearFilters);

    const favoritesOnly = $("#favoritesOnly");
    if (favoritesOnly) {
      favoritesOnly.addEventListener("change", () => {
        state.favoritesOnly = favoritesOnly.checked;
        renderProjects();
      });
    }

    const filterBindings = [
      ["#categoryFilter", "category"],
      ["#languageFilter", "language"],
      ["#difficultyFilter", "difficulty"],
      ["#docFilter", "doc"],
      ["#sourceFilter", "newsSource"],
      ["#sortSelect", "sort"]
    ];
    filterBindings.forEach(([selector, key]) => {
      const select = $(selector);
      if (!select) return;
      select.addEventListener("change", () => {
        if (key === "sort") {
          if (state.activeTab === "news") {
            state.newsSort = select.value;
            renderNews();
          } else {
            state.sort = select.value;
            renderProjects();
          }
          return;
        }
        state[key] = select.value;
        render();
      });
    });

    const tabButtons = $$(".tab");
    tabButtons.forEach((button, index) => {
      button.addEventListener("click", () => setActiveTab(button.dataset.tab, { scroll: true }));
      button.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        let nextIndex = index;
        if (event.key === "ArrowRight") nextIndex = (index + 1) % tabButtons.length;
        if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabButtons.length) % tabButtons.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = tabButtons.length - 1;
        const nextButton = tabButtons[nextIndex];
        setActiveTab(nextButton.dataset.tab);
        nextButton.focus();
      });
    });

    window.addEventListener("hashchange", () => {
      const tab = (location.hash || "").replace("#", "");
      if (TABS.includes(tab) && tab !== state.activeTab) {
        setActiveTab(tab, { updateHash: false, scroll: true });
      }
    });

    document.addEventListener(
      "error",
      (event) => {
        const image = event.target;
        if (!(image instanceof HTMLImageElement)) return;
        const fallback = image.dataset.fallback;
        if (fallback && image.getAttribute("src") !== fallback) {
          image.src = fallback;
        }
      },
      true
    );

    document.addEventListener("click", (event) => {
      const queryButton = event.target.closest("[data-query]");
      if (queryButton) {
        setQuery(queryButton.dataset.query || "");
        return;
      }

      const actionElement = event.target.closest("[data-action]");
      if (!actionElement) return;
      const action = actionElement.dataset.action;

      if (action === "toggle-favorite") {
        event.preventDefault();
        toggleFavorite(actionElement.dataset.id);
        return;
      }

      if (action === "open-project") {
        event.preventDefault();
        openProjectModal(actionElement.dataset.id);
        return;
      }

      if (action === "close-modal") {
        event.preventDefault();
        closeModal();
        return;
      }

      if (action === "close-backdrop") {
        if (!event.target.closest(".modal")) closeModal();
        return;
      }

      if (action === "clear-filters") {
        event.preventDefault();
        clearFilters();
        return;
      }

      if (action === "refresh-index") {
        event.preventDefault();
        refreshIndex();
        return;
      }

      if (action === "open-donation") {
        event.preventDefault();
        openDonationModal();
        return;
      }

      if (action === "copy-query") {
        event.preventDefault();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(state.query).then(() => showToast(t("copied")));
        }
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeModal();
    });
  }

  async function init() {
    loadFavorites();
    applyI18n();
    applyTheme();

    const [data, index] = await Promise.all([loadData(), loadIndex()]);
    prepareData(data.directorio, data.proyectos, index);

    if (!state.dataLoaded) showBanner();

    populateSelects();
    populateSortOptions();
    updateFilterVisibility();
    renderQuickTags();
    setActiveTab(state.activeTab, { updateHash: false });
    bindEvents();

    hideLoadingScreen();
  }

  function hideLoadingScreen() {
    const screen = $("#loadingScreen");
    if (!screen) return;
    const remaining = Math.max(0, LOADING_MIN_MS - (Date.now() - loadingStart));
    setTimeout(() => {
      screen.classList.add("is-hidden");
      setTimeout(() => {
        if (screen.parentNode) screen.parentNode.removeChild(screen);
      }, 500);
    }, remaining);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
