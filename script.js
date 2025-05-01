const grid = document.getElementById('grid');
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const body = document.body;
const serverUrl = 'http://localhost:5500';
let currentContextMenuTarget = null;
let settingsPanelVisible = false;

(function() {
    const savedImageUrl = localStorage.getItem('backgroundImageUrl');
    body.style.backgroundColor = 'transparent';
    if (savedImageUrl) {
        const fullImageUrl = savedImageUrl.startsWith('http') ? savedImageUrl : serverUrl + savedImageUrl;
        body.style.backgroundImage = `url('${fullImageUrl}')`;
        body.style.backgroundSize = 'cover';
        body.style.backgroundPosition = 'center';
    }
})();

function applyWallpaper(imageUrl) {
    const fullImageUrl = serverUrl + imageUrl;
    body.style.backgroundImage = `url('${fullImageUrl}')`;
    body.style.backgroundSize = 'cover';
    body.style.backgroundPosition = 'center';
    body.style.backgroundColor = 'transparent';
    localStorage.setItem('backgroundImageUrl', imageUrl);
}

function getSites() {
    return JSON.parse(localStorage.getItem('atalhos') || '[]');
}

function saveSites(sites) {
    localStorage.setItem('atalhos', JSON.stringify(sites));
}

function removeSite(indexToRemove) {
    let sites = getSites();
    sites = sites.filter((_, index) => index !== indexToRemove);
    saveSites(sites);
    render();
}

function updateSite(indexToUpdate, newName, newUrl, newImageUrl) {
    let sites = getSites();
    if (sites[indexToUpdate]) {
        sites[indexToUpdate].nome = newName;
        sites[indexToUpdate].url = newUrl;
        if (newImageUrl !== undefined) {
            sites[indexToUpdate].imageUrl = newImageUrl;
        }
        saveSites(sites);
        render();
    }
}

function renderContextMenu(event, index) {
    event.preventDefault();
    const existingContextMenu = document.getElementById('context-menu');
    if (existingContextMenu) {
        existingContextMenu.remove();
    }

    currentContextMenuTarget = { index };

    const contextMenu = document.createElement('div');
    contextMenu.id = 'context-menu';
    contextMenu.style.position = 'absolute';
    contextMenu.style.left = `${event.clientX}px`;
    contextMenu.style.top = `${event.clientY}px`;
    contextMenu.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    contextMenu.style.color = 'white';
    contextMenu.style.padding = '8px';
    contextMenu.style.borderRadius = '4px';
    contextMenu.style.zIndex = '1000';

    const deleteOption = document.createElement('div');
    deleteOption.innerText = 'Excluir';
    deleteOption.style.cursor = 'pointer';
    deleteOption.style.padding = '4px 0';
    deleteOption.onclick = () => {
        removeSite(index);
        document.getElementById('context-menu')?.remove();
    };

    const editNameOption = document.createElement('div');
    editNameOption.innerText = 'Editar Nome';
    editNameOption.style.cursor = 'pointer';
    editNameOption.style.padding = '4px 0';
    editNameOption.onclick = () => {
        const sites = getSites();
        const currentName = sites[index]?.nome || sites[index]?.url;
        const newName = prompt('Digite o novo nome:', currentName);
        if (newName !== null) {
            const currentUrl = sites[index]?.url;
            updateSite(index, newName, currentUrl);
        }
        document.getElementById('context-menu')?.remove();
    };

    const editUrlOption = document.createElement('div');
    editUrlOption.innerText = 'Editar URL';
    editUrlOption.style.cursor = 'pointer';
    editUrlOption.style.padding = '4px 0';
    editUrlOption.onclick = () => {
        const sites = getSites();
        const currentUrl = sites[index]?.url;
        const newUrl = prompt('Digite o novo URL:', currentUrl);
        if (newUrl) {
            const currentName = sites[index]?.nome;
            updateSite(index, currentName, newUrl);
        }
        document.getElementById('context-menu')?.remove();
    };

    const editImageOption = document.createElement('div');
    editImageOption.innerText = 'Editar Imagem';
    editImageOption.style.cursor = 'pointer';
    editImageOption.style.padding = '4px 0';
    editImageOption.onclick = () => {
        const sites = getSites();
        const currentImageUrl = sites[index]?.imageUrl || `https://www.google.com/s2/favicons?domain=${sites[index]?.url}&sz=64`;
        const newImageUrl = prompt('Digite a URL da nova imagem:', currentImageUrl);
        if (newImageUrl !== null) {
            const currentName = sites[index]?.nome;
            const currentUrl = sites[index]?.url;
            updateSite(index, currentName, currentUrl, newImageUrl);
        }
        document.getElementById('context-menu')?.remove();
    };

    contextMenu.appendChild(deleteOption);
    contextMenu.appendChild(editNameOption);
    contextMenu.appendChild(editUrlOption);
    contextMenu.appendChild(editImageOption);
    document.body.appendChild(contextMenu);

    document.addEventListener('click', function removeContextMenuOnClickOutside(event) {
        if (!contextMenu.contains(event.target)) {
            contextMenu.remove();
            document.removeEventListener('click', removeContextMenuOnClickOutside);
        }
    });
}

function render() {
    grid.innerHTML = '';
    const sites = getSites();
    console.log('Dados dos sites carregados:', sites); // Log para verificar os dados

    sites.forEach((site, index) => {
        const div = document.createElement('a');
        div.className = 'tile';
        div.href = site.url;
        div.target = '_blank';
        const imageUrl = site.imageUrl || `https://www.google.com/s2/favicons?domain=${site.url}&sz=64`;
        div.innerHTML = `
            <img src="${imageUrl}" alt="${site.nome || site.url}" />
            <div>${site.nome || site.url}</div>
        `;

        div.addEventListener('contextmenu', (event) => {
            renderContextMenu(event, index);
        });

        grid.appendChild(div);

        if (index === sites.length - 1) {
            const addButton = document.createElement('button');
            addButton.innerHTML = '+';
            addButton.className = 'add-btn';
            addButton.onclick = () => openAddSiteForm();
            addButton.style.marginLeft = '23px';
            grid.appendChild(addButton);
        }
    });

    console.log('Grid renderizada com', sites.length, 'atalhos.'); // Log para verificar a renderização
}

function openAddSiteForm() {
    const url = prompt('Digite o URL do site:');
    const nome = prompt('Digite o nome do site:');
    if (url) {
        const sites = getSites();
        sites.push({ url, nome });
        saveSites(sites);
        render();
    }
}

function handleOutsideClick(event) {
    if (settingsPanelVisible && !settingsPanel.contains(event.target) && event.target !== settingsBtn) {
        settingsPanel.style.display = 'none';
        settingsPanelVisible = false;
        document.removeEventListener('click', handleOutsideClick);
    }
}

settingsBtn.onclick = () => {
    settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'flex' : 'none';
    settingsPanelVisible = !settingsPanelVisible;
    if (settingsPanelVisible) {
        document.addEventListener('click', handleOutsideClick);
    } else {
        document.removeEventListener('click', handleOutsideClick);
    }
};

render();

setTimeout(function() {
    // AQUI TAMBÉM NÃO PRECISAMOS MAIS APLICAR OS ESTILOS SALVOS
}, 100);

document.getElementById('bg-input-settings').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('wallpaper', file);

    try {
        const response = await fetch(`${serverUrl}/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Erro ao enviar a imagem para o servidor.');
        }

        const data = await response.json();
        if (data.imageUrl) {
            applyWallpaper(data.imageUrl);
        }
    } catch (error) {
        console.error('Erro ao fazer upload da imagem:', error);
        alert('Não foi possível enviar a imagem. Tente novamente.');
    }
});