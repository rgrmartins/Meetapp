import { Router } from 'express';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

// Rota para Criar Usuários
routes.post('/users', UserController.store);
// Rota para Logar
routes.post('/sessions', SessionController.store);

// só executará nas rotas abaixo dele
routes.use(authMiddleware);

// Rota para Atualizar Usuários
routes.put('/users', UserController.update);

export default routes;
