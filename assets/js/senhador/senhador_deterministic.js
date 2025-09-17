// assets/js/senhador/senhador_deterministic.js

export async function generateDeterministicPassword() {
    const masterPasswordInput = document.getElementById('master-password-input');
    const serviceNameInput = document.getElementById('service-name-input');

    if (!masterPasswordInput || !serviceNameInput) return;

    const masterPassword = masterPasswordInput.value;
    const serviceName = serviceNameInput.value;

    if (!masterPassword || !serviceName) {
        alert("Por favor, preencha a senha-mestra e o nome do serviço.");
        return;
    }

    try {
        const encoder = new TextEncoder();
        
        // 1. Importa a senha mestra como uma chave criptográfica
        const keyMaterial = await crypto.subtle.importKey(
            "raw",
            encoder.encode(masterPassword),
            { name: "PBKDF2" },
            false,
            ["deriveBits"]
        );

        // 2. Define os parâmetros do PBKDF2
        const salt = encoder.encode(serviceName); // O nome do serviço é um ótimo "sal"
        const iterations = 100000; // Número de iterações, aumenta a segurança
        const keyLength = 256; // Comprimento da chave derivada em bits (256 bits = 32 bytes)

        // 3. Deriva os bits usando PBKDF2
        const derivedBits = await crypto.subtle.deriveBits(
            {
                name: "PBKDF2",
                salt: salt,
                iterations: iterations,
                hash: "SHA-256",
            },
            keyMaterial,
            keyLength
        );

        // 4. Converte os bits derivados em uma senha legível
        const hashArray = Array.from(new Uint8Array(derivedBits));
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}|;:,.<>?";
        
        let generatedPassword = "";
        for (let i = 0; i < 16; i++) { // Gera uma senha de 16 caracteres
            // Usa 2 bytes para ter um intervalo maior de valores e evitar viés
            const index = (hashArray[i*2] << 8) | hashArray[i*2 + 1];
            generatedPassword += charset[index % charset.length];
        }
        
        return generatedPassword;

    } catch (error) {
        console.error("Erro ao gerar senha determinística:", error);
        alert("Ocorreu um erro. Verifique o console para mais detalhes.");
        return "";
    }
}