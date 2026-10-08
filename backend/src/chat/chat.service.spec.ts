import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';

describe('ChatService', () => {
  test('rejects requests when GROQ_API_KEY is missing', async () => {
    const config = {
      get: jest.fn().mockReturnValue(undefined),
    } as unknown as ConfigService;
    const service = new ChatService(config);

    await expect(service.chat('Hello')).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
