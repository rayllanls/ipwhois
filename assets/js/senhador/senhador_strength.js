export function updateUI(score) {
    const strengthBar = document.getElementById('strength-bar');
    const feedback = document.getElementById('feedback');
    let color = '#ddd';
    let text = 'Aguardando a senha...';
    let width = 0;

    if (score > 0) {
        width = (score / 6) * 100;
    }

    if (score <= 1) {
        color = '#ff6b6b';
        text = 'Facílimo de adivinhar!';
    } else if (score === 2) {
        color = '#ff9f43';
        text = 'Melhor que nada...';
    } else if (score === 3 || score === 4) {
        color = '#ffe450';
        text = 'Boa, mas pode melhorar!';
    } else if (score === 5) {
        color = '#2ed573';
        text = 'Muito Forte!';
    } else if (score >= 6) {
        color = '#1e90ff';
        text = 'Extremamente Forte!';
    }

    if (strengthBar) {
        strengthBar.style.width = `${width}%`;
        strengthBar.style.backgroundColor = color;
    }
    if (feedback) {
        feedback.textContent = text;
    }
}

export function updatePasswordStrength(password) {
    let score = 0;
    if (password.length > 0) score += 1;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    updateUI(score);
    return score;
}