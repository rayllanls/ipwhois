import { updateUI, updatePasswordStrength } from './senhador_strength.js';
import { generateRandomPassword } from './senhador_generator.js';
import { generateDeterministicPassword } from './senhador_deterministic.js';
import { checkPasswordLeak } from './senhador_leak.js';

document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password-input');
    const togglePassword = document.getElementById('toggle-password');
    const generatorTypeRadios = document.getElementsByName('generator-type');
    const randomOptions = document.getElementById('random-options');
    const deterministicOptions = document.getElementById('deterministic-options');

    const generateButtonUnified = document.getElementById('generate-button-unified');
    const generatedPasswordOutput = document.getElementById('generated-password-output');
    const copyButton = document.getElementById('copy-button');

    // --- CORREÇÃO AQUI ---
    // Limpa os campos ao carregar a página para evitar cache
    if (generatedPasswordOutput) {
        generatedPasswordOutput.value = '';
    }
    // -----------------------

    generatorTypeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'random') {
                randomOptions.style.display = 'block';
                deterministicOptions.style.display = 'none';
            } else {
                randomOptions.style.display = 'none';
                deterministicOptions.style.display = 'block';
            }
        });
    });

    if (passwordInput) {
        passwordInput.addEventListener('input', async () => {
            const password = passwordInput.value;
            if (password.length > 0) {
                updatePasswordStrength(password);
            } else {
                updateUI(0);
                const leakStatus = document.getElementById('leak-status');
                if (leakStatus) {
                    leakStatus.textContent = 'Aguardando...';
                    leakStatus.classList.remove('safe', 'pwned');
                }
            }
        });
    }

    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.classList.toggle('fa-eye');
            togglePassword.classList.toggle('fa-eye-slash');
        });
    }

    if (generateButtonUnified) {
        generateButtonUnified.addEventListener('click', async () => {
            let password = '';
            const selectedGenerator = document.querySelector('input[name="generator-type"]:checked').value;

            if (selectedGenerator === 'random') {
                password = generateRandomPassword();
            } else {
                password = await generateDeterministicPassword();
            }

            if (password) {
                generatedPasswordOutput.value = password;
                updatePasswordStrength(password);
            }
        });
    }
    
    if (copyButton && generatedPasswordOutput) {
        copyButton.addEventListener('click', () => {
            generatedPasswordOutput.select();
            document.execCommand('copy');
            alert("Senha copiada para a área de transferência!");
        });
    }
});