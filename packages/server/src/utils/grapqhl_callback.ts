import fetch from 'node-fetch';
import { URLSearchParams } from 'url';
import { CallBackendArguments } from 'swagger-to-graphql';

export class GraphQLMethods {
  static getBodyAndHeaders(
    body: string,
    bodyType: 'json' | 'formData',
    headers: { [key: string]: string } | undefined
  ) {
    if (!body) {
      return { headers };
    }

    if (bodyType === 'json') {
      return {
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(body),
      };
    }

    return {
      headers,
      body: new URLSearchParams(body),
    };
  }

  static async callRestBackend({
    requestOptions: { method, body, baseUrl, path, query, headers, bodyType },
    context,
  }: CallBackendArguments<{}>) {
    const searchPath = query ? `?${new URLSearchParams(query)}` : '';
    const url = `${context}${path}${searchPath}`;
    const bodyAndHeaders = GraphQLMethods.getBodyAndHeaders(
      body,
      bodyType,
      headers
    );

    const response = await fetch(url, {
      method,
      ...bodyAndHeaders,
    });

    const text = await response.text();

    if (response.ok) {
      try {
        return JSON.parse(text);
      } catch (e) {
        return text;
      }
    }
    throw new Error(`Response: ${response.status} - ${text}`);
  }
}
