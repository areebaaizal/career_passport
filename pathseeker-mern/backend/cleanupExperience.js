import mongoose from 'mongoose';
import User from './models/User.js';

const MONGO_URI = 'mongodb://127.0.0.1:27017/pathseeker';

async function cleanup() {
  await mongoose.connect(MONGO_URI);

  // Step 1: jinke paas experience array nahi hai (null/missing/galat type), unko empty array bana do
  const fixResult = await User.updateMany(
    { experience: { $not: { $type: 'array' } } },
    { $set: { experience: [] } }
  );
  console.log(`Normalized bad experience fields: ${fixResult.modifiedCount}`);

  // Step 2: ab safely $pull chalao, sirf un documents pe jinka experience array hai
  const result = await User.updateMany(
    { experience: { $type: 'array' } },
    {
      $pull: {
        experience: {
          $or: [
            { companyName: { $in: [null, ''] } },
            { jobTitle: { $in: [null, ''] } },
          ],
        },
      },
    }
  );

  console.log(`Cleaned up. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
  await mongoose.disconnect();
}

cleanup().catch((err) => {
  console.error('Cleanup failed:', err);
  process.exit(1);
});