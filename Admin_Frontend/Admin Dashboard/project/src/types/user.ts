export interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;

  active: boolean;   // ⭐ THIS IS THE REAL FIELD

  currentStatus?: 'PRESENT' | 'ABSENT';
  createdAt: string;
  updatedAt: string;
}


export interface CreateUserDTO {
  name: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
}
