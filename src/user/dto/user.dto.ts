import { Exclude, Expose } from "class-transformer";

@Exclude()
export class UserDTO {
  @Expose()
  id: number;
  @Expose()
  email: string;
  @Expose()
  firstName: string;
  @Expose()
  lastName: string;
  @Expose()
  phonenumber: string;
  @Expose()
  role: string;
  @Expose()
  profileImage: string;
  @Expose()
  ratingAsSeller: number;
  @Expose()
  ratingAsBuyer: number;
  @Expose()
  balance: number;
  @Expose()
  reviewsCountAsSeller: number;
  @Expose()
  reviewsCountAsBuyer: number;
  @Expose()
  createdAt: Date;
  @Expose()
  updatedAt: Date;
}
