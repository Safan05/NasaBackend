import authRouter from './auth.js';
import guestRouter from './guest.js';
const injectRoutes = (app) => {
  /**
   * @swagger
   * tags:
   *   name: Auth
   *   description: Authentication routes
   */
    app.use('/api/v1/auth', authRouter);
    app.use('/api/v1/guest', guestRouter);
}
export default injectRoutes;
