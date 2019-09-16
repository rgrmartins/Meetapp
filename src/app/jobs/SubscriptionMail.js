import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class SubscriptionMail {
  get key() {
    // Chave unica
    return 'SubscriptionMail';
  }

  // A tarefa a ser executada
  async handle({ data }) {
    const { user, meetup } = data;

    console.log('A Fila executou');

    await Mail.sendMail({
      to: `${user.name} <${user.email}>`,
      subject: 'Nova Inscrição',
      template: 'subscription',
      context: {
        user: user.name,
        meetup: meetup.title,
        date: format(
          parseISO(meetup.date),
          "'dia' dd 'de' MMMM', às' H:mm'h'",
          {
            locale: pt,
          }
        ),
      },
    });
  }
}

export default new SubscriptionMail();
