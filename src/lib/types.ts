export interface IScheduleDef {
  timeRange: [string, string];
  dateRange: [string, string];
  days: string;
}

export interface IScrapedSection {
  crn: string;
  subject: string;
  crse: string;
  section: string;
  cmp: string;
  creditRange: number[];
  title: string;
  seats: number;
  seatsTaken: number;
  seatsAvailable: number;
  instructors: string;
  location: string | null;
  fee: number;
  schedules: IScheduleDef[];
}

export interface ISection {
  crn: string;
  section: string;
  cmp: string;
  creditRange: number[];
  seats: number;
  seatsTaken: number;
  seatsAvailable: number;
  instructors: string[];
  location: string | null;
  fee: number;
  schedules: IScheduleDef[];
}

export interface ICourseOverview {
  subject: string;
  crse: string;
  title: string;
  sections: ISection[];
}

export enum ESemester {
  fall = 'Fall',
  spring = 'Spring',
  summer = 'Summer'
}

export interface ISectionDetails {
  title: string;
  description: string;
  instructors: string[];
  credits: number | null;
  semestersOffered: ESemester[];
  prereqs: string | null;
  location: string;
}

export interface IFaculty {
  name: string;
  departments: string[];
  occupations: string[];
  email: string | null;
  phone: string | null;
  office: string | null;
  websiteURL: string | null;
  photoURL: string | null;
  interests: string[];
}

export interface ITransferCourse {
  from: {
    college: string;
    state: string;
    subject: string;
    crse: string;
    credits: number;
  };
  to: {
    title: string;
    subject: string;
    crse: string;
    credits: number;
  };
}
