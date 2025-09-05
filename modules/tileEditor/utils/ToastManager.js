/**
 * TileEditor Toast Manager - Handles all toast notifications
 */
class ToastManager {
    constructor() {
        this.container = null;
        this.initContainer();
    }

    initContainer() {
        // Check if container already exists
        this.container = document.getElementById('toastContainer');
        if (!this.container) {
            // Create container if it doesn't exist
            this.container = document.createElement('div');
            this.container.id = 'toastContainer';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    }

    show(message, type = 'info') {
        if (!this.container) {
            // console.('[ToastManager] Toast container not found');
            return;
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-message">${message}</span>
                <button type="button" class="toast-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
        `;
        
        this.container.appendChild(toast);
        
        // Show toast with animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.classList.remove('show');
                setTimeout(() => {
                    if (toast.parentElement) {
                        toast.remove();
                    }
                }, 300);
            }
        }, 5000);
    }

    success(message) {
        this.show(message, 'success');
    }

    error(message) {
        this.show(message, 'error');
    }

    warning(message) {
        this.show(message, 'warning');
    }

    info(message) {
        this.show(message, 'info');
    }

    clear() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Globale Verfügbarkeit
if (typeof window !== 'undefined') {
    window.ToastManager = ToastManager;
}
