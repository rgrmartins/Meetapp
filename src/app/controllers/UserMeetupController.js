import Meetup from '../models/Meetup';

class UserMeetupController {
  async index(req, res) {
    /**
     * Procurando Meetups ORGANIZADOS pelo usuário logado
     * Está listando todos, inclusives os passados
     */
    const meetups = await Meetup.findAll({
      where: {
        user_id: req.userID,
        canceled_at: null,
      },
      order: ['date'],
    });

    return res.json(meetups);
  }
}

export default new UserMeetupController();
