import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export class Ballast implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Ballast',
    name: 'ballast',
    icon: 'file:ballast.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Work with Ballast campaigns, leads, mailboxes, and replies.',
    defaults: {
      name: 'Ballast',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'ballastApi',
        required: true,
      },
    ],
    properties: [
      // ----------------------------------
      //         Resource Selection
      // ----------------------------------
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Campaign',
            value: 'campaign',
            description: 'Manage outreach campaigns and lead assignment',
          },
          {
            name: 'Lead',
            value: 'lead',
            description: 'Add and manage leads and domain suppressions',
          },
          {
            name: 'Mailbox',
            value: 'mailbox',
            description: 'Check connected sending mailboxes and warmup metrics',
          },
          {
            name: 'Unibox',
            value: 'unibox',
            description: 'Manage reply threads, labels, and send replies',
          },
        ],
        default: 'lead',
      },

      // ----------------------------------
      //         Operations: Campaign
      // ----------------------------------
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['campaign'],
          },
        },
        options: [
          {
            name: 'Add Leads to Campaign',
            value: 'addLeads',
            description: 'Assign leads or whole lists to a campaign',
            action: 'Add leads to a campaign',
          },
          {
            name: 'Create',
            value: 'create',
            description: 'Create a draft campaign',
            action: 'Create a campaign',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Get campaign details and schedule settings',
            action: 'Get a campaign',
          },
          {
            name: 'Get Many',
            value: 'getAll',
            description: 'List campaigns with lead progress counters',
            action: 'List campaigns',
          },
          {
            name: 'Pause',
            value: 'pause',
            description: 'Pause a running campaign',
            action: 'Pause a campaign',
          },
          {
            name: 'Resume or Launch',
            value: 'resume',
            description: 'Launch or resume sending for a campaign',
            action: 'Resume a campaign',
          },
        ],
        default: 'addLeads',
      },

      // ----------------------------------
      //         Operations: Lead
      // ----------------------------------
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['lead'],
          },
        },
        options: [
          {
            name: 'Add Suppression',
            value: 'addSuppression',
            description: 'Suppress an email address or whole domain (@company.com)',
            action: 'Add suppression',
          },
          {
            name: 'Create',
            value: 'create',
            description: 'Add a new lead to your workspace',
            action: 'Create a lead',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Get lead details, lists, and custom fields',
            action: 'Get a lead',
          },
          {
            name: 'Get Many',
            value: 'getAll',
            description: 'List leads with optional filtering and search',
            action: 'List leads',
          },
        ],
        default: 'create',
      },

      // ----------------------------------
      //         Operations: Mailbox
      // ----------------------------------
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['mailbox'],
          },
        },
        options: [
          {
            name: 'Get Many',
            value: 'getAll',
            description: 'List connected mailboxes with health and daily limits',
            action: 'List mailboxes',
          },
          {
            name: 'Get Warmup Status',
            value: 'getWarmup',
            description: 'Get warmup health scores and inbox placement rates',
            action: 'Get warmup status',
          },
        ],
        default: 'getAll',
      },

      // ----------------------------------
      //         Operations: Unibox
      // ----------------------------------
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['unibox'],
          },
        },
        options: [
          {
            name: 'Get Threads',
            value: 'getThreads',
            description: 'List reply threads, filtered by label or urgency',
            action: 'List reply threads',
          },
          {
            name: 'Send Reply',
            value: 'reply',
            description: 'Answer a thread from the assigned mailbox',
            action: 'Send a reply',
          },
          {
            name: 'Set Label',
            value: 'setLabel',
            description: 'Apply or clear a label on a reply thread',
            action: 'Set thread label',
          },
        ],
        default: 'getThreads',
      },

      // ==================================
      //        Campaign Fields
      // ==================================
      {
        displayName: 'Campaign ID',
        name: 'campaignId',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            resource: ['campaign'],
            operation: ['addLeads', 'get', 'pause', 'resume'],
          },
        },
        description: 'The unique identifier of the campaign',
      },
      {
        displayName: 'Lead IDs',
        name: 'leadIds',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['campaign'],
            operation: ['addLeads'],
          },
        },
        description: 'Comma-separated list of lead IDs to add to the campaign',
      },
      {
        displayName: 'List IDs',
        name: 'listIds',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['campaign'],
            operation: ['addLeads'],
          },
        },
        description: 'Comma-separated list of lead list IDs to import into the campaign',
      },
      {
        displayName: 'All Leads',
        name: 'allLeads',
        type: 'boolean',
        default: false,
        displayOptions: {
          show: {
            resource: ['campaign'],
            operation: ['addLeads'],
          },
        },
        description: 'Whether to add all workspace leads to this campaign',
      },
      {
        displayName: 'Campaign Name',
        name: 'name',
        type: 'string',
        required: true,
        default: 'Untitled campaign',
        displayOptions: {
          show: {
            resource: ['campaign'],
            operation: ['create'],
          },
        },
        description: 'The name of the new campaign',
      },
      {
        displayName: 'Template ID',
        name: 'templateId',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['campaign'],
            operation: ['create'],
          },
        },
        description: 'Optional sequence template ID to initialize steps and variants',
      },
      {
        displayName: 'Status Filter',
        name: 'status',
        type: 'multiOptions',
        options: [
          { name: 'Draft', value: 'draft' },
          { name: 'Running', value: 'running' },
          { name: 'Paused', value: 'paused' },
          { name: 'Completed', value: 'completed' },
          { name: 'Held', value: 'held' },
          { name: 'Archived', value: 'archived' },
        ],
        default: [],
        displayOptions: {
          show: {
            resource: ['campaign'],
            operation: ['getAll'],
          },
        },
        description: 'Filter campaigns by current sending status',
      },

      // ==================================
      //          Lead Fields
      // ==================================
      {
        displayName: 'Email',
        name: 'email',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            resource: ['lead'],
            operation: ['create'],
          },
        },
        description: 'Recipient email address',
      },
      {
        displayName: 'First Name',
        name: 'firstName',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['lead'],
            operation: ['create'],
          },
        },
        description: 'First name of the lead',
      },
      {
        displayName: 'Last Name',
        name: 'lastName',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['lead'],
            operation: ['create'],
          },
        },
        description: 'Last name of the lead',
      },
      {
        displayName: 'Company',
        name: 'company',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['lead'],
            operation: ['create'],
          },
        },
        description: 'Company or organization name',
      },
      {
        displayName: 'Job Title',
        name: 'title',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['lead'],
            operation: ['create'],
          },
        },
        description: 'Lead job title or role',
      },
      {
        displayName: 'Phone',
        name: 'phone',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['lead'],
            operation: ['create'],
          },
        },
        description: 'Phone number in international or local format',
      },
      {
        displayName: 'Website',
        name: 'website',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['lead'],
            operation: ['create'],
          },
        },
        description: 'Company website URL or domain',
      },
      {
        displayName: 'Country',
        name: 'country',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['lead'],
            operation: ['create'],
          },
        },
        description: 'Two-letter ISO country code (e.g. US, DE, RO)',
      },
      {
        displayName: 'Timezone',
        name: 'timezone',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['lead'],
            operation: ['create'],
          },
        },
        description: 'IANA timezone name (e.g. America/New_York, Europe/Bucharest)',
      },
      {
        displayName: 'List ID',
        name: 'listId',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['lead'],
            operation: ['create'],
          },
        },
        description: 'Optional lead list ID to put this contact in',
      },
      {
        displayName: 'Custom Fields (JSON)',
        name: 'customFields',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['lead'],
            operation: ['create'],
          },
        },
        description: 'Optional JSON object with custom variables (e.g. {"pain_point": "deliverability"})',
      },
      {
        displayName: 'Lead ID',
        name: 'leadId',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            resource: ['lead'],
            operation: ['get'],
          },
        },
        description: 'The unique identifier of the lead',
      },
      {
        displayName: 'Page',
        name: 'page',
        type: 'number',
        default: 1,
        displayOptions: {
          show: {
            resource: ['lead'],
            operation: ['getAll'],
          },
        },
        description: 'Page number for lead pagination',
      },
      {
        displayName: 'Page Size',
        name: 'pageSize',
        type: 'number',
        default: 50,
        displayOptions: {
          show: {
            resource: ['lead'],
            operation: ['getAll'],
          },
        },
        description: 'Number of leads per page (max 100)',
      },
      {
        displayName: 'Search Query',
        name: 'search',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['lead'],
            operation: ['getAll'],
          },
        },
        description: 'Search email, full name, or company',
      },
      {
        displayName: 'Suppression Values',
        name: 'values',
        type: 'string',
        typeOptions: {
          rows: 3,
        },
        required: true,
        default: '',
        displayOptions: {
          show: {
            resource: ['lead'],
            operation: ['addSuppression'],
          },
        },
        description: 'Emails or domain names (one per line or comma-separated, e.g. alex@example.com or @competitor.com)',
      },
      {
        displayName: 'Suppression Reason',
        name: 'reason',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['lead'],
            operation: ['addSuppression'],
          },
        },
        description: 'Reason for the suppression (recorded in workspace audit trail)',
      },

      // ==================================
      //          Unibox Fields
      // ==================================
      {
        displayName: 'View Filter',
        name: 'view',
        type: 'options',
        options: [
          { name: 'All Threads', value: 'all' },
          { name: 'Unread Only', value: 'unread' },
          { name: 'Urgent Only', value: 'urgent' },
        ],
        default: 'all',
        displayOptions: {
          show: {
            resource: ['unibox'],
            operation: ['getThreads'],
          },
        },
        description: 'Filter threads by read status or urgency',
      },
      {
        displayName: 'Thread ID',
        name: 'threadId',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            resource: ['unibox'],
            operation: ['reply', 'setLabel'],
          },
        },
        description: 'The unique identifier of the reply thread',
      },
      {
        displayName: 'Reply Text',
        name: 'text',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        required: true,
        default: '',
        displayOptions: {
          show: {
            resource: ['unibox'],
            operation: ['reply'],
          },
        },
        description: 'Plain text reply sent in-thread from the original mailbox',
      },
      {
        displayName: 'Label ID',
        name: 'labelId',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['unibox'],
            operation: ['setLabel'],
          },
        },
        description: 'Label ID to apply. Leave empty to clear thread labels.',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const credentials = await this.getCredentials('ballastApi');
    const baseUrl = ((credentials.baseUrl as string) || 'https://ballast.to/api/v1').replace(/\/$/, '');

    for (let i = 0; i < items.length; i++) {
      try {
        const resource = this.getNodeParameter('resource', i) as string;
        const operation = this.getNodeParameter('operation', i) as string;
        let responseData: unknown;

        if (resource === 'campaign') {
          if (operation === 'addLeads') {
            const campaignId = this.getNodeParameter('campaignId', i) as string;
            const leadIdsRaw = this.getNodeParameter('leadIds', i, '') as string;
            const listIdsRaw = this.getNodeParameter('listIds', i, '') as string;
            const allLeads = this.getNodeParameter('allLeads', i, false) as boolean;

            const leadIds = leadIdsRaw
              ? leadIdsRaw
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
              : undefined;
            const listIds = listIdsRaw
              ? listIdsRaw
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
              : undefined;

            responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'ballastApi', {
              method: 'POST',
              url: `${baseUrl}/campaigns/${campaignId}/leads`,
              body: {
                ...(leadIds && leadIds.length > 0 ? { leadIds } : {}),
                ...(listIds && listIds.length > 0 ? { listIds } : {}),
                ...(allLeads ? { allLeads: true } : {}),
              },
              json: true,
            });
          } else if (operation === 'create') {
            const name = this.getNodeParameter('name', i) as string;
            const templateId = this.getNodeParameter('templateId', i, '') as string;

            responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'ballastApi', {
              method: 'POST',
              url: `${baseUrl}/campaigns`,
              body: {
                name,
                ...(templateId ? { templateId } : {}),
              },
              json: true,
            });
          } else if (operation === 'pause') {
            const campaignId = this.getNodeParameter('campaignId', i) as string;
            responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'ballastApi', {
              method: 'POST',
              url: `${baseUrl}/campaigns/${campaignId}/pause`,
              json: true,
            });
          } else if (operation === 'resume') {
            const campaignId = this.getNodeParameter('campaignId', i) as string;
            responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'ballastApi', {
              method: 'POST',
              url: `${baseUrl}/campaigns/${campaignId}/launch`,
              json: true,
            });
          } else if (operation === 'get') {
            const campaignId = this.getNodeParameter('campaignId', i) as string;
            responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'ballastApi', {
              method: 'GET',
              url: `${baseUrl}/campaigns/${campaignId}`,
              json: true,
            });
          } else if (operation === 'getAll') {
            const status = this.getNodeParameter('status', i, []) as string[];
            const qs: Record<string, string[]> = {};
            if (status && status.length > 0) {
              qs.status = status;
            }
            responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'ballastApi', {
              method: 'GET',
              url: `${baseUrl}/campaigns`,
              qs,
              json: true,
            });
          }
        } else if (resource === 'lead') {
          if (operation === 'create') {
            const email = this.getNodeParameter('email', i) as string;
            const firstName = this.getNodeParameter('firstName', i, '') as string;
            const lastName = this.getNodeParameter('lastName', i, '') as string;
            const company = this.getNodeParameter('company', i, '') as string;
            const title = this.getNodeParameter('title', i, '') as string;
            const phone = this.getNodeParameter('phone', i, '') as string;
            const website = this.getNodeParameter('website', i, '') as string;
            const country = this.getNodeParameter('country', i, '') as string;
            const timezone = this.getNodeParameter('timezone', i, '') as string;
            const listId = this.getNodeParameter('listId', i, '') as string;
            const customFieldsJson = this.getNodeParameter('customFields', i, '') as string;

            let customFields: Record<string, unknown> | undefined;
            if (customFieldsJson) {
              try {
                customFields =
                  typeof customFieldsJson === 'string'
                    ? JSON.parse(customFieldsJson)
                    : customFieldsJson;
              } catch {
                throw new NodeOperationError(
                  this.getNode(),
                  'Custom fields must be valid JSON.',
                  { itemIndex: i },
                );
              }
            }

            responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'ballastApi', {
              method: 'POST',
              url: `${baseUrl}/leads`,
              body: {
                email,
                ...(firstName ? { firstName } : {}),
                ...(lastName ? { lastName } : {}),
                ...(company ? { company } : {}),
                ...(title ? { title } : {}),
                ...(phone ? { phone } : {}),
                ...(website ? { website } : {}),
                ...(country ? { country } : {}),
                ...(timezone ? { timezone } : {}),
                ...(listId ? { listId } : {}),
                ...(customFields ? { customFields } : {}),
              },
              json: true,
            });
          } else if (operation === 'get') {
            const leadId = this.getNodeParameter('leadId', i) as string;
            responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'ballastApi', {
              method: 'GET',
              url: `${baseUrl}/leads/${leadId}`,
              json: true,
            });
          } else if (operation === 'getAll') {
            const page = this.getNodeParameter('page', i, 1) as number;
            const pageSize = this.getNodeParameter('pageSize', i, 50) as number;
            const search = this.getNodeParameter('search', i, '') as string;

            const qs: Record<string, string | number> = { page, pageSize };
            if (search) qs.search = search;

            responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'ballastApi', {
              method: 'GET',
              url: `${baseUrl}/leads`,
              qs,
              json: true,
            });
          } else if (operation === 'addSuppression') {
            const valuesRaw = this.getNodeParameter('values', i) as string;
            const reason = this.getNodeParameter('reason', i, '') as string;
            const values = valuesRaw
              .split(/[\n,]+/)
              .map((s) => s.trim())
              .filter(Boolean);

            responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'ballastApi', {
              method: 'POST',
              url: `${baseUrl}/suppressions`,
              body: {
                values,
                ...(reason ? { reason } : {}),
              },
              json: true,
            });
          }
        } else if (resource === 'mailbox') {
          if (operation === 'getAll') {
            responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'ballastApi', {
              method: 'GET',
              url: `${baseUrl}/mailboxes`,
              json: true,
            });
          } else if (operation === 'getWarmup') {
            responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'ballastApi', {
              method: 'GET',
              url: `${baseUrl}/warmup`,
              json: true,
            });
          }
        } else if (resource === 'unibox') {
          if (operation === 'getThreads') {
            const view = this.getNodeParameter('view', i, 'all') as string;
            const qs: Record<string, string> = { view };

            responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'ballastApi', {
              method: 'GET',
              url: `${baseUrl}/unibox/threads`,
              qs,
              json: true,
            });
          } else if (operation === 'reply') {
            const threadId = this.getNodeParameter('threadId', i) as string;
            const text = this.getNodeParameter('text', i) as string;

            responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'ballastApi', {
              method: 'POST',
              url: `${baseUrl}/unibox/threads/${threadId}/reply`,
              body: { text },
              json: true,
            });
          } else if (operation === 'setLabel') {
            const threadId = this.getNodeParameter('threadId', i) as string;
            const labelId = this.getNodeParameter('labelId', i, '') as string;

            responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'ballastApi', {
              method: 'POST',
              url: `${baseUrl}/unibox/threads/${threadId}/label`,
              body: { labelId: labelId || null },
              json: true,
            });
          }
        }

        const executionData = this.helpers.constructExecutionMetaData(
          this.helpers.returnJsonArray(responseData as IDataObject | IDataObject[]),
          { itemData: { item: i } },
        );
        returnData.push(...executionData);
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: { error: (error as Error).message },
            pairedItem: { item: i },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
