export interface Event {
  id?: string;
  name: string;
  startDateTime: string; // ISO format date (yyyy-MM-dd)
  registrationDeadline: string; // ISO format date
  location: string;
  address: string;
  category: string;
  description: string;
  maxParticipants: number;
  currentParticipantsCount: number;
  organizationId: string;
  userToRegister?: string;
}
