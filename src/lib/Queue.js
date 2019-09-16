// Configuração de filas de email
import Bee from 'bee-queue';
import SubscriptionMail from '../app/jobs/SubscriptionMail';
import redisConfig from '../config/redis';

// Todos os jobs tem que ser incluso aqui, igual aos models
const jobs = [SubscriptionMail];

class Queue {
  constructor() {
    // Filas de serviço
    this.queues = {};

    this.init();
  }

  init() {
    jobs.forEach(({ key, handle }) => {
      this.queues[key] = {
        bee: new Bee(key, {
          redis: redisConfig,
        }),
        handle,
      };
    });
  }

  // Adicionando um novo job a fila de queues
  add(queue, job) {
    return this.queues[queue].bee.createJob(job).save();
  }

  // Processando as filas
  processQueue() {
    jobs.forEach(job => {
      const { bee, handle } = this.queues[job.key];

      bee.process(handle);
    });
  }
}

export default new Queue();
