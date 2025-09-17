document.addEventListener('DOMContentLoaded', () => {
    const ipInput = document.getElementById('ipInput');
    const searchButton = document.getElementById('searchButton');
    const clearButton = document.getElementById('clearButton');
    const copyButton = document.getElementById('copyButton');
    const resultDiv = document.getElementById('result');
    const resultData = document.getElementById('result-data');
    let map; // Variável para guardar a instância do mapa

    searchButton.addEventListener('click', buscarDadosIP);
    clearButton.addEventListener('click', limparCampos);
    copyButton.addEventListener('click', copiarResultado);
    ipInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            buscarDadosIP();
        }
    });

    async function buscarDadosIP() {
        const input = ipInput.value.trim();
        // Em vez de 'hidden', usamos a classe 'visible' para a animação
        resultDiv.classList.remove('visible', 'error');
        resultData.innerHTML = '<div class="spinner"></div>';
        copyButton.classList.add('hidden');

        try {
            let ipToSearch = await resolveInput(input);
            const data = await fetchIpData(ipToSearch);
            displayResults(data);
            resultDiv.classList.add('visible'); // Ativa a animação
        } catch (error) {
            displayError(error.message);
            resultDiv.classList.add('visible');
        }
    }

    async function resolveInput(input) {
        // ... (esta função não precisa de alterações)
        const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,6})|:)|:((:[0-9a-fA-F]{1,7})|:)$/;
        const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
        if (ipv4Regex.test(input) || ipv6Regex.test(input)) return input;
        if (domainRegex.test(input)) {
            const dnsResponse = await fetch(`https://dns.google/resolve?name=${input}`);
            const dnsData = await dnsResponse.json();
            if (dnsData.Status !== 0 || !dnsData.Answer || dnsData.Answer.length === 0) throw new Error('Não foi possível resolver o nome de domínio para um IP.');
            return dnsData.Answer[0].data;
        }
        throw new Error('Por favor, digite um endereço IP ou um nome de domínio válido.');
    }

    async function fetchIpData(ip) {
        const response = await fetch(`https://ipinfo.io/${ip}/json`);
        if (!response.ok) throw new Error('IP não encontrado ou erro na API.');
        return response.json();
    }

    function displayResults(data) {
        const countryName = data.country ? new Intl.DisplayNames(['pt-BR'], { type: 'region' }).of(data.country) : 'N/A';
        
        let html = `
            <div class="data-item"><i class="fas fa-network-wired"></i><span class="data-label">IP:</span> <span class="data-value">${data.ip || 'N/A'}</span></div>
            <div class="data-item"><i class="fas fa-server"></i><span class="data-label">Host:</span> <span class="data-value">${data.hostname || 'N/A'}</span></div>
            <div class="data-item"><i class="fas fa-map-marker-alt"></i><span class="data-label">Cidade:</span> <span class="data-value">${data.city || 'N/A'}, ${data.region || 'N/A'}</span></div>
            <div class="data-item"><i class="fas fa-flag"></i><span class="data-label">País:</span> <span class="data-value">${countryName} (${data.country || 'N/A'})</span></div>
            <div class="data-item"><i class="fas fa-building"></i><span class="data-label">Organização:</span> <span class="data-value">${data.org || 'N/A'}</span></div>
            <div class="data-item"><i class="fas fa-satellite-dish"></i><span class="data-label">Provedor:</span> <span class="data-value">${data.asn?.name || 'N/A'}</span></div>
            <div class="data-item"><i class="fas fa-mail-bulk"></i><span class="data-label">Cód. Postal:</span> <span class="data-value">${data.postal || 'N/A'}</span></div>
            <div class="data-item"><i class="fas fa-clock"></i><span class="data-label">Fuso Horário:</span> <span class="data-value">${data.timezone || 'N/A'}</span></div>
        `;
        resultData.innerHTML = html;
        copyButton.classList.remove('hidden');

        // Lógica do Mapa
        const [lat, lon] = data.loc ? data.loc.split(',') : [0, 0];
        if (map) { // Se o mapa já existe, apenas o atualiza
            map.setView([lat, lon], 13);
        } else { // Senão, cria um novo mapa
            map = L.map('map').setView([lat, lon], 13);
             L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
             attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'

            }).addTo(map);
        }
        L.marker([lat, lon]).addTo(map).bindPopup(`<b>${data.ip}</b><br>${data.city}, ${countryName}`).openPopup();
    }

    function displayError(message) {
        resultData.innerHTML = `<p class="text-red-600 p-4">Erro: ${message}</p>`;
        document.getElementById('map').innerHTML = ''; // Limpa o mapa em caso de erro
        if(map) { map.remove(); map = null; } // Remove a instância do mapa
        resultDiv.classList.add('error');
        copyButton.classList.add('hidden');
    }

    function limparCampos() {
        ipInput.value = '';
        resultDiv.classList.remove('visible', 'error');
        copyButton.classList.add('hidden');
        if (map) {
            map.remove(); // Remove o mapa da tela
            map = null;   // Limpa a variável
        }
    }

    function copiarResultado() {
        const text = Array.from(resultData.querySelectorAll('.data-item'))
            .map(item => {
                const label = item.querySelector('.data-label').textContent;
                const value = item.querySelector('.data-value').textContent;
                return `${label} ${value}`;
            })
            .join('\n');
        
        const textToCopy = text + '\n\nDados encontrados em: https://rayllanls.github.io/rakoon';
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalText = copyButton.textContent;
            copyButton.textContent = 'Copiado!';
            copyButton.style.backgroundColor = 'var(--success, #2ed573)';
            setTimeout(() => {
                copyButton.textContent = originalText;
                copyButton.style.backgroundColor = '';
            }, 2000);
        }).catch(() => {
            alert('Erro ao copiar o resultado.');
        });
    }
});