// Admin Panel JavaScript
const API_BASE_URL = 'http://localhost:5001/api/v1';
let currentUser = null;
let currentPage = 1;
let selectedUsers = [];

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    updateTime();
    setInterval(updateTime, 1000);
    loadDashboard();
});

// Check authentication
async function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = '/admin/login.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Unauthorized');
        }

        const data = await response.json();
        currentUser = data.user;
        
        // Check if user has admin privileges
        if (!['admin', 'super_admin'].includes(currentUser.role)) {
            alert('شما دسترسی به پنل مدیریت ندارید');
            window.location.href = '/';
            return;
        }

        // Hide super admin features for regular admins
        if (currentUser.role !== 'super_admin') {
            document.querySelectorAll('.super-admin-only').forEach(el => {
                el.style.display = 'none';
            });
        }

    } catch (error) {
        console.error('Auth error:', error);
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login.html';
    }
}

// Update current time
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleString('fa-IR');
    document.getElementById('current-time').textContent = timeString;
}

// Navigation functions
function showDashboard() {
    hideAllSections();
    document.getElementById('dashboard-section').style.display = 'block';
    updateActiveNav('dashboard');
    loadDashboard();
}

function showUsers() {
    hideAllSections();
    document.getElementById('users-section').style.display = 'block';
    updateActiveNav('users');
    loadUsers();
}

function showProperties() {
    hideAllSections();
    document.getElementById('properties-section').style.display = 'block';
    updateActiveNav('properties');
    loadProperties();
    loadCities();
}

function showPayments() {
    hideAllSections();
    document.getElementById('payments-section').style.display = 'block';
    updateActiveNav('payments');
    loadPayments();
}

function showReports() {
    hideAllSections();
    document.getElementById('reports-section').style.display = 'block';
    updateActiveNav('reports');
    loadReports();
}

function showClients() {
    hideAllSections();
    document.getElementById('clients-section').style.display = 'block';
    updateActiveNav('clients');
    loadClients();
    loadClientCities();
}

function hideAllSections() {
    const sections = ['dashboard-section', 'users-section', 'properties-section', 'payments-section', 'reports-section'];
    sections.forEach(section => {
        document.getElementById(section).style.display = 'none';
    });
}

function updateActiveNav(section) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const navMap = {
        'dashboard': 0,
        'users': 1,
        'properties': 2,
        'payments': 3,
        'reports': 4,
        'clients': 5
    };
    
    document.querySelectorAll('.nav-link')[navMap[section]].classList.add('active');
}

// Dashboard functions
async function loadDashboard() {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE_URL}/admin/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to load stats');

        const stats = await response.json();
        
        // Update stats cards
        document.getElementById('total-users').textContent = stats.totalUsers || 0;
        document.getElementById('total-properties').textContent = stats.totalProperties || 0;
        document.getElementById('successful-payments').textContent = stats.successfulPayments || 0;
        document.getElementById('total-revenue').textContent = formatCurrency(stats.totalRevenue || 0);

        // Load recent activities
        loadRecentUsers();
        loadRecentPayments();

    } catch (error) {
        console.error('Error loading dashboard:', error);
        showAlert('خطا در بارگذاری داشبورد', 'danger');
    }
}

async function loadRecentUsers() {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE_URL}/admin/users?limit=5&sortBy=createdAt&sortOrder=DESC`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to load recent users');

        const data = await response.json();
        const container = document.getElementById('recent-users');
        
        container.innerHTML = data.users.map(user => `
            <div class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="mb-0">${user.name}</h6>
                    <small class="text-muted">${user.email}</small>
                </div>
                <span class="badge ${user.isActive ? 'bg-success' : 'bg-secondary'} rounded-pill">
                    ${user.isActive ? 'فعال' : 'غیرفعال'}
                </span>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading recent users:', error);
    }
}

async function loadRecentPayments() {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE_URL}/payment/history?limit=5`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to load recent payments');

        const data = await response.json();
        const container = document.getElementById('recent-payments');
        
        container.innerHTML = data.payments.map(payment => `
            <div class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="mb-0">${formatCurrency(payment.amount)}</h6>
                    <small class="text-muted">${payment.description}</small>
                </div>
                <span class="badge ${getPaymentStatusBadge(payment.status)} rounded-pill">
                    ${getPaymentStatusText(payment.status)}
                </span>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading recent payments:', error);
    }
}

// User management functions
async function loadUsers(page = 1) {
    try {
        showLoading('users-loading');
        
        const search = document.getElementById('user-search').value;
        const role = document.getElementById('role-filter').value;
        const isActive = document.getElementById('status-filter').value;
        
        const params = new URLSearchParams({
            page: page,
            limit: 10,
            search: search,
            role: role,
            isActive: isActive
        });

        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE_URL}/admin/users?${params}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to load users');

        const data = await response.json();
        currentPage = page;
        
        renderUsersTable(data.users);
        renderPagination(data.pagination, 'users-pagination', loadUsers);
        
        hideLoading('users-loading');

    } catch (error) {
        console.error('Error loading users:', error);
        hideLoading('users-loading');
        showAlert('خطا در بارگذاری کاربران', 'danger');
    }
}

function renderUsersTable(users) {
    const tbody = document.getElementById('users-tbody');
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>
                <input type="checkbox" class="user-checkbox" value="${user.id}" onchange="toggleUserSelection(${user.id})">
            </td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.phone || '-'}</td>
            <td>
                <span class="role-badge role-${user.role}">
                    ${getRoleText(user.role)}
                </span>
            </td>
            <td>
                <span class="status-badge ${user.isActive ? 'status-active' : 'status-inactive'}">
                    ${user.isActive ? 'فعال' : 'غیرفعال'}
                </span>
            </td>
            <td>${formatDate(user.createdAt)}</td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    <button class="btn btn-outline-primary" onclick="editUser(${user.id})" title="ویرایش">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-warning" onclick="changeUserPassword(${user.id})" title="تغییر رمز">
                        <i class="fas fa-key"></i>
                    </button>
                    <button class="btn btn-outline-${user.isActive ? 'warning' : 'success'}" 
                            onclick="toggleUserStatus(${user.id}, ${user.isActive})" 
                            title="${user.isActive ? 'غیرفعال کردن' : 'فعال کردن'}">
                        <i class="fas fa-${user.isActive ? 'ban' : 'check'}"></i>
                    </button>
                    ${currentUser.role === 'super_admin' ? `
                        <button class="btn btn-outline-danger" onclick="deleteUser(${user.id})" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

// Property management functions
async function loadProperties(page = 1) {
    try {
        showLoading('properties-loading');
        
        const search = document.getElementById('property-search').value;
        const type = document.getElementById('property-type-filter').value;
        const city = document.getElementById('city-filter').value;
        
        const params = new URLSearchParams({
            page: page,
            limit: 10
        });
        
        if (search) params.append('search', search);
        if (type) params.append('type', type);
        if (city) params.append('city', city);

        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE_URL}/admin/properties?${params}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to load properties');

        const data = await response.json();
        
        console.log('Properties data:', data);
        console.log('Pagination:', data.pagination);
        
        renderPropertiesTable(data.properties);
        renderPagination(data.pagination, 'properties-pagination', loadProperties);
        
        hideLoading('properties-loading');

    } catch (error) {
        console.error('Error loading properties:', error);
        hideLoading('properties-loading');
        showAlert('خطا در بارگذاری ملک‌ها', 'danger');
    }
}

function renderPropertiesTable(properties) {
    const tbody = document.getElementById('properties-tbody');
    
    tbody.innerHTML = properties.map(property => `
        <tr>
            <td>
                ${property.coverImage ? 
                    `<img src="/${property.coverImage}" alt="تصویر ملک" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">` : 
                    '<i class="fas fa-image text-muted" style="font-size: 24px;"></i>'
                }
            </td>
            <td>${property.title}</td>
            <td>
                <span class="badge bg-${getPropertyTypeColor(property.type)}">
                    ${getPropertyTypeText(property.type)}
                </span>
            </td>
            <td>${property.city || '-'}</td>
            <td>${property.neighborhood || '-'}</td>
            <td>${property.metraj || '-'}</td>
            <td>${getPropertyRooms(property)}</td>
            <td>${getPropertyBuildYear(property)}</td>
            <td>${getPropertyPrice(property)}</td>
            <td>${formatDate(property.createdAt)}</td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    <button class="btn btn-outline-primary" onclick="viewProperty(${property.id})" title="مشاهده">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline-info" onclick="editProperty(${property.id})" title="ویرایش">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Payment management functions
async function loadPayments(page = 1) {
    try {
        showLoading('payments-loading');
        
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE_URL}/payment/history?page=${page}&limit=10`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to load payments');

        const data = await response.json();
        
        // Update payment stats
        updatePaymentStats(data.payments);
        
        renderPaymentsTable(data.payments);
        renderPagination(data.pagination, 'payments-pagination', loadPayments);
        
        hideLoading('payments-loading');

    } catch (error) {
        console.error('Error loading payments:', error);
        hideLoading('payments-loading');
        showAlert('خطا در بارگذاری پرداخت‌ها', 'danger');
    }
}

function updatePaymentStats(payments) {
    const totalPayments = payments.length;
    const successfulPayments = payments.filter(p => p.status === 'success').length;
    const pendingPayments = payments.filter(p => p.status === 'pending').length;
    const totalAmount = payments.filter(p => p.status === 'success').reduce((sum, p) => sum + p.amount, 0);

    document.getElementById('total-payments').textContent = totalPayments;
    document.getElementById('successful-payments-count').textContent = successfulPayments;
    document.getElementById('pending-payments').textContent = pendingPayments;
    document.getElementById('total-amount').textContent = formatCurrency(totalAmount);
}

function renderPaymentsTable(payments) {
    const tbody = document.getElementById('payments-tbody');
    
    tbody.innerHTML = payments.map(payment => `
        <tr>
            <td>${payment.id}</td>
            <td>${payment.user ? payment.user.name : 'نامشخص'}</td>
            <td>${formatCurrency(payment.amount)}</td>
            <td>${payment.description}</td>
            <td>
                <span class="badge ${getPaymentStatusBadge(payment.status)}">
                    ${getPaymentStatusText(payment.status)}
                </span>
            </td>
            <td>${payment.refId || '-'}</td>
            <td>${formatDate(payment.createdAt)}</td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    <button class="btn btn-outline-primary" onclick="viewPayment(${payment.id})" title="مشاهده">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${payment.status === 'pending' ? `
                        <button class="btn btn-outline-warning" onclick="cancelPayment(${payment.id})" title="لغو">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

// Reports functions
async function loadReports() {
    try {
        // Load charts
        loadUsersChart();
        loadPaymentsChart();
    } catch (error) {
        console.error('Error loading reports:', error);
        showAlert('خطا در بارگذاری گزارشات', 'danger');
    }
}

async function loadUsersChart() {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE_URL}/admin/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to load user stats');

        const stats = await response.json();
        
        const ctx = document.getElementById('users-chart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['کاربران فعال', 'کاربران غیرفعال', 'کاربران جدید (30 روز)'],
                datasets: [{
                    data: [
                        stats.activeUsers || 0,
                        stats.inactiveUsers || 0,
                        stats.newUsersLast30Days || 0
                    ],
                    backgroundColor: ['#28a745', '#dc3545', '#17a2b8']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });

    } catch (error) {
        console.error('Error loading users chart:', error);
    }
}

async function loadPaymentsChart() {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE_URL}/payment/history?limit=100`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to load payment stats');

        const data = await response.json();
        
        const statusCounts = {
            success: 0,
            pending: 0,
            failed: 0,
            cancelled: 0
        };

        data.payments.forEach(payment => {
            statusCounts[payment.status]++;
        });

        const ctx = document.getElementById('payments-chart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['موفق', 'در انتظار', 'ناموفق', 'لغو شده'],
                datasets: [{
                    label: 'تعداد پرداخت‌ها',
                    data: [
                        statusCounts.success,
                        statusCounts.pending,
                        statusCounts.failed,
                        statusCounts.cancelled
                    ],
                    backgroundColor: ['#28a745', '#ffc107', '#dc3545', '#6c757d']
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

    } catch (error) {
        console.error('Error loading payments chart:', error);
    }
}

// User management modal functions
function showAddUserModal() {
    if (currentUser.role !== 'super_admin') {
        showAlert('فقط سوپر ادمین می‌تواند کاربر جدید اضافه کند', 'warning');
        return;
    }
    
    document.getElementById('addUserForm').reset();
    new bootstrap.Modal(document.getElementById('addUserModal')).show();
}

async function addUser() {
    try {
        const formData = {
            name: document.getElementById('user-name').value,
            email: document.getElementById('user-email').value,
            phone: document.getElementById('user-phone').value,
            password: document.getElementById('user-password').value,
            role: document.getElementById('user-role').value
        };

        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error('Failed to add user');

        showAlert('کاربر با موفقیت اضافه شد', 'success');
        bootstrap.Modal.getInstance(document.getElementById('addUserModal')).hide();
        loadUsers();

    } catch (error) {
        console.error('Error adding user:', error);
        showAlert('خطا در افزودن کاربر', 'danger');
    }
}

async function editUser(userId) {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to load user');

        const user = await response.json();
        
        document.getElementById('edit-user-id').value = user.id;
        document.getElementById('edit-user-name').value = user.name;
        document.getElementById('edit-user-email').value = user.email;
        document.getElementById('edit-user-phone').value = user.phone || '';
        document.getElementById('edit-user-role').value = user.role;
        
        new bootstrap.Modal(document.getElementById('editUserModal')).show();

    } catch (error) {
        console.error('Error loading user:', error);
        showAlert('خطا در بارگذاری اطلاعات کاربر', 'danger');
    }
}

async function updateUser() {
    try {
        const userId = document.getElementById('edit-user-id').value;
        const formData = {
            name: document.getElementById('edit-user-name').value,
            email: document.getElementById('edit-user-email').value,
            phone: document.getElementById('edit-user-phone').value,
            role: document.getElementById('edit-user-role').value
        };

        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error('Failed to update user');

        showAlert('کاربر با موفقیت بروزرسانی شد', 'success');
        bootstrap.Modal.getInstance(document.getElementById('editUserModal')).hide();
        loadUsers();

    } catch (error) {
        console.error('Error updating user:', error);
        showAlert('خطا در بروزرسانی کاربر', 'danger');
    }
}

function changeUserPassword(userId) {
    if (currentUser.role !== 'super_admin') {
        showAlert('فقط سوپر ادمین می‌تواند رمز عبور را تغییر دهد', 'warning');
        return;
    }
    
    document.getElementById('password-user-id').value = userId;
    document.getElementById('changePasswordForm').reset();
    new bootstrap.Modal(document.getElementById('changePasswordModal')).show();
}

async function changePassword() {
    try {
        const userId = document.getElementById('password-user-id').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword !== confirmPassword) {
            showAlert('رمز عبور و تکرار آن یکسان نیستند', 'danger');
            return;
        }

        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/password`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ password: newPassword })
        });

        if (!response.ok) throw new Error('Failed to change password');

        showAlert('رمز عبور با موفقیت تغییر یافت', 'success');
        bootstrap.Modal.getInstance(document.getElementById('changePasswordModal')).hide();

    } catch (error) {
        console.error('Error changing password:', error);
        showAlert('خطا در تغییر رمز عبور', 'danger');
    }
}

// Bulk actions
function toggleSelectAll() {
    const selectAll = document.getElementById('select-all-users');
    const checkboxes = document.querySelectorAll('.user-checkbox');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAll.checked;
        if (selectAll.checked) {
            selectedUsers.push(parseInt(checkbox.value));
        } else {
            selectedUsers = [];
        }
    });
}

function toggleUserSelection(userId) {
    const index = selectedUsers.indexOf(userId);
    if (index > -1) {
        selectedUsers.splice(index, 1);
    } else {
        selectedUsers.push(userId);
    }
}

async function bulkAction(action) {
    if (selectedUsers.length === 0) {
        showAlert('لطفاً کاربران مورد نظر را انتخاب کنید', 'warning');
        return;
    }

    if (!confirm(`آیا از ${getBulkActionText(action)} ${selectedUsers.length} کاربر اطمینان دارید؟`)) {
        return;
    }

    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE_URL}/admin/users/bulk-action`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                userIds: selectedUsers,
                action: action
            })
        });

        if (!response.ok) throw new Error('Failed to perform bulk action');

        showAlert(`${getBulkActionText(action)} با موفقیت انجام شد`, 'success');
        selectedUsers = [];
        document.getElementById('select-all-users').checked = false;
        loadUsers();

    } catch (error) {
        console.error('Error performing bulk action:', error);
        showAlert('خطا در انجام عملیات گروهی', 'danger');
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
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.querySelector('.main-content').insertBefore(alertDiv, document.querySelector('.main-content').firstChild);
    
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

function formatCurrency(amount) {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('fa-IR');
}

function getRoleText(role) {
    const roles = {
        'user': 'کاربر',
        'admin': 'ادمین',
        'super_admin': 'سوپر ادمین'
    };
    return roles[role] || role;
}

function getPaymentStatusText(status) {
    const statuses = {
        'pending': 'در انتظار',
        'success': 'موفق',
        'failed': 'ناموفق',
        'cancelled': 'لغو شده'
    };
    return statuses[status] || status;
}

function getPaymentStatusBadge(status) {
    const badges = {
        'pending': 'bg-warning',
        'success': 'bg-success',
        'failed': 'bg-danger',
        'cancelled': 'bg-secondary'
    };
    return badges[status] || 'bg-secondary';
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
        return property.saleDetail.totalPrice || '-';
    } else if (property.rentDetail) {
        return `${property.rentDetail.rent} (ودیعه: ${property.rentDetail.deposit})`;
    }
    return '-';
}

function getPropertyRooms(property) {
    if (property.saleDetail && property.saleDetail.rooms) {
        return property.saleDetail.rooms;
    } else if (property.rentDetail && property.rentDetail.rooms) {
        return property.rentDetail.rooms;
    }
    return '-';
}

function getPropertyBuildYear(property) {
    if (property.saleDetail && property.saleDetail.buildYear) {
        return property.saleDetail.buildYear;
    } else if (property.rentDetail && property.rentDetail.buildYear) {
        return property.rentDetail.buildYear;
    }
    return '-';
}

function getBulkActionText(action) {
    const actions = {
        'activate': 'فعال کردن',
        'deactivate': 'غیرفعال کردن',
        'delete': 'حذف'
    };
    return actions[action] || action;
}

async function loadCities() {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE_URL}/admin/cities`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to load cities');
        
        const data = await response.json();
        const select = document.getElementById('city-filter');
        
        select.innerHTML = '<option value="">همه شهرها</option>';
        data.cities.forEach(city => {
            select.innerHTML += `<option value="${city.name}">${city.name}</option>`;
        });
    } catch (error) {
        console.error('Error loading cities:', error);
    }
}

// Export functions
function exportReport(type) {
    showAlert('این قابلیت در حال توسعه است', 'info');
}

// Logout function
function logout() {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login.html';
}

// Mobile sidebar toggle
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('show');
}

// Placeholder functions for future implementation
function viewProperty(id) {
    showAlert('مشاهده جزئیات ملک در حال توسعه است', 'info');
}

function editProperty(id) {
    showAlert('ویرایش ملک در حال توسعه است', 'info');
}

function viewPayment(id) {
    showAlert('مشاهده جزئیات پرداخت در حال توسعه است', 'info');
}

function cancelPayment(id) {
    showAlert('لغو پرداخت در حال توسعه است', 'info');
}

async function toggleUserStatus(userId, currentStatus) {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ isActive: !currentStatus })
        });

        if (!response.ok) throw new Error('Failed to toggle user status');

        showAlert(`کاربر ${!currentStatus ? 'فعال' : 'غیرفعال'} شد`, 'success');
        loadUsers();

    } catch (error) {
        console.error('Error toggling user status:', error);
        showAlert('خطا در تغییر وضعیت کاربر', 'danger');
    }
}

async function deleteUser(userId) {
    if (currentUser.role !== 'super_admin') {
        showAlert('فقط سوپر ادمین می‌تواند کاربر را حذف کند', 'warning');
        return;
    }

    if (!confirm('آیا از حذف این کاربر اطمینان دارید؟')) {
        return;
    }

    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to delete user');

        showAlert('کاربر با موفقیت حذف شد', 'success');
        loadUsers();

    } catch (error) {
        console.error('Error deleting user:', error);
        showAlert('خطا در حذف کاربر', 'danger');
    }
} 

async function loadClients(page = 1) {
    try {
        showLoading('clients-loading');
        const token = localStorage.getItem('adminToken');
        
        let url = `${API_BASE_URL}/admin/clients?page=${page}`;
        
        // Add filters
        const search = document.getElementById('client-search')?.value;
        const propertyType = document.getElementById('client-property-type-filter')?.value;
        const city = document.getElementById('client-city-filter')?.value;
        
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (propertyType) url += `&propertyType=${propertyType}`;
        if (city) url += `&city=${encodeURIComponent(city)}`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to load clients');

        const data = await response.json();
        renderClientsTable(data.clients);
        renderPagination(data.pagination, 'clients-pagination', loadClients);

    } catch (error) {
        console.error('Error loading clients:', error);
        showAlert('خطا در بارگذاری مشتریان', 'danger');
    } finally {
        hideLoading('clients-loading');
    }
}

function renderClientsTable(clients) {
    const tbody = document.getElementById('clients-tbody');
    if (!tbody) return;

    if (!clients || clients.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" class="text-center text-muted py-4">
                    <i class="fas fa-users fa-2x mb-2"></i>
                    <br>هیچ مشتری‌ای یافت نشد
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = clients.map(client => `
        <tr>
            <td>
                <input type="checkbox" class="client-checkbox" value="${client.id}" onchange="toggleClientSelection(${client.id})">
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <div class="avatar-sm bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2">
                        <i class="fas fa-user"></i>
                    </div>
                    <div>
                        <div class="fw-bold">${client.name}</div>
                        <small class="text-muted">ID: ${client.id}</small>
                    </div>
                </div>
            </td>
            <td>
                <a href="tel:${client.phone}" class="text-decoration-none">
                    <i class="fas fa-phone me-1"></i>${client.phone}
                </a>
            </td>
            <td>
                <span class="badge bg-${getPropertyTypeColor(client.propertyType)}">
                    ${getPropertyTypeText(client.propertyType)}
                </span>
            </td>
            <td>${client.area}</td>
            <td>${client.city}</td>
            <td>
                ${client.budget ? formatCurrency(client.budget) : 'نامشخص'}
            </td>
            <td>
                <span class="badge ${client.isActive ? 'bg-success' : 'bg-danger'}">
                    ${client.isActive ? 'فعال' : 'غیرفعال'}
                </span>
            </td>
            <td>${formatDate(client.createdAt)}</td>
            <td>
                <div class="btn-group" role="group">
                    <button type="button" class="btn btn-sm btn-outline-primary" onclick="viewClientFiles(${client.id})" title="مشاهده فایل‌ها">
                        <i class="fas fa-folder"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-info" onclick="findMatches(${client.id})" title="یافتن تطبیق‌ها">
                        <i class="fas fa-search"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-warning" onclick="editClient(${client.id})" title="ویرایش">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-danger" onclick="deleteClient(${client.id})" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function loadClientCities() {
    try {
        const response = await fetch(`${API_BASE_URL}/files/cities`);
        if (!response.ok) throw new Error('Failed to load cities');
        
        const data = await response.json();
        const select = document.getElementById('client-city-filter');
        
        if (select) {
            select.innerHTML = '<option value="">همه شهرها</option>';
            data.cities.forEach(city => {
                select.innerHTML += `<option value="${city.name}">${city.name}</option>`;
            });
        }
    } catch (error) {
        console.error('Error loading client cities:', error);
    }
}

function showAddClientModal() {
    document.getElementById('addClientModal').classList.add('show');
    document.getElementById('addClientModal').style.display = 'block';
    document.body.classList.add('modal-open');
}

async function addClient() {
    try {
        const formData = {
            name: document.getElementById('client-name').value,
            phone: document.getElementById('client-phone').value,
            propertyType: document.getElementById('client-property-type').value,
            area: document.getElementById('client-area').value,
            city: document.getElementById('client-city').value,
            budget: document.getElementById('client-budget').value,
            description: document.getElementById('client-description').value
        };

        // Validation
        if (!formData.name || !formData.phone || !formData.propertyType || !formData.area || !formData.city) {
            showAlert('لطفاً تمام فیلدهای ضروری را پر کنید', 'warning');
            return;
        }

        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE_URL}/admin/clients`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error('Failed to add client');

        const data = await response.json();
        showAlert('مشتری با موفقیت اضافه شد', 'success');
        
        // Close modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('addClientModal'));
        modal.hide();
        document.getElementById('addClientForm').reset();
        
        // Reload clients
        loadClients();

    } catch (error) {
        console.error('Error adding client:', error);
        showAlert('خطا در افزودن مشتری', 'danger');
    }
}

async function editClient(clientId) {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE_URL}/admin/clients/${clientId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to load client');

        const data = await response.json();
        const client = data.client;

        // Populate form
        document.getElementById('edit-client-id').value = client.id;
        document.getElementById('edit-client-name').value = client.name;
        document.getElementById('edit-client-phone').value = client.phone;
        document.getElementById('edit-client-property-type').value = client.propertyType;
        document.getElementById('edit-client-area').value = client.area;
        document.getElementById('edit-client-city').value = client.city;
        document.getElementById('edit-client-budget').value = client.budget || '';
        document.getElementById('edit-client-description').value = client.description || '';

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('editClientModal'));
        modal.show();

    } catch (error) {
        console.error('Error loading client for edit:', error);
        showAlert('خطا در بارگذاری اطلاعات مشتری', 'danger');
    }
}

async function updateClient() {
    try {
        const clientId = document.getElementById('edit-client-id').value;
        const formData = {
            name: document.getElementById('edit-client-name').value,
            phone: document.getElementById('edit-client-phone').value,
            propertyType: document.getElementById('edit-client-property-type').value,
            area: document.getElementById('edit-client-area').value,
            city: document.getElementById('edit-client-city').value,
            budget: document.getElementById('edit-client-budget').value,
            description: document.getElementById('edit-client-description').value
        };

        // Validation
        if (!formData.name || !formData.phone || !formData.propertyType || !formData.area || !formData.city) {
            showAlert('لطفاً تمام فیلدهای ضروری را پر کنید', 'warning');
            return;
        }

        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE_URL}/admin/clients/${clientId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error('Failed to update client');

        const data = await response.json();
        showAlert('مشتری با موفقیت ویرایش شد', 'success');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editClientModal'));
        modal.hide();
        
        // Reload clients
        loadClients();

    } catch (error) {
        console.error('Error updating client:', error);
        showAlert('خطا در ویرایش مشتری', 'danger');
    }
}

async function deleteClient(clientId) {
    if (!confirm('آیا از حذف این مشتری اطمینان دارید؟')) {
        return;
    }

    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE_URL}/admin/clients/${clientId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to delete client');

        showAlert('مشتری با موفقیت حذف شد', 'success');
        loadClients();

    } catch (error) {
        console.error('Error deleting client:', error);
        showAlert('خطا در حذف مشتری', 'danger');
    }
}

async function viewClientFiles(clientId) {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE_URL}/admin/clients/${clientId}/files`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to load client files');

        const data = await response.json();
        
        // Show files in a modal
        showClientFilesModal(data.files, data.client);

    } catch (error) {
        console.error('Error loading client files:', error);
        showAlert('خطا در بارگذاری فایل‌های مشتری', 'danger');
    }
}

function showClientFilesModal(files, client) {
    const modalHtml = `
        <div class="modal fade" id="clientFilesModal" tabindex="-1">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-folder me-2"></i>
                            فایل‌های مشتری: ${client.name}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${files.length === 0 ? 
                            '<div class="text-center text-muted py-4"><i class="fas fa-folder-open fa-2x mb-2"></i><br>هیچ فایلی برای این مشتری یافت نشد</div>' :
                            `<div class="row">
                                ${files.map(file => `
                                    <div class="col-md-6 mb-3">
                                        <div class="card ${file.isNew ? 'border-danger' : ''}">
                                            <div class="card-body">
                                                <div class="d-flex align-items-center justify-content-between">
                                                    <div class="d-flex align-items-center">
                                                        <i class="fas fa-file-alt fa-2x text-primary me-3"></i>
                                                        <div>
                                                            <h6 class="mb-1">${file.title || 'فایل بدون عنوان'}</h6>
                                                            <small class="text-muted">${formatDate(file.createdAt)}</small>
                                                            <div class="mt-1">
                                                                <span class="badge bg-${getFileTypeColor(file.fileType)}">${getFileTypeText(file.fileType)}</span>
                                                                ${file.isNew ? '<span class="badge bg-danger ms-1">جدید</span>' : ''}
                                                                ${file.isRead ? '<span class="badge bg-success ms-1">خوانده شده</span>' : ''}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="btn-group" role="group">
                                                        <button type="button" class="btn btn-sm btn-outline-primary" onclick="downloadFile('${file.filePath}')" title="دانلود">
                                                            <i class="fas fa-download"></i>
                                                        </button>
                                                        ${!file.isRead ? `<button type="button" class="btn btn-sm btn-outline-success" onclick="markFileAsRead(${client.id}, ${file.id})" title="علامت‌گذاری به عنوان خوانده شده">
                                                            <i class="fas fa-check"></i>
                                                        </button>` : ''}
                                                        <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeClientFile(${client.id}, ${file.id})" title="حذف">
                                                            <i class="fas fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                                ${file.description ? `<p class="mt-2 mb-0 text-muted small">${file.description}</p>` : ''}
                                                ${file.matchScore ? `<div class="mt-2"><small class="text-muted">امتیاز تطبیق: ${file.matchScore}%</small></div>` : ''}
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>`
                        }
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">بستن</button>
                        <button type="button" class="btn btn-primary" onclick="addFileToClient(${client.id})">
                            <i class="fas fa-plus me-1"></i>افزودن فایل
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('clientFilesModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Add new modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('clientFilesModal'));
    modal.show();
}

async function markFileAsRead(clientId, fileId) {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE_URL}/admin/clients/${clientId}/files/${fileId}/read`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to mark file as read');

        showAlert('فایل با موفقیت علامت‌گذاری شد', 'success');
        viewClientFiles(clientId); // Refresh the modal

    } catch (error) {
        console.error('Error marking file as read:', error);
        showAlert('خطا در علامت‌گذاری فایل', 'danger');
    }
}

async function removeClientFile(clientId, fileId) {
    if (!confirm('آیا از حذف این فایل اطمینان دارید؟')) {
        return;
    }

    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE_URL}/admin/clients/${clientId}/files/${fileId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to remove file');

        showAlert('فایل با موفقیت حذف شد', 'success');
        viewClientFiles(clientId); // Refresh the modal

    } catch (error) {
        console.error('Error removing file:', error);
        showAlert('خطا در حذف فایل', 'danger');
    }
}

function downloadFile(filePath) {
    // Create a temporary link to download the file
    const link = document.createElement('a');
    link.href = filePath;
    link.download = filePath.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function addFileToClient(clientId) {
    // This would open a file upload modal or redirect to file selection
    showAlert('این قابلیت در حال توسعه است', 'info');
}

function getFileTypeText(fileType) {
    const types = {
        'property': 'ملک',
        'crawled': 'کراول شده',
        'generated': 'تولید شده'
    };
    return types[fileType] || fileType;
}

function getFileTypeColor(fileType) {
    const colors = {
        'property': 'primary',
        'crawled': 'success',
        'generated': 'warning'
    };
    return colors[fileType] || 'secondary';
}

async function findMatches(clientId) {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE_URL}/admin/clients/${clientId}/matches`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to load matches');

        const data = await response.json();
        showMatchesModal(data.matches, data.client);

    } catch (error) {
        console.error('Error loading matches:', error);
        showAlert('خطا در بارگذاری تطبیق‌ها', 'danger');
    }
}

function showMatchesModal(matches, client) {
    const modalHtml = `
        <div class="modal fade" id="matchesModal" tabindex="-1">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-search me-2"></i>
                            تطبیق‌های یافت شده برای: ${client.name}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${matches.length === 0 ? 
                            '<div class="text-center text-muted py-4"><i class="fas fa-search fa-2x mb-2"></i><br>هیچ تطبیقی یافت نشد</div>' :
                            `<div class="table-responsive">
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>عنوان</th>
                                            <th>نوع</th>
                                            <th>متراژ</th>
                                            <th>شهر</th>
                                            <th>قیمت</th>
                                            <th>عملیات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${matches.map(property => `
                                            <tr>
                                                <td>${property.title}</td>
                                                <td><span class="badge bg-${getPropertyTypeColor(property.type)}">${getPropertyTypeText(property.type)}</span></td>
                                                <td>${property.metraj || 'نامشخص'}</td>
                                                <td>${property.city || 'نامشخص'}</td>
                                                <td>${getPropertyPrice(property)}</td>
                                                <td>
                                                    <button class="btn btn-sm btn-outline-primary" onclick="viewProperty(${property.id})">
                                                        <i class="fas fa-eye"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>`
                        }
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('matchesModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Add new modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('matchesModal'));
    modal.show();
}

function toggleSelectAllClients() {
    const selectAll = document.getElementById('select-all-clients');
    const checkboxes = document.querySelectorAll('.client-checkbox');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAll.checked;
    });
}

function toggleClientSelection(clientId) {
    const checkboxes = document.querySelectorAll('.client-checkbox:checked');
    const selectAll = document.getElementById('select-all-clients');
    
    if (checkboxes.length === document.querySelectorAll('.client-checkbox').length) {
        selectAll.checked = true;
    } else {
        selectAll.checked = false;
    }
}

async function bulkClientAction(action) {
    const selectedClients = Array.from(document.querySelectorAll('.client-checkbox:checked')).map(cb => cb.value);
    
    if (selectedClients.length === 0) {
        showAlert('لطفاً حداقل یک مشتری را انتخاب کنید', 'warning');
        return;
    }

    if (!confirm(`آیا از ${getBulkActionText(action)} ${selectedClients.length} مشتری اطمینان دارید؟`)) {
        return;
    }

    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE_URL}/admin/clients/bulk`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                action,
                clientIds: selectedClients
            })
        });

        if (!response.ok) throw new Error('Failed to perform bulk action');

        showAlert(`${getBulkActionText(action)} با موفقیت انجام شد`, 'success');
        loadClients();

    } catch (error) {
        console.error('Error performing bulk action:', error);
        showAlert('خطا در انجام عملیات', 'danger');
    }
} 