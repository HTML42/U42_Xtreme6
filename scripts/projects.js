window.X6 = window.X6 || {};

const init = async () => {
  await XFramework.bootstrap({
    defaultController: 'index',
    defaultView: 'index',
    userClass: 'User'
  });
};

const appReady = () => {
  const hasFrameworkClass = typeof window.XFramework === 'function' || typeof window.X_Framework === 'function';

  if (!hasFrameworkClass) {
    window.setTimeout(appReady, 1);
    return;
  }

  if (!XFramework.Ready) {
    window.setTimeout(appReady, 1);
    return;
  }

  void init();
};

appReady();
