import e from 'express';
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';
import authMiddleware from '@/middlewares/auth.middleware';
import serverSetup from '@/utils/serverSetup';
import mongoClient from '@/utils/mongodb';

const TOPIC_LENGTH_LIMIT = 50;
const ALIAS_LENGTH_LIMIT = 50;
const LONG_URL_LENGTH_LIMIT = 1000;

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

    if(topic.includes(';') || topic.trim().length > TOPIC_LENGTH_LIMIT || topic.trim().length < 5) {
      res.status(400).json({error: 'Please enter a better topic name'})
      return;
    }
    if(customAlias.includes('overall') || customAlias.trim().length > ALIAS_LENGTH_LIMIT || customAlias.trim().length < 5) {
      res.status(400).json({error: 'Please enter a better custom alias'})
      return;
    }
    if(longUrl.trim().length > LONG_URL_LENGTH_LIMIT || longUrl.trim().length < 4) {
      res.status(400).json({error: 'Please enter a better long URL'})
      return;
    }

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
      redisDb.connect().then(() => {
        redisDb.set(alias, `${longUrl};${url.createdBy};${url.topic}`).then(() => {
          redisDb.disconnect().then(() => {
            console.log("redis set!")
          })
        })
      })
      res.status(201).json({ shortUrl: `${process.env.BASE_URL}/${alias}`, createdAt: Date.now() });
      return;
    }
    res.status(409).json({error: "The alias is already taken.please choose anothr one"});
  } catch (err: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:alias', async (req: e.Request, res: e.Response) => {
  // GET /api/shorten/{alias}
  // Redirect to the original URL based on the short URL alias, enabling seamless access to the long URL
  res.redirect(307, `/${req.params.alias}`)
})

export default router;
