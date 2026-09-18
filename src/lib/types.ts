export type Priority = "High" | "Medium" | "Low";

export interface Tag {
  label: string;
  subLabel?: string;
  icon: string;
}

export interface Booking {
  id: string;
  title: string;
  clientName: string;
  clientType: string;
  contactPerson: string;
  phone: string;
  email: string;
  clientQuote?: string;
  eventType: string;
  date: string; // yyyy-MM-dd
  timeStart: string;
  timeEnd: string;
  venueName: string;
  venueCity: string;
  venueAddress: string;
  hallType: string;
  hallCost: number;
  peopleCount: number;
  budgetTotal: number;
  budgetSpent: number;
  specialDemands: Tag[];
  extraActivities: Tag[];
  assignedTeamMemberIds: string[];
  status: "upcoming" | "today" | "completed";
}

export interface Task {
  id: string;
  bookingId: string;
  title: string;
  assigneeId: string;
  dueDate: string;
  dueTime: string;
  priority: Priority;
  done: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  presence: "online" | "offline";
  isCurrentUser?: boolean;
  isAdmin?: boolean;
  hue: number;
}

export interface Notification {
  id: string;
  type: "booking_assigned" | "task_reminder" | "client_message" | "team_update" | "event_completed";
  title: string;
  description: string;
  time: string;
  read: boolean;
}

export interface SavedVenue {
  id?: string;
  name: string;
  city: string;
  address: string;
}

