/** @jest-environment node */
import { describe, expect, it } from '@jest/globals';
import { ApiAccessError, assertApiAccess } from './ApiAccessError.ts';

describe('API access errors', () => {
  it('When a response is forbidden, then it raises a typed access error', () => {
    // Arrange
    const response = Response.json({}, { status: 403 });

    // Act
    const checkAccess = () => {
      assertApiAccess(response);
    };

    // Assert
    expect(checkAccess).toThrow(ApiAccessError);
  });

  it('When a response is successful, then it is accepted', () => {
    // Arrange
    const response = Response.json({ id: 'user' });

    // Act
    const checkAccess = () => {
      assertApiAccess(response);
    };

    // Assert
    expect(checkAccess).not.toThrow();
  });
});
