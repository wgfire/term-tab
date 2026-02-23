import React, { useState, useRef, useEffect } from 'react';
import { useHistory, requestHistoryPermission, formatTimeAgo } from '@/hooks/useHistory';
import { HistoryConfig, HistoryDomainGroup } from '@/types';

interface HistoryWidgetProps {
    config: HistoryConfig;
}

export const HistoryWidget: React.FC<HistoryWidgetProps> = ({ config }) => {
    const { groups, totalUrls, totalDomains, loading, error, needsPermission, refetch } = useHistory(config);
    const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set());
    const containerRef = useRef<HTMLDivElement>(null);
    const [visibleCount, setVisibleCount] = useState(20);

    // Adjust visible count based on container height
    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const h = entry.contentRect.height;
                // ~18px per line, subtract header + footer
                const available = Math.max(3, Math.floor((h - 60) / 18));
                setVisibleCount(available);
            }
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    const toggleDomain = (domain: string) => {
        setExpandedDomains(prev => {
            const next = new Set(prev);
            if (next.has(domain)) next.delete(domain);
            else next.add(domain);
            return next;
        });
    };

    const handleGrantPermission = async () => {
        const granted = await requestHistoryPermission();
        if (granted) refetch();
    };

    // Permission needed state
    if (needsPermission) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-[var(--color-muted)] select-none p-4">
                <div className="text-xs font-mono opacity-60 text-center">
                    history access required
                </div>
                <button
                    onClick={handleGrantPermission}
                    className="px-4 py-2 border border-[var(--color-border)] text-[var(--color-accent)] hover:bg-[var(--color-hover)] font-mono text-xs transition-colors cursor-pointer"
                >
                    [ GRANT HISTORY ACCESS ]
                </button>
                <div className="text-[10px] opacity-40 text-center">
                    chrome will ask to confirm
                </div>
            </div>
        );
    }

    // Loading state
    if (loading && groups.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-[var(--color-muted)] select-none">
                <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-[var(--color-muted)] rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-[var(--color-muted)] rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-[var(--color-muted)] rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-xs font-mono opacity-50">scanning history...</span>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-[var(--color-muted)] select-none p-4">
                <span className="text-xs font-mono">err: {error}</span>
                <button
                    onClick={refetch}
                    className="text-xs font-mono text-[var(--color-accent)] hover:underline cursor-pointer"
                >
                    [ retry ]
                </button>
            </div>
        );
    }

    // Build display lines
    const lines: { type: 'domain' | 'entry'; group: HistoryDomainGroup; entryIndex?: number }[] = [];
    for (const group of groups) {
        lines.push({ type: 'domain', group });
        if (expandedDomains.has(group.domain)) {
            group.entries.forEach((_entry, idx) => {
                lines.push({ type: 'entry', group, entryIndex: idx });
            });
        }
    }

    const displayLines = lines.slice(0, visibleCount);

    return (
        <div ref={containerRef} className="h-full flex flex-col text-xs font-mono select-none overflow-hidden">
            {/* Header */}
            <div className="flex justify-between px-2 py-1 text-[var(--color-muted)] border-b border-[var(--color-border)] shrink-0">
                <span>DOMAIN</span>
                <div className="flex gap-4">
                    <span className="w-10 text-right">HITS</span>
                    <span className="w-16 text-right">LAST</span>
                </div>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-1">
                {displayLines.map((line) => {
                    if (line.type === 'domain') {
                        const isExpanded = expandedDomains.has(line.group.domain);
                        const hasMultiple = line.group.entries.length > 1;
                        const latestVisit = Math.max(...line.group.entries.map(e => e.lastVisitTime));
                        return (
                            <div
                                key={`d-${line.group.domain}`}
                                className={`flex justify-between items-center px-1 py-[2px] hover:bg-[var(--color-hover)] transition-colors ${hasMultiple ? 'cursor-pointer' : ''}`}
                                onClick={() => hasMultiple && toggleDomain(line.group.domain)}
                            >
                                <span className="text-[var(--color-fg)] truncate flex-1 mr-2">
                                    <span className="text-[var(--color-muted)]">
                                        {hasMultiple ? (isExpanded ? '[-]' : '[+]') : ' * '}
                                    </span>
                                    {' '}{line.group.domain}
                                </span>
                                <div className="flex gap-4 shrink-0">
                                    <span className="w-10 text-right text-[var(--color-accent)]">{line.group.totalVisits}</span>
                                    <span className="w-16 text-right text-[var(--color-muted)]">{formatTimeAgo(latestVisit)}</span>
                                </div>
                            </div>
                        );
                    } else {
                        const entry = line.group.entries[line.entryIndex!];
                        const displayTitle = entry.title.length > 40
                            ? entry.title.slice(0, 37) + '...'
                            : entry.title;
                        return (
                            <a
                                key={`e-${entry.url}`}
                                href={entry.url}
                                className="flex justify-between items-center px-1 py-[2px] hover:bg-[var(--color-hover)] transition-colors no-underline group"
                                title={entry.title}
                            >
                                <span className="text-[var(--color-muted)] truncate flex-1 mr-2 group-hover:text-[var(--color-accent)]">
                                    {'    '}{'> '}{displayTitle}
                                </span>
                                <div className="flex gap-4 shrink-0">
                                    <span className="w-10 text-right text-[var(--color-muted)]">{entry.visitCount}</span>
                                    <span className="w-16 text-right text-[var(--color-muted)] opacity-60">{formatTimeAgo(entry.lastVisitTime)}</span>
                                </div>
                            </a>
                        );
                    }
                })}

                {groups.length === 0 && !loading && (
                    <div className="text-center text-[var(--color-muted)] py-4 opacity-60">
                        no history found
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex justify-between px-2 py-1 text-[var(--color-muted)] border-t border-[var(--color-border)] shrink-0 opacity-60">
                <span>{totalUrls} urls | {totalDomains} domains | {config.daysBack}d</span>
                <button
                    onClick={refetch}
                    className="hover:text-[var(--color-accent)] transition-colors cursor-pointer"
                    title="Refresh"
                >
                    [refresh]
                </button>
            </div>
        </div>
    );
};
