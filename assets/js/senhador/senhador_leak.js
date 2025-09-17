// assets/js/senhador/senhador_leak.js

export async function checkPasswordLeak(password) {
    const leakStatus = document.getElementById('leak-status');
    if (!leakStatus) return;

    leakStatus.textContent = 'Verificando vazamento...';
    leakStatus.classList.remove('safe', 'pwned');

    try {
        // 1. Criar o hash SHA-1 da senha
        const encoder = new TextEncoder('utf-8');
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-1', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const sha1Hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

        // 2. Dividir o hash para a API
        const prefix = sha1Hash.substring(0, 5);
        const suffix = sha1Hash.substring(5);

        // 3. Consultar a API do HIBP
        const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
        if (!response.ok) {
            throw new Error('Erro ao contatar a API de verificação de vazamento.');
        }
        const text = await response.text();

        // 4. Verificar se o sufixo da nossa senha está na resposta
        const hashes = text.split('\r\n').map(line => line.split(':')[0]);
        const isPwned = hashes.includes(suffix);

        if (isPwned) {
            leakStatus.textContent = 'Atenção! Esta senha foi encontrada em vazamentos de dados!';
            leakStatus.classList.add('pwned');
        } else {
            leakStatus.textContent = 'Ótimo! Esta senha não foi encontrada em vazamentos conhecidos.';
            leakStatus.classList.add('safe');
        }

    } catch (error) {
        leakStatus.textContent = 'Não foi possível verificar a senha. Tente novamente mais tarde.';
        console.error('Erro na verificação de vazamento:', error);
    }
}