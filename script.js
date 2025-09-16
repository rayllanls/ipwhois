document.addEventListener('DOMContentLoaded', () => {
    const ipInput = document.getElementById('ipInput');
    const searchButton = document.getElementById('searchButton');
    const clearButton = document.getElementById('clearButton');
    const copyButton = document.getElementById('copyButton');
    const resultDiv = document.getElementById('result');

    // Attach event listeners
    searchButton.addEventListener('click', buscarDadosIP);
    clearButton.addEventListener('click', limparCampos);
    copyButton.addEventListener('click', copiarResultado);
    ipInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            buscarDadosIP();
        }
    });

    /**
     * Searches for IP or domain information.
     */
    async function buscarDadosIP() {
        const input = ipInput.value.trim();
        resultDiv.innerHTML = '<div class="spinner"></div>';
        resultDiv.classList.remove('hidden', 'error');
        copyButton.classList.add('hidden');

        try {
            let ipToSearch = await resolveInput(input);
            const data = await fetchIpData(ipToSearch);
            displayResults(data);
        } catch (error) {
            displayError(error.message);
        }
    }

    /**
     * Resolves a domain name to an IP address or validates an IP.
     * @param {string} input - The IP or domain to resolve.
     * @returns {Promise<string>} The resolved IP address.
     */
    async function resolveInput(input) {
        const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,6})|:)|:((:[0-9a-fA-F]{1,7})|:)$/;
        const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;

        if (ipv4Regex.test(input) || ipv6Regex.test(input)) {
            return input;
        }

        if (domainRegex.test(input)) {
            const dnsResponse = await fetch(`https://dns.google/resolve?name=${input}`);
            const dnsData = await dnsResponse.json();
            if (dnsData.Status !== 0 || !dnsData.Answer || dnsData.Answer.length === 0) {
                throw new Error('Não foi possível resolver o nome de domínio para um IP.');
            }
            return dnsData.Answer[0].data;
        }

        throw new Error('Por favor, digite um endereço IP ou um nome de domínio válido.');
    }

    /**
     * Fetches IP information from the ipinfo.io API.
     * @param {string} ip - The IP address to fetch data for.
     * @returns {Promise<object>} The IP data object.
     */
    async function fetchIpData(ip) {
        const response = await fetch(`https://ipinfo.io/${ip}/json`);
        if (!response.ok) {
            throw new Error('IP não encontrado ou erro na API.');
        }
        return response.json();
    }

    /**
     * Displays the fetched IP data on the page.
     * @param {object} data - The IP data object.
     */
    function displayResults(data) {
        let html = `
            <div class="data-item"><span class="data-label">IP:</span> <span class="data-value">${data.ip || 'N/A'}</span></div>
            <div class="data-item"><span class="data-label">Host:</span> <span class="data-value">${data.hostname || 'N/A'}</span></div>
            <div class="data-item"><span class="data-label">Cidade:</span> <span class="data-value">${data.city || 'N/A'}</span></div>
            <div class="data-item"><span class="data-label">Região:</span> <span class="data-value">${data.region || 'N/A'}</span></div>
            <div class="data-item"><span class="data-label">País:</span> <span class="data-value">${data.country || 'N/A'} (${data.country_name || 'N/A'})</span></div>
            <div class="data-item"><span class="data-label">Localização (Lat/Lon):</span> <span class="data-value">${data.loc || 'N/A'}</span></div>
            <div class="data-item"><span class="data-label">Organização:</span> <span class="data-value">${data.org || 'N/A'}</span></div>
            <div class="data-item"><span class="data-label">Provedor:</span> <span class="data-value">${data.asn?.name || 'N/A'}</span></div>
            <div class="data-item"><span class="data-label">Código Postal:</span> <span class="data-value">${data.postal || 'N/A'}</span></div>
            <div class="data-item"><span class="data-label">Fuso Horário:</span> <span class="data-value">${data.timezone || 'N/A'}</span></div>
        `;
        resultDiv.innerHTML = html;
        copyButton.classList.remove('hidden');
    }

    /**
     * Displays an error message.
     * @param {string} message - The error message.
     */
    function displayError(message) {
        resultDiv.innerHTML = `<p class="text-red-600">Erro: ${message}</p>`;
        resultDiv.classList.add('error');
        copyButton.classList.add('hidden');
    }

    /**
     * Clears the input field and results.
     */
    function limparCampos() {
        ipInput.value = '';
        resultDiv.innerHTML = '';
        resultDiv.classList.add('hidden');
        copyButton.classList.add('hidden');
    }

    /**
     * Copies the result text to the clipboard.
     */
    function copiarResultado() {
        const text = Array.from(resultDiv.querySelectorAll('.data-item'))
            .map(item => {
                const label = item.querySelector('.data-label').textContent;
                const value = item.querySelector('.data-value').textContent;
                return `${label} ${value}`;
            })
            .join('\n');
        
        const textToCopy = text + '\n\nDados encontrados em: https://rayllanls.github.io/ipwhois';
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert('Resultado copiado para a área de transferência!');
        }).catch(() => {
            alert('Erro ao copiar o resultado.');
        });
    }
});
