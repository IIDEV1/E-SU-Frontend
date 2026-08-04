export type Role = 'admin' | 'manager' | 'employee' | 'chancellery';
export type UserStatus = 'active' | 'blocked' | 'pending';

export interface User {
  id: string;
  fullName: string;
  email: string;
  position: string;
  departmentName: string;
  role: Role;
  status: UserStatus;
  lastActive: string;
}