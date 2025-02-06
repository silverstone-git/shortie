
import express from 'express';
import IAnalytics from '../models/analytics';
import IUrl  from '../models/url';
import { authenticatedUser } from '../middlewares/auth.middleware';

const router = express.Router();
router.use(authenticatedUser);

router.get('/:alias', async (req, res) => {
  try {
    const alias = req.params.alias;
    const url = await IUrl.findOne({ alias });

    if (!url) {
      res.status(404).json({ error: 'URL not found' });
      return 
    }

    const analytics = await IAnalytics.find({ urlId: url._id });

    res.json({
      totalClicks: analytics.length,
      uniqueUsers: new Set(analytics.map(a => a.ip)).size,
      clicksByDate: analytics.reduce((acc: any, curr: any) => {
        const date = curr.timestamp.toDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {}),
      osType: analytics.reduce((acc: any, curr: any) => {
        const os = curr.os || 'unknown';
        acc[os] = { uniqueClicks: (acc[os]?.uniqueClicks || 0) + 1 };
        return acc;
      }, {}),
      deviceType: analytics.reduce((acc: any, curr: any) => {
        const device = curr.device || 'unknown';
        acc[device] = { uniqueClicks: (acc[device]?.uniqueClicks || 0) + 1 };
        return acc;
      }, {})
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// TODO: more analystics stuff

export default router;
