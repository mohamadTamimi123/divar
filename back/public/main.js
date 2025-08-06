// API Base URL
const API_BASE_URL = '/api/v1';

// Global variables
let currentUser = null;
let currentPage = 1;
let selectedClients = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Main.js loaded successfully!');
    checkAuth();
    loadProperties();
    loadCities();
    loadSubscriptionPlans();
    
    // Form handlers
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        login();
    });
    
    document.getElementById('register-form').addEventListener('submit', function(e) {
        e.preventDefault();
        register();
    });
    
    document.getElementById('add-client-form').addEventListener('submit', function(e) {
        e.preventDefault();
        addClient();
    });
    
    document.getElementById('search-form').addEventListener('submit', function(e) {
        e.preventDefault();
        searchProperties();
    });
});

// Authentication functions
function checkAuth() {
    const token = localStorage.getItem('userToken');
    if (token) {
        // Verify token with server
        fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Token invalid');
            }
        })
        .then(data => {
            currentUser = data.user;
            showUserMenu();
        })
        .catch(error => {
            console.error('Auth check failed:', error);
            localStorage.removeItem('userToken');
            showAuthButtons();
        });
    } else {
        showAuthButtons();
    }
}

function showUserMenu() {
    document.getElementById('auth-buttons').style.display = 'none';
    document.getElementById('user-menu').style.display = 'block';
    document.getElementById('user-name').textContent = currentUser.name;
}

function showAuthButtons() {
    document.getElementById('auth-buttons').style.display = 'block';
    document.getElementById('user-menu').style.display = 'none';
    currentUser = null;
}

// Modal functions
function showLoginModal() {
    const modal = new bootstrap.Modal(document.getElementById('loginModal'));
    modal.show();
}

function showRegisterModal() {
    const modal = new bootstrap.Modal(document.getElementById('registerModal'));
    modal.show();
}

function showAddClientModal() {
    if (!currentUser) {
        showAlert('برای افزودن مشتری ابتدا وارد شوید', 'warning');
        return;
    }
    const modal = new bootstrap.Modal(document.getElementById('addClientModal'));
    modal.show();
}

// Authentication actions
async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        showAlert('لطفاً ایمیل و رمز عبور را وارد کنید', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('userToken', data.token);
            currentUser = data.user;
            showUserMenu();
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
            modal.hide();
            
            showAlert('ورود موفقیت‌آمیز بود', 'success');
        } else {
            showAlert(data.error || 'خطا در ورود', 'danger');
        }
    } catch (error) {
        console.error('Login error:', error);
        showAlert('خطا در ارتباط با سرور', 'danger');
    }
}

async function register() {
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const phone = document.getElementById('register-phone').value;
    const password = document.getElementById('register-password').value;

    if (!name || !email || !phone || !password) {
        showAlert('لطفاً تمام فیلدهای ضروری را پر کنید', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, phone, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('userToken', data.token);
            currentUser = data.user;
            showUserMenu();
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
            modal.hide();
            
            showAlert('ثبت‌نام موفقیت‌آمیز بود', 'success');
        } else {
            showAlert(data.error || 'خطا در ثبت‌نام', 'danger');
        }
    } catch (error) {
        console.error('Register error:', error);
        showAlert('خطا در ارتباط با سرور', 'danger');
    }
}

function logout() {
    localStorage.removeItem('userToken');
    currentUser = null;
    showAuthButtons();
    showAlert('خروج موفقیت‌آمیز بود', 'success');
}

// Navigation functions
function showProperties() {
    hideAllSections();
    document.getElementById('properties-section').classList.add('section-active');
    loadProperties();
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    document.querySelector('.nav-link[onclick="showProperties()"]').classList.add('active');
}

function showClients() {
    if (!currentUser) {
        showAlert('برای دسترسی به این بخش، ابتدا وارد شوید', 'warning');
        return;
    }
    hideAllSections();
    document.getElementById('clients-section').classList.add('section-active');
    loadClients();
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    document.querySelector('.nav-link[onclick="showClients()"]').classList.add('active');
}

function showSubscription() {
    hideAllSections();
    document.getElementById('subscription-section').classList.add('section-active');
    loadSubscriptionPlans();
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    document.querySelector('.nav-link[onclick="showSubscription()"]').classList.add('active');
}

function hideAllSections() {
    document.getElementById('properties-section').classList.remove('section-active');
    document.getElementById('clients-section').classList.remove('section-active');
    document.getElementById('subscription-section').classList.remove('section-active');
}

// Property functions
async function loadProperties(page = 1) {
    console.log('🔍 Loading properties...');
    try {
        showLoading('properties-loading');
        
        const type = document.getElementById('property-type')?.value || '';
        const city = document.getElementById('city-filter')?.value || '';
        const neighborhood = document.getElementById('neighborhood-filter')?.value || '';
        
        const params = new URLSearchParams({
            page: page,
            limit: 12
        });
        
        if (type) params.append('type', type);
        if (city) params.append('city', city);
        if (neighborhood) params.append('neighborhood', neighborhood);

        const response = await fetch(`${API_BASE_URL}/files?${params}`);
        
        if (!response.ok) throw new Error('Failed to load properties');

        const data = await response.json();
        
        renderProperties(data.properties);
        renderPagination(data.pagination, 'properties-pagination', loadProperties);
        document.getElementById('properties-count').textContent = data.pagination.totalItems;
        
        hideLoading('properties-loading');

    } catch (error) {
        console.error('Error loading properties:', error);
        hideLoading('properties-loading');
        showAlert('خطا در بارگذاری ملک‌ها', 'danger');
    }
}

function renderProperties(properties) {
    console.log('🎨 Rendering properties:', properties.length);
    const container = document.getElementById('properties-container');
    
    if (properties.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    هیچ ملکی یافت نشد
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = properties.map(property => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card property-card">
                <img src="/${property.coverImage || 'public/images/placeholder.jpg'}" 
                     class="property-image" 
                     alt="تصویر ملک"
                     onerror="this.src='/public/images/placeholder.jpg'">
                <div class="card-body">
                    <h5 class="card-title">${property.title}</h5>
                    <p class="card-text text-muted">
                        <i class="fas fa-map-marker-alt me-1"></i>
                        ${property.city || 'نامشخص'} - ${property.neighborhood || 'نامشخص'}
                    </p>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge bg-${getPropertyTypeColor(property.type)}">
                            ${getPropertyTypeText(property.type)}
                        </span>
                        <span class="text-muted">
                            <i class="fas fa-ruler-combined me-1"></i>
                            ${property.metraj || 'نامشخص'}
                        </span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="price-badge">
                            ${getPropertyPrice(property)}
                        </span>
                        ${currentUser ? `
                            <button class="btn btn-sm btn-outline-primary" onclick="viewPropertyDetails(${property.id})">
                                <i class="fas fa-eye me-1"></i>
                                مشاهده جزئیات
                            </button>
                        ` : `
                            <button class="btn btn-sm btn-outline-warning" onclick="showLoginModal()">
                                <i class="fas fa-lock me-1"></i>
                                ورود برای مشاهده
                            </button>
                        `}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function searchProperties() {
    loadProperties(1);
}

function clearFilters() {
    document.getElementById('property-type').value = '';
    document.getElementById('city-filter').value = '';
    document.getElementById('neighborhood-filter').value = '';
    loadProperties(1);
}

// Client functions
async function loadClients() {
    if (!currentUser) return;
    
    try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${API_BASE_URL}/clients`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to load clients');

        const data = await response.json();
        renderClients(data.clients);

    } catch (error) {
        console.error('Error loading clients:', error);
        showAlert('خطا در بارگذاری مشتریان', 'danger');
    }
}

function renderClients(clients) {
    const container = document.getElementById('clients-container');
    
    if (clients.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    هیچ مشتری ثبت نشده است
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = clients.map(client => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="client-card">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <h6 class="mb-0">${client.name}</h6>
                    <span class="client-match">
                        <i class="fas fa-handshake me-1"></i>
                        ${client.matchCount || 0} تطبیق
                    </span>
                </div>
                <p class="text-muted mb-2">
                    <i class="fas fa-phone me-1"></i>
                    ${client.phone}
                </p>
                <div class="mb-2">
                    <span class="badge bg-primary me-1">${getPropertyTypeText(client.propertyType)}</span>
                    <span class="badge bg-info me-1">${client.area}</span>
                    <span class="badge bg-success">${client.city}</span>
                </div>
                ${client.budget ? `
                    <p class="text-muted mb-2">
                        <i class="fas fa-money-bill me-1"></i>
                        بودجه: ${formatCurrency(client.budget)}
                    </p>
                ` : ''}
                ${client.description ? `
                    <p class="text-muted small mb-2">${client.description}</p>
                ` : ''}
                <div class="d-flex justify-content-between">
                    <button class="btn btn-sm btn-outline-primary" onclick="findMatches(${client.id})">
                        <i class="fas fa-search me-1"></i>
                        یافتن تطبیق
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteClient(${client.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

async function addClient() {
    if (!currentUser) return;
    
    const name = document.getElementById('client-name').value;
    const phone = document.getElementById('client-phone').value;
    const propertyType = document.getElementById('client-property-type').value;
    const area = document.getElementById('client-area').value;
    const city = document.getElementById('client-city').value;
    const budget = document.getElementById('client-budget').value;
    const description = document.getElementById('client-description').value;

    if (!name || !phone || !propertyType || !area || !city) {
        showAlert('لطفاً تمام فیلدهای ضروری را پر کنید', 'warning');
        return;
    }

    try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${API_BASE_URL}/clients`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name,
                phone,
                propertyType,
                area,
                city,
                budget: budget ? parseInt(budget) : null,
                description
            })
        });

        const data = await response.json();

        if (response.ok) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('addClientModal'));
            modal.hide();
            showAlert('مشتری با موفقیت اضافه شد', 'success');
            loadClients();
        } else {
            showAlert(data.error || 'خطا در افزودن مشتری', 'danger');
        }
    } catch (error) {
        console.error('Error adding client:', error);
        showAlert('خطا در ارتباط با سرور', 'danger');
    }
}

// Subscription functions
async function loadSubscriptionPlans() {
    try {
        const response = await fetch(`${API_BASE_URL}/payment/plans`);
        
        if (!response.ok) throw new Error('Failed to load subscription plans');

        const data = await response.json();
        renderSubscriptionPlans(data.plans);

    } catch (error) {
        console.error('Error loading subscription plans:', error);
        showAlert('خطا در بارگذاری اشتراک‌ها', 'danger');
    }
}

function renderSubscriptionPlans(plans) {
    const container = document.getElementById('subscription-plans');
    
    container.innerHTML = plans.map(plan => `
        <div class="col-md-4 mb-4">
            <div class="subscription-card">
                <h4 class="mb-3">${plan.name}</h4>
                <p class="mb-3">${plan.description}</p>
                <div class="mb-3">
                    <h2 class="mb-0">${formatCurrency(plan.price.monthly)}</h2>
                    <small>ماهانه</small>
                </div>
                <div class="mb-3">
                    <h3 class="mb-0">${formatCurrency(plan.price.yearly)}</h3>
                    <small>سالانه (20% تخفیف)</small>
                </div>
                <ul class="list-unstyled mb-4">
                    ${plan.features.map(feature => `
                        <li class="mb-2">
                            <i class="fas fa-check me-2"></i>
                            ${feature}
                        </li>
                    `).join('')}
                </ul>
                ${currentUser ? `
                    <button class="btn btn-light btn-custom" onclick="subscribeToPlan('${plan.id}', 'monthly')">
                        اشتراک ماهانه
                    </button>
                    <button class="btn btn-light btn-custom mt-2" onclick="subscribeToPlan('${plan.id}', 'yearly')">
                        اشتراک سالانه
                    </button>
                ` : `
                    <button class="btn btn-light btn-custom" onclick="showRegisterModal()">
                        ثبت‌نام برای اشتراک
                    </button>
                `}
            </div>
        </div>
    `).join('');
}

async function subscribeToPlan(planId, period) {
    if (!currentUser) {
        showAlert('ابتدا وارد شوید', 'warning');
        return;
    }

    try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${API_BASE_URL}/payment/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                planId,
                period,
                amount: period === 'monthly' ? 50000 : 480000, // Example amounts
                description: `اشتراک ${period === 'monthly' ? 'ماهانه' : 'سالانه'}`
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Redirect to payment gateway
            window.location.href = data.paymentUrl;
        } else {
            showAlert(data.error || 'خطا در ایجاد پرداخت', 'danger');
        }
    } catch (error) {
        console.error('Error creating subscription:', error);
        showAlert('خطا در ارتباط با سرور', 'danger');
    }
}

// Utility functions
function showLoading(elementId) {
    document.getElementById(elementId).style.display = 'block';
}

function hideLoading(elementId) {
    document.getElementById(elementId).style.display = 'none';
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

function renderPagination(pagination, containerId, loadFunction) {
    const container = document.getElementById(containerId);
    
    if (pagination.totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let paginationHTML = '<ul class="pagination">';
    
    // Previous button
    if (pagination.hasPrevPage) {
        paginationHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${pagination.currentPage - 1}">قبلی</a></li>`;
    }
    
    // Page numbers
    for (let i = 1; i <= pagination.totalPages; i++) {
        if (i === pagination.currentPage) {
            paginationHTML += `<li class="page-item active"><span class="page-link">${i}</span></li>`;
        } else {
            paginationHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
        }
    }
    
    // Next button
    if (pagination.hasNextPage) {
        paginationHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${pagination.currentPage + 1}">بعدی</a></li>`;
    }
    
    paginationHTML += '</ul>';
    container.innerHTML = paginationHTML;
    
    // Add event listeners
    const pageLinks = container.querySelectorAll('.page-link[data-page]');
    pageLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = parseInt(e.target.dataset.page);
            loadFunction(page);
        });
    });
}

async function loadCities() {
    try {
        const response = await fetch(`${API_BASE_URL}/files/cities`);
        if (!response.ok) throw new Error('Failed to load cities');
        
        const cities = await response.json();
        const selects = ['city-filter', 'client-city'];
        
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                select.innerHTML = '<option value="">همه شهرها</option>';
                cities.forEach(city => {
                    select.innerHTML += `<option value="${city}">${city}</option>`;
                });
            }
        });
    } catch (error) {
        console.error('Error loading cities:', error);
    }
}

function getPropertyTypeText(type) {
    const types = {
        'sale': 'فروش',
        'rent': 'اجاره',
        'land': 'زمین',
        'partnership': 'مشارکت'
    };
    return types[type] || type;
}

function getPropertyTypeColor(type) {
    const colors = {
        'sale': 'success',
        'rent': 'primary',
        'land': 'warning',
        'partnership': 'info'
    };
    return colors[type] || 'secondary';
}

function getPropertyPrice(property) {
    if (property.saleDetail) {
        return property.saleDetail.totalPrice || 'قیمت توافقی';
    } else if (property.rentDetail) {
        return `${property.rentDetail.rent} (ودیعه: ${property.rentDetail.deposit})`;
    }
    return 'قیمت توافقی';
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
}

// Placeholder functions for future implementation
function viewPropertyDetails(propertyId) {
    showAlert('مشاهده جزئیات ملک در حال توسعه است', 'info');
}

function findMatches(clientId) {
    showAlert('یافتن تطبیق‌ها در حال توسعه است', 'info');
}

function deleteClient(clientId) {
    if (confirm('آیا از حذف این مشتری اطمینان دارید؟')) {
        showAlert('حذف مشتری در حال توسعه است', 'info');
    }
}

function showProfile() {
    showAlert('پروفایل در حال توسعه است', 'info');
}

function showMySubscriptions() {
    showAlert('اشتراک‌های من در حال توسعه است', 'info');
} 