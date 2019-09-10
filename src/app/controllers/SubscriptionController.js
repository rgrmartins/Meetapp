import { isBefore } from 'date-fns';
import Meetup from '../models/Meetup';
import User from '../models/User';
import Subscription from '../models/Subscription';

class SubscriptionController {
  async store(req, res) {
    const { id_meetup } = req.params;
    const user = await User.findByPk(req.userID);

    // Buscando Meetup pelo ID
    const meetup = await Meetup.findByPk(id_meetup, {
      include: [
        {
          model: User,
          attributes: ['name', 'email'],
        },
      ],
    });

    // Validando se existe o meetup
    if (!meetup) {
      return res.status(401).json({ error: 'Could not find meetup.' });
    }

    // Validando se o usuário logado é também organizador do meetup
    if (meetup.user_id === req.userID) {
      return res.status(400).json({
        error: 'You cannot sign up for the organizup meetup.',
      });
    }

    // Validando se o meetup ja não passou
    if (!isBefore(new Date(), meetup.date)) {
      return res
        .status(400)
        .json({ error: 'signing up for past meetups is not allowed.' });
    }

    // Validando se o usuário já não está inscrito em algum meetup da mesma data
    const checkDate = await Subscription.findOne({
      where: {
        user_id: user.id,
        canceled_at: null,
      },
      include: [
        {
          model: Meetup,
          required: true,
          where: {
            date: meetup.date,
          },
        },
      ],
    });

    if (checkDate) {
      return res
        .status(400)
        .json({ error: "Can't subscribe to two meetups at the same time" });
    }

    return res.json(meetup);
  }
}

export default new SubscriptionController();
