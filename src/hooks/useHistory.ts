import { useState, useEffect, useCallback } from 'react';
import { HistoryEntry, HistoryDomainGroup, HistoryConfig } from '@/types';

declare const chrome: any;

const CACHE_KEY = 'tui-history-cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CachedHistory {
    groups: HistoryDomainGroup[];
    totalUrls: number;
    totalDomains: number;
    timestamp: number;
}

function loadCache(): CachedHistory | null {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const cached: CachedHistory = JSON.parse(raw);
        if (Date.now() - cached.timestamp > CACHE_TTL) return null;
        return cached;
    } catch {
        return null;
    }
}

function saveCache(groups: HistoryDomainGroup[], totalUrls: number, totalDomains: number) {
    try {
        const data: CachedHistory = { groups, totalUrls, totalDomains, timestamp: Date.now() };
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch { /* quota exceeded */ }
}

function extractDomain(url: string): string {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return url;
    }
}

function isFilteredUrl(url: string): boolean {
    return url.startsWith('chrome://') ||
        url.startsWith('chrome-extension://') ||
        url.startsWith('about:') ||
        url.startsWith('edge://') ||
        url.startsWith('brave://');
}

function formatTimeAgo(timestamp: number): string {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export { formatTimeAgo };

export function useHistory(config: HistoryConfig) {
    const [groups, setGroups] = useState<HistoryDomainGroup[]>([]);
    const [totalUrls, setTotalUrls] = useState(0);
    const [totalDomains, setTotalDomains] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [needsPermission, setNeedsPermission] = useState(false);

    const fetchHistory = useCallback(async () => {
        // Check if chrome.history API is available
        if (typeof chrome === 'undefined' || !chrome.history) {
            setNeedsPermission(true);
            setLoading(false);
            return;
        }

        // Check permission
        try {
            const hasPermission = await chrome.permissions.contains({ permissions: ['history'] });
            if (!hasPermission) {
                setNeedsPermission(true);
                setLoading(false);
                return;
            }
        } catch {
            setNeedsPermission(true);
            setLoading(false);
            return;
        }

        setNeedsPermission(false);
        setLoading(true);
        setError(null);

        try {
            const startTime = Date.now() - config.daysBack * 24 * 60 * 60 * 1000;
            const results = await chrome.history.search({
                text: '',
                startTime,
                maxResults: config.maxResults,
            });

            // Filter and transform
            const entries: HistoryEntry[] = results
                .filter((item: any) => item.url && !isFilteredUrl(item.url) && (item.visitCount ?? 0) >= config.minVisits)
                .map((item: any) => ({
                    url: item.url!,
                    title: item.title || item.url!,
                    visitCount: item.visitCount ?? 0,
                    lastVisitTime: item.lastVisitTime ?? 0,
                    domain: extractDomain(item.url!),
                }));

            // Group by domain
            const domainMap = new Map<string, HistoryEntry[]>();
            for (const entry of entries) {
                const existing = domainMap.get(entry.domain) || [];
                existing.push(entry);
                domainMap.set(entry.domain, existing);
            }

            // Build groups, sort entries within each group, then sort groups
            const groupList: HistoryDomainGroup[] = Array.from(domainMap.entries()).map(([domain, domainEntries]) => {
                domainEntries.sort((a, b) => b.visitCount - a.visitCount);
                return {
                    domain,
                    totalVisits: domainEntries.reduce((sum, e) => sum + e.visitCount, 0),
                    entries: domainEntries,
                };
            });

            groupList.sort((a, b) => b.totalVisits - a.totalVisits);

            setGroups(groupList);
            setTotalUrls(entries.length);
            setTotalDomains(groupList.length);
            saveCache(groupList, entries.length, groupList.length);
        } catch (err: any) {
            setError(err.message || 'Failed to load history');
        } finally {
            setLoading(false);
        }
    }, [config.daysBack, config.maxResults, config.minVisits]);

    // Load from cache first, then fetch fresh data
    useEffect(() => {
        const cached = loadCache();
        if (cached) {
            setGroups(cached.groups);
            setTotalUrls(cached.totalUrls);
            setTotalDomains(cached.totalDomains);
            setLoading(false);
        }
        fetchHistory();
    }, [fetchHistory]);

    return { groups, totalUrls, totalDomains, loading, error, needsPermission, refetch: fetchHistory };
}

export async function requestHistoryPermission(): Promise<boolean> {
    try {
        return await chrome.permissions.request({ permissions: ['history'] });
    } catch {
        return false;
    }
}
