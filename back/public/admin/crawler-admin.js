// Crawler Admin Panel JavaScript
class CrawlerAdmin {
    constructor() {
        this.currentSection = 'dashboard';
        this.currentPage = 1;
        this.filesPerPage = 20;
        this.currentFile = null;
        this.init();
    }

    init() {
        this.loadStats();
        this.loadStatus();
        this.setupEventListeners();
        this.startAutoRefresh();
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('crawler-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.startCrawler();
        });

        // Search functionality
        document.getElementById('file-search')?.addEventListener('input', (e) => {
            this.searchFileContent(e.target.value);
        });

        // Filter changes
        document.getElementById('filter-type')?.addEventListener('change', () => {
            this.loadFiles();
        });

        document.getElementById('filter-city')?.addEventListener('change', () => {
            this.loadFiles();
        });
    }

    // Navigation
    showSection(section) {
        // Hide all sections
        document.querySelectorAll('[id$="-section"]').forEach(el => {
            el.style.display = 'none';
        });

        // Show selected section
        document.getElementById(`${section}-section`).style.display = 'block';

        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        event.target.classList.add('active');

        this.currentSection = section;

        // Load section-specific data
        switch (section) {
            case 'dashboard':
                this.loadStats();
                this.loadStatus();
                this.loadRecentFiles();
                break;
            case 'files':
                this.loadFiles();
                break;
            case 'control':
                this.loadStatus();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }

    // Dashboard Functions
    async loadStats() {
        try {
            const response = await fetch('/api/v1/crawler/stats', {
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });
            const data = await response.json();

            if (response.ok) {
                this.updateStats(data.stats);
            } else {
                this.showError('Error loading stats');
            }
        } catch (error) {
            console.error('Error loading stats:', error);
            this.showError('Error loading stats');
        }
    }

    updateStats(stats) {
        if (!stats) return;
        
        const safeGet = (obj, key, defaultValue = '0') => {
            return obj && obj[key] ? obj[key].toLocaleString() : defaultValue;
        };

        const setTextContent = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        };

        setTextContent('total-ads', safeGet(stats, 'totalAds'));
        setTextContent('total-files', safeGet(stats, 'totalFiles'));
        setTextContent('tehran-ads', safeGet(stats, 'tehranAds'));
        setTextContent('karaj-ads', safeGet(stats, 'karajAds'));
        setTextContent('tehran-sale', safeGet(stats, 'tehranSale'));
        setTextContent('tehran-rent', safeGet(stats, 'tehranRent'));
        setTextContent('karaj-sale', safeGet(stats, 'karajSale'));
        setTextContent('karaj-rent', safeGet(stats, 'karajRent'));
    }

    async loadStatus() {
        try {
            const response = await fetch('/api/v1/crawler/status', {
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });
            const data = await response.json();

            if (response.ok) {
                this.updateStatus(data.status);
            } else {
                this.showError('Error loading status');
            }
        } catch (error) {
            console.error('Error loading status:', error);
            this.showError('Error loading status');
        }
    }

    updateStatus(status) {
        const indicator = document.getElementById('status-indicator');
        const text = document.getElementById('status-text');
        const activity = document.getElementById('last-activity');
        const outputDir = document.getElementById('output-dir');

        if (status.running) {
            indicator.className = 'status-indicator status-running';
            text.textContent = 'Running';
        } else {
            indicator.className = 'status-indicator status-stopped';
            text.textContent = 'Stopped';
        }

        activity.textContent = status.lastActivity || '-';
        outputDir.textContent = status.outputDir || '-';
    }

    async loadRecentFiles() {
        try {
            const response = await fetch('/api/v1/crawler/files?page=1&limit=5', {
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });
            const data = await response.json();

            if (response.ok) {
                this.updateRecentFiles(data.files);
            } else {
                this.showError('Error loading recent files');
            }
        } catch (error) {
            console.error('Error loading recent files:', error);
            this.showError('Error loading recent files');
        }
    }

    updateRecentFiles(files) {
        const tbody = document.getElementById('recent-files');
        if (!tbody) {
            console.error('recent-files element not found');
            return;
        }
        
        if (!files || files.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No files found</td></tr>';
            return;
        }

        tbody.innerHTML = files.map(file => {
            const filename = file.name || file.filename || 'unknown';
            const typeLabel = this.getTypeLabel(file.type || 'unknown');
            const cityLabel = this.getCityLabel(file.city || 'unknown');
            const size = file.sizeFormatted || file.size || '0 KB';
            const date = file.modified ? new Date(file.modified).toLocaleDateString() : new Date().toLocaleDateString();
            
            return `
                <tr>
                    <td>
                        <i class="fas fa-file-alt me-2"></i>
                        <a href="#" onclick="viewFile('${filename}')" class="text-decoration-none">
                            ${filename}
                        </a>
                    </td>
                    <td><span class="badge bg-primary">${typeLabel}</span></td>
                    <td><span class="badge bg-secondary">${cityLabel}</span></td>
                    <td><span class="file-size">${size}</span></td>
                    <td><span class="file-date">${date}</span></td>
                    <td>
                        <div class="btn-group btn-group-sm" role="group">
                            <button class="btn btn-outline-primary" onclick="viewFile('${filename}')" title="View">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-outline-success" onclick="importFile('${filename}')" title="Import">
                                <i class="fas fa-database"></i>
                            </button>
                            <button class="btn btn-outline-danger" onclick="deleteFile('${filename}')" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Files Management
    async loadFiles() {
        try {
            const type = document.getElementById('filter-type').value;
            const city = document.getElementById('filter-city').value;
            const page = this.currentPage;
            
            let url = `/api/v1/crawler/files?page=${page}&limit=${this.filesPerPage}`;
            if (type) url += `&type=${type}`;
            if (city) url += `&city=${city}`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });
            const data = await response.json();

            if (response.ok) {
                this.updateFilesList(data.files, data.pagination);
            } else {
                this.showError('Error loading files list');
            }
        } catch (error) {
            console.error('Error loading files list:', error);
            this.showError('Error loading files list');
        }
    }

    updateFilesList(files, pagination) {
        const tbody = document.getElementById('files-list');
        if (!tbody) {
            console.error('files-list element not found');
            return;
        }
        
        if (!files || files.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No files found</td></tr>';
            return;
        }

        tbody.innerHTML = files.map(file => {
            const filename = file.name || file.filename || 'unknown';
            const typeLabel = this.getTypeLabel(file.type || 'unknown');
            const cityLabel = this.getCityLabel(file.city || 'unknown');
            const size = file.sizeFormatted || file.size || '0 KB';
            const date = file.modified ? new Date(file.modified).toLocaleDateString() : new Date().toLocaleDateString();
            
            return `
                <tr>
                    <td>
                        <i class="fas fa-file-alt me-2"></i>
                        <a href="#" onclick="viewFile('${filename}')" class="text-decoration-none">
                            ${filename}
                        </a>
                    </td>
                    <td><span class="badge bg-primary">${typeLabel}</span></td>
                    <td><span class="badge bg-secondary">${cityLabel}</span></td>
                    <td><span class="file-size">${size}</span></td>
                    <td><span class="file-date">${date}</span></td>
                    <td>
                        <div class="btn-group btn-group-sm" role="group">
                            <button class="btn btn-outline-primary" onclick="viewFile('${filename}')" title="View">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-outline-success" onclick="importFile('${filename}')" title="Import">
                                <i class="fas fa-database"></i>
                            </button>
                            <button class="btn btn-outline-danger" onclick="deleteFile('${filename}')" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        // Update pagination if it exists
        const paginationElement = document.getElementById('files-pagination');
        if (paginationElement && pagination) {
            this.updatePagination(paginationElement, pagination, (page) => {
                this.currentPage = page;
                this.loadFiles();
            });
        }
    }

    renderFileContent(data) {
        if (!data || !Array.isArray(data)) {
            return '<tr><td colspan="5" class="text-center">No data available</td></tr>';
        }

        return data.map(item => {
            const title = item.title || 'No title';
            const type = item.type || 'unknown';
            const city = item.city || 'unknown';
            const price = this.getPriceText(item);
            const url = item.url || '#';

            return `
                <tr>
                    <td>${title}</td>
                    <td><span class="badge bg-primary">${type}</span></td>
                    <td><span class="badge bg-secondary">${city}</span></td>
                    <td>${price}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="viewAdDetails('${url}')" title="View Details">
                            <i class="fas fa-external-link-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // File Operations
    async viewFile(filename) {
        try {
            const response = await fetch(`/api/v1/crawler/files/${filename}?page=1&limit=50`, {
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });
            const data = await response.json();

            if (response.ok) {
                this.showFileModal(data.content, data.pagination, filename);
            } else {
                this.showError('Error loading file content');
            }
        } catch (error) {
            console.error('Error loading file content:', error);
            this.showError('Error loading file content');
        }
    }

    showFileModal(data, pagination, filename) {
        const modal = new bootstrap.Modal(document.getElementById('fileModal'));
        const modalTitle = document.querySelector('#fileModal .modal-title');
        const modalBody = document.querySelector('#fileModal .modal-body');

        modalTitle.textContent = `File: ${filename}`;
        modalBody.innerHTML = `
            <div class="mb-3">
                <input type="text" class="form-control" id="file-search" placeholder="Search in file content...">
            </div>
            <div class="table-responsive">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Type</th>
                            <th>City</th>
                            <th>Price</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="file-content">
                        ${this.renderFileContent(data)}
                    </tbody>
                </table>
            </div>
            <nav>
                <ul class="pagination justify-content-center" id="file-pagination">
                </ul>
            </nav>
        `;

        this.updatePagination(document.getElementById('file-pagination'), pagination, (page) => {
            this.loadFileContent(page);
        });

        modal.show();
    }

    async loadFileContent(page = 1) {
        if (!this.currentFile) return;

        try {
            const response = await fetch(`/api/v1/crawler/files/${this.currentFile}?page=${page}&limit=50`, {
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });
            const data = await response.json();

            if (response.ok) {
                document.getElementById('file-content').innerHTML = this.renderFileContent(data.content);
                this.updatePagination(document.getElementById('file-pagination'), data.pagination, (page) => {
                    this.loadFileContent(page);
                });
            } else {
                this.showError('Error loading file content');
            }
        } catch (error) {
            console.error('Error loading file content:', error);
            this.showError('Error loading file content');
        }
    }

    searchFileContent(query) {
        const tbody = document.getElementById('file-content');
        const rows = tbody.querySelectorAll('tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
        });
    }

    async deleteFile(filename) {
        if (!confirm('Are you sure you want to delete this file?')) return;

        try {
            const response = await fetch(`/api/v1/crawler/files/${filename}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });
            const data = await response.json();

            if (response.ok) {
                this.showSuccess('File deleted successfully');
                this.loadFiles();
                this.loadRecentFiles();
            } else {
                this.showError(data.error || 'Error deleting file');
            }
        } catch (error) {
            console.error('Error deleting file:', error);
            this.showError('Error deleting file');
        }
    }

    async importFile(filename) {
        if (!confirm(`Are you sure you want to import ${filename} to database?`)) return;

        try {
            this.showSuccess('Starting import process...');
            this.addToLog(`Starting import for ${filename}`, 'info');

            const response = await fetch('/api/v1/crawler/import', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getToken()}`
                },
                body: JSON.stringify({ filename })
            });

            const data = await response.json();

            if (response.ok) {
                this.showSuccess(`Import completed successfully! ${data.imported} ads imported, ${data.errors} errors`);
                this.addToLog(`Import completed: ${data.imported} ads imported, ${data.errors} errors`, 'success');
                this.loadStats();
                this.loadRecentFiles();
            } else {
                this.showError(data.error || 'Error importing file');
                this.addToLog(`Import failed: ${data.error}`, 'error');
            }
        } catch (error) {
            console.error('Error importing file:', error);
            this.showError('Error importing file');
            this.addToLog(`Import failed: ${error.message}`, 'error');
        }
    }

    // Crawler Control
    async startCrawler() {
        const cities = Array.from(document.querySelectorAll('input[name="city"]:checked')).map(cb => cb.value);
        const adTypes = Array.from(document.querySelectorAll('input[name="type"]:checked')).map(cb => cb.value);
        const maxAds = document.getElementById('max-ads').value;

        if (cities.length === 0 || adTypes.length === 0) {
            this.showError('Please select at least one city and one ad type');
            return;
        }

        try {
            const response = await fetch('/api/v1/crawler/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getToken()}`
                },
                body: JSON.stringify({
                    cities,
                    adTypes,
                    maxAds: parseInt(maxAds)
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.showSuccess('Crawler started successfully');
                this.addToLog('Crawler started', 'success');
                this.loadStatus();
            } else {
                this.showError(data.error || 'Error starting crawler');
            }
        } catch (error) {
            console.error('Error starting crawler:', error);
            this.showError('Error starting crawler');
        }
    }

    async stopCrawler() {
        try {
            const response = await fetch('/api/v1/crawler/stop', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getToken()}`
                },
                body: JSON.stringify({})
            });

            const data = await response.json();

            if (response.ok) {
                this.showSuccess('Crawler stopped successfully');
                this.addToLog('Crawler stopped', 'warning');
                this.loadStatus();
            } else {
                this.showError(data.error || 'Error stopping crawler');
            }
        } catch (error) {
            console.error('Error stopping crawler:', error);
            this.showError('Error stopping crawler');
        }
    }

    // Settings
    async loadSettings() {
        // Load settings from localStorage or default values
        const settings = JSON.parse(localStorage.getItem('crawlerSettings') || '{}');
        
        document.getElementById('delay-pages').value = settings.delayPages || 3000;
        document.getElementById('delay-ads').value = settings.delayAds || 2000;
        document.getElementById('headless-mode').value = settings.headless || 'true';
        document.getElementById('chrome-path').value = settings.chromePath || '/usr/bin/google-chrome';
    }

    async saveSettings() {
        const settings = {
            delayPages: parseInt(document.getElementById('delay-pages').value),
            delayAds: parseInt(document.getElementById('delay-ads').value),
            headless: document.getElementById('headless-mode').value,
            chromePath: document.getElementById('chrome-path').value
        };

        localStorage.setItem('crawlerSettings', JSON.stringify(settings));
        this.showSuccess('Settings saved successfully');
    }

    // Utility Functions
    getToken() {
        return localStorage.getItem('adminToken') || '';
    }

    getTypeLabel(type) {
        const labels = {
            'sale': 'Sale',
            'rent': 'Rent',
            'combined': 'Combined',
            'summary': 'Summary'
        };
        return labels[type] || type;
    }

    getCityLabel(city) {
        const labels = {
            'tehran': 'Tehran',
            'karaj': 'Karaj'
        };
        return labels[city] || city;
    }

    getPriceText(item) {
        if (item.gheymatKol) return item.gheymatKol;
        if (item.vadie && item.ejare) return `Vadie: ${item.vadie} | Ejare: ${item.ejare}`;
        if (item.vadie) return `Vadie: ${item.vadie}`;
        if (item.ejare) return `Ejare: ${item.ejare}`;
        return '-';
    }

    updatePagination(element, pagination, callback) {
        if (!pagination || pagination.totalPages <= 1) {
            element.innerHTML = '';
            return;
        }

        let paginationHTML = '';
        
        // Previous button
        if (pagination.hasPrevPage) {
            paginationHTML += `<li class="page-item"><a class="page-link" href="#" onclick="goToPage(${pagination.currentPage - 1})">Previous</a></li>`;
        }

        // Page numbers
        for (let i = 1; i <= pagination.totalPages; i++) {
            if (i === pagination.currentPage) {
                paginationHTML += `<li class="page-item active"><a class="page-link" href="#">${i}</a></li>`;
            } else {
                paginationHTML += `<li class="page-item"><a class="page-link" href="#" onclick="goToPage(${i})">${i}</a></li>`;
            }
        }

        // Next button
        if (pagination.hasNextPage) {
            paginationHTML += `<li class="page-item"><a class="page-link" href="#" onclick="goToPage(${pagination.currentPage + 1})">Next</a></li>`;
        }

        element.innerHTML = paginationHTML;
        
        // Store callback for pagination
        window.goToPage = (page) => {
            if (window.crawlerAdmin) {
                window.crawlerAdmin.currentPage = page;
                callback(page);
            }
        };
    }

    addToLog(message, type = 'info') {
        const logElement = document.getElementById('crawler-log');
        if (!logElement) return;

        const timestamp = new Date().toLocaleString('fa-IR');
        const typeClass = type === 'success' ? 'text-success' : type === 'warning' ? 'text-warning' : type === 'error' ? 'text-danger' : 'text-muted';
        
        const logEntry = document.createElement('div');
        logEntry.className = typeClass;
        logEntry.innerHTML = `[${timestamp}] ${message}`;
        
        logElement.appendChild(logEntry);
        logElement.scrollTop = logElement.scrollHeight;
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    startAutoRefresh() {
        // Refresh stats every 30 seconds
        setInterval(() => {
            if (this.currentSection === 'dashboard') {
                this.loadStats();
                this.loadStatus();
            }
        }, 30000);
    }

    refreshStats() {
        this.loadStats();
        this.loadStatus();
        this.loadRecentFiles();
    }

    viewAdDetails(url) {
        if (url) {
            window.open(url, '_blank');
        }
    }
}

// Global functions for onclick handlers
function showSection(section) {
    if (window.crawlerAdmin) {
        window.crawlerAdmin.showSection(section);
    } else {
        console.error('CrawlerAdmin not initialized');
    }
}

function refreshStats() {
    if (window.crawlerAdmin) {
        window.crawlerAdmin.refreshStats();
    } else {
        console.error('CrawlerAdmin not initialized');
    }
}

function loadFiles() {
    if (window.crawlerAdmin) {
        window.crawlerAdmin.loadFiles();
    } else {
        console.error('CrawlerAdmin not initialized');
    }
}

function viewFile(filename) {
    if (window.crawlerAdmin) {
        window.crawlerAdmin.viewFile(filename);
    } else {
        console.error('CrawlerAdmin not initialized');
    }
}

function deleteFile(filename) {
    if (window.crawlerAdmin) {
        window.crawlerAdmin.deleteFile(filename);
    } else {
        console.error('CrawlerAdmin not initialized');
    }
}

function importFile(filename) {
    if (window.crawlerAdmin) {
        window.crawlerAdmin.importFile(filename);
    } else {
        console.error('CrawlerAdmin not initialized');
    }
}

function startCrawler() {
    if (window.crawlerAdmin) {
        window.crawlerAdmin.startCrawler();
    } else {
        console.error('CrawlerAdmin not initialized');
    }
}

function stopCrawler() {
    if (window.crawlerAdmin) {
        window.crawlerAdmin.stopCrawler();
    } else {
        console.error('CrawlerAdmin not initialized');
    }
}

function saveSettings() {
    if (window.crawlerAdmin) {
        window.crawlerAdmin.saveSettings();
    } else {
        console.error('CrawlerAdmin not initialized');
    }
}

function viewAdDetails(url) {
    if (window.crawlerAdmin) {
        window.crawlerAdmin.viewAdDetails(url);
    } else {
        console.error('CrawlerAdmin not initialized');
    }
}

// Also attach to window object for compatibility
window.showSection = showSection;
window.refreshStats = refreshStats;
window.loadFiles = loadFiles;
window.viewFile = viewFile;
window.deleteFile = deleteFile;
window.importFile = importFile;
window.startCrawler = startCrawler;
window.stopCrawler = stopCrawler;
window.saveSettings = saveSettings;
window.viewAdDetails = viewAdDetails; 