import config from "config";
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
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { FirebaseOptions, initializeApp } from "firebase/app";
import { logger } from "./../utils/logger";
import {
  RoleType,
  ScholarshipData,
  ScholarshipDataRequest,
  VolunteeringDetails,
} from "../utils/types";
import { formatDate } from "../utils/shared";

const FIREBASE_DB_CONFIG = config.get("FIREBASE_DB_CONFIG");

const admin = initializeApp(FIREBASE_DB_CONFIG as FirebaseOptions);
const db = getFirestore(admin);

interface UserSchema {
  emailId: string;
  name: string;
  picture: string;
  role: string;
}

const USERS_COLLECTION = "user";
const SCHOLARSHIP_IDS_COLLECTION = "scholarship_IDs";
const SCHOLARSHIP_FORMS_COLLECTION = "scholarship_forms";
const VOLUNTEER_HOURS_LIST_COLLECTION = "volunteering_hours_list";
const VOLUNTEERING_HOURS_COLLECTION = "volunteering_hours";

export async function getUserByEmailId(emailId: string): Promise<UserSchema> {
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
    return usersList[0] as UserSchema;
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

export async function getAllUsers(key: string, partialText: string) {
  try {
    const _query = query(
      collection(db, USERS_COLLECTION),
      orderBy(key),
      startAt(partialText),
      endAt(partialText + "\uf8ff")
    );
    const filteredObject = await getDocs(_query);
    const filteredList = filteredObject.docs.map((doc) => doc.data());
    return filteredList;
  } catch (error) {
    logger.error("Error listing collections: ", error);
    return null;
  }
}

// check if Scholarship ID exists
export async function checkIfScholarshipIDExists(scholarshipID: string) {
  try {
    const _query = query(
      collection(db, SCHOLARSHIP_IDS_COLLECTION),
      where("scholarshipID", "==", scholarshipID)
    );
    const filteredObject = await getDocs(_query);
    const filteredList = filteredObject.docs.map((doc) => doc.data());
    return filteredList.length > 0 ? true : false;
  } catch (error) {
    logger.error("Error listing collections: ", error);
  }
}

// save scholarship ID
export async function saveScholarshipID(scholarshipID: string, email: string) {
  try {
    await setDoc(
      doc(db, SCHOLARSHIP_IDS_COLLECTION, `${email}-${scholarshipID}`),
      {
        scholarshipID: scholarshipID,
        email: email,
      }
    );
  } catch (error) {
    logger.error("Error listing collections: ", error);
  }
}

// save scholarship form data
export async function saveScholarshipFormData(
  scholarshipFormData: ScholarshipData
) {
  const submissionYear = new Date().getFullYear();
  const submissionDate = formatDate(new Date());
  try {
    if (!scholarshipFormData.scholarshipID) {
      // generate scholarship ID using uuid
      const ShortUniqueId = require("short-unique-id");
      const uuid = new ShortUniqueId({
        length: 12,
        dictionary: "number",
        shuffle: true,
      });

      let scholarshipID = `KKSS${submissionYear}${uuid()}`;

      while (await checkIfScholarshipIDExists(scholarshipID)) {
        // generate new scholarship ID if already exists
        scholarshipID = `KKSS${submissionYear}${uuid()}}`;
      }
      await saveScholarshipID(scholarshipID, scholarshipFormData.email);
      scholarshipFormData.submissionYear = `${submissionYear}`;
      scholarshipFormData.submissionDate = submissionDate;
      scholarshipFormData.scholarshipID = scholarshipID;
      scholarshipFormData.status = "submitted";
    }
    await setDoc(
      doc(db, SCHOLARSHIP_FORMS_COLLECTION, scholarshipFormData.scholarshipID),
      scholarshipFormData
    );

    return {
      scholarshipID: scholarshipFormData.scholarshipID,
      status: "success",
      message: `Scholarship application "saved" successfully`,
    };
  } catch (error) {
    return {
      status: "failed",
      message: `There was an error while saving scholarship application data`,
      error: error,
    };
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
export async function getScholarshipFormData(
  request: ScholarshipDataRequest,
  user: any
) {
  try {
    let scholarshipFormList = await getScholarshipDocuments(
      SCHOLARSHIP_FORMS_COLLECTION,
      request.field,
      request.keyword,
      request.year,
      request.status
    );
    if (user.role === RoleType.USER) {
      scholarshipFormList = scholarshipFormList.filter(
        (scholarshipForm) => scholarshipForm.email === user.email
      );
    }

    if (user.role === RoleType.REVIEWER) {
      scholarshipFormList = scholarshipFormList.filter(
        (scholarshipForm) =>
          scholarshipForm.backgroundVerifierEmail === user.email &&
          (scholarshipForm.status === "submitted" ||
            scholarshipForm.status === "initial_review_completed")
      );
    }
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

// Update scholarship form data
export async function updateScholarshipFormData(
  userEmail: string,
  scholarshipFormData: ScholarshipData
) {
  try {
    if (!userEmail) throw new Error("User email is required");
    if (!scholarshipFormData)
      throw new Error("Scholarship form data is required");
    const user = await getUserByEmailId(userEmail);
    const status = scholarshipFormData.status;
    switch (status) {
      case "initial_review_completed":
        if (user.role === RoleType.USER || user.role === RoleType.REVIEWER) {
          return {
            status: "failed",
            message: `You are not authorized to update the status of this application`,
          };
        }
        break;
      case "background_verification_completed":
        if (user.role === RoleType.USER) {
          return {
            status: "failed",
            message: `You are not authorized to update the status of this application`,
          };
        }
        break;
      case "final_review_completed":
        if (user.role === RoleType.USER || user.role === RoleType.REVIEWER) {
          return {
            status: "failed",
            message: `You are not authorized to update the status of this application`,
          };
        }
        break;
      case "approved":
        if (user.role !== RoleType.ADMIN) {
          return {
            status: "failed",
            message: `You are not authorized to update the status of this application`,
          };
        }
        break;
      case "rejected":
        if (user.role !== RoleType.ADMIN) {
          return {
            status: "failed",
            message: `You are not authorized to update the status of this application`,
          };
        }
        break;
    }

    await updateDoc(
      doc(db, SCHOLARSHIP_FORMS_COLLECTION, scholarshipFormData.scholarshipID),
      scholarshipFormData
    );
    return {
      scholarshipID: scholarshipFormData.scholarshipID,
      status: "success",
      message: `Scholarship application "updated" successfully`,
    };
  } catch (error) {
    return {
      status: "failed",
      message: `There was an error while updating scholarship application data`,
      error: error,
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

export async function updateUserData(email: string, updatedRole: string) {
  const usersCollection = collection(db, USERS_COLLECTION);
  const q = query(usersCollection, where("email", "==", email));

  try {
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      querySnapshot.forEach(async (queryDocSnapshot) => {
        const docRef = doc(usersCollection, queryDocSnapshot.id);
        await updateDoc(docRef, { email: email, role: updatedRole });
        console.log("Document updated:", queryDocSnapshot.id);
      });
    } else {
      console.log("No users found with the specified email.");
    }
  } catch (error) {
    console.error("Error updating documents:", error);
  }
}

// submit Volunteering Hours
export async function submitVolunteeringHours(
  volunteeringDetails: VolunteeringDetails,
  user: any
) {
  try {
    const submissionDate = formatDate(new Date());
    const scholarship_forms = await getScholarshipFormData(
      {
        field: "email",
        keyword: user.email.trim() as string,
        year: "",
        status: "",
      },
      user
    );
    volunteeringDetails.scholarshipID =
      scholarship_forms.scholarshipFormData[0].scholarshipID;
    volunteeringDetails.submissionDate = submissionDate;
    volunteeringDetails.status = "submitted";
    volunteeringDetails.email = user.email;
    volunteeringDetails.name = user.name;

    const ShortUniqueId = require("short-unique-id");
    const uuid = new ShortUniqueId({
      length: 12,
      dictionary: "number",
      shuffle: true,
    });

    const requestID = `${volunteeringDetails.scholarshipID}${uuid()}`;

    volunteeringDetails.requestID = requestID;

    await setDoc(
      doc(
        db,
        VOLUNTEER_HOURS_LIST_COLLECTION,
        `${volunteeringDetails.requestID}`
      ),
      volunteeringDetails
    );

    return {
      status: "success",
      message: `Volunteering Hours "saved" successfully`,
    };
  } catch (error) {
    logger.error("Error listing collections: ", error);
    return {
      status: "failed",
      message: error,
    };
  }
}

// approve Volunteering Hours
export async function approveVolunteeringHours(
  requestID: string,
  email: string,
  user: any
) {
  try {
    const volunteeringHours = (await getVolunteeringHours(user))
      .volunteeringHoursList[0];
    const activityHours = (await getVolunteerActivityHours(requestID))
      .volunteerActivityHoursList[0];
    const approvedVolunteeringHours = {
      email: activityHours.email,
      name: activityHours.name,
      scholarshipID: activityHours.scholarshipID,
      approvedHours: volunteeringHours.approvedHours + activityHours.hours,
    };

    await setDoc(
      doc(
        db,
        VOLUNTEERING_HOURS_COLLECTION,
        `${approvedVolunteeringHours.scholarshipID}}`
      ),
      volunteeringHours
    );

    // delete from volunteering_hours_list
    await deleteDoc(doc(db, VOLUNTEER_HOURS_LIST_COLLECTION, `${requestID}`));

    return {
      status: "success",
      message: `Volunteering Hours "approved" successfully`,
    };
  } catch (error) {
    logger.error("Error listing collections: ", error);
    return {
      status: "failed",
      message: error,
    };
  }
}

// get Volunteering Hours by user
export async function getVolunteeringHours(email: any) {
  try {
    const scholarship_forms = await getScholarshipFormData(
      {
        field: "email",
        keyword: user.email.trim() as string,
        year: "",
        status: "",
      },
      user
    );
    const scholarshipID =
      scholarship_forms.scholarshipFormData[0].scholarshipID;
    const _query = query(
      collection(db, VOLUNTEERING_HOURS_COLLECTION),
      where("scholarshipID", "==", scholarshipID)
    );
    const volunteeringHoursSnapshot = await getDocs(_query);
    const volunteeringHoursList = volunteeringHoursSnapshot.docs.map((doc) =>
      doc.data()
    );
    return {
      volunteeringHoursList: volunteeringHoursList,
      status: "success",
      message: "Volunteering Hours fetched successfully",
    };
  } catch (error) {
    logger.error("Error listing collections: ", error);
    return {
      status: "failed",
      message: error,
    };
  }
}

// get Volunteer Activity Hours by requestID
export async function getVolunteerActivityHours(requestID: string) {
  try {
    const _query = query(
      collection(db, VOLUNTEER_HOURS_LIST_COLLECTION),
      where("requestID", "==", requestID)
    );
    const volunteerActivityHoursSnapshot = await getDocs(_query);
    const volunteerActivityHoursList = volunteerActivityHoursSnapshot.docs.map(
      (doc) => doc.data()
    );
    return {
      volunteerActivityHoursList: volunteerActivityHoursList,
      status: "success",
      message: "Volunteer Activity Hours fetched successfully",
    };
  } catch (error) {
    logger.error("Error listing collections: ", error);
    return {
      status: "failed",
      message: error,
    };
  }
}

// get all Volunteer Activity Hours
export async function getAllVolunteerActivityHours() {
  try {
    const _query = query(collection(db, VOLUNTEER_HOURS_LIST_COLLECTION));
    const volunteerActivityHoursSnapshot = await getDocs(_query);
    const volunteerActivityHoursList = volunteerActivityHoursSnapshot.docs.map(
      (doc) => doc.data()
    );
    return {
      volunteerActivityHoursList: volunteerActivityHoursList,
      status: "success",
      message: "Volunteer Activity Hours fetched successfully",
    };
  } catch (error) {
    logger.error("Error listing collections: ", error);
    return {
      status: "failed",
      message: error,
    };
  }
}
