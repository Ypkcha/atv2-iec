import { NextFunction, Request, Response, Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

function requireOwnUser(req: Request, res: Response, next: NextFunction) {
  const id = Number(req.params.id);
  if (
    !/^\d+$/.test(String(req.params.id)) ||
    !Number.isSafeInteger(id) ||
    id <= 0
  ) {
    return res.status(400).json({ erro: 'Informe um ID de usuário válido.' });
  }

  if (req.user?.id !== id) {
    return res.status(403).json({ erro: 'Acesso restrito à própria conta.' });
  }

  return next();
}

router.post('/', UserController.create);

router.get('/', authMiddleware, UserController.index);
router.get('/:id', authMiddleware, requireOwnUser, UserController.show);
router.put('/:id', authMiddleware, requireOwnUser, UserController.update);
router.delete('/:id', authMiddleware, requireOwnUser, UserController.delete);

export { router as userRoutes };
