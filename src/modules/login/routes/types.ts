import type { GithubUser } from "@types";

export type AdaptedGithubUser = Omit<GithubUser, "id"> & { id: string };
