import express from 'express';
import authMiddleware from '@/middlewares/auth.middleware';
import serverSetup from '@/utils/serverSetup';
import mongoClient from '@/utils/mongodb';
import analyticUtils from '@/utils/analyticUtils.js';

// lower precision -> bigger area -> more handwavy grouping

const router = express.Router();
router.use(authMiddleware.authenticatedUser);

router.get('/:alias', async (req, res) => {
  const db = await serverSetup.getDb(mongoClient);
  try {
    const alias = req.params.alias;
    if(!alias) {
      res.status(400).json({ error: 'Empty alias, please provide a link alias that you saved in path' });
      return 
    }

    if(alias == "overall") {
      await overallHandler(req, res, db);
      return
    }

    const url = await db?.collection('urls').findOne({ alias });

    console.log("analyzing your alias...");
    if (!url) {
      res.status(404).json({ error: 'URL not found' });
      return 
    }

    if(url.createdBy.trim() == res.locals.session.user.email.trim()) {
      // the analytics are made by this user only


      const analytics = await db?.collection('analytics').find({ alias }).toArray();

      const analysis = await analyticUtils.analyze(analytics);
      res.status(200).json(analysis);
    } else {
      // 403
      console.log("bugger off");
      res.status(403).json({'error': 'Please give an alias that you made using this API'})
    }

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



const overallHandler = async (req: express.Request, res: express.Response, db: any) => {
  // give analytics of the user
  console.log("overallllll");
  try {

    let analytics: IAnalytic[] = await db?.collection('analytics').find({ urlBy: res.locals.session.user.email }).toArray();

    if (!analytics || analytics.length == 0) {
      res.status(404).json({ error: 'Analytics not found' });
      return 
    }

    const analysis = await analyticUtils.analyze(analytics);
    res.status(200).json({
      totalUrls: new Set(analytics?.map((a: IAnalytic) => a.alias)).size,
      ...analysis
    })

  } catch(e: any) {
    console.log(e);
    res.status(500).json({error: "Internal Server Error"});
  }

};


router.get('/topic/:topic', async (req, res) => {
  // get all urls with the given topic, and for the ones having createBy == res.locals.sesion.user.email, show analytics
  //
  const db = await serverSetup.getDb(mongoClient);
  try {
    const topic = req.params.topic.trim();
    if(!topic) {
      res.status(400).json({ error: 'Empty topic, please provide a link topic that you saved in path' });
      return 
    }
    console.log("topic is: ", topic);

    let analytics = await db?.collection('analytics').find({ urlBy: res.locals.session.user.email }).toArray();

    if (!analytics || analytics.length == 0) {
      res.status(404).json({ error: 'Analytics not found' });
      return 
    }



    analytics = analytics.filter((analytic: any) => analytic.topic == topic)

    if (!analytics || analytics.length == 0) {
      res.status(404).json({ error: 'Analytics for this topic not found' });
      return 
    }

    const analysis = await analyticUtils.analyze(analytics);
    res.status(200).json(analysis);

  } catch (e: any) {
    console.log(e);
    res.status(500).json({error: "Internal Server Error"});
  }
})

export default router;
