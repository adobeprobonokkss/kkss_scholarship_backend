export type ScholarshipDataRequest = {
  field: string;
  keyword: string;
  year: string;
  status: string;
};

export enum RoleType {
  ADMIN = "ADMIN",
  USER = "USER",
  REVIEWER = "REVIEWER",
  PROGRAM_MANAGER = "PROGRAM_MANAGER",
}

export type ScholarshipData = {
  email: string;
  name: string;
  aadharNumber: string;
  dateOfBirth: string;
  gender: string;
  category: string;
  address: string;
  phNumber: string;
  motherTongue: string;
  placeOfBirth: string;
  referral: string;
  refferralPhNumber: string;
  schoolCollegeNameAndAddress: string;
  education: string;
  stream: string;
  class: string;
  educationOthers: string;
  mediumOfEducation: string;
  schoolCollegePhNumber: string;
  estimatedAnnualFee: string;
  year1: string;
  year2: string;
  year3: string;
  hobbies: string;
  ambition: string;
  awardDetails: string;
  attendanceDetails: string;
  fatherName: string;
  fatherAge: string;
  fatherOccupation: string;
  fatherAnnualIncome: string;
  fatherPhNumber: string;
  motherName: string;
  motherAge: string;
  motherOccupation: string;
  motherAnnualIncome: string;
  motherPhNumber: string;
  siblingName: string;
  siblingAge: string;
  siblingOccupation: string;
  siblingAnnualIncome: string;
  siblingPhNumber: string;
  formSubmittedBy: string;
  yourPhNumber: string;
  scholarshipID?: string;
  status?: string;
  submissionYear?: string;
  backgroundVerifierEmail?: string;
  backgroundVerifierName?: string;
  programManagerEmail?: string;
  programManagerName?: string;
  submissionDate?: string;
  programManagerComment1?: string;
  programManagerComment2?: string;
  backgroundVerifierComment?: string;
  adminComment?: string;
};

export type VolunteeringDetails = {
  activityDate?: string;
  noOfHours?: string;
  activityDescription?: string;
  scholarshipID?: string;
  email?: string;
  name?: string;
  submissionDate?: string;
  status?: string;
  requestID?: string;
};
