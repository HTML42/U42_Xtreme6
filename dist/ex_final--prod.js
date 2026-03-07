/* DIST SOURCE: objects--prod.js */
/* SOURCE: objects/x_user/x_user.class.js */
class XUser {
  static _CACHE = {};

  constructor(id = 0) {
    this.id = Number(id) || 0;
    this.insert_date = 0;
    this.update_date = 0;
    this.delete_date = 0;
  }

  static async load(id = 0) {
    const normalizedId = Number(id) || 0;
    const cacheKey = JSON.stringify({ id: normalizedId });

    if (XUser._CACHE[cacheKey]) {
      return XUser._CACHE[cacheKey];
    }

    const user = new XUser(normalizedId);

    // Placeholder: replace with an awaited API request later.
    await Promise.resolve();

    const now = Math.floor(Date.now() / 1000);
    user.insert_date = now;
    user.update_date = now;
    user.delete_date = 0;

    XUser._CACHE[cacheKey] = user;
    return user;
  }

  static clear_cache() {
    XUser._CACHE = {};
  }
}

globalThis.XUser = XUser;

/* SOURCE: objects/x_users/x_users.class.js */
class XUsers {
  static _CACHE = {};

  constructor(id = 0) {
    this.id = Number(id) || 0;
    this.insert_date = 0;
    this.update_date = 0;
    this.delete_date = 0;
  }

  static async load(id = 0) {
    const normalizedId = Number(id) || 0;
    const cacheKey = JSON.stringify({ load: normalizedId });

    if (XUsers._CACHE[cacheKey]) {
      return XUsers._CACHE[cacheKey];
    }

    // Placeholder: replace with a query/list API request later.
    await Promise.resolve();

    const list = [];
    if (normalizedId > 0) {
      list.push(await globalThis.XUser.load(normalizedId));
    }

    XUsers._CACHE[cacheKey] = list;
    return list;
  }

  static clear_cache() {
    XUsers._CACHE = {};
  }
}

globalThis.XUsers = XUsers;

/* DIST SOURCE: scripts--prod.js */
/* SOURCE: scripts/controllers/Index.Controller.js */
class IndexController {
  constructor() {
    this.name = 'IndexController';
    this.route = null;
  }

  index(route) {
    this.route = route;
    console.log('IndexController.index', route);
  }

  view(route) {
    this.route = route;
    console.log('IndexController.view', route);
  }
}

window.IndexController = IndexController;

/* SOURCE: scripts/projects.js */
window.X6 = window.X6 || {};

setTimeout(() => {
  window.X6.framework = new XFramework({
    defaultController: 'index',
    defaultView: 'index'
  });

  window.X6.router = new XRouter({
    defaultController: 'index',
    defaultView: 'index',
    autoInit: false
  });

  window.X6.framework.attachRouter(window.X6.router);
  window.X6.router.init();
}, 1);

/* SOURCE: scripts/x_framework.class.js */
class XFramework {
  constructor(options = {}) {
    this.defaultController = options.defaultController || 'index';
    this.defaultView = options.defaultView || 'index';
    this.currentRoute = this.getEmptyRoute();
    this.router = null;

    this.handleRoute = this.handleRoute.bind(this);
    window.addEventListener('x6:route', this.handleRoute);
  }

  attachRouter(router) {
    this.router = router;
  }

  destroy() {
    window.removeEventListener('x6:route', this.handleRoute);
  }

  handleRoute(event) {
    if (!event || !event.detail) {
      return;
    }

    this.renderRoute(event.detail);
  }

  getEmptyRoute() {
    return {
      controller: this.defaultController,
      view: this.defaultView,
      action: null,
      id: null,
      params: {},
      segments: []
    };
  }

  renderRoute(route) {
    this.currentRoute = route;

    const controllerClassName = `${this.capitalize(route.controller)}Controller`;
    const controllerClass = window[controllerClassName];

    if (typeof controllerClass !== 'function') {
      console.warn(`Controller not found: ${controllerClassName}`);
      return;
    }

    const controller = new controllerClass();
    controller.route = route;

    const viewMethod = this.resolveViewMethod(controller, route.view);

    if (!viewMethod) {
      console.warn(`View method not found: ${route.view} in ${controllerClassName}`);
      return;
    }

    controller[viewMethod](route);
  }

  resolveViewMethod(controller, viewName) {
    if (typeof controller[viewName] === 'function') {
      return viewName;
    }

    const normalized = String(viewName).toLowerCase();
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(controller));

    for (let i = 0; i < methods.length; i += 1) {
      const method = methods[i];

      if (method.toLowerCase() === normalized && typeof controller[method] === 'function') {
        return method;
      }
    }

    return null;
  }

  capitalize(value) {
    const stringValue = String(value || '');

    if (!stringValue) {
      return '';
    }

    return stringValue.charAt(0).toUpperCase() + stringValue.slice(1);
  }
}

window.XFramework = XFramework;

/* SOURCE: scripts/x_router.class.js */
class XRouter {
  constructor(options = {}) {
    this.defaultController = options.defaultController || 'index';
    this.defaultView = options.defaultView || 'index';
    this.eventName = options.eventName || 'x6:route';
    this.onRoute = typeof options.onRoute === 'function' ? options.onRoute : null;

    this.route = this.getEmptyRoute();
    this.handleLocationChange = this.handleLocationChange.bind(this);

    if (options.autoInit !== false) {
      this.init();
    }
  }

  getEmptyRoute() {
    return {
      controller: this.defaultController,
      view: this.defaultView,
      action: null,
      id: null,
      params: {},
      segments: []
    };
  }

  init() {
    this.destroy();
    window.addEventListener('hashchange', this.handleLocationChange);
    this.handleLocationChange();
  }

  destroy() {
    window.removeEventListener('hashchange', this.handleLocationChange);
  }

  handleLocationChange() {
    if (!window.location.hash) {
      window.location.hash = `!/${this.defaultController}/${this.defaultView}`;
      return;
    }

    this.route = this.parse(window.location.hash);
    this.emitRoute(this.route);

    if (this.onRoute) {
      this.onRoute(this.route);
    }
  }

  emitRoute(route) {
    window.dispatchEvent(new CustomEvent(this.eventName, {
      detail: route
    }));
  }

  parse(hash) {
    const normalized = this.normalizeHash(hash);
    const segments = normalized
      .split('/')
      .map((segment) => decodeURIComponent(segment.trim()))
      .filter(Boolean);

    const controller = (segments[0] || this.defaultController).toLowerCase();
    const view = (segments[1] || this.defaultView).toLowerCase();
    const tail = segments.slice(2);

    let action = null;
    let id = null;
    const params = {};

    if (tail.length > 0) {
      if (this.isNumeric(tail[0])) {
        id = Number(tail[0]);
      } else if (tail.length % 2 === 1) {
        action = tail.shift().toLowerCase();
      }

      while (tail.length > 1) {
        const key = tail.shift();
        const value = tail.shift();

        params[key] = value;
      }
    }

    return {
      controller,
      view,
      action,
      id,
      params,
      segments
    };
  }

  normalizeHash(hash) {
    if (!hash) {
      return '';
    }

    return hash
      .replace(/^#!/, '')
      .replace(/^#/, '')
      .replace(/^\//, '');
  }

  isNumeric(value) {
    return /^\d+$/.test(String(value));
  }
}

window.XRouter = XRouter;

/* SOURCE: scripts/x_template.class.js */
class XTemplate {
  static ensureStore() {
    if (!Array.isArray(window.TEMPLATES)) {
      window.TEMPLATES = [];
    }

    return window.TEMPLATES;
  }

  static set(name, templateString) {
    const key = String(name || '').trim();

    if (!key) {
      throw new Error('Template name is required.');
    }

    const template = String(templateString ?? '');
    XTemplate.ensureStore()[key] = template;

    return template;
  }

  static get(name) {
    const key = String(name || '').trim();

    if (!key) {
      return '';
    }

    const template = XTemplate.ensureStore()[key];
    return typeof template === 'string' ? template : '';
  }

  static render(name, params = {}) {
    const template = XTemplate.get(name);

    if (!template) {
      return '';
    }

    return template.replace(/\{\{\s*([a-z0-9_]+)\s*\}\}/gi, (match, key) => {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        return String(params[key]);
      }

      return '';
    });
  }
}

window.XTemplate = XTemplate;

/* SOURCE: scripts/x_translation.class.js */
class XTranslation {
  static ensureStore() {
    if (!Array.isArray(window.TRANSLATIONS)) {
      window.TRANSLATIONS = [];
    }

    return window.TRANSLATIONS;
  }

  static set(key, value) {
    const translationKey = String(key || '').trim();

    if (!translationKey) {
      throw new Error('Translation key is required.');
    }

    const text = String(value ?? '');
    XTranslation.ensureStore()[translationKey] = text;

    return text;
  }

  static get(key) {
    const translationKey = String(key || '').trim();

    if (!translationKey) {
      return '';
    }

    const text = XTranslation.ensureStore()[translationKey];
    return typeof text === 'string' ? text : '';
  }

  static t(key, params = {}) {
    const text = XTranslation.get(key);

    if (!text) {
      return String(key || '');
    }

    return text.replace(/\{\{\s*([a-z0-9_]+)\s*\}\}/gi, (match, variable) => {
      if (Object.prototype.hasOwnProperty.call(params, variable)) {
        return String(params[variable]);
      }

      return '';
    });
  }
}

window.XTranslation = XTranslation;

/* DIST SOURCE: templates--prod.js */
/* SOURCE: templates/body.js */
window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['body'] = `
<div id="app">
  {{Header}}
  <main id="page_main">
    <article id="page_article">{{Article}}</article>
    <aside id="page_aside">{{Sidebar}}</aside>
  </main>
  {{Footer}}
</div>
`.trim();

/* SOURCE: templates/footer.js */
window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['footer'] = `
<footer id="page_footer">
  <p>{{footer_text}}</p>
  <small>{{footer_domain}}</small>
</footer>
`.trim();

/* SOURCE: templates/form.login.js */
window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['form.login'] = `
<form id="login_form">
  <label>{{label_username}}</label>
  <input name="username" type="text" />

  <label>{{label_password}}</label>
  <input name="password" type="password" />

  <button type="submit">{{action_login}}</button>
</form>
`.trim();

/* SOURCE: templates/header.js */
window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['header'] = `
<header id="page_header">
  <a class="logo" href="#!/index/index">{{app_name}}</a>

  <nav class="menu_main">
    <ul class="clean_list" data-status="loggedin">
      <li><a href="#!/index/index">{{menu_home}}</a></li>
      <li><a href="#!/users/profile">{{menu_profile}}</a></li>
      <li><a href="#!/users/wallets">{{menu_wallets}}</a></li>
      <li><a href="#!/users/deposit">{{menu_deposit}}</a></li>
      <li><a href="#!/users/withdraw">{{menu_withdraw}}</a></li>
      <li><a href="#!/plans/index">{{menu_plans}}</a></li>
      <li data-isadmin><a href="#!/admin/dashboard">{{menu_admin}}</a></li>
      <li><a href="#!/users/logout">{{menu_logout}}</a></li>
    </ul>

    <ul class="clean_list" data-status="loggedout">
      <li><a href="#!/index/index">{{menu_home}}</a></li>
      <li><a href="#!/users/login">{{menu_login}}</a></li>
      <li><a href="#!/users/registration">{{menu_registration}}</a></li>
      <li><a href="#!/index/imprint">{{menu_imprint}}</a></li>
      <li><a href="#!/index/privacy">{{menu_privacy}}</a></li>
    </ul>
  </nav>
</header>
`.trim();

/* SOURCE: templates/sidebar.js */
window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['sidebar'] = `
<section id="page_sidebar">
  <h3>{{sidebar_title}}</h3>
  <ul class="clean_list">
    <li><a href="#!/index/index">{{menu_home}}</a></li>
    <li><a href="#!/support/index">{{menu_support}}</a></li>
    <li><a href="#!/index/contact">{{menu_contact}}</a></li>
  </ul>
</section>
`.trim();

/* SOURCE: templates/view.index.imprint.js */
window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['view.index.imprint'] = `
<section class="view view_index_imprint">
  <h1>{{caption}}</h1>
  <p>{{content}}</p>
</section>
`.trim();

/* SOURCE: templates/view.index.index.js */
window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['view.index.index'] = `
<section class="view view_index_index">
  <h1>{{caption}}</h1>
  <p>{{intro}}</p>
</section>
`.trim();

/* SOURCE: templates/view.index.privacy.js */
window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['view.index.privacy'] = `
<section class="view view_index_privacy">
  <h1>{{caption}}</h1>
  <p>{{content}}</p>
</section>
`.trim();

/* SOURCE: templates/view.users.login.js */
window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['view.users.login'] = `
<section class="view view_users_login">
  <h1>{{caption}}</h1>
  <p>{{intro}}</p>
  {{FormLogin}}
</section>
`.trim();

/* SOURCE: templates/view.users.registration.js */
window.TEMPLATES = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];

window.TEMPLATES['view.users.registration'] = `
<section class="view view_users_registration">
  <h1>{{caption}}</h1>
  <p>{{intro}}</p>
  <form id="registration_form">
    <label>{{label_username}}</label>
    <input name="username" type="text" />

    <label>{{label_email}}</label>
    <input name="email" type="email" />

    <label>{{label_password}}</label>
    <input name="password" type="password" />

    <label>{{label_password2}}</label>
    <input name="password2" type="password" />

    <button type="submit">{{action_registration}}</button>
  </form>
</section>
`.trim();

/* DIST SOURCE: translations--prod.js */
/* SOURCE: translations/de/_default.js */
window.TRANSLATIONS = Array.isArray(window.TRANSLATIONS) ? window.TRANSLATIONS : [];

Object.assign(window.TRANSLATIONS, {
  'app.name': 'CloudMining42',
  'app.domain': 'cloudmining42.com',

  'menu.login': 'Anmelden',
  'menu.logout': 'Abmelden',
  'menu.home': 'Startseite',
  'menu.users': 'Benutzer',
  'menu.profile': 'Profil',
  'menu.imprint': 'Impressum',
  'menu.privacy': 'Datenschutz',
  'menu.support': 'Support',
  'menu.contact': 'Kontakt',
  'menu.registration': 'Registrierung',
  'menu.settings': 'Einstellungen',
  'menu.index': 'Startseite',
  'menu.favourites': 'Favoriten',
  'menu.admin': 'Administration',
  'menu.upload': 'Hochladen',
  'menu.aboutme': 'Über mich',
  'menu.plans': 'Pläne',
  'menu.wallets': 'Wallets',
  'menu.deposit': 'Einzahlung',
  'menu.withdraw': 'Auszahlung',
  'menu.agb': 'AGB',
  'menu.redeem': 'Einlösen',

  'forms.labels.username': 'Benutzername',
  'forms.labels.password': 'Passwort',
  'forms.labels.password2': 'Passwort erneut',
  'forms.labels.email': 'E-Mail',
  'forms.labels.login': 'Anmelden',
  'forms.labels.name': 'Name',
  'forms.labels.submit': 'Absenden',
  'forms.please_choose': 'Bitte auswählen',
  'forms.callbacks.success': 'Formular erfolgreich gesendet!',
  'forms.callbacks.fail': 'Formular konnte nicht gesendet werden.',

  'words.welcome': 'Willkommen',
  'words.yes': 'Ja',
  'words.no': 'Nein',
  'words.profile': 'Profil',
  'words.user_id': 'Benutzer-ID',
  'words.account': 'Konto',
  'words.bitcoin': 'Bitcoin',
  'words.litecoin': 'Litecoin',
  'words.ethereum': 'Ethereum',
  'words.euro': 'Euro',
  'words.dollar': 'Dollar',
  'words.plan': 'Plan',
  'words.status': 'Status',
  'words.start_date': 'Start',
  'words.end_date': 'Ende',
  'words.remaining_days': 'Resttage',
  'words.progress': 'Fortschritt',
  'words.total_earnings': 'Gesamtverdienst',
  'words.runtime': 'Laufzeit',
  'words.withdraw': 'Auszahlung',
  'words.max': 'Max/Alles',
  'words.cancel': 'Abbrechen',
  'words.actions': 'Aktionen',
  'words.copy': 'Kopieren',
  'words.edit': 'Bearbeiten',
  'words.delete': 'Löschen',
  'words.verified': 'Verifiziert',
  'words.unverified': 'Nicht verifiziert',
  'words.save': 'Speichern',
  'words.processing': 'Bitte warten...',
  'words.history': 'Historie',

  'captions.index.index': 'Willkommen',
  'captions.users.login': 'Anmeldung',
  'captions.users.registration': 'Registrierung',
  'captions.users.profile': 'Benutzerprofil',
  'captions.users.email_confirmation': 'E-Mail bestätigen',
  'captions.admin.overview': 'Admin-Übersicht',
  'captions.admin.users': 'Benutzer',
  'captions.upload.image': 'Bild hochladen',
  'captions.plans.index': 'Alle Pläne',

  'tables.captions.name': 'Name',
  'tables.captions.email': 'E-Mail',
  'tables.captions.admin': 'Admin',
  'tables.captions.active': 'Aktiv',

  'popup.title': 'Xtreme Popup',

  'country.germany': 'Deutschland',
  'country.france': 'Frankreich',
  'country.italy': 'Italien',
  'country.spain': 'Spanien',
  'country.netherlands': 'Niederlande',
  'country.austria': 'Österreich',
  'country.switzerland': 'Schweiz',
  'country.poland': 'Polen',
  'country.ukraine': 'Ukraine',
  'country.england': 'England',
  'country.america': 'Amerika',
  'country.canada': 'Kanada',
  'country.japan': 'Japan',
  'country.india': 'Indien'
});

/* SOURCE: translations/de/common.js */
window.TRANSLATIONS = Array.isArray(window.TRANSLATIONS) ? window.TRANSLATIONS : [];

Object.assign(window.TRANSLATIONS, {
  'errors.missing_parameters': 'Fehlende Parameter.',
  'errors.no_permission': 'Keine Berechtigung.',
  'errors.invalid_currency': 'Ungültige Währung.',
  'errors.update_failed': 'Aktualisierung fehlgeschlagen.',

  'errors.login.deleted': 'Dein Konto wurde gelöscht.',
  'errors.login.id': 'Ungültige Login-ID.',
  'errors.login.notfound': 'Benutzer nicht gefunden.',

  'errors.registration.username_required': 'Bitte gib einen Benutzernamen ein.',
  'errors.registration.username_too_short': 'Benutzername zu kurz (mindestens 4 Zeichen).',
  'errors.registration.username_exists': 'Der Benutzername ist bereits vergeben.',
  'errors.registration.email_required': 'Bitte gib eine E-Mail-Adresse ein.',
  'errors.registration.email_invalid': 'E-Mail muss eine gültige E-Mail-Adresse sein.',
  'errors.registration.email_exists': 'Diese E-Mail-Adresse wird bereits verwendet.',
  'errors.registration.password_required': 'Bitte gib ein Passwort ein.',
  'errors.registration.password_too_short': 'Passwort zu kurz (mindestens 8 Zeichen).',
  'errors.registration.password2_required': 'Bitte bestätige dein Passwort.',
  'errors.registration.passwords_mismatch': 'Die beiden Passwörter sind nicht gleich.',
  'errors.registration.failed': 'Registrierung fehlgeschlagen.',

  'errors.password_change.current_password_required': 'Bitte gib dein aktuelles Passwort ein.',
  'errors.password_change.current_password_invalid': 'Dein aktuelles Passwort ist nicht korrekt.',
  'errors.password_change.new_password_required': 'Bitte gib ein neues Passwort ein.',
  'errors.password_change.new_password_too_short': 'Neues Passwort zu kurz (mindestens 8 Zeichen).',
  'errors.password_change.new_password_repeat_required': 'Bitte wiederhole dein neues Passwort.',
  'errors.password_change.passwords_mismatch': 'Die neuen Passwörter stimmen nicht überein.',
  'errors.password_change.failed': 'Passwortänderung fehlgeschlagen.',

  'errors.email_confirmation.invalid_link': 'Ungültiger Bestätigungslink.',
  'errors.email_confirmation.expired': 'Der Bestätigungslink ist abgelaufen.',
  'errors.email_confirmation.already_used': 'Dieser Bestätigungslink wurde bereits verwendet.',
  'errors.email_confirmation.user_deleted': 'Dieses Konto kann nicht aktiviert werden.',
  'errors.email_confirmation.failed': 'E-Mail-Bestätigung fehlgeschlagen.',

  'ui.sidebar.title': 'Navigation',
  'ui.footer.text': '© {{year}} {{app}} · {{rights}}',
  'ui.footer.domain': 'Domain: {{domain}}',

  'ui.view.index.intro': 'Willkommen im Xtreme6 Frontend mit JS-Templates.',
  'ui.view.imprint.intro': 'Hier findest du alle rechtlichen Informationen (Impressum).',
  'ui.view.privacy.intro': 'Hier findest du unsere Datenschutzinformationen.',
  'ui.view.login.intro': 'Melde dich an, um deine Pläne, Einzahlungen und Auszahlungen zu verwalten.',
  'ui.view.registration.intro': 'Bitte fülle alle Felder aus, um dein Konto zu erstellen.'
});
