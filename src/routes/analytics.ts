import express from 'express';
import authMiddleware from '@/middlewares/auth.middleware';
import serverSetup from '@/utils/serverSetup';
import mongoClient from '@/utils/mongodb';
import ngeohash from 'ngeohash';

// lower precision -> bigger area -> more handwavy grouping
const LOCATION_GROUPING_PRECISION = 4;

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

    const url = await db?.collection('urls').findOne({ alias });

    if (!url) {
      res.status(404).json({ error: 'URL not found' });
      return 
    }

    if(url.createdBy.trim() == res.locals.session.user.email.trim()) {
      // the analytics are made by this user only


      const analytics = await db?.collection('analytics').find({ alias }).toArray();

      res.status(200).json({
        totalClicks: analytics?.length,
        uniqueUsers: new Set(analytics?.map((a: any) => a.ip)).size,
        clicksByDate: analytics?.reduce((acc: any, curr: any) => {
          const date = curr.timestamp.toDateString();
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {}),
        clicksByOS: analytics?.reduce((acc: any, curr: any) => {
          const os = curr.os;
          acc[os] = (acc[os] || 0) + 1;
          return acc;
        }, {}),
        clicksByLocation: analytics?.reduce((acc: any, { location }) => {
          // Encode the coordinates into a geohash
          const hash = ngeohash.encode(location.lat, location.lng, LOCATION_GROUPING_PRECISION);
          acc[hash] = (acc[hash] || 0) + 1;
          return acc;
        }, {})
      });
    } else {
      // 403
      console.log("bugger off");
      res.status(403).json({'error': 'Please give an alias that you made using this API'})
    }

  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

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

    let analytics = await db?.collection('analytics').find({ topic }).toArray();
    console.log("analytics got: ", analytics);

    if (!analytics || analytics.length == 0) {
      res.status(404).json({ error: 'Analytics not found' });
      return 
    }



    analytics = analytics.filter((analytic: any) => analytic.urlBy == res.locals.session.user.email)

    console.log("analytics filtered: ", analytics);

    res.status(200).json({
      totalClicks: analytics?.length,
      uniqueUsers: new Set(analytics?.map((a: any) => a.ip)).size,
      clicksByDate: analytics?.reduce((acc: any, curr: any) => {
        const date = curr.timestamp.toDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {}),
      clicksByOS: analytics?.reduce((acc: any, curr: any) => {
        const os = curr.os;
        acc[os] = (acc[os] || 0) + 1;
        return acc;
      }, {}),
      clicksByLocation: analytics?.reduce((acc: any, { location }) => {
        // Encode the coordinates into a geohash
        const hash = ngeohash.encode(location.lat, location.lng, LOCATION_GROUPING_PRECISION);
        acc[hash] = (acc[hash] || 0) + 1;
        return acc;
      }, {})
    });

  } catch (e: any) {
    console.log(e);
  }
})

// TODO: more analystics stuff

export default router;
