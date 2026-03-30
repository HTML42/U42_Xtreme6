class IndexController {
  constructor() {
    this.name = 'IndexController';
    this.route = null;
  }

  index(route) {
    this.route = route;
    console.log('IndexController.index', route);
  }

  imprint(route) {
    this.route = route;
    console.log('IndexController.imprint', route);
  }

  privacy(route) {
    this.route = route;
    console.log('IndexController.privacy', route);
  }
}

window.IndexController = IndexController;
