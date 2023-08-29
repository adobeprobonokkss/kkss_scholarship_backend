export type ScholarshipDataRequest = {
  field: string;
  keyword: string;
  year: string;
};

export enum RoleType {
  ADMIN = "ADMIN",
  USER = "USER",
  VOLUNTEER = "VOLUNTEER",
  PROGRAM_MANAGER = "PROGRAM MANAGER",
}
