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

    const encoder = new TextEncoder();
    const combined = encoder.encode(masterPassword + serviceName);
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}|;:,.<>/?";
    let generatedPassword = "";
    for (let i = 0; i < 16; i++) {
        const index = parseInt(hashHex.substr(i * 2, 2), 16) % charset.length;
        generatedPassword += charset[index];
    }
    
    return generatedPassword;
}