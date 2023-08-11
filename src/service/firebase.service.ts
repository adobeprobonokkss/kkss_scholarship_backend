import config from "config";
import { getFirestore, query, collection, getDocs, addDoc, Query, where } from "firebase/firestore/lite";
import { initializeApp } from "firebase/app";
import { logger } from "./../utils/logger";

const FIREBASE_DB_CONFIG = config.get("FIREBASE_DB_CONFIG");

const admin = initializeApp(FIREBASE_DB_CONFIG);
const db = getFirestore(admin);

interface UserSchema {
  emailId: string;
  name: string;
  picture: string;
}

export async function getUserByEmailId(emailId: string) {
  try {
    const _query = query(collection(db, "user"), where("email", "==", emailId));
    const usersSnapshot = await getDocs(_query);
    const usersList = usersSnapshot.docs.map(doc => doc.data());
    logger.error("getting user list", usersList.length);
    return usersList[0];
  } catch (error) {
    logger.error("Error listing collections: ", error);
    return null;
  }
}

export async function createNewUser(user: UserSchema) {
  try {
    const userCol = collection(db, "user");
    const isAdded = await addDoc(userCol, user);
    logger.info("User registerd successfully");
    logger.info(JSON.stringify(isAdded));
    return user;
  } catch (error) {
    logger.error("Error listing collections: ", error);
    return null;
  }
}

export async function getAllUsers(role: string) {
  try {
    const snapshot = collection(db, "user");
    const usersnapShot = await getDocs(snapshot);
    const users = await usersnapShot.docs.map(doc => doc.data());

    console.log(users);
    return users;
  } catch (error) {
    logger.error("Error listing collections: ", error);
    return null;
  }
}
