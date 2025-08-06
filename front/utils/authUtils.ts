/**
 * Check if user is logged in
 * @returns boolean
 */
export function isLoggedIn(): boolean {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('userToken');
    return !!token;
}

/**
 * Get current user data
 * @returns user data or null
 */
export function getCurrentUser(): any {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch {
        return null;
    }
}

/**
 * Check if user has active subscription
 * @returns Promise<boolean>
 */
export async function hasActiveSubscription(): Promise<boolean> {
    if (!isLoggedIn()) return false;
    
    try {
        const apiPath = process.env.NEXT_PUBLIC_API_PATH || 'http://localhost:5001';
        const token = localStorage.getItem('userToken');
        
        const response = await fetch(`${apiPath}/api/v1/auth/subscription-status`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.hasActiveSubscription || false;
        }
        
        return false;
    } catch (error) {
        console.error('Error checking subscription:', error);
        return false;
    }
}

/**
 * Logout user
 */
export function logout(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    window.location.href = '/';
}

/**
 * Redirect to login page
 */
export function redirectToLogin(): void {
    if (typeof window === 'undefined') return;
    window.location.href = '/login';
} 