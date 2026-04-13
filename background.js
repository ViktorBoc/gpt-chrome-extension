const API_KEY = 'YOUR_OPENAI_API_KEY_HERE';
const PRIMARY_MODEL = 'gpt-5.1';
const FALLBACK_MODEL = 'gpt-4o';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.action !== 'ask') return;

    (async () => {
        try {
            const { prompt } = message.payload; // popup posiela len prompt
            const answer = await askWithSingleFallback(prompt);
            sendResponse({ ok: true, answer });
        } catch (e) {
            sendResponse({ ok: false, error: String(e) });
        }
    })();

    return true; // nechá kanál otvorený pre async odpoveď
});

async function askWithSingleFallback(prompt) {
    // 1) skús primárny model
    const first = await callResponsesAPI(prompt, PRIMARY_MODEL);
    if (first.ok) {
        return extractText(first.data);
    }

    // ak to NIE JE model_not_found, hneď vyhoď chybu
    if (!isModelNotFound(first.text)) {
        throw new Error(`OpenAI API error: ${first.text}`);
    }

    // 2) jediný fallback na gpt-4o
    const fb = await callResponsesAPI(prompt, FALLBACK_MODEL);
    if (fb.ok) {
        return `[${FALLBACK_MODEL}] ` + extractText(fb.data);
    }

    // ak zlyhá aj fallback
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
                // držíme telo jednoduché kvôli kompatibilite
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