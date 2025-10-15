# Voice AI Assistant Deployment Runbook

## Overview
This runbook will guide you through deploying a Twilio Voice AI Assistant using ConversationRelay. Estimated completion time: **45-60 minutes**.

---

## Pre-Flight Checks

Before starting, ensure you have:

- [ ] **Twilio Account** with Flex provisioned
- [ ] **Node.js v16+** installed (`node --version`)
- [ ] **npm or yarn** installed
- [ ] **ngrok** installed ([download here](https://ngrok.com/download))
- [ ] **OpenAI API Key** ([get one here](https://platform.openai.com/api-keys))
- [ ] Code editor (VS Code recommended)
- [ ] Terminal/command line access

---

## Phase 1: Environment Setup (15 min)

### Step 1: Clone and Install Dependencies

```bash
cd conversation-relay-application-template
npm install
```

**Validation:** You should see `success Saved lockfile` and no error messages.

---

### Step 2: Start ngrok Tunnel

Open a **new terminal window** (keep this running throughout):

```bash
ngrok http 3000
```

**Expected output:**
```
Forwarding    https://[your-unique-id].ngrok.app -> http://localhost:3000
```

**✅ Copy the `https://` URL** - you'll need it in the next steps.

**Troubleshooting:**
- If port 3000 is in use, you'll change this later in `.env` (use `PORT=3001` and update ngrok to `ngrok http 3001`)
- ngrok URL changes each restart on free tier - you'll need to update Twilio webhook if you restart ngrok

---

### Step 3: Configure Environment Variables

Create your environment file:

```bash
cp .env.example .env
```

Open `.env` in your code editor and configure the following **required** variables:

| Variable | Where to Find | Example |
|----------|---------------|---------|
| `NGROK_DOMAIN` | From Step 2 (without `https://`) | `abc123.ngrok.app` |
| `TWILIO_ACCOUNT_SID` | [Twilio Console](https://console.twilio.com) - Account Info | `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `TWILIO_AUTH_TOKEN` | Twilio Console - Account Info (click "View") | `your_auth_token` |
| `TWILIO_WORKFLOW_SID` | Twilio Console > TaskRouter > Workspaces > Flex Task Assignment > Workflows | `WWxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `WELCOME_GREETING` | Your choice | `Hello! I'm your AI assistant. How can I help you today?` |
| `OPENAI_API_KEY` | [OpenAI Platform](https://platform.openai.com/api-keys) | `sk-...` |
| `TWILIO_VOICE_INTELLIGENCE_SID` | Twilio Console > Voice Intelligence > Services | `GAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | 

**Optional Google integrations** (can skip for initial testing):
- `GOOGLESHEETS_SPREADSHEET_ID`
- `GOOGLE_CALENDAR_ID`
- `GOOGLE_SERVICE_ACCOUNT_KEY`

**Validation:** No missing required values in `.env` file.

---

## Phase 2: Twilio Configuration (10 min)

### Step 4: Configure Phone Number Webhook

1. Go to [Twilio Console > Phone Numbers > Manage > Active Numbers](https://console.twilio.com/us1/develop/phone-numbers/manage/incoming)
2. Select an existing number or **Buy a Number**
3. Scroll to **Voice Configuration**
4. Set **"A call comes in"**:
   - Webhook: `https://[your-ngrok-domain].ngrok.app/api/incoming-call`
   - HTTP Method: `POST`
5. Click **Save configuration**

**Validation:** Configuration saved without errors.

---

## Phase 3: Application Launch (5 min)

### Step 5: Start Development Server

In your original terminal (not the ngrok one):

```bash
npm run dev
```

**Expected output:**
```
Server running on port 3000
WebSocket server initialized
```

**Troubleshooting:**
- **Port in use error:** Change `PORT=3001` in `.env`, restart ngrok with `ngrok http 3001`, update Twilio webhook
- **Missing env vars:** Double-check all required variables in `.env`

---

## Phase 4: Testing (10 min)

### Step 6: Test Voice AI Assistant

1. **Call your Twilio phone number** from your mobile phone
2. **Expected behavior:**
   - You hear the welcome greeting
   - AI assistant responds to your questions
   - Conversation flows naturally

**Test scenarios:**
- Ask a general question: "What's the weather?"
- Request human handoff: "I need to speak to an agent"
- Test tools: "Check my card delivery status"

**Troubleshooting:**
- **No answer:** Check Twilio webhook URL matches your current ngrok domain
- **Connection drops immediately:** Check server logs in terminal for errors
- **AI not responding:** Verify `OPENAI_API_KEY` is valid and has credits

---

## Phase 5: Verification Checklist

- [ ] ngrok tunnel running and accessible
- [ ] Development server running without errors
- [ ] Phone call connects successfully
- [ ] Welcome greeting plays
- [ ] AI responds to basic questions
- [ ] Can request human handoff (transfers to Flex)

---

## Quick Reference

### Important URLs
- **Incoming call webhook:** `https://[your-ngrok-domain].ngrok.app/api/incoming-call`
- **Action webhook:** `https://[your-ngrok-domain].ngrok.app/api/action`

### Log Files
Monitor these terminals:
1. **ngrok terminal:** Shows incoming webhook requests
2. **Server terminal:** Shows application logs and errors

### Stop/Restart
```bash
# Stop server: Ctrl+C in server terminal
# Stop ngrok: Ctrl+C in ngrok terminal

# Restart server
npm run dev

# Restart ngrok (will generate NEW URL - update Twilio webhook!)
ngrok http 3000
```

---

## Key Customization Points

This section highlights where to make common customizations. Each entry shows the **file location** and **what you can change**.

### 🎯 AI Prompts & Behavior

**System Prompt** - [src/prompts/systemPrompt.ts](src/prompts/systemPrompt.ts)
- **What:** Core AI instructions, personality, and guidelines
- **Examples:**
  - Change AI name and role (line 4)
  - Modify conversation rules (lines 6-19)
  - Adjust function call behavior (lines 25-60)
- **Tip:** This is your primary control for AI behavior

**Additional Context** - [src/prompts/additionalContext.ts](src/prompts/additionalContext.ts)
- **What:** Dynamic context injected into each conversation (date/time, user data)
- **Use:** Add session-specific information the AI needs

---

### 🌍 Language Configuration

**Language Options** - [src/languageOptions.ts](src/languageOptions.ts)
- **What:** Available languages, voices, and TTS/transcription providers
- **Current languages:** Portuguese (ElevenLabs), Spanish (ElevenLabs), English (Google)
- **How to add:** Copy existing language block, modify:
  - `locale_code`: Language locale (e.g., "fr-FR")
  - `voice`: Provider-specific voice ID
  - `ttsProvider`: "google" or "ElevenLabs"
  - `transcriptionProvider`: "google" or "Deepgram"

**Default Language** - [src/prompts/systemPrompt.ts:1](src/prompts/systemPrompt.ts#L1)
- **What:** Default conversation language
- **Current:** Brazilian Portuguese (pt-BR)
- **Change:** Edit line 1 to set different default

**Switch Language Tool** - [src/services/llm/tools/switchLanguage.ts](src/services/llm/tools/switchLanguage.ts)
- **What:** Allows AI to switch languages mid-conversation
- **Config:** [src/services/llm/websocketService.ts:120-136](src/services/llm/websocketService.ts#L120-L136)

---

### 🔊 Interruption Handling

**Interruption Logic** - [src/services/llm/websocketService.ts:38-49](src/services/llm/websocketService.ts#L38-L49)
- **What:** How the system handles when users interrupt the AI
- **Key behaviors:**
  - Line 41: Sets `userInterrupted` flag
  - Line 42: Waits for post-interruption prompt
  - Lines 45-48: Tells AI what it said before being interrupted
- **Customize:** Modify the system message sent to AI (line 47)

**Resume After Interruption** - [src/services/llm/websocketService.ts:20-30](src/services/llm/websocketService.ts#L20-L30)
- **What:** Controls when new prompts are accepted
- **Line 22:** Checks if stream is active or awaiting post-interrupt prompt

---

### 🔢 DTMF (Keypad Input)

**DTMF Processing** - [src/services/llm/dtmfHelper.ts](src/services/llm/dtmfHelper.ts)
- **What:** Maps phone keypad digits to words the AI understands
- **Current mapping (lines 3-17):**
  - `1` → "One"
  - `*` → "Star"
  - `#` → "Pound"
- **Customize:** Change words or add new mappings for your language

**DTMF Integration** - [src/services/llm/websocketService.ts:51-57](src/services/llm/websocketService.ts#L51-L57)
- **What:** Sends DTMF input to AI as system message
- **Use case:** AI can ask users to "press 1 for yes, 2 for no"

---

### 🛠️ Tools & Integrations

**Tool Definitions** - [src/services/llm/tools/](src/services/llm/tools/)
- **What:** Functions the AI can call to perform actions
- **Examples:**
  - [humanAgentHandoff.ts](src/services/llm/tools/humanAgentHandoff.ts) - Transfer to Flex agent
  - [checkCardDelivery.ts](src/services/llm/tools/checkCardDelivery.ts) - Check delivery status
  - [bookDriver.ts](src/services/llm/tools/bookDriver.ts) - Schedule appointments
  - [identifyUser.ts](src/services/llm/tools/identifyUser.ts) - User lookup

**Add New Tool:**
1. Create new file in `src/services/llm/tools/`
2. Export tool definition (OpenAI function format)
3. Export execute function
4. Import in [src/services/llm/tools/index.ts](src/services/llm/tools/index.ts)

---

### 📊 Mock Data

**Test Data** - [src/data/mock-data.ts](src/data/mock-data.ts)
- **What:** Sample data for testing tools (users, orders, schedules)
- **Replace:** Connect to real databases/APIs in tool implementations

---

### 🔗 External Integrations

**Google Sheets/Calendar** - [src/config.ts:62-63](src/config.ts#L62-L63)
- **What:** Configuration for Google service integrations
- **Required env vars:**
  - `GOOGLESHEETS_SPREADSHEET_ID`
  - `GOOGLE_CALENDAR_ID`
  - `GOOGLE_SERVICE_ACCOUNT_KEY`

**Conversation Service** - [src/config.ts:62](src/config.ts#L62)
- **What:** Twilio Conversations service for Flex integration
- **Env var:** `TWILIO_CONVERSATION_SERVICE_SID`

---

## Next Steps

You've successfully deployed the Voice AI Assistant!

For customization topics:
- Modifying the AI prompt and behavior
- Adding custom tools and integrations
- Configuring Google Sheets/Calendar integration
- Advanced Flex integration
- Production deployment considerations

See [README.md](README.md) for detailed technical reference.

