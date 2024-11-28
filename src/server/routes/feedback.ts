import { createExpressEndpoints, initServer } from '@ts-rest/express';
import express from 'express';
import { feedbackContract } from '../../api/feedback';
import { UserRole } from '../../api/user';
import { assert } from '../../utils/validate';
import { FeedbackModel } from '../model/feedback';
import '../session';
import { enforceRole } from '../util/enforce_role';


export const feedbackApp = express();

const router = initServer().router(feedbackContract, {
  async reportError({ body, req }) {
    assert(req.session.userId != null, { unauthorized: true });
    const submission = await FeedbackModel.create({
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
      const submission = await FeedbackModel.findByPk(body.errorId);
      assert(submission != null, { notFound: true });
      assert(submission.userId === req.session.userId, { permissionDenied: true });

      submission.userMessage = body.message;
      await submission.save();
    } else {
      await FeedbackModel.create({
        userId: req.session.userId,
        userMessage: body.message,
        url: body.url,
    });
    }
    return { status: 200, body: { success: true } };
  },
  async list({ req }) {
    enforceRole(req, UserRole.enum.ADMIN);
    const feedback = await FeedbackModel.findAll({ order: [['id', 'ASC']], limit: 20 });
    return { status: 200, body: { feedback: feedback.map(f => f.toApi()) } };
  },
  async deleteFeedback({ req, params }) {
    enforceRole(req, UserRole.enum.ADMIN);
    await FeedbackModel.destroy({ where: { id: params.feedbackId } });
    return { status: 200, body: { success: true } };
  },
});

createExpressEndpoints(feedbackContract, router, feedbackApp);

