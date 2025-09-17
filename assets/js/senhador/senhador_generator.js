export function generateRandomPassword() {
    const includeUppercase = document.getElementById('include-uppercase');
    const includeNumbers = document.getElementById('include-numbers');
    const includeSymbols = document.getElementById('include-symbols');
    const passwordLength = document.getElementById('password-length');

    const length = parseInt(passwordLength.value);
    let charset = "abcdefghijklmnopqrstuvwxyz";
    if (includeUppercase && includeUppercase.checked) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeNumbers && includeNumbers.checked) charset += "0123456789";
    if (includeSymbols && includeSymbols.checked) charset += "!@#$%^&*()-_=+[]{}|;:,.<>/?";
    let password = "";
    const randomValues = new Uint32Array(length);
    window.crypto.getRandomValues(randomValues);
    for (let i = 0; i < length; i++) {
        password += charset.charAt(randomValues[i] % charset.length);
    }
    return password;
}