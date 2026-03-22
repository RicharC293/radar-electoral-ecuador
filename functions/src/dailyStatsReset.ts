import { onSchedule } from "firebase-functions/v2/scheduler";

import { db } from "./lib/firebase";

export const dailyStatsReset = onSchedule(
  {
    schedule: "0 5 * * *",
    timeZone: "America/Guayaquil",
    region: "us-central1"
  },
  async () => {
    const snapshot = await db.collection("polls").where("status", "==", "live").get();
    const batch = db.batch();

    snapshot.docs.forEach((pollDoc) => {
      batch.set(
        pollDoc.ref,
        {
          totalVotersToday: 0
        },
        { merge: true }
      );
    });

    await batch.commit();
  }
);
