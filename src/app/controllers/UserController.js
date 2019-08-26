import * as Yup from 'yup';
import User from '../models/User';

class UserController {
  async store(req, res) {
    // Validando a entrada de dados com YUP
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });

    // Comparar o corpo da requisição com o schema do YUP
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    // Verificando se existe email já cadastrado
    const userExists = await User.findOne({ where: { email: req.body.email } });

    // Retornando erro caso email ja esteja cadastrado
    if (userExists) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    // extraindo somente o que é interessante para retornar na resposta
    const { id, name, email } = await User.create(req.body);

    return res.json({
      id,
      name,
      email,
    });
  }

  async update(req, res) {
    // Validando a entrada de dados com YUP
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldoPassword, field) =>
          oldoPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    // Validar o corpo da requisição com a entidade
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { email, oldPassword } = req.body;

    const user = await User.findByPk(req.userID);

    if (email !== user.email) {
      // Verificar se ja existe um email cadastrado
      const userExists = await user.findOne({ where: { email } });

      // Retorna uma msg caso ja exista o email
      if (userExists) {
        return res.status(400).json({ error: 'User already exists.' });
      }
    }

    // Só tentara ser executado caso tenha sido passada o oldpassword
    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match.' });
    }

    // Alterando o usuário na base de dados
    const { id, name } = await user.update(req.body);

    return res.json({
      id,
      name,
      email,
    });
  }
}

export default new UserController();
