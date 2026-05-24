import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { TaskCard } from './components/TaskCard';
import { ProgressBar } from './components/ProgressBar';
import { RightPanel } from './components/RightPanel';
import { ParticleCanvas } from './components/ParticleCanvas';
import { StatsView } from './components/StatsView';
import { StoreView } from './components/StoreView';
import { CalendarView } from './components/CalendarView';
import { InsightsView } from './components/InsightsView';
import { InventoryPanel } from './components/InventoryPanel';
import { AchievementsView } from './components/AchievementsView';
import { SettingsView } from './components/SettingsView';
import { DevToolsView } from './components/DevToolsView';
import { DaySummaryPopup } from './components/DaySummaryPopup';
import { FocusView } from './components/FocusView';
import { ResourceBar } from './components/ResourceBar';
import { NotificationStack } from './components/NotificationStack';
import { TaskModal } from './components/TaskModal';
import { useAppState } from './hooks/useAppState';
import { getRank, WIDGET_SIZES, RESOURCE_DEFS } from './constants';
import type { AppState, DashboardWidgetConfig, DashboardWidgetId, TabId, TaskDefinition, WidgetSize } from './types';

const SIDEBAR_EXPANDED = 220;
const SIDEBAR_COLLAPSED = 70;
const FOOTER_HEIGHT = 100;
const TOP_BAR_HEIGHT = 40;

type SortKey = 'name' | 'target' | 'completed' | 'value' | 'category';
type GroupMode = 'none' | 'category' | 'status';

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [taskModal, setTaskModal] = useState<TaskDefinition | null | 'new'>(null);
  const [sortBy, setSortBy] = useState<SortKey>('category');
  const [sortAsc, setSortAsc] = useState(true);
  const [groupMode, setGroupMode] = useState<GroupMode>('category');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const {
    state, comboTimeLeft, completeTask, resetDay, endDay, resetAll,
    totalTasks, completedTasks,
    purchaseReward, addReward, removeReward, updateReward,
    redeemItem,
    addTask, removeTask, updateTask,
    addCategory, updateCategory, removeCategory,
    addStoreCategory, updateStoreCategory, removeStoreCategory,
    addTaskColorPreset, removeTaskColorPreset,
    updateDashboardWidgets,
    addPlatform, removePlatform, addInsightEntry,
    updateSettings,
    updateFocusSession, addFocusTime,
    devAddMoney, devAddResource, devCompleteTask, devSetCombo, devResetMonth, resetAchievements,
    daySummary, dismissDaySummary,
    dismissNotification,
  } = useAppState();

  const sidebarWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;
  const totalPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const currentRank = getRank(totalPercent);

  const sortedTasks = [...state.tasks].sort((a, b) => {
    const dir = sortAsc ? 1 : -1;
    switch (sortBy) {
      case 'name': return dir * a.name.localeCompare(b.name);
      case 'target': return dir * (a.dailyTarget - b.dailyTarget);
      case 'completed': {
        const ac = state.progress[a.id] ?? 0;
        const bc = state.progress[b.id] ?? 0;
        return dir * (ac - bc);
      }
      case 'value': return dir * (a.baseValue - b.baseValue);
      case 'category': return dir * a.category.localeCompare(b.category);
      default: return 0;
    }
  });

  const groupedTasks: Map<string, TaskDefinition[]> = new Map();
  if (groupMode === 'none') {
    groupedTasks.set('all', sortedTasks);
  } else {
    for (const t of sortedTasks) {
      let key: string;
      if (groupMode === 'category') {
        key = t.category;
      } else {
        const done = (state.progress[t.id] ?? 0) >= t.dailyTarget;
        key = done ? 'Completed' : 'In Progress';
      }
      if (!groupedTasks.has(key)) groupedTasks.set(key, []);
      groupedTasks.get(key)!.push(t);
    }
  }

  const toggleGroup = (key: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="dashboard-layout">
            <div className="dashboard-tasks-column">
            <ComboWidget
              multiplier={state.combo.multiplier}
              comboTimeLeft={comboTimeLeft}
              comboWindowMs={state.combo.comboWindowMs}
            />

            {/* Sort & Group controls - sticky */}
            <div className="task-sort-bar">
              <SortBtn active={sortBy === 'name'} label="Name" onClick={() => { setSortBy('name'); if (sortBy === 'name') setSortAsc(a => !a); else setSortAsc(true); }} asc={sortAsc} showArrow={sortBy === 'name'} />
              <SortBtn active={sortBy === 'target'} label="Quota" onClick={() => { setSortBy('target'); if (sortBy === 'target') setSortAsc(a => !a); else setSortAsc(true); }} asc={sortAsc} showArrow={sortBy === 'target'} />
              <SortBtn active={sortBy === 'completed'} label="Done" onClick={() => { setSortBy('completed'); if (sortBy === 'completed') setSortAsc(a => !a); else setSortAsc(true); }} asc={sortAsc} showArrow={sortBy === 'completed'} />
              <SortBtn active={sortBy === 'value'} label="Value" onClick={() => { setSortBy('value'); if (sortBy === 'value') setSortAsc(a => !a); else setSortAsc(true); }} asc={sortAsc} showArrow={sortBy === 'value'} />
              <SortBtn active={sortBy === 'category'} label="Category" onClick={() => { setSortBy('category'); if (sortBy === 'category') setSortAsc(a => !a); else setSortAsc(true); }} asc={sortAsc} showArrow={sortBy === 'category'} />
              <span className="mx-1 h-4" style={{ borderLeft: '1px solid rgba(255,255,255,0.1)' }} />
              <GroupBtn active={groupMode === 'none'} label="Flat" onClick={() => setGroupMode('none')} />
              <GroupBtn active={groupMode === 'category'} label="By Category" onClick={() => setGroupMode('category')} />
              <GroupBtn active={groupMode === 'status'} label="By Status" onClick={() => setGroupMode('status')} />
            </div>

            {/* Scrollable task area */}
            <div className="task-scroll-area">
              {[...groupedTasks.entries()].map(([groupKey, tasks]) => {
                const isCollapsed = collapsedGroups.has(groupKey);
                const catColor = state.categories.find(c => c.name === groupKey)?.color ?? '#ffffff';
                const isGroup = groupMode !== 'none';

                return (
                  <div key={groupKey}>
                    {isGroup && (
                      <button
                        onClick={() => toggleGroup(groupKey)}
                        className="w-full flex items-center gap-2 mb-3 py-1 group"
                      >
                        <span
                          className="text-xs transition-transform duration-200"
                          style={{
                            color: catColor,
                            transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                            display: 'inline-block',
                          }}
                        >
                          ▾
                        </span>
                        <span className="text-xs font-bold tracking-widest" style={{ color: catColor }}>
                          {groupKey.toUpperCase()}
                        </span>
                        <span className="text-[10px] tabular-nums" style={{ color: 'rgba(255,255,255,0.25)' }}>
                          ({tasks.length})
                        </span>
                        <div className="flex-1 h-px" style={{ background: `${catColor}20` }} />
                      </button>
                    )}
                    {!isCollapsed && (
                      <div className="task-grid mb-2">
                        {tasks.map(task => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            completed={state.progress[task.id] ?? 0}
                            comboMultiplier={state.combo.multiplier}
                            categoryColor={state.categories.find(c => c.name === task.category)?.color ?? task.color}
                            onComplete={completeTask}
                            onEdit={t => setTaskModal(t)}
                            onDelete={removeTask}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add task card */}
              <button
                onClick={() => setTaskModal('new')}
                className="rounded-lg p-6 flex flex-col items-center justify-center gap-2 transition-all duration-200 w-full"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px dashed rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.2)',
                  minHeight: 80,
                }}
              >
                <span className="text-2xl">+</span>
                <span className="text-xs font-bold tracking-widest">ADD TASK</span>
              </button>
            </div>
            </div>

            <DashboardWidgets
              state={state}
              completedTasks={completedTasks}
              totalTasks={totalTasks}
              completionPercent={totalPercent}
              onStartFocus={() => setActiveTab('focus')}
              widgets={state.dashboardWidgets}
              onUpdateWidgets={updateDashboardWidgets}
            />
          </div>
        );
      case 'focus':
        return (
          <FocusView
            session={state.focusSession}
            focusTotalMs={state.focusTotalMs}
            onUpdateSession={updateFocusSession}
            onAddFocusTime={addFocusTime}
          />
        );
      case 'stats':
        return <StatsView state={state} totalTasks={totalTasks} completedTasks={completedTasks} completionPercent={totalPercent} />;
      case 'store':
        return (
          <StoreView
            rewards={state.rewards}
            money={state.money}
            resources={state.resources}
            cooldowns={state.rewardCooldowns}
            onPurchase={purchaseReward}
            onAddReward={addReward}
            onRemoveReward={removeReward}
            onUpdateReward={updateReward}
            redeemables={state.redeemables}
            onRedeem={redeemItem}
            storeCategories={state.storeCategories}
            onAddStoreCategory={addStoreCategory}
            onRemoveStoreCategory={removeStoreCategory}
            onUpdateStoreCategory={updateStoreCategory}
          />
        );
      case 'calendar':
        return <CalendarView calendar={state.calendar} streak={state.streak} />;
      case 'insights':
        return <InsightsView platforms={state.insightPlatforms} entries={state.insightEntries} onAddPlatform={addPlatform} onRemovePlatform={removePlatform} onAddEntry={addInsightEntry} />;
      case 'inventory':
        return <InventoryPanel money={state.money} resources={state.resources} redeemables={state.redeemables} onRedeem={redeemItem} />;
      case 'achievements':
        return <AchievementsView achievements={state.achievements} />;
      case 'settings':
        return (
          <SettingsView
            settings={state.settings}
            categories={state.categories}
            onUpdate={updateSettings}
            onAddCategory={addCategory}
            onUpdateCategory={updateCategory}
            onDeleteCategory={removeCategory}
          />
        );
      case 'devtools':
        return (
          <DevToolsView
            onAddMoney={devAddMoney}
            onAddResource={devAddResource}
            onCompleteTask={devCompleteTask}
            onSetCombo={devSetCombo}
            onResetDay={resetDay}
            onResetMonth={devResetMonth}
            onForceEndDay={endDay}
            onResetAll={resetAll}
            onResetAchievements={resetAchievements}
            tasks={state.tasks.map(t => ({ id: t.id, name: t.name }))}
          />
        );
      default:
        return null;
    }
  };

  const tabTitle: Record<TabId, string> = {
    dashboard: "TODAY'S MISSION",
    focus: 'FOCUS MODE',
    stats: 'STATISTICS',
    store: 'REWARD STORE',
    calendar: 'CALENDAR',
    insights: 'INTELLIGENCE FEED',
    inventory: 'INVENTORY',
    achievements: 'ACHIEVEMENTS',
    settings: 'SETTINGS',
    devtools: 'DEVELOPER TOOLS',
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: '#060610',
        fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
      }}
    >
      {/* Ambient background grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,224,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,224,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          zIndex: 0,
          opacity: state.settings.glowIntensity,
        }}
      />

      {/* Corner glows */}
      <div
        className="fixed pointer-events-none"
        style={{
          top: -100, right: -100, width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,46,209,0.06) 0%, transparent 70%)',
          zIndex: 0, opacity: state.settings.glowIntensity,
        }}
      />
      <div
        className="fixed pointer-events-none"
        style={{
          bottom: -100, left: sidebarWidth, width: 500, height: 300,
          background: 'radial-gradient(ellipse, rgba(0,224,255,0.04) 0%, transparent 70%)',
          zIndex: 0, transition: 'left 0.3s', opacity: state.settings.glowIntensity,
        }}
      />

      {/* Particles */}
      <ParticleCanvas completionPercent={totalPercent} intensity={state.settings.particleIntensity} />

      {/* Resource bar (top) */}
      <ResourceBar money={state.money} resources={state.resources} sidebarWidth={sidebarWidth} />

      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
        onReset={resetDay}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        rank={currentRank.rank}
        rankColor={currentRank.color}
        completionPercent={totalPercent}
        dailyStreak={state.streak.dailyStreak}
        money={state.money}
      />

      {/* Main content */}
      <main
        className="relative z-20"
        style={{
          marginLeft: sidebarWidth,
          paddingTop: TOP_BAR_HEIGHT,
          paddingBottom: FOOTER_HEIGHT + 20,
          transition: 'margin-left 0.3s',
          height: '100vh',
          overflow: activeTab === 'dashboard' ? 'hidden' : 'auto',
        }}
      >
        <div
          className="app-content"
          style={{
            height: activeTab === 'dashboard' ? '100%' : 'auto',
            overflow: activeTab === 'dashboard' ? 'hidden' : 'visible',
          }}
        >
          {/* Header */}
          <div className="mb-8">
            <div
              className="text-xs font-bold tracking-widest mb-1"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              {new Date()
                .toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
                .toUpperCase()}
            </div>
            <h1
              className="text-3xl font-black tracking-tight"
              style={{ color: '#ffffff', letterSpacing: '-0.02em' }}
            >
              {tabTitle[activeTab]}
            </h1>
          </div>

          {renderContent()}
        </div>
      </main>

      {/* Progress bar footer */}
      <ProgressBar
        completionPercent={totalPercent}
        comboMultiplier={state.combo.multiplier}
        comboTimeLeft={comboTimeLeft}
        comboWindowMs={state.combo.comboWindowMs}
        totalPoints={state.totalPointsToday}
        sidebarWidth={sidebarWidth}
      />

      {/* Right panel */}
      <RightPanel
        open={rightPanelOpen}
        onToggle={() => setRightPanelOpen(o => !o)}
        timeline={state.timeline}
      />

      {/* Notifications */}
      <NotificationStack notifications={state.notifications} onDismiss={dismissNotification} />

      {/* Day summary popup */}
      {daySummary && <DaySummaryPopup summary={daySummary} onDismiss={dismissDaySummary} />}

      {/* Task modal */}
      {taskModal !== null && (
        <TaskModal
          task={taskModal === 'new' ? null : taskModal}
          categories={state.categories}
          colorPresets={state.taskColorPresets}
          onAddCategory={addCategory}
          onAddColorPreset={addTaskColorPreset}
          onRemoveColorPreset={removeTaskColorPreset}
          onSave={task => {
            if (taskModal === 'new') addTask(task);
            else updateTask(task);
            setTaskModal(null);
          }}
          onDelete={id => { removeTask(id); setTaskModal(null); }}
          onClose={() => setTaskModal(null)}
        />
      )}
    </div>
  );
}

interface ComboWidgetProps {
  multiplier: number;
  comboTimeLeft: number;
  comboWindowMs: number;
}

function ComboWidget({ multiplier, comboTimeLeft, comboWindowMs }: ComboWidgetProps) {
  const comboValue = Math.floor(multiplier);
  const comboLabel = comboValue.toLocaleString();
  const isActive = comboValue > 1;
  const comboTimeSec = Math.ceil(comboTimeLeft / 1000);
  const comboProgress = comboWindowMs > 0 ? (comboTimeLeft / comboWindowMs) * 100 : 0;
  const prevMultiplier = useRef(multiplier);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (multiplier > prevMultiplier.current) {
      setShake(true);
      const t = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(t);
    }
    prevMultiplier.current = multiplier;
  }, [multiplier]);

  const intensity = Math.min(Math.log10(Math.max(comboValue, 1)) / 2, 1);
  const shakePx = 1 + intensity * 8;
  const rotateDeg = 0.5 + intensity * 3;
  const pulseScale = 1.02 + intensity * 0.16;
  const shakeDuration = Math.max(0.08, 0.2 - intensity * 0.11);
  const comboFontSize = isActive
    ? Math.max(44, Math.min(74, 78 - Math.max(0, comboLabel.length - 4) * 3.5))
    : 36;

  const comboColor = isActive
    ? `hsl(${45 - intensity * 30}, 100%, ${55 + intensity * 10}%)`
    : 'rgba(255,255,255,0.15)';

  const glowSize = 20 + intensity * 40;

  return (
    <div
      className="rounded-lg flex items-center justify-between flex-1"
      style={{
        background: isActive
          ? `linear-gradient(135deg, rgba(255,204,0,${0.06 + intensity * 0.08}) 0%, rgba(255,136,0,${0.03 + intensity * 0.05}) 50%, rgba(255,46,209,${intensity * 0.04}) 100%)`
          : 'rgba(255,255,255,0.03)',
        border: isActive ? `1px solid rgba(255,204,0,${0.25 + intensity * 0.3})` : '1px solid rgba(255,255,255,0.07)',
        boxShadow: isActive ? `0 0 ${glowSize}px rgba(255,204,0,${0.1 + intensity * 0.2})` : 'none',
        padding: isActive ? '20px 24px' : '16px 20px',
        transition: 'all 0.3s',
        overflow: 'visible',
      }}
    >
      <div className="flex items-center gap-4">
        <div
          style={{
            display: 'inline-block',
            animation: isActive ? `combo-shake ${shakeDuration}s linear infinite` : 'none',
            '--combo-shake': `${shakePx}px`,
            '--combo-rotate': `${rotateDeg}deg`,
            '--combo-scale': String(pulseScale),
            transform: shake ? `scale(${1.15 + intensity * 0.15})` : `scale(${1 + intensity * 0.08})`,
            transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          } as CSSProperties}
        >
          <div
            className="font-black"
            style={{
              fontSize: `${comboFontSize}px`,
              maxWidth: 'min(42vw, 420px)',
              overflow: 'visible',
              whiteSpace: 'nowrap',
              color: comboColor,
              textShadow: isActive
                ? `0 0 ${glowSize}px rgba(255,204,0,${0.6 + intensity * 0.3}), 0 0 ${glowSize * 2}px rgba(255,204,0,${0.3 + intensity * 0.2}), ${intensity > 0.5 ? `0 0 ${glowSize * 3}px rgba(255,46,209,0.2)` : 'none'}`
                : 'none',
              letterSpacing: '-0.03em',
              lineHeight: 1,
              transition: 'font-size 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.3s, text-shadow 0.3s',
            }}
          >
            x{comboLabel}
          </div>
        </div>
        <div>
          <div
            className="text-xs font-bold tracking-widest"
            style={{ color: isActive ? `rgba(255,204,0,${0.6 + intensity * 0.3})` : 'rgba(255,255,255,0.2)' }}
          >
            COMBO MULTIPLIER
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
            {isActive ? 'Keep completing tasks within the window!' : 'Complete tasks to build combo'}
          </div>
        </div>
      </div>

      {isActive && (
        <div className="flex flex-col items-end gap-1.5">
          <div
            className="font-black tabular-nums"
            style={{
              color: comboColor,
              fontSize: `${18 + intensity * 6}px`,
              textShadow: `0 0 ${8 + intensity * 8}px rgba(255,204,0,0.5)`,
            }}
          >
            {Math.floor(comboTimeSec / 60)}:{String(comboTimeSec % 60).padStart(2, '0')}
          </div>
          <div
            className="w-24 h-1.5 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${comboProgress}%`,
                background: `linear-gradient(90deg, rgba(255,204,0,0.9), rgba(255,136,0,0.9))`,
                boxShadow: `0 0 6px rgba(255,204,0,0.6)`,
                transition: 'width 0.5s',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

const WIDGET_LABELS: Record<DashboardWidgetId, string> = {
  daily_progress: 'Daily Progress',
  telemetry: 'Mission Telemetry',
  targets: 'Next Targets',
  focus: 'Focus Module',
  unlocks: 'Recent Unlocks',
  streak: 'Streak & Consistency',
  economy: 'Economy',
  resources: 'Resource Vault',
  timeline: 'Recent Activity',
};

const WIDGET_COLORS: Record<DashboardWidgetId, string> = {
  daily_progress: '#00e0ff',
  telemetry: '#00e0ff',
  targets: '#ffcc00',
  focus: '#cc44ff',
  unlocks: '#ff2ed1',
  streak: '#ff8800',
  economy: '#ffcc00',
  resources: '#33ffcc',
  timeline: '#4488ff',
};

function DashboardWidgets({ state, completedTasks, totalTasks, completionPercent, onStartFocus, widgets, onUpdateWidgets }: {
  state: AppState;
  completedTasks: number;
  totalTasks: number;
  completionPercent: number;
  onStartFocus: () => void;
  widgets: DashboardWidgetConfig[];
  onUpdateWidgets: (widgets: DashboardWidgetConfig[]) => void;
}) {
  const [draggingWidget, setDraggingWidget] = useState<DashboardWidgetId | null>(null);
  const [dragOverWidget, setDragOverWidget] = useState<DashboardWidgetId | null>(null);
  const [justDroppedWidget, setJustDroppedWidget] = useState<DashboardWidgetId | null>(null);
  const [liftingWidget, setLiftingWidget] = useState<DashboardWidgetId | null>(null);
  const [swappingWidgets, setSwappingWidgets] = useState<{ from: DashboardWidgetId; to: DashboardWidgetId } | null>(null);
  const widgetRefs = useRef<Map<DashboardWidgetId, HTMLDivElement>>(new Map());
  const positionsRef = useRef<Map<DashboardWidgetId, DOMRect>>(new Map());

  const enabledWidgets = widgets.filter(w => w.enabled);
  const bigWidget = enabledWidgets.find(w => WIDGET_SIZES[w.id] === 'big');
  const normalWidgets = enabledWidgets.filter(w => WIDGET_SIZES[w.id] !== 'big');

  // FLIP animation
  useLayoutEffect(() => {
    if (!swappingWidgets) return;
    const oldPositions = positionsRef.current;
    widgetRefs.current.forEach((el, id) => {
      if (!el) return;
      const oldRect = oldPositions.get(id);
      if (!oldRect) return;
      const newRect = el.getBoundingClientRect();
      const deltaX = oldRect.left - newRect.left;
      const deltaY = oldRect.top - newRect.top;
      if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) {
        el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        el.style.transition = 'none';
        el.style.zIndex = '20';
        el.offsetHeight;
        el.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
        el.style.transform = 'translate(0, 0)';
        const cleanup = () => {
          el.style.transform = '';
          el.style.transition = '';
          el.style.zIndex = '';
          el.removeEventListener('transitionend', cleanup);
        };
        el.addEventListener('transitionend', cleanup);
      }
    });
  }, [swappingWidgets]);

  const moveWidgetTo = (dragId: DashboardWidgetId, targetId: DashboardWidgetId) => {
    if (dragId === targetId) return;
    const dragIndex = widgets.findIndex(w => w.id === dragId);
    const targetIndex = widgets.findIndex(w => w.id === targetId);
    if (dragIndex < 0 || targetIndex < 0) return;
    const positions = new Map<DashboardWidgetId, DOMRect>();
    widgetRefs.current.forEach((el, id) => { if (el) positions.set(id, el.getBoundingClientRect()); });
    positionsRef.current = positions;
    setSwappingWidgets({ from: dragId, to: targetId });
    const next = [...widgets];
    const temp = next[dragIndex];
    next[dragIndex] = next[targetIndex];
    next[targetIndex] = temp;
    onUpdateWidgets(next);
    setTimeout(() => setSwappingWidgets(null), 400);
  };

  const replaceWidget = (slotId: DashboardWidgetId, nextId: DashboardWidgetId) => {
    if (slotId === nextId) return;
    const slotIndex = widgets.findIndex(w => w.id === slotId);
    const nextIndex = widgets.findIndex(w => w.id === nextId);
    if (slotIndex < 0 || nextIndex < 0) return;
    const next = [...widgets];
    const selected = { ...next[nextIndex], enabled: true };
    const current = { ...next[slotIndex], enabled: next[nextIndex].enabled };
    next[slotIndex] = selected;
    next[nextIndex] = current;
    onUpdateWidgets(next);
  };

  const renderWidget = (id: DashboardWidgetId) => {
    const color = WIDGET_COLORS[id];
    switch (id) {
      case 'daily_progress':
        return (
          <WidgetShell widgetId={id} title="DAILY PROGRESS" color={color} widgets={widgets} onReplace={replaceWidget} size="big">
            <DailyProgressWidget state={state} completedTasks={completedTasks} totalTasks={totalTasks} completionPercent={completionPercent} onStartFocus={onStartFocus} />
          </WidgetShell>
        );
      case 'telemetry':
        return (
          <WidgetShell widgetId={id} title="MISSION TELEMETRY" color={color} widgets={widgets} onReplace={replaceWidget}>
            <TelemetryWidget state={state} completedTasks={completedTasks} totalTasks={totalTasks} completionPercent={completionPercent} />
          </WidgetShell>
        );
      case 'targets':
        return (
          <WidgetShell widgetId={id} title="NEXT TARGETS" color={color} widgets={widgets} onReplace={replaceWidget}>
            <TargetsWidget state={state} />
          </WidgetShell>
        );
      case 'focus':
        return (
          <WidgetShell widgetId={id} title="FOCUS MODULE" color={color} widgets={widgets} onReplace={replaceWidget}>
            <FocusWidget state={state} onStartFocus={onStartFocus} />
          </WidgetShell>
        );
      case 'unlocks':
        return (
          <WidgetShell widgetId={id} title="RECENT UNLOCKS" color={color} widgets={widgets} onReplace={replaceWidget}>
            <UnlocksWidget state={state} />
          </WidgetShell>
        );
      case 'streak':
        return (
          <WidgetShell widgetId={id} title="STREAK & CONSISTENCY" color={color} widgets={widgets} onReplace={replaceWidget}>
            <StreakWidget state={state} />
          </WidgetShell>
        );
      case 'economy':
        return (
          <WidgetShell widgetId={id} title="ECONOMY" color={color} widgets={widgets} onReplace={replaceWidget}>
            <EconomyWidget state={state} />
          </WidgetShell>
        );
      case 'resources':
        return (
          <WidgetShell widgetId={id} title="RESOURCE VAULT" color={color} widgets={widgets} onReplace={replaceWidget}>
            <ResourcesWidget state={state} />
          </WidgetShell>
        );
      case 'timeline':
        return (
          <WidgetShell widgetId={id} title="RECENT ACTIVITY" color={color} widgets={widgets} onReplace={replaceWidget}>
            <TimelineWidget state={state} />
          </WidgetShell>
        );
      default:
        return null;
    }
  };

  const renderDraggableWidget = (widget: DashboardWidgetConfig) => {
    const isDragging = draggingWidget === widget.id;
    const isDragOver = dragOverWidget === widget.id && draggingWidget !== widget.id;
    const isJustDropped = justDroppedWidget === widget.id;
    const isLifting = liftingWidget === widget.id;
    const isSwapping = swappingWidgets && (swappingWidgets.from === widget.id || swappingWidgets.to === widget.id);
    const size = WIDGET_SIZES[widget.id];

    return (
      <div
        key={widget.id}
        ref={el => { if (el) widgetRefs.current.set(widget.id, el); else widgetRefs.current.delete(widget.id); }}
        draggable
        onDragStart={event => {
          setLiftingWidget(widget.id);
          setTimeout(() => { setDraggingWidget(widget.id); setLiftingWidget(null); }, 50);
          event.dataTransfer.effectAllowed = 'move';
          const elem = event.currentTarget as HTMLElement;
          const rect = elem.getBoundingClientRect();
          event.dataTransfer.setDragImage(elem, rect.width / 2, rect.height / 2);
        }}
        onDragOver={event => {
          event.preventDefault();
          event.dataTransfer.dropEffect = 'move';
          if (draggingWidget && draggingWidget !== widget.id) setDragOverWidget(widget.id);
        }}
        onDragLeave={() => setDragOverWidget(null)}
        onDrop={event => {
          event.preventDefault();
          if (draggingWidget && draggingWidget !== widget.id) {
            moveWidgetTo(draggingWidget, widget.id);
            setJustDroppedWidget(draggingWidget);
            setTimeout(() => setJustDroppedWidget(null), 400);
          }
          setDraggingWidget(null);
          setDragOverWidget(null);
        }}
        onDragEnd={() => { setDraggingWidget(null); setDragOverWidget(null); setLiftingWidget(null); }}
        className={`widget-drag-container ${isSwapping ? 'widget-swapping' : ''} ${isDragging ? 'widget-dragging' : ''} ${isLifting ? 'widget-lifting' : ''} ${isDragOver ? 'widget-drag-over' : ''} ${size === 'big' ? 'widget-big' : ''}`}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          opacity: isDragging ? 0.4 : 1,
          boxShadow: isDragging ? 'none'
            : isLifting ? '0 12px 40px rgba(0,224,255,0.25), 0 0 0 2px rgba(0,224,255,0.3)'
            : isDragOver ? '0 0 0 2px rgba(0,224,255,0.5), 0 8px 32px rgba(0,224,255,0.2)'
            : isSwapping ? '0 0 25px rgba(0,224,255,0.35), 0 0 0 1px rgba(0,224,255,0.2)'
            : isJustDropped ? '0 0 20px rgba(0,224,255,0.4)'
            : 'none',
          borderRadius: '8px',
          position: 'relative',
          zIndex: isSwapping || isLifting ? 10 : 'auto',
        }}
      >
        {isDragOver && (
          <div className="absolute inset-0 rounded-lg pointer-events-none" style={{ border: '2px dashed rgba(0,224,255,0.6)', background: 'rgba(0,224,255,0.05)', animation: 'widget-drop-pulse 1s ease-in-out infinite', zIndex: 10 }} />
        )}
        {isLifting && (
          <div className="absolute inset-0 rounded-lg pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(0,224,255,0.15) 0%, transparent 70%)', animation: 'widget-lift-glow 0.3s ease-out', zIndex: -1 }} />
        )}
        {isJustDropped && (
          <div className="absolute inset-0 rounded-lg pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(0,224,255,0.2) 0%, transparent 60%)', animation: 'widget-settle 0.4s ease-out forwards', zIndex: -1 }} />
        )}
        {renderWidget(widget.id)}
      </div>
    );
  };

  // Layout: big widget locked at top (non-draggable), then normal widgets in 2-col grid
  return (
    <aside className="dashboard-widgets">
      {/* Big widget slot - locked, not draggable */}
      {bigWidget && renderWidget(bigWidget.id)}

      {/* Normal widget grid */}
      {normalWidgets.length > 0 && (
        <div className="widget-normal-grid">
          {normalWidgets.map(w => renderDraggableWidget(w))}
        </div>
      )}

      {enabledWidgets.length === 0 && (
        <div className="rounded-lg p-4 text-xs" style={{ color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          Enable widgets from the layout panel.
        </div>
      )}
    </aside>
  );
}

/* ── Widget Shell ── */

function WidgetShell({ widgetId, title, color, widgets, onReplace, size, children }: {
  widgetId: DashboardWidgetId;
  title: string;
  color: string;
  widgets: DashboardWidgetConfig[];
  onReplace: (slotId: DashboardWidgetId, nextId: DashboardWidgetId) => void;
  size?: WidgetSize;
  children: ReactNode;
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setDropdownOpen(false);
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dropdownOpen]);

  // Filter dropdown to only show widgets of the same size category
  const sameSizeWidgets = widgets.filter(w => WIDGET_SIZES[w.id] === (size ?? 'normal'));

  return (
    <section
      className="widget-shell rounded-xl p-4 group"
      style={{
        background: `linear-gradient(145deg, ${color}12 0%, rgba(255,255,255,0.02) 50%, ${color}08 100%)`,
        border: `1px solid ${color}20`,
        boxShadow: `0 4px 24px ${color}08, inset 0 1px 0 ${color}15`,
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          {size !== 'big' && (
            <div className="flex flex-col gap-[3px] opacity-25 group-hover:opacity-50 transition-opacity duration-300" style={{ cursor: 'grab' }}>
              <div className="flex gap-[3px]"><div className="w-1 h-1 rounded-full" style={{ background: color }} /><div className="w-1 h-1 rounded-full" style={{ background: color }} /></div>
              <div className="flex gap-[3px]"><div className="w-1 h-1 rounded-full" style={{ background: color }} /><div className="w-1 h-1 rounded-full" style={{ background: color }} /></div>
              <div className="flex gap-[3px]"><div className="w-1 h-1 rounded-full" style={{ background: color }} /><div className="w-1 h-1 rounded-full" style={{ background: color }} /></div>
            </div>
          )}
          <div className="text-[10px] font-semibold tracking-[0.15em] uppercase" style={{ color, textShadow: `0 0 20px ${color}40` }}>
            {title}
          </div>
        </div>

        {sameSizeWidgets.length > 1 && (
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center justify-center w-6 h-6 rounded-md transition-all duration-200"
            style={{
              background: dropdownOpen ? `${color}20` : 'transparent',
              border: `1px solid ${dropdownOpen ? color + '40' : 'transparent'}`,
              color: dropdownOpen ? color : 'rgba(255,255,255,0.4)',
            }}
            onMouseEnter={e => { if (!dropdownOpen) { e.currentTarget.style.background = `${color}15`; e.currentTarget.style.color = color; } }}
            onMouseLeave={e => { if (!dropdownOpen) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; } }}
            title="Switch widget"
          >
            <ChevronDown size={14} style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease' }} />
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 top-full mt-2 z-50 min-w-[160px] py-1.5 rounded-lg overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, rgba(20,20,35,0.98) 0%, rgba(12,12,22,0.98) 100%)',
                border: `1px solid ${color}30`,
                boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05), 0 0 20px ${color}15`,
                backdropFilter: 'blur(12px)',
                animation: 'dropdown-appear 0.15s ease-out',
              }}
            >
              {sameSizeWidgets.map(widget => {
                const isActive = widget.id === widgetId;
                return (
                  <button
                    key={widget.id}
                    onClick={() => { if (!isActive) onReplace(widgetId, widget.id); setDropdownOpen(false); }}
                    className="w-full px-3 py-2 text-left text-[11px] font-medium tracking-wide transition-all duration-150 flex items-center gap-2"
                    style={{
                      background: isActive ? `${color}15` : 'transparent',
                      color: isActive ? color : 'rgba(255,255,255,0.6)',
                      borderLeft: isActive ? `2px solid ${color}` : '2px solid transparent',
                    }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.9)'; } }}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; } }}
                  >
                    {isActive && <div className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />}
                    <span style={{ marginLeft: isActive ? 0 : '14px' }}>{WIDGET_LABELS[widget.id]}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        )}
      </div>
      {children}
    </section>
  );
}

/* ── Individual Widget Renderers ── */

function WidgetStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="rounded-lg p-2.5 transition-all duration-200 hover:scale-[1.02]"
      style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}
    >
      <div className="text-[9px] tracking-[0.12em] uppercase mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</div>
      <div className="text-sm font-black tabular-nums truncate" style={{ color, textShadow: `0 0 20px ${color}30` }}>{value}</div>
    </div>
  );
}

function DailyProgressWidget({ state, completedTasks, totalTasks, completionPercent, onStartFocus }: {
  state: AppState; completedTasks: number; totalTasks: number; completionPercent: number; onStartFocus: () => void;
}) {
  const currentRank = getRank(completionPercent);
  const isComplete = completedTasks === totalTasks && totalTasks > 0;
  const focusMinutes = Math.floor(state.focusTotalMs / 60000);
  const remainingTasks = Math.max(totalTasks - completedTasks, 0);

  return (
    <div className="space-y-4">
      {/* Rank + progress bar */}
      <div className="flex items-center gap-4">
        <div className="shrink-0 text-center" style={{ minWidth: 64 }}>
          <div className="text-3xl font-black" style={{ color: currentRank.color, textShadow: `0 0 20px ${currentRank.color}66` }}>
            {currentRank.rank}
          </div>
          <div className="text-[9px] tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>RANK</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold tracking-widest" style={{ color: isComplete ? '#33ffcc' : 'rgba(255,255,255,0.35)' }}>
              {isComplete ? 'MISSION COMPLETE' : 'DAILY MISSION'}
            </span>
            <span className="text-xs font-black tabular-nums" style={{ color: currentRank.color }}>
              {Math.round(completionPercent)}%
            </span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${completionPercent}%`,
                background: isComplete
                  ? 'linear-gradient(90deg, #33ffcc, #00e0ff)'
                  : 'linear-gradient(90deg, #00e0ff, #33ffcc)',
                boxShadow: isComplete
                  ? '0 0 16px rgba(51,255,204,0.7), 0 0 32px rgba(51,255,204,0.3)'
                  : '0 0 12px rgba(0,224,255,0.7)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2">
        <WidgetStat label="DONE" value={`${completedTasks}/${totalTasks}`} color="#33ffcc" />
        <WidgetStat label="LEFT" value={remainingTasks.toString()} color="#ffcc00" />
        <WidgetStat label="XP" value={state.totalPointsToday.toLocaleString()} color="#ff2ed1" />
        <WidgetStat label="FOCUS" value={`${focusMinutes}m`} color="#cc44ff" />
      </div>

      {/* Complete banner */}
      {isComplete && (
        <div
          className="rounded-lg p-3 text-center"
          style={{
            background: `linear-gradient(135deg, ${currentRank.color}15 0%, ${currentRank.color}08 100%)`,
            border: `1px solid ${currentRank.color}44`,
            boxShadow: `0 0 20px ${currentRank.color}22`,
          }}
        >
          <div className="text-2xl font-black mb-1" style={{ color: currentRank.color, textShadow: `0 0 20px ${currentRank.color}, 0 0 40px ${currentRank.color}44` }}>
            {currentRank.rank}
          </div>
          <div className="text-xs font-bold tracking-widest" style={{ color: '#ffffff' }}>MISSION COMPLETE</div>
          <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>All quotas fulfilled for today</div>
        </div>
      )}

      {/* Quick actions */}
      {!isComplete && (
        <div className="flex gap-2">
          <button
            onClick={onStartFocus}
            className="flex-1 py-2 rounded text-[10px] font-bold tracking-widest transition-all duration-200 hover:brightness-125"
            style={{ background: 'rgba(204,68,255,0.12)', border: '1px solid rgba(204,68,255,0.3)', color: '#cc44ff' }}
          >
            FOCUS
          </button>
        </div>
      )}
    </div>
  );
}

function TelemetryWidget({ state, completedTasks, totalTasks, completionPercent }: {
  state: AppState; completedTasks: number; totalTasks: number; completionPercent: number;
}) {
  const remainingTasks = Math.max(totalTasks - completedTasks, 0);
  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        <WidgetStat label="DONE" value={`${completedTasks}/${totalTasks}`} color="#33ffcc" />
        <WidgetStat label="LEFT" value={remainingTasks.toString()} color="#ffcc00" />
        <WidgetStat label="XP" value={state.totalPointsToday.toLocaleString()} color="#ff2ed1" />
        <WidgetStat label="BEST COMBO" value={`x${Math.floor(state.combo.peakToday).toLocaleString()}`} color="#ff8800" />
      </div>
      <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-full rounded-full" style={{ width: `${completionPercent}%`, background: 'linear-gradient(90deg, #00e0ff, #33ffcc)', boxShadow: '0 0 12px rgba(0,224,255,0.7)' }} />
      </div>
    </div>
  );
}

function TargetsWidget({ state }: { state: AppState }) {
  const nextTasks = state.tasks.filter(t => (state.progress[t.id] ?? 0) < t.dailyTarget).slice(0, 4);
  return (
    <div className="space-y-2">
      {nextTasks.length === 0 ? (
        <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>All task quotas are complete.</div>
      ) : nextTasks.map(task => {
        const done = state.progress[task.id] ?? 0;
        return (
          <div key={task.id} className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-bold truncate" style={{ color: task.color }}>{task.name.toUpperCase()}</div>
              <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.28)' }}>{task.category}</div>
            </div>
            <div className="text-xs font-black tabular-nums" style={{ color: '#ffffff' }}>{done}/{task.dailyTarget}</div>
          </div>
        );
      })}
    </div>
  );
}

function FocusWidget({ state, onStartFocus }: { state: AppState; onStartFocus: () => void }) {
  const focusMinutes = Math.floor(state.focusTotalMs / 60000);
  const focusHours = (state.focusTotalMs / 3600000).toFixed(1);
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="text-2xl font-black" style={{ color: '#cc44ff', textShadow: '0 0 14px rgba(204,68,255,0.5)' }}>{focusMinutes}m</div>
        <div className="text-[10px] tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>{focusHours}h TOTAL</div>
      </div>
      <button onClick={onStartFocus} className="px-3 py-2 rounded text-[10px] font-bold tracking-widest" style={{ background: 'rgba(204,68,255,0.12)', border: '1px solid rgba(204,68,255,0.35)', color: '#cc44ff' }}>
        START
      </button>
    </div>
  );
}

function UnlocksWidget({ state }: { state: AppState }) {
  const latest = state.achievements.filter(a => a.unlockedAt !== null).sort((a, b) => (b.unlockedAt ?? 0) - (a.unlockedAt ?? 0)).slice(0, 3);
  const totalUnlocked = state.achievements.filter(a => a.unlockedAt !== null).length;
  return (
    <div className="space-y-2">
      {latest.length === 0 ? (
        <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>No achievements unlocked yet.</div>
      ) : latest.map(a => (
        <div key={a.id} className="text-xs font-bold truncate" style={{ color: a.color }}>{a.name.toUpperCase()}</div>
      ))}
      <div className="text-[10px] pt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>{totalUnlocked}/{state.achievements.length} UNLOCKED</div>
    </div>
  );
}

function StreakWidget({ state }: { state: AppState }) {
  const sssDays = Object.values(state.calendar).filter(d => d.tasksCompleted > 0 && d.totalTasks > 0 && (d.tasksCompleted / d.totalTasks) * 100 >= 100).length;
  return (
    <div className="grid grid-cols-2 gap-2">
      <WidgetStat label="DAILY STREAK" value={`${state.streak.dailyStreak}`} color="#ff8800" />
      <WidgetStat label="SSS STREAK" value={`${state.streak.sssStreak}`} color="#ff2ed1" />
      <WidgetStat label="SSS DAYS" value={`${sssDays}`} color="#ffcc00" />
      <WidgetStat label="REDEEMABLES" value={`${state.redeemables.length}`} color="#33ffcc" />
    </div>
  );
}

function EconomyWidget({ state }: { state: AppState }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <WidgetStat label="BALANCE" value={state.money.toLocaleString()} color="#ffcc00" />
      <WidgetStat label="EARNED" value={state.totalMoneyEarned.toLocaleString()} color="#33ffcc" />
      <WidgetStat label="SPENT" value={state.totalMoneySpent.toLocaleString()} color="#ff8800" />
      <WidgetStat label="TASKS DONE" value={`${state.totalTasksCompleted}`} color="#00e0ff" />
    </div>
  );
}

function ResourcesWidget({ state }: { state: AppState }) {
  const topResources = Object.entries(state.resources)
    .filter(([_, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  return (
    <div className="space-y-1.5">
      {topResources.length === 0 ? (
        <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>No resources collected yet.</div>
      ) : topResources.map(([id, amount]) => {
        const def = RESOURCE_DEFS.find(r => r.id === id);
        return (
          <div key={id} className="flex items-center justify-between">
            <span className="text-xs" style={{ color: def?.color ?? '#ffffff' }}>{def?.icon} {def?.name ?? id}</span>
            <span className="text-xs font-black tabular-nums" style={{ color: def?.color ?? '#ffffff' }}>{amount}</span>
          </div>
        );
      })}
    </div>
  );
}

function TimelineWidget({ state }: { state: AppState }) {
  const recent = state.timeline.slice(-4).reverse();
  return (
    <div className="space-y-2">
      {recent.length === 0 ? (
        <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>No activity yet today.</div>
      ) : recent.map(entry => (
        <div key={entry.id} className="flex items-center justify-between">
          <span className="text-xs font-bold truncate" style={{ color: entry.taskColor }}>{entry.taskName.toUpperCase()}</span>
          <span className="text-[10px] font-black tabular-nums" style={{ color: '#ffffff' }}>+{entry.pointsEarned}</span>
        </div>
      ))}
    </div>
  );
}


function SortBtn({ active, label, onClick, asc, showArrow }: { active: boolean; label: string; onClick: () => void; asc: boolean; showArrow: boolean }) {
  return (
    <button
      onClick={onClick}
      className="px-2 py-1 rounded text-[10px] font-bold tracking-wider transition-all duration-150"
      style={{
        background: active ? 'rgba(0,224,255,0.1)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${active ? 'rgba(0,224,255,0.25)' : 'rgba(255,255,255,0.07)'}`,
        color: active ? '#00e0ff' : 'rgba(255,255,255,0.3)',
      }}
    >
      {label.toUpperCase()}{showArrow ? (asc ? ' ↑' : ' ↓') : ''}
    </button>
  );
}

function GroupBtn({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-2 py-1 rounded text-[10px] font-bold tracking-wider transition-all duration-150"
      style={{
        background: active ? 'rgba(51,255,204,0.1)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${active ? 'rgba(51,255,204,0.25)' : 'rgba(255,255,255,0.07)'}`,
        color: active ? '#33ffcc' : 'rgba(255,255,255,0.3)',
      }}
    >
      {label.toUpperCase()}
    </button>
  );
}
