export class User {
  constructor(id, name, email) {
    if (!name?.trim() || !email?.trim()) {
      throw new Error('name und email dürfen nicht leer sein');
    }

    this.id = id;
    this.name = name;
    this.email = email;
  }
}
