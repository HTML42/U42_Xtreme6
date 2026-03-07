window.X6 = window.X6 || {};

(async () => {
  await XLanguage.init();

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
})();
