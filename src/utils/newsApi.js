/**
 * newsApi.js – Fetches REAL aviation & weather news from Google News RSS feed.
 * Uses allorigins proxy to bypass CORS. No API key needed.
 */

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

// Multiple search queries for comprehensive coverage
const NEWS_QUERIES = [
    'india+aviation+flight+delay',
    'india+airport+weather+disruption',
];

/**
 * Determine sentiment from a headline (keyword-based)
 */
function detectSentiment(title) {
    const lower = title.toLowerCase();
    const negativeWords = ['delay', 'cancel', 'disrupt', 'crash', 'emergency', 'ground', 'halt',
        'storm', 'fog', 'cyclone', 'turbulence', 'strike', 'accident', 'warn', 'suspend',
        'divert', 'stranded', 'chaos', 'flood', 'rain', 'thunder', 'death', 'fatal',
        'hijack', 'bomb', 'threat', 'fire', 'problem', 'issue', 'fail', 'shut'];
    const positiveWords = ['new route', 'expand', 'launch', 'improve', 'record', 'profit',
        'growth', 'upgrade', 'award', 'best', 'inaugural', 'milestone', 'boost', 'recover',
        'resume', 'open', 'invest', 'order', 'deliver', 'celebrate'];

    if (negativeWords.some(w => lower.includes(w))) return 'negative';
    if (positiveWords.some(w => lower.includes(w))) return 'positive';
    return 'neutral';
}

/**
 * Determine category from a headline
 */
function detectCategory(title) {
    const lower = title.toLowerCase();
    if (/weather|fog|rain|storm|cyclone|flood|thunder|haze|snow|wind/.test(lower)) return 'Weather';
    if (/delay|cancel|disrupt|ground|suspend|divert/.test(lower)) return 'Disruption';
    if (/new route|expand|launch|inaugurate/.test(lower)) return 'Route Expansion';
    if (/fleet|aircraft|plane|delivery|order|airbus|boeing/.test(lower)) return 'Fleet Update';
    if (/fare|price|ticket|offer|sale|cheap/.test(lower)) return 'Pricing';
    if (/safety|crash|accident|emergency|hijack|bomb/.test(lower)) return 'Safety';
    if (/profit|revenue|loss|financial|ipo|share/.test(lower)) return 'Business';
    if (/airport|runway|terminal|infra/.test(lower)) return 'Infrastructure';
    if (/dgca|regulation|rule|policy|ban/.test(lower)) return 'Regulation';
    return 'Aviation';
}

/**
 * Calculate a human-readable time-ago string
 */
function timeAgo(dateString) {
    try {
        const now = new Date();
        const published = new Date(dateString);
        const diffMs = now - published;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    } catch {
        return 'Recently';
    }
}

/**
 * Extract source name from title (Google News format: "Title - Source Name")
 */
function extractSource(title) {
    const parts = title.split(' - ');
    if (parts.length > 1) {
        return parts[parts.length - 1].trim();
    }
    return 'News';
}

/**
 * Clean title by removing the source suffix
 */
function cleanTitle(title) {
    const parts = title.split(' - ');
    if (parts.length > 1) {
        return parts.slice(0, -1).join(' - ').trim();
    }
    return title;
}

/**
 * Parse XML RSS to extract articles
 */
function parseRSS(xmlText) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'text/xml');
    const items = doc.querySelectorAll('item');

    const articles = [];
    items.forEach(item => {
        const rawTitle = item.querySelector('title')?.textContent || '';
        const link = item.querySelector('link')?.textContent || '';
        const pubDate = item.querySelector('pubDate')?.textContent || '';

        if (rawTitle) {
            articles.push({
                rawTitle,
                title: cleanTitle(rawTitle),
                source: extractSource(rawTitle),
                url: link,
                pubDate,
            });
        }
    });

    return articles;
}

/**
 * Fetch real aviation & weather news from Google News RSS.
 * Returns an array of news items formatted for the Sidebar component.
 * Falls back to null on failure so the app can use static data.
 */
export async function fetchAviationNews() {
    try {
        const allArticles = [];

        for (const query of NEWS_QUERIES) {
            const rssUrl = `https://news.google.com/rss/search?q=${query}&hl=en-IN&gl=IN&ceid=IN:en`;
            const proxyUrl = `${CORS_PROXY}${encodeURIComponent(rssUrl)}`;

            try {
                const res = await fetch(proxyUrl);
                if (!res.ok) continue;
                const text = await res.text();
                const articles = parseRSS(text);
                allArticles.push(...articles);
            } catch {
                // Silently skip this query if it fails
                continue;
            }
        }

        if (allArticles.length === 0) return null;

        // Deduplicate by cleaned title
        const seen = new Set();
        const unique = allArticles.filter(a => {
            const key = a.title.toLowerCase().substring(0, 50);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        // Map to our internal format
        const newsItems = unique.slice(0, 8).map(article => ({
            title: article.title,
            airline: 'All Airlines',
            sentiment: detectSentiment(article.title),
            category: detectCategory(article.title),
            time: timeAgo(article.pubDate),
            url: article.url,
            source: article.source,
        }));

        return newsItems;
    } catch (err) {
        console.warn('News fetch failed:', err.message);
        return null;
    }
}
