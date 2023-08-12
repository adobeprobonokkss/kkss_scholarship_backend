import config, { get } from "config";
import {
  getFirestore,
  query,
  collection,
  getDocs,
  addDoc,
  Query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore/lite";
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
    const usersList = usersSnapshot.docs.map((doc) => doc.data());
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
    const users = await usersnapShot.docs.map((doc) => doc.data());

    console.log(users);
    return users;
  } catch (error) {
    logger.error("Error listing collections: ", error);
    return null;
  }
}

// check if Scholarship ID exists
export async function checkIfScholarshipIDExists(scholarshipID: string) {
  try {
    const snapshot = collection(db, "scholarship_IDs");
    const scholarshipIDSnapshot = await getDocs(snapshot);

    const scholarshipIDArray = scholarshipIDSnapshot.docs[0].get("IDs");

    return scholarshipIDArray.includes(scholarshipID);
  } catch (error) {
    logger.error("Error listing collections: ", error);
  }
}

// save scholarship ID
export async function saveScholarshipID(scholarshipID: string) {
  try {
    const scholarshipIDCol = collection(db, "scholarship_IDs");
    const scholarshipIDSnapshot = await getDocs(scholarshipIDCol);
    const scholarshipIDArray = scholarshipIDSnapshot.docs[0].get("IDs");
    scholarshipIDArray.push(scholarshipID);

    updateDoc(doc(db, "scholarship_IDs", "taQQLHSS0MqqhqNHerMa"), {
      IDs: scholarshipIDArray,
    });
  } catch (error) {
    logger.error("Error listing collections: ", error);
  }
}

// save scholarship form data
export async function saveScholarshipFormData(scholarshipFormData: any) {
  try {
    if (!scholarshipFormData.scholarshipID) {
      // generate scholarship ID using uuid
      const uuid = require("uuid");
      let scholarshipID = uuid.v4();

      while (await checkIfScholarshipIDExists(scholarshipID)) {
        // generate new scholarship ID if already exists
        scholarshipID = uuid.v4();
      }
      await saveScholarshipID(scholarshipID);
      scholarshipFormData.scholarshipID = scholarshipID;
    }
    const scholarshipFormCol = collection(db, "scholarship_forms");
    const isAdded = await addDoc(scholarshipFormCol, scholarshipFormData);

    return {
      scholarshipID: scholarshipFormData.scholarshipID,
      status: "success",
      message: "Scholarship form data saved successfully",
    };
  } catch (error) {
    logger.error("Error listing collections: ", error);
    return null;
  }
}

// get scholarship form data
export async function getScholarshipFormData(scholarshipID: string) {
  try {
    const _query = query(
      collection(db, "scholarship_forms"),
      where("scholarshipID", "==", scholarshipID)
    );
    const scholarshipFormSnapshot = await getDocs(_query);
    const scholarshipFormList = scholarshipFormSnapshot.docs.map((doc) =>
      doc.data()
    );
    return {
      scholarshipID: scholarshipID,
      scholarshipFormData: scholarshipFormList[0],
      status: "success",
      message: "Scholarship form data fetched successfully",
    };
  } catch (error) {
    logger.error("Error listing collections: ", error);
    return null;
  }
}
