document.addEventListener('DOMContentLoaded', () => {
    // --- LÓGICA DAS ABAS ---
    const tabs = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(target).classList.add('active');
        });
    });

    // --- LÓGICA DA CALCULADORA DE HASH ---
    const hashInput = document.getElementById('hash-input');
    const hashOutputs = {
        md5: document.getElementById('md5-output'),
        sha1: document.getElementById('sha1-output'),
        sha256: document.getElementById('sha256-output'),
        sha384: document.getElementById('sha384-output'),
        sha512: document.getElementById('sha512-output'),
    };
    const copyHashButtons = document.querySelectorAll('.copy-hash-btn');

    function bufferToHex(buffer) { /* ... (função auxiliar) ... */ }
    async function calculateHashes(text) { /* ... (código da calculadora de hash) ... */ }
    
    // (Cole o código completo da calculadora de hash da resposta anterior aqui para manter tudo)
    // Para ser breve, estou omitindo a repetição, mas certifique-se de que ele esteja aqui.


    // --- NOVA LÓGICA DO CODIFICADOR / DECODIFICADOR ---

    const encoderInput = document.getElementById('encoder-input');
    const encoderOutput = document.getElementById('encoder-output');
    const encodingFormat = document.getElementById('encoding-format');
    const encodingDirection = document.getElementsByName('encoding-direction');
    const copyEncoderOutputBtn = document.getElementById('copy-encoder-output');

    // Função para ROT13
    function rot13(text) {
        return text.replace(/[a-zA-Z]/g, function (c) {
            return String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
        });
    }

    // Função principal que realiza a conversão
    function runEncoder() {
        const text = encoderInput.value;
        const format = encodingFormat.value;
        const direction = document.querySelector('input[name="encoding-direction"]:checked').value;

        if (!text) {
            encoderOutput.value = '';
            return;
        }

        try {
            let result = '';
            switch (format) {
                case 'base64':
                    result = direction === 'encode' ? btoa(text) : atob(text);
                    break;
                case 'url':
                    result = direction === 'encode' ? encodeURIComponent(text) : decodeURIComponent(text);
                    break;
                case 'rot13':
                    // ROT13 é sua própria inversa, então a direção não importa
                    result = rot13(text);
                    break;
            }
            encoderOutput.value = result;
        } catch (error) {
            console.error("Erro de conversão:", error);
            encoderOutput.value = "Erro: Entrada inválida para decodificação.";
        }
    }

    // Eventos que disparam a conversão
    encoderInput.addEventListener('input', runEncoder);
    encodingFormat.addEventListener('change', runEncoder);
    encodingDirection.forEach(radio => radio.addEventListener('change', runEncoder));

    // Lógica do botão de copiar
    copyEncoderOutputBtn.addEventListener('click', () => {
        if (encoderOutput.value) {
            navigator.clipboard.writeText(encoderOutput.value).then(() => {
                const originalText = copyEncoderOutputBtn.innerHTML;
                copyEncoderOutputBtn.innerHTML = 'Copiado!';
                setTimeout(() => {
                    copyEncoderOutputBtn.innerHTML = originalText;
                }, 2000);
            }).catch(err => console.error("Falha ao copiar:", err));
        }
    });

    // (Lógica da Calculadora de Hash da resposta anterior deve ser incluída aqui)
    function bufferToHex(buffer) {
        return Array.from(new Uint8Array(buffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    async function calculateHashes(text) {
        if (!text) {
            for (const key in hashOutputs) { hashOutputs[key].value = ''; }
            return;
        }
        try {
            hashOutputs.md5.value = CryptoJS.MD5(text).toString();
            const encoder = new TextEncoder();
            const data = encoder.encode(text);
            const [sha1Buffer, sha256Buffer, sha384Buffer, sha512Buffer] = await Promise.all([
                crypto.subtle.digest('SHA-1', data),
                crypto.subtle.digest('SHA-256', data),
                crypto.subtle.digest('SHA-384', data),
                crypto.subtle.digest('SHA-512', data)
            ]);
            hashOutputs.sha1.value = bufferToHex(sha1Buffer);
            hashOutputs.sha256.value = bufferToHex(sha256Buffer);
            hashOutputs.sha384.value = bufferToHex(sha384Buffer);
            hashOutputs.sha512.value = bufferToHex(sha512Buffer);
        } catch (error) {
            console.error("Erro ao calcular hashes:", error);
            for (const key in hashOutputs) { hashOutputs[key].value = 'Erro no cálculo'; }
        }
    }

    if (hashInput) {
        hashInput.addEventListener('input', () => calculateHashes(hashInput.value));
    }

    copyHashButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const targetInput = document.getElementById(targetId);
            if (targetInput && targetInput.value) {
                navigator.clipboard.writeText(targetInput.value).then(() => {
                    const originalIcon = button.innerHTML;
                    button.innerHTML = '<i class="fas fa-check"></i>';
                    setTimeout(() => { button.innerHTML = originalIcon; }, 1500);
                }).catch(err => console.error("Falha ao copiar:", err));
            }
        });
    });
});