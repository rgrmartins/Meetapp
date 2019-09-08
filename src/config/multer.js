// Configuração da parte de uploads de arquivos
import multer from 'multer';
import crypto from 'crypto';
import { extname, resolve } from 'path';

export default {
  // Como e onde serão salvo os arquivos que serão feitos uploads
  storage: multer.diskStorage({
    destination: resolve(__dirname, '..', '..', 'tmp', 'uploads'),
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, res) => {
        if (err) return cb(err);

        // Criando um hash antes do nome para não haver repetição de nomes
        return cb(null, res.toString('hex') + extname(file.originalname));
      });
    },
  }),
};
