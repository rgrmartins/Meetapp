import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore } from 'date-fns';
import Meetup from '../models/Meetup';
import User from '../models/User';

class MeetupController {
  async store(req, res) {
    // Validações
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
      banner_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { title, description, location, date, banner_id } = req.body;

    /**
     * Verificando se a data enviada pelo usuário já não passou.
     */
    const hourStart = startOfHour(parseISO(date));
    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permited.' });
    }

    /**
     * Verificando se o usuário ja não é organizador de um meetup no mesmo dia e hora
     */
    const user_id = req.userID;

    const checkAvailability = await Meetup.findOne({
      where: {
        user_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    if (checkAvailability) {
      return res.status(400).json({
        error:
          'Meetup date not available, because the organizer already has a meetup scheduled.',
      });
    }

    /**
     * Criando o Meetup
     */
    const meetup = await Meetup.create({
      title,
      description,
      location,
      date,
      banner_id,
      user_id,
    });

    return res.json(meetup);
  }

  async delete(req, res) {
    const meetup = await Meetup.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['name', 'email'],
        },
      ],
    });

    /**
     * Verificando se o usuário que está cancelando é o dono do Meetup
     */
    if (meetup.user_id !== req.userID) {
      return res
        .status(401)
        .json({ error: "You don't have permission to cancel this Meetup" });
    }

    /**
     * Verificando se o Meetup já não passou
     */
    if (!isBefore(new Date(), meetup.date)) {
      return res.status(400).json({ error: 'Unable to cancel past meetups.' });
    }

    meetup.canceled_at = new Date();

    await meetup.save();

    return res.json(meetup);
  }

  async update(req, res) {
    // Validações
    const schema = Yup.object().shape({
      title: Yup.string(),
      description: Yup.string(),
      location: Yup.string(),
      date: Yup.date(),
      banner_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    // Pegando o date da requisição
    const { date } = req.body;

    // Buscando Meetup
    const meetup = await Meetup.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['name', 'email'],
        },
      ],
    });

    /**
     * Verificando se o usuário logado é o dono do Meetup
     */
    if (meetup.user_id !== req.userID) {
      return res
        .status(401)
        .json({ error: "You don't have permission to update this Meetup" });
    }

    /**
     * Verificando se o Meetup já não passou
     */
    if (!isBefore(new Date(), meetup.date)) {
      return res.status(400).json({ error: 'Unable to cancel past meetups.' });
    }

    /**
     * Verificando se o usuário já não está organizando um meetup na nova data e hora
     * Caso tenha data e hora novas
     */
    if (date) {
      const hourStart = startOfHour(parseISO(date));
      const checkAvailability = await Meetup.findOne({
        where: {
          user_id: req.userID,
          canceled_at: null,
          date: hourStart,
        },
      });

      if (checkAvailability) {
        return res.status(400).json({
          error:
            'Meetup date not available, because the organizer already has a meetup scheduled.',
        });
      }
    }

    meetup.update(req.body);

    return res.json(meetup);
  }
}

export default new MeetupController();
