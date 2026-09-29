const cron = require('node-cron');
const prisma = require('../config/prisma');

const initCleanupJob = () => {
  cron.schedule('0 0 */2 * *', async () => {
    try {
        console.log('done')
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate());

      const result = await prisma.bloodRequest.deleteMany({
        where: {
          createdAt: {
            lt: twoDaysAgo,
          },
        },
      });

      console.log(`Cleanup: Removed ${result.count} requests.`);
    } catch (error) {
      console.error('Cleanup Job Error:', error);
    }
  });
};

module.exports = initCleanupJob;