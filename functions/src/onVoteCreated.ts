import { onDocumentCreated } from "firebase-functions/v2/firestore";

import { db } from "./lib/firebase";

export const onVoteCreated = onDocumentCreated(
  {
    document: "polls/{pollId}/votes/{voteId}",
    region: "us-central1"
  },
  async (event) => {
    const data = event.data?.data();
    const pollId = event.params.pollId;
    if (!data || !pollId) {
      return;
    }

    const candidatesSnapshot = await db
      .collection("polls")
      .doc(pollId)
      .collection("candidates")
      .where("isActive", "==", true)
      .get();

    const totalVotes = candidatesSnapshot.docs.reduce(
      (sum, item) => sum + Number(item.data().totalVotes ?? 0),
      0
    );
    const totalPositive = candidatesSnapshot.docs.reduce(
      (sum, item) => sum + Number(item.data().positiveVotes ?? 0),
      0
    );
    const totalNegative = candidatesSnapshot.docs.reduce(
      (sum, item) => sum + Number(item.data().negativeVotes ?? 0),
      0
    );

    const batch = db.batch();
    candidatesSnapshot.docs.forEach((doc) => {
      const d = doc.data();
      const itemVotes = Number(d.totalVotes ?? 0);
      const itemPositive = Number(d.positiveVotes ?? 0);
      const itemNegative = Number(d.negativeVotes ?? 0);

      batch.set(
        doc.ref,
        {
          percentage: totalVotes > 0 ? Number(((itemVotes / totalVotes) * 100).toFixed(1)) : 0,
          positivePercentage: totalPositive > 0 ? Number(((itemPositive / totalPositive) * 100).toFixed(1)) : 0,
          negativePercentage: totalNegative > 0 ? Number(((itemNegative / totalNegative) * 100).toFixed(1)) : 0,
        },
        { merge: true }
      );
    });

    await batch.commit();
  }
);
