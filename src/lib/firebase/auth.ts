import { signInWithEmailAndPassword, signOut } from "firebase/auth";

import { auth } from "@/lib/firebase/config";

export async function signInAsAdmin(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signOutAdmin() {
  return signOut(auth);
}
