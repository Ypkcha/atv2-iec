import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUI from 'swagger-ui-express';
import swaggerDocument from './docs/swagger.json';
import { sequelize } from './config/database';
import { appRoutes } from './routes';
import './models/associations';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middewares
app.use(cors());
app.use(express.json());

// Rota de Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    mensagem: 'Servidor Backend rodando com sucesso.',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Rota da documentação interativa
app.use('/api/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

// Registra todas as rotas da aplicacao sob o prefixo /api
app.use('/api', appRoutes);

async function main() {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o PostgreSQL realizada com sucesso.');

    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(
        `Health check disponível em: http://localhost:${PORT}/api/health`,
      );
    });
  } catch (error) {
    console.error('Erro ao iniciar o backend:', error);
    process.exitCode = 1;
  }
}

main();
