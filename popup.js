// Renders a message in the answer div
function renderMsg(msg) {
    document.getElementById('answer').textContent = msg;
}

async function ask() {
    const q = document.getElementById('question').value.trim();
    if (!q) return renderMsg('Please enter a question first.');
    renderMsg('Thinking...');

    chrome.runtime.sendMessage(
        { action: 'ask', payload: { prompt: systemPrompt(q) } },
        (resp) => {
            if (chrome.runtime.lastError) {
                return renderMsg('❌ ' + chrome.runtime.lastError.message);
            }
            if (!resp?.ok) {
                return renderMsg('❌ ' + (resp?.error || 'Unknown error'));
            }
            renderMsg(resp.answer || 'No answer received');
        }
    );
}

// Builds the system prompt for the AI – edit this to fit your subject
function systemPrompt(question) {
    return `
Si expert na predmet Manažment informačných systémov (MIS).

Odpovedaj výhradne podľa tém typických pre MIS:
- stratégia IS/IT, úloha IS v organizácii,
- IT governance (COBIT, ITIL, ISO 20000),
- projektové riadenie IS/IT (PMI, PRINCE2),
- architektúra IS, ERP/CRM/SCM,
- riadenie prevádzky IS, SLA, incident/problem management,
- bezpečnosť IS (CIA), riadenie rizík, audit IS,
- ekonomika IS, TCO, ROI.

Pravidlá odpovede:
1. Odpovedz IBA úplným textom správnej možnosti presne tak, ako je uvedená v otázke.
2. Ak možnosti nie sú označené písmenami, nič nepriraďuj — len vyber správny text.
3. Ak ide o pravda/nepravda, odpovedz iba „PRAVDA“ alebo „NEPRAVDA“.
4. Ak používateľ nenapíše inak, predpokladaj, že existuje len **jedna** správna odpoveď.
5. Bez vysvetlenia, bez rozboru, bez odôvodnenia. Iba samotná správna odpoveď.

Odpovedz iba jednou vetou alebo jednou možnosťou, nič navyše.

Otázka: ${question}
`;
}


document.getElementById('ask').addEventListener('click', ask);
