import type {
  IDataObject,
  IHookFunctions,
  INodeType,
  INodeTypeDescription,
  IWebhookFunctions,
  IWebhookResponseData,
} from 'n8n-workflow';

export class BallastTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Ballast Trigger',
    name: 'ballastTrigger',
    icon: 'file:ballast.svg',
    group: ['trigger'],
    version: 1,
    description: 'Trigger workflows on Ballast lead replies, bounces, unsubscribes, and campaign events.',
    eventTriggerDescription: '',
    activationMessage: 'Your workflow will run whenever the selected Ballast events occur.',
    defaults: {
      name: 'Ballast Trigger',
    },
    inputs: [],
    outputs: ['main'],
    credentials: [
      {
        name: 'ballastApi',
        required: true,
      },
    ],
    webhooks: [
      {
        name: 'default',
        httpMethod: 'POST',
        responseMode: 'onReceived',
        path: 'webhook',
      },
    ],
    properties: [
      {
        displayName: 'Events',
        name: 'events',
        type: 'multiOptions',
        required: true,
        default: ['lead.replied'],
        description: 'Choose which Ballast events trigger this workflow',
        options: [
          {
            name: 'Lead Replied',
            value: 'lead.replied',
            description: 'A lead answered a campaign email (out-of-office and auto-replies excluded)',
          },
          {
            name: 'Reply Labeled',
            value: 'lead.labeled',
            description: 'A reply received a label from AI, a rule, or an operator',
          },
          {
            name: 'Lead Bounced',
            value: 'lead.bounced',
            description: 'An email to a lead bounced hard',
          },
          {
            name: 'Lead Unsubscribed',
            value: 'lead.unsubscribed',
            description: 'A lead unsubscribed by link, one-click header, or reply',
          },
          {
            name: 'Spam Complaint',
            value: 'lead.complained',
            description: 'A recipient provider reported a campaign email as spam',
          },
          {
            name: 'Lead Won',
            value: 'lead.won',
            description: 'A lead was marked won',
          },
          {
            name: 'Campaign Paused',
            value: 'campaign.paused',
            description: 'A campaign stopped sending: paused by an operator, a label, a breaker, or its end date',
          },
        ],
      },
    ],
  };

  webhookMethods = {
    default: {
      async checkExists(this: IHookFunctions): Promise<boolean> {
        const webhookData = this.getWorkflowStaticData('node');
        if (!webhookData.webhookId) {
          return false;
        }

        const webhookUrl = this.getNodeWebhookUrl('default');
        const credentials = await this.getCredentials('ballastApi');
        const baseUrl = ((credentials.baseUrl as string) || 'https://ballast.to/api/v1').replace(/\/$/, '');

        try {
          const responseData = (await this.helpers.httpRequestWithAuthentication.call(
            this,
            'ballastApi',
            {
              method: 'GET',
              url: `${baseUrl}/webhooks`,
              json: true,
            },
          )) as { webhooks?: Array<{ id: string; url: string }> };

          const webhooks = responseData?.webhooks || [];
          return webhooks.some(
            (w) => w.id === webhookData.webhookId && w.url === webhookUrl,
          );
        } catch {
          return false;
        }
      },

      async create(this: IHookFunctions): Promise<boolean> {
        const webhookUrl = this.getNodeWebhookUrl('default');
        const webhookData = this.getWorkflowStaticData('node');
        const events = this.getNodeParameter('events', []) as string[];
        const credentials = await this.getCredentials('ballastApi');
        const baseUrl = ((credentials.baseUrl as string) || 'https://ballast.to/api/v1').replace(/\/$/, '');

        const workflow = this.getWorkflow();
        const description = `n8n: ${workflow.name || workflow.id || 'Workflow'}`.slice(0, 120);

        const responseData = (await this.helpers.httpRequestWithAuthentication.call(
          this,
          'ballastApi',
          {
            method: 'POST',
            url: `${baseUrl}/webhooks`,
            body: {
              url: webhookUrl,
              description,
              events,
            },
            json: true,
          },
        )) as { webhook?: { id: string } };

        if (responseData?.webhook?.id) {
          webhookData.webhookId = responseData.webhook.id;
          return true;
        }

        return false;
      },

      async delete(this: IHookFunctions): Promise<boolean> {
        const webhookData = this.getWorkflowStaticData('node');
        if (!webhookData.webhookId) {
          return true;
        }

        const credentials = await this.getCredentials('ballastApi');
        const baseUrl = ((credentials.baseUrl as string) || 'https://ballast.to/api/v1').replace(/\/$/, '');

        try {
          await this.helpers.httpRequestWithAuthentication.call(this, 'ballastApi', {
            method: 'DELETE',
            url: `${baseUrl}/webhooks/${webhookData.webhookId}`,
            json: true,
          });
        } catch {
          // Endpoint already deleted or removed on Ballast
        }

        delete webhookData.webhookId;
        return true;
      },
    },
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const bodyData = this.getBodyData() as IDataObject | IDataObject[];
    return {
      workflowData: [this.helpers.returnJsonArray(bodyData)],
    };
  }
}
