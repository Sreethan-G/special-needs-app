export interface Resource {
  _id: string;
  name: string;
  location: {
    address: string;
    city: string;
    state: string;
    lat?: number | null;
    lng?: number | null;
  };
  contact: string;
  languages?: string;
  website?: string;
  notes?: string;
  image: string;
  type: string;
}
