// This file renders the flight search and filter controls.
import React from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';

// This component renders the search bar view.
function SearchBar({ searchTerm, riskFilter, sortBy, onSearchChange, onRiskChange, onSortChange }) {
    const { t } = useLanguage();
    return (
        <div className="search-section">
            <div className="search-bar">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z"
                        fill="currentColor"
                    />
                </svg>
                <input
                    type="text"
                    id="searchInput"
                    placeholder={t('searchFlights')}
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>
            <div className="filter-controls">
                <select
                    id="riskFilter"
                    className="filter-select"
                    value={riskFilter}
                    onChange={(e) => onRiskChange(e.target.value)}
                >
                    <option value="all">{t('allRiskLevels')}</option>
                    <option value="low">{t('low')}</option>
                    <option value="medium">{t('medium')}</option>
                    <option value="high">{t('high')}</option>
                    <option value="critical">{t('critical')}</option>
                </select>
                <select
                    id="sortBy"
                    className="filter-select"
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value)}
                >
                    <option value="risk">{t('sortByRisk')}</option>
                    <option value="time">{t('sortByTime')}</option>
                    <option value="airline">{t('sortByAirline')}</option>
                </select>
            </div>
        </div>
    );
}

export default SearchBar;
