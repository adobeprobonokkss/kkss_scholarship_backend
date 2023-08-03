import config from "config";
import { getFirestore, query, collection, getDocs, addDoc, Query, where } from "firebase/firestore/lite";
import { initializeApp } from "firebase/app";

const FIREBASE_DB_CONFIG = config.get("FIREBASE_DB_CONFIG");

const admin = initializeApp(FIREBASE_DB_CONFIG);
const db = getFirestore(admin);

export async function getUserByEmailId(emailId: string) {
  try {
    // const userCol = query(collection(db, "user"));
    const _query = query(collection(db, "user"), where("email", "==", emailId));
    // const isAdded = addDoc(userCol, { name: "rama", address: "testaddedfrom some thing " });
    const usersSnapshot = await getDocs(_query);
    const usersList = usersSnapshot.docs.map(doc => doc.data());
    console.log(usersList);
    return usersList;
  } catch (error) {
    console.log("Error listing collections: ", error);
    return null;
  }
}

interface UserSchema {
  emailId: string;
  name: string;
  picture: string;
}
export async function createNewUser(user: UserSchema) {
  try {
    const userCol = collection(db, "user");
    const isAdded = await addDoc(userCol, user);
    console.log("User registerd successfully");
    console.log(JSON.stringify(isAdded));
    return user;
  } catch (error) {
    console.log("Error listing collections: ", error);
    return null;
  }
}
