import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import MeetupController from './app/controllers/MeetupController';
import UserMeetupController from './app/controllers/UserMeetupController';
import SubscriptionController from './app/controllers/SubscriptionController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

// Rota para Criar Usuários
routes.post('/users', UserController.store);
// Rota para Logar
routes.post('/sessions', SessionController.store);

// ------- só executará nas rotas abaixo dele -------
routes.use(authMiddleware);

// Rota para Atualizar Usuários
routes.put('/users', UserController.update);

// Rota para criar Meetups
routes.post('/meetups', MeetupController.store);
// Rota para Listar Meetups
routes.get('/meetups', MeetupController.index);
// Rota para deletar (Cancelar) um Meetup
routes.delete('/meetups/:id', MeetupController.delete);
// Rota para editar um Meetup
routes.put('/meetups/:id', MeetupController.update);
// Rota para listagem de Meetups organizados por um usuário
routes.get('/user_meetups', UserMeetupController.index);
// Rota para fazer inscrição em um Meetup
routes.post('/subscription/:id_meetup', SubscriptionController.store);
// Rota para Cancelar inscrição em um Meetup
routes.delete('/subscription/:id_meetup', SubscriptionController.delete);
// Rota para listar Incrições realizadas pelo Usuário Logado
routes.get('/subscription', SubscriptionController.index);

// Rota de Upload de arquivos
routes.post('/files', upload.single('file'), FileController.store);

export default routes;
