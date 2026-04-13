# GPT-5 Helper – Chrome Extension

A lightweight Chrome extension that lets you ask questions directly from your browser using OpenAI's GPT-5.1 model via the Responses API. Designed for quick lookups during quizzes, exams, or any situation where you need a fast, concise answer.

## What it does

- Opens as a popup from the Chrome toolbar
- You paste a question (e.g. a quiz or test question with answer options)
- The extension sends it to OpenAI and returns only the correct answer — no fluff, no explanation
- If GPT-5.1 is unavailable, it automatically falls back to GPT-4o

The built-in system prompt is tuned for **Management Information Systems (MIS)** topics (IT governance, ERP, ITIL, risk management, etc.), but you can easily swap it out in `popup.js` for any subject.

## Use cases

- Quickly checking answers during online quizzes or e-learning platforms
- Getting one-line answers to multiple-choice questions
- A starting template for any subject-specific AI browser assistant

## Setup

1. Clone this repo
2. Open `background.js` and replace `YOUR_OPENAI_API_KEY_HERE` with your actual [OpenAI API key](https://platform.openai.com/api-keys)
3. Open Chrome and go to `chrome://extensions/`
4. Enable **Developer mode** (top right)
5. Click **Load unpacked** and select this project folder

## Project structure

```
├── manifest.json   # Extension config (MV3)
├── background.js   # Service worker – handles OpenAI API calls
├── popup.html      # Extension popup UI
└── popup.js        # Popup logic + system prompt
```
## Customization

The system prompt in `popup.js` is currently tuned for a university course on
**Management Information Systems (MIS)**. To adapt it for any other subject,
open `popup.js` and edit the `systemPrompt()` function - replace the topic list
and rules with whatever context fits your use case.

## Notes

- Requires an OpenAI account with access to GPT-5.1 (or falls back to GPT-4o)
- The API key is used client-side - do **not** share your built extension or commit your key
- Max response length is set to 300 tokens (configurable in `background.js`)
