document.getElementById('proofread-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const text = document.getElementById('text').value;
    const guidelines = JSON.stringify({
        "pronouns": {
            "subject": "he",
            "object": "him",
            "possessiveAdjective": "his",
            "possessivePronoun": "his",
            "reflexive": "himself"
        },
        "tense": "present",
        "sentenceStructure": "simple",
        "tone": "formal",
        "spelling": "British English"
    });

    const response = await fetch('/proofread', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, guidelines })
    });

    const result = await response.json();
    document.getElementById('result').innerText = result.proofreadText;
});
