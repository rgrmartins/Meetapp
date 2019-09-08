import { isBefore } from 'date-fns';
import Meetup from '../models/Meetup';
import Subscription from '../models/Subscription';

class SubscriptionController {
  async store(req, res) {
    const { id_meetup } = req.params;

    // Buscando Meetup pelo ID
    const meetup = await Meetup.findByPk(id_meetup);
    // Validando se existe o meetup
    if (!meetup) {
      return res.status(401).json({ error: 'Could not find meetup.' });
    }

    // Validando se o usuário logado é também organizador do meetup
    if (meetup.user_id === req.userID) {
      return res.json({
        error: 'You cannot sign up for the organizup meetup.',
      });
    }

    // Validando se o meetup ja não passou
    if (!isBefore(new Date(), meetup.date)) {
      return res
        .status(400)
        .json({ error: 'signing up for past meetups is not allowed.' });
    }

    // Validando se o usuário já não está inscrito
    const checkSubscription = await Subscription.findOne({
      where: {
        user_id: req.userID,
        meetup_id: id_meetup,
        canceled_at: null,
      },
    });

    if (checkSubscription) {
      return res
        .status(401)
        .json({ error: 'You are already subscribed to this meetup' });
    }

    return res.json(meetup);
  }
}

export default new SubscriptionController();
