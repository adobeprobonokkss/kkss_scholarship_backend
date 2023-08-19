import config, { get } from "config";
import {
  getFirestore,
  query,
  collection,
  getDocs,
  addDoc,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { logger } from "./../utils/logger";

const FIREBASE_DB_CONFIG = config.get("FIREBASE_DB_CONFIG");
const scholarshipFormDataCache: any = {
  time: null,
  data: null,
};

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
    logger.info(
      `Getting User List length for user ${emailId} and it should always be 1`,
      usersList.length
    );
    return usersList[0];
  } catch (error) {
    logger.error(
      `Encounterd error while fetching email id ${emailId} from user Database`,
      error
    );
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
      const ShortUniqueId = require("short-unique-id");
      const uuid = new ShortUniqueId({ length: 16 });

      let scholarshipID = uuid();

      while (await checkIfScholarshipIDExists(scholarshipID)) {
        // generate new scholarship ID if already exists
        scholarshipID = uuid.v4();
      }
      await saveScholarshipID(scholarshipID);
      scholarshipFormData.scholarshipID = scholarshipID;
      scholarshipFormData.status = "submitted";
    }
    const scholarshipFormCol = collection(db, "scholarship_forms");
    const isAdded = await addDoc(scholarshipFormCol, scholarshipFormData);

    return {
      scholarshipID: scholarshipFormData.scholarshipID,
      status: isAdded ? "success" : "failed",
      message: `Scholarship form data ${isAdded ? "saved" : "not saved"}}`,
    };
  } catch (error) {
    logger.error("Error listing collections: ", error);
    return null;
  }
}

// get scholarship form data by scholarship ID
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

// get Scholarship form data by user email ID
export async function getScholarshipFormDataByEmailId(email: string) {
  try {
    const _query = query(
      collection(db, "scholarship_forms"),
      where("email", "==", email)
    );
    const scholarshipFormSnapshot = await getDocs(_query);
    const scholarshipFormList = scholarshipFormSnapshot.docs.map((doc) =>
      doc.data()
    );
    return {
      scholarshipFormData: scholarshipFormList,
      status: "success",
      message: "Scholarship form data fetched successfully",
    };
  } catch (error) {
    logger.error("Error listing collections: ", error);
    return null;
  }
}

// get Scholarship form data by user Phone Number
export async function getScholarshipFormDataByPhoneNumber(phoneNumber: string) {
  try {
    const _query = query(
      collection(db, "scholarship_forms"),
      where("phNumber", "==", phoneNumber)
    );
    const scholarshipFormSnapshot = await getDocs(_query);
    const scholarshipFormList = scholarshipFormSnapshot.docs.map((doc) =>
      doc.data()
    );
    return {
      scholarshipFormData: scholarshipFormList,
      status: "success",
      message: "Scholarship form data fetched successfully",
    };
  } catch (error) {
    logger.error("Error listing collections: ", error);
    return null;
  }
}

// get Scholarship form data by user name
export async function getScholarshipFormDataByName(name: string) {
  try {
    const _query = query(
      collection(db, "scholarship_forms"),
      where("name", "==", name)
    );
    const scholarshipFormSnapshot = await getDocs(_query);
    const scholarshipFormList = scholarshipFormSnapshot.docs.map((doc) =>
      doc.data()
    );
    return {
      scholarshipFormData: scholarshipFormList,
      status: "success",
      message: "Scholarship form data fetched successfully",
    };
  } catch (error) {
    logger.error("Error listing collections: ", error);
    return null;
  }
}

// get all scholarship form data
export async function getAllScholarshipFormData() {
  try {
    const timeNow = new Date().getTime();
    console.log(timeNow, scholarshipFormDataCache.time);
    if (
      !scholarshipFormDataCache.time ||
      timeNow - scholarshipFormDataCache.time > 300000
    ) {
      const _query = query(collection(db, "scholarship_forms"));
      const scholarshipFormSnapshot = await getDocs(_query);
      const scholarshipFormList = scholarshipFormSnapshot.docs.map((doc) =>
        doc.data()
      );
      scholarshipFormDataCache.time = timeNow;
      scholarshipFormDataCache.data = scholarshipFormList;
      return {
        scholarshipFormData: scholarshipFormList,
        status: "success",
        message: "Scholarship form data fetched successfully",
        type: "new",
      };
    }
    return {
      scholarshipFormData: scholarshipFormDataCache.data,
      status: "success",
      message: "Scholarship form data fetched successfully",
      type: "cache",
    };
  } catch (error) {
    logger.error("Error listing collections: ", error);
    return {
      status: "failed",
      message: "Error fetching scholarship form data",
    };
  }
}
