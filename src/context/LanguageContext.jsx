// This file manages language selection and translations for the app.
import React, { createContext, useContext, useState } from 'react';
import en from '../i18n/en.js';
import hi from '../i18n/hi.js';
import ta from '../i18n/ta.js';
import te from '../i18n/te.js';
import sa from '../i18n/sa.js';
import ur from '../i18n/ur.js';

const translations = { en, hi, ta, te, sa, ur };

const LanguageContext = createContext();

// This component provides the language state to child components.
export function LanguageProvider({ children }) {
    const [lang, setLang] = useState(() => {
        try { return localStorage.getItem('fg_lang') || 'en'; } catch { return 'en'; }
    });

    // This function handles toggle language.
    const toggleLanguage = () => {
        const order = ['en', 'hi', 'ta', 'te', 'sa', 'ur'];
        const next = order[(order.indexOf(lang) + 1) % order.length];
        setLang(next);
        try { localStorage.setItem('fg_lang', next); } catch {}
    };

    // This function handles change language.
    const changeLanguage = (newLang) => {
        if (translations[newLang]) {
            setLang(newLang);
            try { localStorage.setItem('fg_lang', newLang); } catch {}
        }
    };

    // This function handles t.
    const t = (key) => translations[lang]?.[key] || translations.en[key] || key;

    return (
        <LanguageContext.Provider value={{ lang, toggleLanguage, changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

// This hook returns the language data and actions.
export function useLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
    return ctx;
}
