import { createExpressEndpoints, initServer } from '@ts-rest/express';
import express from 'express';
import { feedbackContract } from '../../api/feedback';
import { UserRole } from '../../api/user';
import { assert } from '../../utils/validate';
import { FeedbackDao } from './dao';
import '../session';
import { enforceRole } from '../util/enforce_role';


export const feedbackApp = express();

const router = initServer().router(feedbackContract, {
  async reportError({ body, req }) {
    assert(req.session.userId != null, { unauthorized: true });
    const submission = await FeedbackDao.create({
      errorMessage: body.errorMessage,
      errorStack: body.stack,
      userId: req.session.userId,
      url: body.url,
    });
    return { status: 200, body: { success: true, errorId: submission.id } };
  },
  async submit({ body, req }) {
    assert(req.session.userId != null, { unauthorized: true });
    if (body.errorId != null) {
      const submission = await FeedbackDao.findByPk(body.errorId);
      assert(submission != null, { notFound: true });
      assert(submission.userId === req.session.userId, { permissionDenied: true });

      submission.userMessage = body.message;
      await submission.save();
    } else {
      await FeedbackDao.create({
        userId: req.session.userId,
        userMessage: body.message,
        url: body.url,
      });
    }
    return { status: 200, body: { success: true } };
  },
  async list({ req }) {
    await enforceRole(req, UserRole.enum.ADMIN);
    const feedback = await FeedbackDao.findAll({ order: [['id', 'ASC']], limit: 20 });
    return { status: 200, body: { feedback: feedback.map(f => f.toApi()) } };
  },
  async deleteFeedback({ req, params }) {
    await enforceRole(req, UserRole.enum.ADMIN);
    await FeedbackDao.destroy({ where: { id: params.feedbackId } });
    return { status: 200, body: { success: true } };
  },
});

createExpressEndpoints(feedbackContract, router, feedbackApp);

