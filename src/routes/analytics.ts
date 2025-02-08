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
        const os = curr.os || 'unknown';
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
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// TODO: more analystics stuff

export default router;
