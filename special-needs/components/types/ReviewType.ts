export interface ReviewType {
  _id: string;
  userId: {
    _id: string;
    username: string;
    profilePicUrl: string;
  };
  rating: number;
  review: string;
  resourceId: string;
  date: string;
}
