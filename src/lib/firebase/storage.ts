import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { storage } from "@/lib/firebase/config";

export async function uploadCandidatePhoto(pollId: string, candidateId: string, file: File) {
  const fileRef = ref(storage, `polls/${pollId}/candidates/${candidateId}/${file.name}`);
  await uploadBytes(fileRef, file, {
    contentType: file.type
  });

  return getDownloadURL(fileRef);
}
