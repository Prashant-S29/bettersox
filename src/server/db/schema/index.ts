import { account, session, verification } from "./db.schema.auth";
import { eventsLog, trackedRepos } from "./db.schema.tracker";
import { user } from "./db.schema.user";

export const schema = {
  user,
  account,
  session,
  verification,
  eventsLog,
  trackedRepos,
};
