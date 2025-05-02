const grid = document.getElementById('grid');
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const body = document.body;
let currentContextMenuTarget = null;
let settingsPanelVisible = false;
let pagesData = {};
let currentPage = 'Principal';
const pageButtonsContainer = document.getElementById('page-buttons-container');
let currentPageButton = null;
let contextMenuPageButtonTarget = null;
const wallpaperUrlInput = document.getElementById('wallpaper-url');

(function() {
    const savedWallpaperUrl = localStorage.getItem('wallpaperUrl');
    body.style.backgroundColor = 'transparent';
    if (savedWallpaperUrl) {
        applyWallpaper(savedWallpaperUrl);
        wallpaperUrlInput.value = savedWallpaperUrl;
    } else {
        applyWallpaper('');
        wallpaperUrlInput.value = '';
    }

    pagesData = getPages();
    if (!pagesData['Principal']) {
        pagesData['Principal'] = [];
        savePages(pagesData);
    }

    currentPage = 'Principal';
    renderPageButtons();
    switchToPage(currentPage);
})();

function applyWallpaper(url) {
    body.style.backgroundImage = url ? `url('${url}')` : 'none';
    body.style.backgroundSize = url ? 'cover' : 'auto';
    body.style.backgroundPosition = url ? 'center' : 'center';
    body.style.backgroundRepeat = url ? 'no-repeat' : 'repeat';
    body.style.backgroundAttachment = 'fixed';
    body.style.backgroundColor = 'transparent';
    localStorage.setItem('wallpaperUrl', url);
}

function getPages() {
    const storedPages = localStorage.getItem('atalhosPages');
    return storedPages ? JSON.parse(storedPages) : { "Principal": [] };
}

function savePages(pages) {
    localStorage.setItem('atalhosPages', JSON.stringify(pages));
}

function getCurrentSites() {
    return getPages()[currentPage] || [];
}

function saveCurrentSites(sites) {
    const pages = getPages();
    pages[currentPage] = sites;
    savePages(pages);
}

function removeSite(indexToRemove) {
    const currentSites = getCurrentSites();
    const updatedSites = currentSites.filter((_, index) => index !== indexToRemove);
    saveCurrentSites(updatedSites);
    render();
}

function updateSite(indexToUpdate, newName, newUrl, newImageUrl) {
    const currentSites = getCurrentSites();
    if (currentSites[indexToUpdate]) {
        currentSites[indexToUpdate].nome = newName;
        currentSites[indexToUpdate].url = newUrl;
        if (newImageUrl !== undefined) {
            currentSites[indexToUpdate].imageUrl = newImageUrl;
        }
        saveCurrentSites(currentSites);
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
        const currentSites = getCurrentSites();
        const currentName = currentSites[index]?.nome || currentSites[index]?.url;
        const newName = prompt('Digite o novo nome:', currentName);
        if (newName !== null) {
            const currentUrl = currentSites[index]?.url;
            updateSite(index, newName, currentUrl);
        }
        document.getElementById('context-menu')?.remove();
    };

    const editUrlOption = document.createElement('div');
    editUrlOption.innerText = 'Editar URL';
    editUrlOption.style.cursor = 'pointer';
    editUrlOption.style.padding = '4px 0';
    editUrlOption.onclick = () => {
        const currentSites = getCurrentSites();
        const currentUrl = currentSites[index]?.url;
        const newUrl = prompt('Digite o novo URL:', currentUrl);
        if (newUrl) {
            const currentName = currentSites[index]?.nome;
            updateSite(index, currentName, newUrl);
        }
        document.getElementById('context-menu')?.remove();
    };

    const editImageOption = document.createElement('div');
    editImageOption.innerText = 'Editar Imagem';
    editImageOption.style.cursor = 'pointer';
    editImageOption.style.padding = '4px 0';
    editImageOption.onclick = () => {
        const currentSites = getCurrentSites();
        const currentImageUrl = currentSites[index]?.imageUrl || `https://www.google.com/s2/favicons?domain=${currentSites[index]?.url}&sz=64`;
        const newImageUrl = prompt('Digite a URL da nova imagem:', currentImageUrl);
        if (newImageUrl !== null) {
            const currentName = currentSites[index]?.nome;
            const currentUrl = currentSites[index]?.url;
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
    const currentSites = getCurrentSites();
    console.log('Dados da página "' + currentPage + '":', currentSites);

    currentSites.forEach((site, index) => {
        const div = document.createElement('a');
        div.className = 'tile';
        div.href = site.url;
        const imageUrl = site.imageUrl || `https://www.google.com/s2/favicons?domain=${site.url}&sz=64`;
        div.innerHTML = `
            <img src="${imageUrl}" alt="${site.nome || site.url}" />
            <div>${site.nome || site.url}</div>
        `;

        div.addEventListener('contextmenu', (event) => {
            renderContextMenu(event, index);
        });

        grid.appendChild(div);
    });

    // Adiciona o botão de adicionar SEMPRE no final da grade
    const existingAddButton = grid.querySelector('.add-btn');
    if (!existingAddButton) {
        const addButton = document.createElement('button');
        addButton.innerHTML = '+';
        addButton.className = 'add-btn';
        addButton.onclick = () => openAddSiteForm();
        grid.appendChild(addButton);
    }

    console.log('Grid renderizada com', currentSites.length, 'atalhos na página "' + currentPage + '".');
}

function openAddSiteForm() {
    const url = prompt('Digite o URL do site:');
    const nome = prompt('Digite o nome do site:');
    if (url) {
        const currentSites = getCurrentSites();
        currentSites.push({ url, nome });
        saveCurrentSites(currentSites);
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

function createPageButton(pageName) {
    const button = document.createElement('button');
    button.innerText = pageName;
    button.className = 'page-button';
    if (pageName === currentPage) {
        button.classList.add('active');
        currentPageButton = button;
    }
    button.addEventListener('click', () => {
        switchToPage(pageName);
    });

    button.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        contextMenuPageButtonTarget = pageName;
        const existingMenu = document.querySelector('.page-button-context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
        const menu = document.createElement('div');
        menu.className = 'page-button-context-menu';
        menu.style.left = `${event.clientX}px`;
        menu.style.top = `${event.clientY}px`;

        if (pageName !== 'Principal') {
            const renameOption = document.createElement('div');
            renameOption.innerText = 'Renomear';
            renameOption.onclick = () => {
                const newName = prompt('Novo nome:', pageName);
                if (newName && newName !== pageName) {
                    renamePage(pageName, newName);
                }
                menu.remove();
            };
            menu.appendChild(renameOption);

            const deleteOption = document.createElement('div');
            deleteOption.innerText = 'Excluir';
            deleteOption.onclick = () => {
                if (confirm(`Tem certeza que deseja excluir a página "${pageName}"?`)) {
                    deletePage(pageName);
                }
                menu.remove();
            };
            menu.appendChild(deleteOption);
        }

        document.body.appendChild(menu);

        document.addEventListener('click', function closeMenuOnClickOutside(e) {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenuOnClickOutside);
            }
        });
    });

    return button;
}

function renderPageButtons() {
    const addButton = document.getElementById('add-page-button');
    const wasAddButtonPresent = !!addButton;

    if (wasAddButtonPresent) {
        pageButtonsContainer.removeChild(addButton);
    }

    pageButtonsContainer.innerHTML = '';
    const pages = getPages();
    for (const pageName in pages) {
        pageButtonsContainer.appendChild(createPageButton(pageName));
    }

    // Recria o botão de adicionar e o adiciona novamente ao final
    const newAddButton = document.createElement('button');
    newAddButton.id = 'add-page-button';
    newAddButton.innerText = '+';
    newAddButton.className = 'add-page-button';
    newAddButton.title = 'Adicionar nova página';
    newAddButton.addEventListener('click', () => {
        const newPageName = prompt('Digite o nome da nova página:');
        if (newPageName) {
            const pages = getPages();
            if (!pages[newPageName]) {
                pages[newPageName] = [];
                savePages(pages);
                renderPageButtons(); // Renderiza novamente para incluir o novo botão
                switchToPage(newPageName);
            } else {
                alert('Essa página já existe.');
            }
        }
    });
    pageButtonsContainer.appendChild(newAddButton);
}

function switchToPage(pageName) {
    if (currentPageButton) {
        currentPageButton.classList.remove('active');
    }
    currentPage = pageName;
    const newActiveButton = Array.from(pageButtonsContainer.children).find(button => button.innerText === pageName);
    if (newActiveButton) {
        newActiveButton.classList.add('active');
        currentPageButton = newActiveButton;
    }
    render();
    localStorage.setItem('currentPage', currentPage);
}

function renamePage(oldName, newName) {
    const pages = getPages();
    if (pages[newName]) {
        alert('Já existe uma página com esse nome.');
        return;
    }
    pages[newName] = pages[oldName];
    delete pages[oldName];
    if (currentPage === oldName) {
        currentPage = newName;
    }
    savePages(pages);
    renderPageButtons();
    render();
}

function deletePage(pageToDelete) {
    const pages = getPages();
    if (pageToDelete === 'Principal') {
        alert('A página Principal não pode ser excluída.');
        return;
    }
    delete pages[pageToDelete];
    if (currentPage === pageToDelete) {
        switchToPage('Principal');
    }
    savePages(pages);
    renderPageButtons();
    render();
}

wallpaperUrlInput.addEventListener('change', () => {
    const url = wallpaperUrlInput.value.trim();
    applyWallpaper(url);
});

window.addEventListener('beforeunload', () => {
    localStorage.setItem('currentPage', currentPage);
});