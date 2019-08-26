import jwt from 'jsonwebtoken';
import * as Yup from 'yup';

import User from '../models/User';
import authConfig from '../../config/auth';

class SessionController {
  async store(req, res) {
    // Validando entrada com YUP
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().required(),
    });

    // Comparar o corpo da requisição com o schema do YUP
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    // Extraindo informações do corpo da requisição
    const { email, password } = req.body;

    // Procurando na base de dados pelo email enviado no req
    const user = await User.findOne({ where: { email } });

    // Validando caso não encontre na base
    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    // Validando a autencidade do password
    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Password does not match.' });
    }

    const { id, name } = user;

    // Retornando somente o que é interessante e não todos os dados do user
    return res.json({
      user: {
        id,
        name,
        email,
      },
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new SessionController();
