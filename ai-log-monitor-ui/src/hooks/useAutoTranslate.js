import { useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const useAutoTranslate = (dependencies = []) => {
    const { i18n } = useTranslation();

    useLayoutEffect(() => {
        const select = document.querySelector('.goog-te-combo');
        // Force Google Translate to re-scan the DOM synchronously 
        if (select && i18n.language !== 'en') {
            // By briefly setting it to empty and back, we force a synchronous re-scan
            // without using setTimeout, eliminating the translation "flicker"
            select.value = '';
            select.dispatchEvent(new Event('change'));
            select.value = i18n.language;
            select.dispatchEvent(new Event('change'));
        }
    }, [i18n.language, ...dependencies]);
};
