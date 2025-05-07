import type { MongoUser } from "@models";

export type UserFilter = Partial<Pick<MongoUser, "userID" | "token" | "email">>;
