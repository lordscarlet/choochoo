import { createContext, ReactNode, useCallback, useContext, useEffect, useReducer, useState } from "react";
import { UserApi } from "../../api/user";
import { assert } from "../../utils/validate";
import { Set as ImmutableSet, Map as ImmutableMap } from 'immutable';
import { userClient } from "../services/user";

const UserCacheContext = createContext<ImmutableMap<string, UserApi>>(ImmutableMap<string, UserApi>());
const UserReadingContext = createContext<((userIds: string[]) => void)|undefined>(undefined);

export function useUsers(userIds: string[]): UserApi[]|undefined {
  const userCache = useContext(UserCacheContext);
  const userReading = useContext(UserReadingContext);
  useEffect(() => {
    assert(userReading != null);
    userReading(userIds);
  }, [userIds]);
  const users = userIds.map((userId) => userCache.get(userId));
  if (users.every(user => user != null)) return users;
  return undefined;
}

export function UserCacheProvider({children}: {children: ReactNode}) {
  const [usersToRead, addUsers] = useReducer((userIds: ImmutableSet<string>, newUserIds: string[]) => {
    return userIds.union(newUserIds);
  }, ImmutableSet.of<string>());

  const [usersBeingRead, addUsersBeingRead] = useReducer((userIds: ImmutableSet<string>, newUserIds: ImmutableSet<string>) => {
    return userIds.union(newUserIds);
  }, ImmutableSet.of<string>());

  const [userCache, updateUserCache] = useReducer((userCache: ImmutableMap<string, UserApi>, newUsers: UserApi[]) => {
    return userCache.merge(newUsers.map((user) => [user.id, user]));
  }, ImmutableMap<string, UserApi>());

  useEffect(() => {
    const usersAboutToRead = usersToRead.subtract(usersBeingRead);
    if (usersAboutToRead.size === 0) return;
    addUsersBeingRead(usersAboutToRead);
    userClient.list({query: {id: [...usersAboutToRead]}}).then(({status, body}) => {
      assert(status === 200);
      updateUserCache(body.users);
    });
  }, [usersToRead]);
  return <UserCacheContext.Provider value={userCache}>
    <UserReadingContext.Provider value={addUsers}>
      {children}
    </UserReadingContext.Provider>
  </UserCacheContext.Provider>;
}