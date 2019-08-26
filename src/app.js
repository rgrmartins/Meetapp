import express from 'express';
import routes from './routes';

import './database';

class App {
  constructor() {
    this.server = express();

    // Instanciando os 2 métodos
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.server.use(express.json());
  }

  routes() {
    this.server.use(routes);
  }
}

export default new App().server;
