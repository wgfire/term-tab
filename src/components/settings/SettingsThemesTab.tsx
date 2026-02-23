import React, { useRef } from 'react';
import { THEMES } from '@/constants';
import { VisualStyle } from '@/types';

interface SettingsThemesTabProps {
    currentTheme: string;
    onThemeChange: (themeName: string) => void;
    customThemes: Record<string, any>;
    onDeleteCustomTheme?: (name: string) => void;
    onOpenThemeMaker?: () => void;
    visualStyle: VisualStyle;
    onVisualStyleChange: (style: VisualStyle) => void;
    backgroundImage: string;
    onBackgroundImageChange: (url: string) => void;
    backgroundBlur: number;
    onBackgroundBlurChange: (blur: number) => void;
    glassOpacity: number;
    onGlassOpacityChange: (opacity: number) => void;
}

const STYLE_OPTIONS: { value: VisualStyle; label: string }[] = [
    { value: 'classic', label: 'terminal' },
    { value: 'glass', label: 'glass' },
    { value: 'holographic', label: 'holographic' },
];

export const SettingsThemesTab: React.FC<SettingsThemesTabProps> = ({
    currentTheme,
    onThemeChange,
    customThemes,
    onDeleteCustomTheme,
    onOpenThemeMaker,
    visualStyle,
    onVisualStyleChange,
    backgroundImage,
    onBackgroundImageChange,
    backgroundBlur,
    onBackgroundBlurChange,
    glassOpacity,
    onGlassOpacityChange,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const result = ev.target?.result;
            if (typeof result === 'string') {
                onBackgroundImageChange(result);
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Visual Style Selector */}
            <div>
                <div className="text-xs font-mono text-[var(--color-muted)] mb-2 uppercase tracking-widest">style</div>
                <div className="flex gap-2">
                    {STYLE_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => onVisualStyleChange(opt.value)}
                            className={`px-4 py-1.5 text-xs font-mono border transition-all ${
                                visualStyle === opt.value
                                    ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-hover)]'
                                    : 'border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-muted)] hover:text-[var(--color-fg)]'
                            }`}
                        >
                            [ {opt.label} ]
                        </button>
                    ))}
                </div>
            </div>

            {/* Glass-specific settings */}
            {visualStyle === 'glass' && (
                <div className="border border-[var(--color-border)] p-4 flex flex-col gap-3">
                    <div className="text-xs font-mono text-[var(--color-muted)] uppercase tracking-widest">glass settings</div>

                    {/* Background Image */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-mono text-[var(--color-muted)]">background image</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={backgroundImage.startsWith('data:') ? '(uploaded file)' : backgroundImage}
                                onChange={(e) => onBackgroundImageChange(e.target.value)}
                                placeholder="enter URL or upload file..."
                                className="flex-1 bg-transparent border border-[var(--color-border)] text-[var(--color-fg)] text-xs px-2 py-1 font-mono focus:outline-none focus:border-[var(--color-accent)]"
                                readOnly={backgroundImage.startsWith('data:')}
                            />
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-2 py-1 text-xs font-mono border border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                            >
                                upload
                            </button>
                            {backgroundImage && (
                                <button
                                    onClick={() => onBackgroundImageChange('')}
                                    className="px-2 py-1 text-xs font-mono border border-[var(--color-border)] text-[var(--color-muted)] hover:text-red-500 hover:border-red-500"
                                >
                                    clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Background Blur */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-mono text-[var(--color-muted)]">background blur: {backgroundBlur}px</label>
                        <input
                            type="range"
                            min="0"
                            max="20"
                            value={backgroundBlur}
                            onChange={(e) => onBackgroundBlurChange(Number(e.target.value))}
                            className="w-full accent-[var(--color-accent)]"
                        />
                    </div>

                    {/* Glass Opacity */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-mono text-[var(--color-muted)]">glass opacity: {glassOpacity}%</label>
                        <input
                            type="range"
                            min="40"
                            max="90"
                            value={glassOpacity}
                            onChange={(e) => onGlassOpacityChange(Number(e.target.value))}
                            className="w-full accent-[var(--color-accent)]"
                        />
                    </div>
                </div>
            )}

            {/* Theme Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div
                    onClick={onOpenThemeMaker}
                    className="border border-[var(--color-accent)] border-dashed p-2 cursor-pointer hover:bg-[var(--color-hover)] flex flex-col items-center justify-center gap-2 text-center group min-h-[80px]"
                >
                    <span className="text-2xl text-[var(--color-accent)] group-hover:scale-110 transition-transform">+</span>
                    <span className="text-xs font-mono text-[var(--color-accent)]">CREATE NEW</span>
                </div>

                {Object.entries(customThemes).map(([key, theme]: [string, any]) => (
                    <div
                        key={key}
                        onClick={() => onThemeChange(key)}
                        className={`
                            border p-2 cursor-pointer transition-all relative overflow-hidden group min-h-[80px] flex flex-col justify-between
                            ${currentTheme === key
                                ? 'border-[var(--color-accent)] bg-[var(--color-hover)]'
                                : 'border-[var(--color-border)] hover:border-[var(--color-muted)]'
                            }
                        `}
                    >
                        <div className="flex items-center justify-between gap-1 mb-2 px-1">
                            <div className="flex items-center gap-2 overflow-hidden w-full pr-8">
                                <span className="font-mono text-xs uppercase truncate text-[var(--color-accent)]">{theme.name}</span>
                            </div>
                        </div>
                        <div className="flex w-full h-8 gap-0 mt-auto">
                            <div className="flex-1 h-full" style={{ backgroundColor: theme.colors.bg }} />
                            <div className="flex-1 h-full" style={{ backgroundColor: theme.colors.fg }} />
                            <div className="flex-1 h-full" style={{ backgroundColor: theme.colors.accent }} />
                        </div>
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteCustomTheme?.(key);
                            }}
                            className="absolute top-0 right-0 bg-[var(--color-bg)] border-l border-b border-[var(--color-border)] px-2 py-0.5 cursor-pointer hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-all z-10"
                            title="Delete Theme"
                        >
                            <span className="block group-hover:hidden text-[10px] text-[var(--color-accent)] font-bold">CUSTOM</span>
                            <span className="hidden group-hover:block text-[10px] font-bold text-[var(--color-accent)]">[x]</span>
                        </div>
                    </div>
                ))}

                {Object.keys(THEMES).map(themeKey => (
                    <div
                        key={themeKey}
                        onClick={() => onThemeChange(themeKey)}
                        className={`
                            border p-2 cursor-pointer transition-all relative overflow-hidden group min-h-[80px] flex flex-col justify-between
                            ${currentTheme === themeKey
                                ? 'border-[var(--color-accent)] bg-[var(--color-hover)]'
                                : 'border-[var(--color-border)] hover:border-[var(--color-muted)]'}
                        `}
                    >
                        <div className="flex items-center justify-between gap-1 mb-2 px-1">
                            <div className="flex items-center gap-2 overflow-hidden w-full">
                                <span className="font-mono text-xs uppercase truncate text-[var(--color-accent)]">{THEMES[themeKey].name}</span>
                            </div>
                        </div>
                        <div className="flex w-full h-8 gap-0 mt-auto">
                            <div className="flex-1 h-full" style={{ backgroundColor: THEMES[themeKey].colors.bg }} />
                            <div className="flex-1 h-full" style={{ backgroundColor: THEMES[themeKey].colors.fg }} />
                            <div className="flex-1 h-full" style={{ backgroundColor: THEMES[themeKey].colors.accent }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
