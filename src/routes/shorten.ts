import e from 'express';
import { v4 as uuidv4 } from 'uuid';
import type { IUser } from '../models/user.ts';
import 'dotenv/config';
import { authenticatedUser } from '../middlewares/auth.middleware.ts';
import { getDb, getCache } from '../utils/serverSetup.ts';
import mongoClient from '../utils/mongodb.ts';


const router = e.Router();
router.use(authenticatedUser);



router.post('/', async (req: e.Request, res: e.Response) => {

  const db = await getDb(mongoClient);
  const redisDb = await getCache();

  try {
    console.log(req.body);
    const { longUrl, customAlias, topic } = req.body;
    console.log(longUrl);
    console.log(customAlias);
    console.log(topic);
    const alias = customAlias || uuidv4().substring(0, 6);
    const shortUrl = `${process.env.BASE_URL}/${alias}`;

    console.log("result of short url: ", shortUrl)

    const url = {
      longUrl,
      shortUrl,
      alias,
      topic,
      // to be provided by auth middleware
      createdBy: (res.locals.session.user as IUser).email as string
    };


    const result = await db?.collection('urls').insertOne(url);
    console.log("result of url insertOne: ", result)
    await redisDb.connect()
    await redisDb.set(alias, longUrl);
    await redisDb.disconnect();
    console.log("redis setting done!")

    res.json({ shortUrl, createdAt: Date.now() });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
