class UsersController {
  constructor() {
    this.name = 'UsersController';
    this.route = null;
  }

  login(route) {
    this.route = route;
    console.log('UsersController.login', route);
  }

  registration(route) {
    this.route = route;
    console.log('UsersController.registration', route);
  }
}

window.UsersController = UsersController;
