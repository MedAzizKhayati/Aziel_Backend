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
}
