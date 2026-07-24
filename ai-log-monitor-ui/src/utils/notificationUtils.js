/**
 * Requests native browser/OS notification permission from the user.
 * @returns {Promise<boolean>} True if permission was granted
 */
export async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        alert("This browser does not support desktop notification API.");
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
}

/**
 * Sends a native Windows / OS desktop push notification.
 * @param {string} title - Notification title
 * @param {string} body - Main notification message text
 */
export function sendDesktopNotification(title, body) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
        return;
    }

    try {
        const notification = new Notification(title, {
            body: body,
            icon: '/vite.svg',
            tag: 'ai-log-incident',
            renotify: true
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
        };
    } catch (err) {
        console.error("Failed to send desktop notification:", err);
    }
}
