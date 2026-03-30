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
