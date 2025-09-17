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
                // --- MUDANÇA 1: Adicionada a verificação de vazamento ---
                checkPasswordLeak(password);
            } else {
                updateUI(0);
                const leakStatus = document.getElementById('leak-status');
                if (leakStatus) {
                    // Limpa a mensagem de vazamento quando o campo está vazio
                    leakStatus.textContent = 'Digite uma senha para verificar se ela já foi vazada.';
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
                // Atualiza a força e verifica o vazamento da senha gerada também
                updatePasswordStrength(password);
                checkPasswordLeak(password);
            }
        });
    }
    
    // --- MUDANÇA 2: Lógica aprimorada do botão copiar ---
    if (copyButton && generatedPasswordOutput) {
        copyButton.addEventListener('click', () => {
            // Não faz nada se não houver senha para copiar
            if (!generatedPasswordOutput.value) return; 

            generatedPasswordOutput.select();
            // A document.execCommand('copy') é mais compatível com navegadores antigos
            document.execCommand('copy'); 
            
            // Feedback visual para o usuário
            const originalText = copyButton.textContent;
            copyButton.textContent = 'Copiado!';
            // A cor verde para sucesso. Usei um valor fallback caso a variável CSS não carregue.
            copyButton.style.backgroundColor = 'var(--success, #2ed573)'; 

            // Volta ao normal após 2 segundos
            setTimeout(() => {
                copyButton.textContent = originalText;
                copyButton.style.backgroundColor = ''; // Remove o estilo inline para voltar ao do CSS
            }, 2000);
        });
    }
});