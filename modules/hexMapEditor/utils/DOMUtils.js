// DOM Utilities
class DOMUtils {
    static createElement(tag, className, styles = {}, textContent = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (textContent) element.textContent = textContent;
        
        Object.entries(styles).forEach(([property, value]) => {
            element.style[property] = value;
        });
        
        return element;
    }

    static findElement(id) {
        return document.getElementById(id);
    }

    static findElements(selector) {
        return document.querySelectorAll(selector);
    }

    static clearElement(element) {
        if (element) element.innerHTML = '';
    }

    static appendChild(parent, child) {
        if (parent && child) parent.appendChild(child);
    }
}

// Globale Verfügbarkeit
if (typeof window !== 'undefined') {
    window.DOMUtils = DOMUtils;
}
