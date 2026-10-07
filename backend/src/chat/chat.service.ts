import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';
import { ChatGroq } from '@langchain/groq';
import { randomUUID } from 'node:crypto';

@Injectable()
export class ChatService {
  private readonly model: ChatGroq | null;
  private readonly conversations = new Map<string, BaseMessage[]>();

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('GROQ_API_KEY');

    this.model = apiKey
      ? new ChatGroq({
          apiKey,
          model: this.config.get<string>('GROQ_MODEL', 'openai/gpt-oss-20b'),
          temperature: 0.7,
          maxRetries: 0,
        })
      : null;
  }

  async chat(message: string, requestedId?: string) {
    if (!this.model) {
      throw new ServiceUnavailableException(
        'GROQ_API_KEY is not configured on the server.',
      );
    }

    const conversationId = requestedId || randomUUID();
    const history = this.conversations.get(conversationId) ?? [
      new SystemMessage(
        'You are a helpful, concise assistant. Answer clearly and conversationally.',
      ),
    ];
    const userMessage = new HumanMessage(message.trim());

    try {
      const response = await this.model.invoke([...history, userMessage], {
        timeout: 20_000,
      });
      const reply = this.readText(response.content);

      this.conversations.set(conversationId, [
        ...history,
        userMessage,
        new AIMessage(reply),
      ]);

      return { reply, conversationId };
    } catch (error) {
      console.error('Groq request failed:', error);

      if (this.getStatusCode(error) === 429) {
        throw new HttpException(
          'Groq rate limit exceeded. Check your Groq usage limits and try again.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      if (this.getStatusCode(error) === 401) {
        throw new HttpException(
          'The configured Groq API key was rejected.',
          HttpStatus.UNAUTHORIZED,
        );
      }

      throw new InternalServerErrorException(
        'The AI service could not complete the request. Please try again.',
      );
    }
  }

  private readText(content: unknown): string {
    if (typeof content === 'string') return content;

    if (Array.isArray(content)) {
      const text = content
        .map((part) => {
          if (typeof part === 'string') return part;
          if (
            part &&
            typeof part === 'object' &&
            'text' in part &&
            typeof part.text === 'string'
          ) {
            return part.text;
          }
          return '';
        })
        .join('');

      if (text) return text;
    }

    throw new Error('The model returned an unsupported response format.');
  }

  private getStatusCode(error: unknown): number | undefined {
    if (
      error &&
      typeof error === 'object' &&
      'statusCode' in error &&
      typeof error.statusCode === 'number'
    ) {
      return error.statusCode;
    }

    if (
      error &&
      typeof error === 'object' &&
      'status' in error &&
      typeof error.status === 'number'
    ) {
      return error.status;
    }

    return undefined;
  }
}
