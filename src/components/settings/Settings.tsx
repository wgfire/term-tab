import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { SettingsThemesTab } from '@/components/settings/SettingsThemesTab';
import { SettingsWidgetsTab } from '@/components/settings/SettingsWidgetsTab';
import { SettingsLinksTab } from '@/components/settings/SettingsLinksTab';
import { SettingsPresetsTab } from '@/components/settings/SettingsPresetsTab';
import { SettingsAdvancedTab } from '@/components/settings/SettingsAdvancedTab';

type Tab = 'themes' | 'links' | 'widgets' | 'advanced' | 'presets';

export const Settings: React.FC = () => {
    const {
        currentTheme, setCurrentTheme,
        customThemes, handleDeleteCustomTheme, setIsThemeMakerOpen,
        linkGroups, setLinkGroups,
        customCss, setCustomCss,
        statsMode, setStatsMode,
        weatherMode, setWeatherMode,
        tempUnit, setTempUnit,
        isLayoutLocked, setIsLayoutLocked,
        isResizingEnabled, setIsResizingEnabled,
        resetLayout,
        activeWidgets, toggleWidget, addExtraWidget,
        showWidgetTitles, setShowWidgetTitles,
        customFont, setCustomFont,
        reserveSettingsSpace, setReserveSettingsSpace,
        funOptions, setFunOptions,
        marketConfig, setMarketConfig,
        presets, handleSavePreset, handleLoadPreset, handleDeletePreset,
        widgetRadius, setWidgetRadius,
        openInNewTab, setOpenInNewTab,
        borderGlow, setBorderGlow,
        animatedLinks, setAnimatedLinks,
        todoistConfig, setTodoistConfig,
        historyConfig, setHistoryConfig,
        visualStyle, setVisualStyle,
        backgroundImage, setBackgroundImage,
        backgroundBlur, setBackgroundBlur,
        glassOpacity, setGlassOpacity
    } = useAppContext();

    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('themes');

    // Widget duplication modal state
    const [widgetToDuplicate, setWidgetToDuplicate] = useState<string | null>(null);

    return (
        <>
            {/* Trigger Button - fixed bottom-right */}
            <button
                className={`fixed bottom-8 right-4 z-[9999] font-mono text-xs transition-all duration-200 cursor-pointer bg-transparent border-none outline-none select-none ${isOpen ? 'text-[var(--color-accent)] opacity-100' : 'text-[var(--color-muted)] opacity-20 hover:opacity-100'}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle settings"
            >
                {isOpen ? '[ × ]' : '[ cfg ]'}
            </button>

            {/* Backdrop - click to close */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[9998]"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Confirmation Modal for Widget Duplication */}
            {widgetToDuplicate && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 pointer-events-auto">
                    <div className="bg-[var(--color-bg)] border border-[var(--color-border)] p-4 shadow-2xl flex flex-col gap-4 max-w-sm">
                        <div className="text-[var(--color-fg)] font-bold text-center">
                            Add another '{widgetToDuplicate}'?
                        </div>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => {
                                    addExtraWidget(widgetToDuplicate);
                                    setWidgetToDuplicate(null);
                                }}
                                className="px-4 py-1 border border-[var(--color-border)] text-[var(--color-accent)] hover:bg-[var(--color-hover)] no-radius"
                            >
                                [ YES ]
                            </button>
                            <button
                                onClick={() => setWidgetToDuplicate(null)}
                                className="px-4 py-1 border border-[var(--color-border)] text-[var(--color-muted)] hover:bg-[var(--color-hover)] no-radius"
                            >
                                [ NO ]
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Panel - fixed bottom-right */}
            {isOpen && (
                <div
                    className="fixed bottom-16 right-4 z-[9999] w-[380px] max-w-[calc(100vw-32px)] max-h-[85vh] flex flex-col bg-[var(--color-bg)] border border-[var(--color-border)] shadow-2xl settings-panel-enter"
                >
                    {/* Title Bar */}
                    <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-border)] shrink-0">
                        <div className="font-mono text-xs">
                            <span className="text-[var(--color-accent)]">//</span>
                            <span className="text-[var(--color-muted)] ml-1">settings</span>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="font-mono text-xs text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors bg-transparent border-none outline-none cursor-pointer"
                        >
                            [x]
                        </button>
                    </div>

                    {/* Tab Bar */}
                    <div className="flex flex-wrap border-b border-[var(--color-border)] shrink-0">
                        {(['themes', 'links', 'widgets', 'presets', 'advanced'] as Tab[]).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`font-mono text-xs px-2 py-1 bg-transparent border-none outline-none cursor-pointer transition-colors ${
                                    activeTab === tab
                                        ? 'text-[var(--color-accent)] border-b-2 border-[var(--color-accent)] -mb-[2px]'
                                        : 'text-[var(--color-muted)] hover:text-[var(--color-fg)]'
                                }`}
                            >
                                {activeTab === tab ? `[${tab}]` : tab}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 min-h-0 overflow-y-auto p-4 custom-scrollbar">

                        {activeTab === 'themes' && (
                            <SettingsThemesTab
                                currentTheme={currentTheme}
                                onThemeChange={setCurrentTheme}
                                customThemes={customThemes || {}}
                                onDeleteCustomTheme={handleDeleteCustomTheme}
                                onOpenThemeMaker={() => setIsThemeMakerOpen(true)}
                                visualStyle={visualStyle}
                                onVisualStyleChange={setVisualStyle}
                                backgroundImage={backgroundImage}
                                onBackgroundImageChange={setBackgroundImage}
                                backgroundBlur={backgroundBlur}
                                onBackgroundBlurChange={setBackgroundBlur}
                                glassOpacity={glassOpacity}
                                onGlassOpacityChange={setGlassOpacity}
                            />
                        )}

                        {activeTab === 'widgets' && (
                            <SettingsWidgetsTab
                                activeWidgets={activeWidgets}
                                onToggleWidget={toggleWidget}
                                setWidgetToDuplicate={setWidgetToDuplicate}
                            />
                        )}

                        {activeTab === 'links' && (
                            <SettingsLinksTab
                                linkGroups={linkGroups}
                                onUpdateLinks={setLinkGroups}
                            />
                        )}

                        {activeTab === 'presets' && (
                            <SettingsPresetsTab
                                presets={presets}
                                onSavePreset={handleSavePreset}
                                onLoadPreset={handleLoadPreset}
                                onDeletePreset={handleDeletePreset}
                            />
                        )}

                        {activeTab === 'advanced' && (
                            <SettingsAdvancedTab
                                showWidgetTitles={showWidgetTitles}
                                onToggleWidgetTitles={() => setShowWidgetTitles(!showWidgetTitles)}
                                reserveSettingsSpace={reserveSettingsSpace}
                                onToggleReserveSettings={() => setReserveSettingsSpace(!reserveSettingsSpace)}
                                customFont={customFont}
                                onCustomFontChange={setCustomFont}
                                widgetRadius={widgetRadius}
                                onWidgetRadiusChange={setWidgetRadius}
                                isLayoutLocked={isLayoutLocked}
                                onToggleLayoutLock={() => setIsLayoutLocked(!isLayoutLocked)}
                                onResetLayout={resetLayout}
                                isResizingEnabled={isResizingEnabled}
                                onToggleResizing={() => setIsResizingEnabled(!isResizingEnabled)}
                                statsMode={statsMode}
                                onStatsModeChange={setStatsMode}
                                weatherMode={weatherMode}
                                onWeatherModeChange={setWeatherMode}
                                tempUnit={tempUnit}
                                onTempUnitChange={setTempUnit}
                                openInNewTab={openInNewTab}
                                onToggleOpenInNewTab={() => setOpenInNewTab(!openInNewTab)}
                                activeWidgets={activeWidgets}
                                funOptions={funOptions}
                                onFunOptionsChange={setFunOptions}
                                customCss={customCss}
                                onCustomCssChange={setCustomCss}
                                marketConfig={marketConfig}
                                onMarketConfigChange={setMarketConfig}
                                borderGlow={borderGlow}
                                onToggleBorderGlow={() => setBorderGlow(!borderGlow)}
                                animatedLinks={animatedLinks}
                                onToggleAnimatedLinks={() => setAnimatedLinks(!animatedLinks)}
                                todoistConfig={todoistConfig}
                                onTodoistConfigChange={setTodoistConfig}
                                historyConfig={historyConfig}
                                onHistoryConfigChange={setHistoryConfig}
                            />
                        )}

                    </div>
                </div>
            )}
        </>
    );
};
