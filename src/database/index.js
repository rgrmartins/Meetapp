import Sequelize from 'sequelize';

import User from '../app/models/User';
import File from '../app/models/File';
import Meetup from '../app/models/Meetup';
import Subscription from '../app/models/Subscription';

import databaseConfig from '../config/database';

// Aqui ficará todos os models da aplicação que estão mapeados pelo Sequelize
const models = [User, File, Meetup, Subscription];

class Database {
  constructor() {
    this.init();
  }

  // Conexão com o Banco Relacional através do Sequelize
  init() {
    this.connection = new Sequelize(databaseConfig);

    // Segundo Map é para rodar os associates de cada model caso tenha
    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }
}

export default new Database();
