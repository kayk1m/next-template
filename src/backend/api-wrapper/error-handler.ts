import { StatusCodes } from 'http-status-codes';
import Joi from 'joi';
import { isResSent } from 'next/dist/shared/lib/utils';

import { ApiError } from '@/utils/api-error';
import { isProd } from '@/utils/env';

import type { ApiWrapper } from '.';
import type { NextApiHandler } from 'next';

export const errorHandler: ApiWrapper = (handler: NextApiHandler) => async (req, res) => {
  try {
    await handler(req, res);

    if (!isResSent(res)) {
      throw new ApiError('METHOD_NOT_ALLOWED');
    }
  } catch (err) {
    if (isResSent(res)) {
      // TODO: should we need to take care of broken handler
      //       after sending a response back to client? 🤔
      return;
    }

    const withDetails = !isProd();

    if (Joi.isError(err)) {
      const joiError = new ApiError('VALIDATION_ERROR', err.message, undefined, err.stack);

      return res.status(joiError.statusCode).json(joiError.toJson(withDetails));
    }

    if (err instanceof ApiError) {
      return res.status(err.statusCode).json(err.toJson(withDetails));
    }

    const internalServerError =
      err instanceof Error
        ? new ApiError('INTERNAL_SERVER_ERROR', err.message, undefined, err.stack)
        : new ApiError('INTERNAL_SERVER_ERROR');

    return res
      .status(res.statusCode >= 400 ? res.statusCode : StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalServerError.toJson(withDetails));
  }
};
