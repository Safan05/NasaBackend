import express from 'express';
const guestRouter = express.Router();

guestRouter.get('/register', (req, res) => {
    const guestId = "guest_" + Math.random().toString(36).substring(2, 15);
    res.json({ guestId });
});

export default guestRouter;