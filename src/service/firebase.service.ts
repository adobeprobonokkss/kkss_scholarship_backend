import config, { get } from "config";
import {
  getFirestore,
  query,
  orderBy,
  startAt,
  endAt,
  collection,
  getDocs,
  addDoc,
  where,
  doc,
  updateDoc,
  QueryConstraint,
} from "firebase/firestore";
import { FirebaseOptions, initializeApp } from "firebase/app";
import { logger } from "./../utils/logger";
import { ScholarshipDataRequest } from "../utils/types";

const FIREBASE_DB_CONFIG = config.get("FIREBASE_DB_CONFIG");

const admin = initializeApp(FIREBASE_DB_CONFIG as FirebaseOptions);
const db = getFirestore(admin);

interface UserSchema {
  emailId: string;
  name: string;
  picture: string;
}

const USERS_COLLECTION = "user";
const SCHOLARSHIP_IDS_COLLECTION = "scholarship_IDs";
const SCHOLARSHIP_FORMS_COLLECTION = "scholarship_forms";

export async function getUserByEmailId(emailId: string) {
  try {
    const _query = query(
      collection(db, USERS_COLLECTION),
      where("email", "==", emailId)
    );
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
    const userCol = collection(db, USERS_COLLECTION);
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
    const snapshot = collection(db, USERS_COLLECTION);
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
    const snapshot = collection(db, SCHOLARSHIP_IDS_COLLECTION);
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
    const scholarshipIDCol = collection(db, SCHOLARSHIP_IDS_COLLECTION);
    const scholarshipIDSnapshot = await getDocs(scholarshipIDCol);
    const scholarshipIDArray = scholarshipIDSnapshot.docs[0].get("IDs");
    scholarshipIDArray.push(scholarshipID);

    updateDoc(doc(db, SCHOLARSHIP_IDS_COLLECTION, "taQQLHSS0MqqhqNHerMa"), {
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
    const scholarshipFormCol = collection(db, SCHOLARSHIP_FORMS_COLLECTION);
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

async function getScholarshipDocuments(
  collectionName: string,
  field: string,
  keyword: string,
  year: string,
  status: string
): Promise<any[]> {
  const queryList: QueryConstraint[] = [];
  const keywordSearchQuery: QueryConstraint[] = [];
  if (year) {
    queryList.push(where("submissionYear", "==", year));
  }
  if (status) {
    queryList.push(where("status", "==", status));
  }
  if (field && keyword) {
    keywordSearchQuery.push(orderBy(field)),
      keywordSearchQuery.push(startAt(keyword)),
      keywordSearchQuery.push(endAt(keyword + "\uf8ff"));
  }

  const _query = query(
    collection(db, collectionName),
    ...queryList,
    ...keywordSearchQuery
  );
  const filteredObject = await getDocs(_query);
  const filteredList = filteredObject.docs.map((doc) => doc.data());
  return filteredList;
}

// get scholarship form data by config
export async function getScholarshipFormData(request: ScholarshipDataRequest) {
  try {
    const scholarshipFormList = await getScholarshipDocuments(
      SCHOLARSHIP_FORMS_COLLECTION,
      request.field,
      request.keyword,
      request.year,
      request.status
    );
    return {
      field: request.field,
      keyword: request.keyword,
      year: request.year,
      scholarshipFormData: scholarshipFormList ?? [],
      form_status: request.status,
      status: "success",
      message: "Scholarship form data fetched successfully",
    };
  } catch (error) {
    logger.error("Error listing collections: ", error);
    return {
      status: "failed",
      message: error,
    };
  }
}

// get all scholarship form data
export async function getAllScholarshipFormData() {
  try {
    const _query = query(collection(db, SCHOLARSHIP_FORMS_COLLECTION));
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
    return {
      status: "failed",
      message: error,
    };
  }
}
