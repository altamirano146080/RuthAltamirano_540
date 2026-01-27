import express from 'express';
import { getUser, getStreams } from '../controllers/analytics.controller.js';

const router = express.Router();

router.get('/user', getUser);
router.get('/streams', getStreams);

export default router;