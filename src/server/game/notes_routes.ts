import { createExpressEndpoints, initServer } from "@ts-rest/express";
import express from "express";
import { notesContract } from "../../api/notes";
import { assert } from "../../utils/validate";
import { assertRole } from "../util/enforce_role";
import { GameDao } from "./dao";

export const notesApp = express();

const router = initServer().router(notesContract, {
  async get({ req, params }) {
    const user = await assertRole(req);
    const game = await GameDao.findByPk(params.gameId);
    assert(game != null, { notFound: true });
    const notes = game.getNotesForUser(user.id);
    return { status: 200, body: { notes } };
  },
  async set({ req, params, body }) {
    const user = await assertRole(req);
    const game = await GameDao.findByPk(params.gameId);
    assert(game != null, { notFound: true });
    game.setNotesForUser(user.id, body.notes);
    await game.save();
    return { status: 200, body: { notes: body.notes } };
  },
});

createExpressEndpoints(notesContract, router, notesApp);
