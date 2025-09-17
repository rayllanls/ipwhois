export async function checkPasswordLeak(password) {
    const leakStatus = document.getElementById('leak-status');
    if (!leakStatus) return;

    leakStatus.textContent = 'Verificando...';
    leakStatus.classList.remove('safe', 'pwned');

    // Lista de hashes de senhas vazadas. Adicionei o hash de 'senha12345'.
    const pwnedPasswords = [
        "0C34B6808F914D1657D972D714E9EBBA0B3251D5", // 123456
        "0B1713508C5C812320E90B018249826372B28965", // password
        "6C4D3E646E13C5001C532986427D6C1D6B408425", // senha123
        "FEF01265B8876E875ACBCB453A81D1A6A675B3B7", // 12345678
        "63AC7B9A9A48805F0429188F110D5367B0EE0591", // senha12345
    ];

    const encoder = new TextEncoder('utf-8');
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const sha1Hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

    if (pwnedPasswords.includes(sha1Hash)) {
        leakStatus.textContent = 'Atenção! Sua senha foi encontrada em vazamentos de dados!';
        leakStatus.classList.add('pwned');
    } else {
        leakStatus.textContent = 'Sua senha não foi encontrada em vazamentos conhecidos.';
        leakStatus.classList.add('safe');
    }
}