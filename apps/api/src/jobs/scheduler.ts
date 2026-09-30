import cron from 'node-cron';
import DistributorService from '../services/DistributorService';
import initializeGDIPCronJobs from './gdipCronJobs';

/**
 * Initialize all scheduled jobs
 */
export const initScheduledJobs = () => {
    console.log('Initializing scheduled jobs...');

    // Run Distributor Reward processing every day at midnight
    // Cron format: Minute Hour DayMonth Month DayWeek
    cron.schedule('0 0 * * *', async () => {
        console.log('Running scheduled job: Distributor Rewards');
        try {
            await DistributorService.processRewards();
        } catch (error) {
            console.error('Error running Distributor Rewards job:', error);
        }
    });

    // Initialize GDIP trade cycle automated jobs (daily checks at 2:00 AM, 3:00 AM, 4:00 AM)
    initializeGDIPCronJobs();

    console.log('Scheduled jobs initialized.');
};
