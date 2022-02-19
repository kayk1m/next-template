import { StatusCodes } from 'http-status-codes';
import Joi from 'joi';

import { mockHandler } from '@/backend/test-helper';

import { ApiError, type ApiErrorJson } from '@/utils/api-error';

import { NextApiBuilder } from '.';

import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

const _handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    switch (req.query.error) {
      case 'alreadySent':
        res.status(StatusCodes.NO_CONTENT).end();
        throw new Error('Should never see me!');

      case 'unexpectedError':
        throw new Error('Unexpected Error');

      case 'unexpectedWeirdError':
        throw 'can I be thrown?';

      case 'throwWithStatusCode':
        res.status(StatusCodes.NOT_ACCEPTABLE);
        throw new Error('Not Acceptable Error');

      case 'apiError':
        throw new ApiError('TOKEN_EXPIRED');

      case 'validationError':
        await Joi.string().valid('shouldBeDifferent').validateAsync(req.query.error);
    }

    res.status(StatusCodes.OK).json({ hello: 'world' });
  }
};

describe('Default wrapper (error-handler)', () => {
  let apiHandler: NextApiHandler;

  beforeAll(() => {
    apiHandler = new NextApiBuilder(_handler).build();
  });

  it('should success', async () => {
    const { statusCode, jsonData } = await mockHandler<{ hello: string }>(apiHandler, {
      req: { method: 'GET' },
    });

    expect(statusCode).toBe(StatusCodes.OK);
    expect(jsonData?.hello).toEqual('world');
  });

  it('should success if handler throws after sending a response', async () => {
    const { statusCode } = await mockHandler(apiHandler, {
      method: 'GET',
      query: { error: 'alreadySent' },
    });

    expect(statusCode).toBe(StatusCodes.NO_CONTENT);
  });

  it('should fail - method not allowed', async () => {
    const { statusCode, jsonData } = await mockHandler(apiHandler, { method: 'POST' });

    expect(statusCode).toBe(StatusCodes.METHOD_NOT_ALLOWED);
    expect(jsonData).toHaveProperty('name');
    expect(jsonData).toHaveProperty('message');
  });

  it('should fail - unexpected error', async () => {
    const { statusCode, jsonData } = await mockHandler<ApiErrorJson>(apiHandler, {
      method: 'GET',
      query: { error: 'unexpectedError' },
    });

    expect(statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(jsonData).toHaveProperty('stack');
    expect(jsonData?.stack).toBeDefined();
    expect(jsonData).toHaveProperty('name');
    expect(jsonData).toHaveProperty('message');
  });

  it('should fail - unexpected weird error', async () => {
    const { statusCode, jsonData } = await mockHandler<ApiErrorJson>(apiHandler, {
      method: 'GET',
      query: { error: 'unexpectedWeirdError' },
    });

    expect(statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(jsonData).toHaveProperty('name');
    expect(jsonData).toHaveProperty('message');
  });

  it('should fail - throw error with statusCode', async () => {
    const { statusCode, jsonData } = await mockHandler<ApiErrorJson>(apiHandler, {
      method: 'GET',
      query: { error: 'throwWithStatusCode' },
    });

    expect(statusCode).toBe(StatusCodes.NOT_ACCEPTABLE);
    expect(jsonData).toHaveProperty('name');
    expect(jsonData).toHaveProperty('message');
  });

  it('should fail - validation error', async () => {
    const { statusCode, jsonData } = await mockHandler<ApiErrorJson>(apiHandler, {
      method: 'GET',
      query: { error: 'validationError' },
    });

    expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
    expect(jsonData).toHaveProperty('name');
    expect(jsonData).toHaveProperty('message');
  });

  it('should fail - api error', async () => {
    const { statusCode, jsonData } = await mockHandler<ApiErrorJson>(apiHandler, {
      method: 'GET',
      query: { error: 'apiError' },
    });

    expect(statusCode).toBe(StatusCodes.UNAUTHORIZED);
    expect(jsonData).toHaveProperty('name');
    expect(jsonData).toHaveProperty('message');
  });
});
