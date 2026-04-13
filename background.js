const API_KEY = 'YOUR_OPENAI_API_KEY_HERE';
const PRIMARY_MODEL = 'gpt-5.1';
const FALLBACK_MODEL = 'gpt-4o';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.action !== 'ask') return;

    (async () => {
        try {
            const { prompt } = message.payload; // popup sends only the prompt
            const answer = await askWithSingleFallback(prompt);
            sendResponse({ ok: true, answer });
        } catch (e) {
            sendResponse({ ok: false, error: String(e) });
        }
    })();

    return true; // keeps the message channel open for async response
});

async function askWithSingleFallback(prompt) {
    // 1) try primary model
    const first = await callResponsesAPI(prompt, PRIMARY_MODEL);
    if (first.ok) {
        return extractText(first.data);
    }

    // if it's not a model_not_found error, throw immediately
    if (!isModelNotFound(first.text)) {
        throw new Error(`OpenAI API error: ${first.text}`);
    }

    // 2) single fallback to gpt-4o
    const fb = await callResponsesAPI(prompt, FALLBACK_MODEL);
    if (fb.ok) {
        return `[${FALLBACK_MODEL}] ` + extractText(fb.data);
    }

    // if fallback also fails
    throw new Error(`OpenAI API error (fallback failed): ${fb.text}`);
}

function isModelNotFound(errText) {
    try {
        const j = JSON.parse(errText);
        const code = j?.error?.code || j?.error?.type || '';
        return String(code).includes('model_not_found');
    } catch {
        return false;
    }
}

function extractText(data) {
    return data?.output_text ?? (data?.output?.[0]?.content?.[0]?.text ?? '');
}

async function callResponsesAPI(prompt, model) {
    try {
        const resp = await fetch('https://api.openai.com/v1/responses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model,
                input: prompt,
                max_output_tokens: 300
            })
        });

        const text = await resp.text();
        let data = {};
        try { data = JSON.parse(text); } catch {}
        return { ok: resp.ok, text, data };
    } catch (e) {
        return { ok: false, text: String(e), data: {} };
    }
}