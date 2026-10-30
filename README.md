# n8n-nodes-ballast

Official [n8n](https://n8n.io) community node for [Ballast](https://ballast.to).

Connect cold email sequences, lead lists, mailbox warmup health, and real-time Unibox reply events directly to your automated workflows.

---

## Installation

### In n8n UI
1. Go to **Settings > Community Nodes** in your n8n workspace.
2. Click **Install a community node**.
3. Enter `n8n-nodes-ballast` as the npm package name.
4. Agree to the risks of community nodes and click **Install**.

### Self-hosted CLI / Docker
In your n8n root directory or inside your Docker volume:

```bash
npm install n8n-nodes-ballast
```

Restart your n8n instance once the package is installed.

---

## Credentials

The node authenticates with a Ballast workspace API key.

1. Open your workspace settings at [ballast.to/settings/api-keys](https://ballast.to/settings/api-keys).
2. Generate an API key (starts with `bl_`).
3. In n8n, create a new **Ballast API** credential and paste your API key.
4. Base URL defaults to `https://ballast.to/api/v1`. Keep the default unless you are routing through a proxy.

---

## Nodes

### 1. Ballast Trigger

Registers a signed webhook on Ballast and starts your workflow when chosen events fire.

Supported trigger events:
* **Lead Replied (`lead.replied`)**: A recipient answered a campaign email (out-of-office and auto-replies excluded).
* **Reply Labeled (`lead.labeled`)**: A reply received a category from AI, a rule, or an operator (Interested, Not now, Out of office, Wrong person, Unsubscribe).
* **Lead Bounced (`lead.bounced`)**: An email to a lead bounced hard.
* **Lead Unsubscribed (`lead.unsubscribed`)**: A lead opted out via header, link, or reply.
* **Spam Complaint (`lead.complained`)**: Recipient provider reported an email as spam.
* **Lead Won (`lead.won`)**: A lead was marked won in the workspace.
* **Campaign Paused (`campaign.paused`)**: A campaign stopped sending because of an operator, a label trigger, a breaker trip, or its end date.

### 2. Ballast (Action Node)

Perform operations across your Ballast workspace.

#### Campaign
* **Add Leads to Campaign**: Assign leads or whole lists to a campaign sequence.
* **Create**: Create a new draft campaign, with optional sequence template.
* **Get**: Retrieve campaign settings, step sequence, and schedule.
* **Get Many**: List workspace campaigns with lead progress counters.
* **Pause**: Pause a running campaign immediately.
* **Resume or Launch**: Resume a paused campaign or launch a draft.

#### Lead
* **Create**: Add a new contact with email, company, title, geo, and custom fields.
* **Get**: Retrieve lead details, lists, and assigned labels.
* **Get Many**: List workspace leads with pagination and search.
* **Add Suppression**: Suppress an email or an entire domain (`@competitor.com`) so no mailbox sends to it.

#### Mailbox
* **Get Many**: List connected sending mailboxes with sending limits, ramp-up stage, and domain DNS health.
* **Get Warmup Status**: Retrieve mailbox warmup health scores and inbox placement ratios.

#### Unibox
* **Get Threads**: List conversation threads filtered by read state or urgency.
* **Send Reply**: Answer a thread directly from the original mailbox, keeping headers and message history intact.
* **Set Label**: Categorize a thread or clear existing labels.

---

## Common Workflows

### 1. Ingest Scraped Leads into a Sequence
```
Apollo / Clay Scraper -> LLM Enrichment -> Filter Qualified -> Ballast: Add Lead -> Ballast: Add Leads to Campaign
```

### 2. Auto-route Positive Replies to CRM
```
Ballast Trigger (Reply Labeled: Interested) -> Slack Alert / CRM Deal Creation (HubSpot, Pipedrive)
```

### 3. Safety Circuit Breaker on Bounce
```
Ballast Trigger (Lead Bounced) -> Verify List Source -> Ballast: Add Suppression
```

---

## Development

```bash
git clone https://github.com/useballast/n8n-nodes-ballast.git
cd n8n-nodes-ballast
npm install --ignore-scripts
npm run build
```

Link locally to your running n8n instance:

```bash
npm link
cd ~/.n8n/custom
npm link n8n-nodes-ballast
```

---

## License

[MIT](LICENSE)
