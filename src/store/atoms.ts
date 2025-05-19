import { atom } from "jotai";
import { IUser } from "@interfaces/User";
import { IRound } from "@interfaces/Round";

/* Base */
export const loadingAtom = atom(true);
export const redirectAtom = atom(false);

/* User */
export const loggedInUserAtom = atom<IUser | null>(null);

/* Rounds */
export const roundsAtom = atom<IRound[]>([]);
export const selectedRoundIdAtom = atom<string | null>(null);
