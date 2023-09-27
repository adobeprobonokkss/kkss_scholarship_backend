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
  getCountFromServer,
  limit,
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

export interface UserSchema {
  email: string;
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
    // const userCol = collection(db, USERS_COLLECTION);
    // const isAdded = await addDoc(userCol, user);
    setDoc(doc(db, USERS_COLLECTION, user.email), user);
    logger.info("User registerd successfully");
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
    // const snapshot = await getCountFromServer(_query);
    //
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
  status: string,
  setLimit: number = 50
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
    ...keywordSearchQuery,
    limit(setLimit)
  );
  const filteredObject = await getDocs(_query);
  const filteredList = filteredObject.docs.map((doc) => doc.data());
  return filteredList;
}

// get scholarship form data by config
export async function getScholarshipFormData(
  request: ScholarshipDataRequest,
  user: UserSchema
) {
  try {
    let scholarshipFormList = await getScholarshipDocuments(
      SCHOLARSHIP_FORMS_COLLECTION,
      request.field,
      request.keyword,
      request.year,
      request.status,
      request.limit
    );

    if (!user || !user.role) throw new Error("User role is required");
    if (user?.role === RoleType.USER) {
      scholarshipFormList = scholarshipFormList.filter(
        (scholarshipForm) => scholarshipForm.email === user.email
      );
    }
    if (user?.role === RoleType.REVIEWER) {
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
        if (user?.role === RoleType.USER || user?.role === RoleType.REVIEWER) {
          return {
            status: "failed",
            message: `You are not authorized to update the status of this application`,
          };
        }
        break;
      case "background_verification_completed":
        if (user?.role === RoleType.USER) {
          return {
            status: "failed",
            message: `You are not authorized to update the status of this application`,
          };
        }
        break;
      case "final_review_completed":
        if (user?.role === RoleType.USER || user?.role === RoleType.REVIEWER) {
          return {
            status: "failed",
            message: `You are not authorized to update the status of this application`,
          };
        }
        break;
      case "approved":
        if (user?.role !== RoleType.ADMIN) {
          return {
            status: "failed",
            message: `You are not authorized to update the status of this application`,
          };
        }
        break;
      case "rejected":
        if (user?.role !== RoleType.ADMIN) {
          return {
            status: "failed",
            message: `You are not authorized to update the status of this application`,
          };
        }
        break;
    }

    await setDoc(
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
export async function getAllScholarshipFormData(setLimit: number) {
  try {
    const _query = query(
      collection(db, SCHOLARSHIP_FORMS_COLLECTION),
      limit(setLimit)
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
      });
    } else {
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
    volunteeringDetails.scholarshipID = volunteeringDetails.scholarshipID;
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
export async function approveOrRejectVolunteeringHours(
  requestID: string,
  email: string,
  scholarshipID: string,
  decision: string,
  user: any
) {
  try {
    if (decision === "approved") {
      const volunteeringHours = (
        await getVolunteeringHours(scholarshipID, email, user)
      )?.volunteeringHoursList?.at(0);

      const activityHours = (
        await getVolunteerActivityHours(requestID)
      ).volunteerActivityHoursList?.at(0);

      if (!activityHours) throw new Error("Volunteering Hours not found");
      const approvedVolunteeringHours = {
        email: activityHours?.email,
        name: activityHours?.name,
        scholarshipID: activityHours?.scholarshipID,
        approvedHours:
          (+volunteeringHours?.approvedHours ?? 0) + +activityHours?.noOfHours,
      };

      await setDoc(
        doc(
          db,
          VOLUNTEERING_HOURS_COLLECTION,
          `${approvedVolunteeringHours.scholarshipID}`
        ),
        approvedVolunteeringHours
      );
    }

    // delete from volunteering_hours_list
    await deleteDoc(doc(db, VOLUNTEER_HOURS_LIST_COLLECTION, `${requestID}`));

    return {
      status: "success",
      message: `Volunteering Hours ${decision} successfully`,
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
export async function getVolunteeringHours(
  scholarshipID: string,
  email: string,
  user: UserSchema
) {
  try {
    const scholarship_forms = (
      await getScholarshipFormData(
        {
          field: "scholarshipID",
          keyword: scholarshipID.trim(),
          year: new Date().getFullYear().toString(),
          status: "",
        },
        user
      )
    ).scholarshipFormData;

    if (scholarship_forms?.length === 0)
      throw new Error("Scholarship form not found");
    if (scholarship_forms?.at(0).scholarshipID !== scholarshipID)
      throw new Error("Scholarship ID not matched");
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

// get all Volunteering Activity by user
export async function getAllVolunteeringActivityHoursByUser(
  scholarshipID: string,
  email: string,
  user: UserSchema
) {
  try {
    const scholarship_forms = (
      await getScholarshipFormData(
        {
          field: "email",
          keyword: email.trim() as string,
          year: new Date().getFullYear().toString(),
          status: "",
        },
        user
      )
    ).scholarshipFormData;
    if (scholarship_forms?.length === 0)
      throw new Error("Scholarship form not found");
    if (scholarship_forms?.at(0).scholarshipID !== scholarshipID)
      throw new Error("Scholarship ID not matched");
    const _query = query(
      collection(db, VOLUNTEER_HOURS_LIST_COLLECTION),
      where("scholarshipID", "==", scholarshipID)
    );
    const activityHoursSnapshot = await getDocs(_query);
    const activityHoursList = activityHoursSnapshot.docs.map((doc) =>
      doc.data()
    );
    return {
      activityHoursList: activityHoursList,
      status: "success",
      message: "Volunteering Activity Hours fetched successfully",
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
export async function getAllVolunteerActivityHours(setLimit: number) {
  try {
    const _query = query(
      collection(db, VOLUNTEER_HOURS_LIST_COLLECTION),
      orderBy("submissionDate", "desc"),
      limit(setLimit)
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

//aggreagate service
export async function getCountOfScholarShipData(year: string, status: string) {
  const queryList: QueryConstraint[] = [];
  const keywordSearchQuery: QueryConstraint[] = [];
  if (year) {
    queryList.push(where("submissionYear", "==", year));
  }
  if (status) {
    queryList.push(where("status", "==", status));
  }

  const _query = query(
    collection(db, SCHOLARSHIP_FORMS_COLLECTION),
    ...queryList
  );
  const snapshot = await getCountFromServer(_query);
  return {
    status,
    year: year,
    count: snapshot.data().count,
  };
}

// get Volunteer Hours by scholarshipID List
export async function getVolunteerHoursByScholarshipIDList(
  scholarshipIDList: string[],
  user: UserSchema
) {
  try {
    if (!scholarshipIDList || scholarshipIDList.length === 0)
      throw new Error("Scholarship ID List is required");
    if (!user) throw new Error("User is required");
    if (!user.role) throw new Error("User role is required");
    if (
      ![RoleType.ADMIN, RoleType.PROGRAM_MANAGER].includes(
        user.role as RoleType
      )
    )
      throw new Error("User is not authorized to perform this action");

    const _query = query(
      collection(db, VOLUNTEERING_HOURS_COLLECTION),
      where("scholarshipID", "in", scholarshipIDList)
    );
    const volunteerHoursSnapshot = await getDocs(_query);
    const volunteerHoursList = volunteerHoursSnapshot.docs.map((doc) =>
      doc.data()
    );
    return {
      volunteerHoursList: volunteerHoursList,
      status: "success",
      message: "Volunteer Hours fetched successfully",
    };
  } catch (error) {
    logger.error("Error listing collections: ", error);
    return {
      status: "failed",
      message: error,
    };
  }
}
