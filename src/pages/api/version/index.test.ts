import { StatusCodes } from 'http-status-codes';

import { mockHandler } from '@/backend/test-helper';

import apiHandler, { API_VERSION } from '.';

describe('/api/version', () => {
  it('GET /api/version -> Get api version', async () => {
    const { statusCode, jsonData } = await mockHandler<{ apiVersion: string }>(apiHandler, {
      method: 'GET',
    });

    expect(statusCode).toBe(StatusCodes.OK);
    expect(jsonData?.apiVersion).toEqual(API_VERSION);
  });

  it('POST /api/version -> method not allowed', async () => {
    const { statusCode } = await mockHandler(apiHandler, { method: 'POST' });

    expect(statusCode).toBe(StatusCodes.METHOD_NOT_ALLOWED);
  });
});
