import { isBefore } from 'date-fns';
import Meetup from '../models/Meetup';
import User from '../models/User';
import Subscription from '../models/Subscription';

import SubscriptionMail from '../jobs/SubscriptionMail';
import Queue from '../../lib/Queue';

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

    const subscription = await Subscription.create({
      user_id: user.id,
      meetup_id: meetup.id,
    });

    await Queue.add(SubscriptionMail.key, {
      user,
      meetup,
    });

    return res.json(subscription);
  }

  async delete(req, res) {
    // Buscando o Meetup
    const meetup = await Meetup.findByPk(req.params.id_meetup, {
      include: [
        {
          model: User,
          attributes: ['name', 'email'],
        },
      ],
    });

    // Verificando se o usuário que está cancelando tem inscrição nesse meetup
    const subscription = await Subscription.findOne({
      where: {
        user_id: req.userID,
        meetup_id: meetup.id,
        canceled_at: null,
      },
    });

    if (!subscription) {
      return res
        .status(400)
        .json({ error: 'You are not written in this meetup.' });
    }

    subscription.canceled_at = new Date();

    await subscription.save();

    return res.json(subscription);
  }
}

export default new SubscriptionController();
