import { duplicate } from "../../utils/functions";
import { grid, PLAIN } from "../factory";

export const map = grid([[...duplicate(6, PLAIN)]]);
