import { Request, Router } from 'express';
import IUrl from '../models/url';
import { v4 as uuidv4 } from 'uuid';
import * as Redis from 'redis';
import { IUser } from '../models/user';
import 'dotenv/config';
import { authenticatedUser } from '../middlewares/auth.middleware';


const router = Router();
router.use(authenticatedUser);

const redisClient = Redis.createClient();


router.post('/', async (req, res) => {
  try {
    const { longUrl, customAlias, topic } = req.body;
    const alias = customAlias || uuidv4().substring(0, 6);
    const shortUrl = `${process.env.BASE_URL}/${alias}`;

    const url = new IUrl({
      longUrl,
      shortUrl,
      alias,
      topic,
      // to be provided by auth middleware
      createdBy: (req.user as IUser).googleId as string
    });

    await url.save();
    redisClient.set(alias, longUrl);

    res.json({ shortUrl, createdAt: url.createdAt });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:alias', async (req: Request, res) => {
  try {
    const alias = req.params.alias;
    const longUrl = await redisClient.get(alias);

    if (!longUrl) {
      res.status(404).json({ error: 'URL not found' });
      return;
    }

    // log analytics
    const analytics = {
      urlId: longUrl,
      timestamp: new Date(),
      ip: req.ip,
      userAgent: req.get('User-Agent') || '',
      location: {
        lat: 0,
        lng: 0
      },
      os: 'unknown',
      device: 'unknown'
    };

    // TODO: implement geolocation, etc. data sniff

    res.redirect(301, longUrl);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }

});


export default router;
