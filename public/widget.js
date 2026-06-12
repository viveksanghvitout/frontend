(function() {
    const currentScript = document.currentScript || document.querySelector('script[data-api-key]');
    if (!currentScript) {
        console.error("SaaS Bot Error: Could not find widget script tag.");
        return;
    }

    const apiKey = currentScript.getAttribute('data-api-key');
    if (!apiKey) {
        console.error("SaaS Bot Error: Missing data-api-key attribute in script tag.");
        return;
    }

    const scriptSrc = currentScript.src;
    let frontendBase = "";
    if (scriptSrc) {
        try {
            frontendBase = new URL(scriptSrc).origin;
        } catch (e) {
            frontendBase = window.location.origin;
        }
    } else {
        frontendBase = window.location.origin;
    }

    const isInlineMode = currentScript.getAttribute('data-inline') === 'true' ||
                         new URLSearchParams(window.location.search).get('mode') === 'inline';

    // Create container
    const container = document.createElement('div');
    container.id = 'saas-widget-container';
    
    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = `${frontendBase}/widget-window?apiKey=${encodeURIComponent(apiKey)}&inline=${isInlineMode}`;
    iframe.style.border = 'none';
    iframe.style.background = 'transparent';
    iframe.allow = 'microphone';

    if (isInlineMode) {
        container.style.position = 'relative';
        container.style.width = '100%';
        container.style.height = '600px';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
    } else {
        container.style.position = 'fixed';
        container.style.bottom = '24px';
        container.style.right = '24px'; 
        container.style.zIndex = '999999';
        
        // Initial size for floating button
        iframe.style.width = '80px';
        iframe.style.height = '80px';
    }

    container.appendChild(iframe);
    
    // In inline mode, the script could be placed anywhere, so insert after the script.
    // In floating mode, append to body.
    if (isInlineMode && currentScript.parentNode) {
        currentScript.parentNode.insertBefore(container, currentScript.nextSibling);
    } else {
        document.body.appendChild(container);
    }

    // Listen for resize and position messages from the React app
    window.addEventListener('message', (event) => {
        // Uncomment in production to restrict origin:
        // if (event.origin !== frontendBase) return;

        if (event.data && event.data.type === 'SAAS_WIDGET_RESIZE') {
            if (!isInlineMode) {
                iframe.style.width = event.data.width;
                iframe.style.height = event.data.height;
                
                // Adjust mobile display if it's open (usually 100vw, 100vh)
                if (event.data.isOpen && window.innerWidth <= 480) {
                    container.style.bottom = '0';
                    container.style.right = '0';
                } else if (!event.data.isOpen && window.innerWidth <= 480) {
                    container.style.bottom = '16px';
                    container.style.right = '16px';
                }
            }
        } else if (event.data && event.data.type === 'SAAS_WIDGET_POSITION') {
            if (!isInlineMode) {
                if (event.data.position === 'left') {
                    container.style.right = 'auto';
                    container.style.left = '24px';
                    if (window.innerWidth <= 480 && !event.data.isOpen) {
                        container.style.left = '16px';
                    }
                } else {
                    container.style.left = 'auto';
                    container.style.right = '24px';
                    if (window.innerWidth <= 480 && !event.data.isOpen) {
                        container.style.right = '16px';
                    }
                }
            }
        }
    });

})();