import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class BallastApi implements ICredentialType {
  name = 'ballastApi';
  displayName = 'Ballast API';
  documentationUrl = 'https://ballast.to/docs/api';
  icon = 'file:ballast.svg' as const;
  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description: 'API key from your Ballast workspace: Settings > API keys',
    },
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'https://ballast.to/api/v1',
      required: true,
      description: 'Ballast API base URL. Use https://ballast.to/api/v1 for production.',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '=Bearer {{$credentials.apiKey}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials?.baseUrl || "https://ballast.to/api/v1"}}',
      url: '/ping',
      method: 'GET',
    },
  };
}
