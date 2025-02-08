import e from 'express';
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';
import authMiddleware from '@/middlewares/auth.middleware';
import serverSetup from '@/utils/serverSetup';
import mongoClient from '@/utils/mongodb';

const router = e.Router();
router.use(authMiddleware.authenticatedUser);



router.post('/', async (req: e.Request, res: e.Response) => {

  const db = await serverSetup.getDb(mongoClient);
  const redisDb = await serverSetup.getCache();

  try {
    console.log(req.body);
    const { longUrl, customAlias, topic } = req.body;
    console.log(longUrl);
    console.log(customAlias);
    console.log(topic);
    const alias = customAlias || uuidv4().substring(0, 6);

    const url = {
      longUrl,
      alias,
      topic,
      // to be provided by auth middleware
      createdBy: (res.locals.session.user as IUser).email as string,
      createdAt: Date.now()
    } as IUrl;


    const result = await db?.collection('urls').updateOne({alias}, { $setOnInsert: {...url} }, {upsert: true});
    console.log("result of url updateOne: ", result)
    if (result.upsertedCount == 1) {
      await redisDb.connect()
      await redisDb.set(alias, longUrl);
      await redisDb.disconnect();
      console.log("redis setting done!")
      res.status(201).json({ shortUrl: `${process.env.BASE_URL}/${alias}`, createdAt: Date.now() });
      return;
    }
    res.status(409).json({message: "The alias is already taken.please choose anothr one"});
  } catch (err: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
