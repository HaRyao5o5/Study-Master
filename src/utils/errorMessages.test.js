// src/utils/errorMessages.test.js
import { describe, it, expect } from 'vitest';
import { SUCCESS, CONFIRM, ERROR } from './errorMessages';

describe('errorMessages', () => {
  describe('SUCCESS messages', () => {
    it('should return success message for quiz creation', () => {
      const message = SUCCESS.QUIZ_CREATED('テストクイズ');
      expect(message).toContain('テストクイズ');
      expect(message).toContain('作成');
    });

    it('should return success message for folder creation', () => {
      const message = SUCCESS.FOLDER_CREATED('数学');
      expect(message).toContain('数学');
      expect(message).toContain('作成');
    });
  });

  describe('CONFIRM messages', () => {
    it('should return confirmation message for quiz deletion', () => {
      const message = CONFIRM.DELETE_QUIZ;
      expect(typeof message).toBe('string');
      expect(message.length).toBeGreaterThan(0);
    });

    it('should return confirmation message for folder deletion', () => {
      const message = CONFIRM.DELETE_FOLDER;
      expect(typeof message).toBe('string');
      expect(message.length).toBeGreaterThan(0);
    });
  });

  describe('ERROR messages', () => {
    it('should return error message for invalid file', () => {
      const message = ERROR.INVALID_FILE;
      expect(typeof message).toBe('string');
      expect(message.length).toBeGreaterThan(0);
    });

    it('should return error message for network error', () => {
      const message = ERROR.NETWORK_ERROR;
      expect(typeof message).toBe('string');
      expect(message.length).toBeGreaterThan(0);
    });
  });
});
