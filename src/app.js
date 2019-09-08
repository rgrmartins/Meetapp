import 'dotenv/config';
import express from 'express';
import 'express-async-errors';
import path from 'path';
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
    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  routes() {
    this.server.use(routes);
  }
}

export default new App().server;
