import React, { useState } from 'react';
import { Search, Shield, CheckCircle2, XCircle, Calendar, Filter, SlidersHorizontal } from 'lucide-react';
import { FilterDrawer } from '../../components/ui/FilterDrawer'; // Убедитесь, что путь корректный

interface AuditLogItem {
    id: string;
    dateTime: string;
    user: string;
    role: string;
    action: string;
    object: string;
    document: string;
    department: string;
    result: 'success' | 'error';
}

const initialAuditLogs: AuditLogItem[] = [
    {
        id: '1',
        dateTime: '2026-07-27 14:20:15',
        user: 'Айдана Садыкова',
        role: 'Руководитель',
        action: 'Согласование',
        object: 'Документ',
        document: 'Приказ №45-У',
        department: 'Учебный отдел',
        result: 'success',
    },
    {
        id: '2',
        dateTime: '2026-07-27 11:05:40',
        user: 'Иван Петров',
        role: 'Сотрудник',
        action: 'Создание',
        object: 'Документ',
        document: 'Служебная записка №12',
        department: 'IT Департамент',
        result: 'success',
    },
    {
        id: '3',
        dateTime: '2026-07-26 16:45:10',
        user: 'Елена Смирнова',
        role: 'Канцелярия',
        action: 'Возврат',
        object: 'Документ',
        document: 'Финансовый отчет',
        department: 'Бухгалтерия',
        result: 'error',
    },
    {
        id: '4',
        dateTime: '2026-07-25 09:12:00',
        user: 'Администратор Системы',
        role: 'Администратор',
        action: 'Архивирование',
        object: 'Документ',
        document: 'Договор подряда №3',
        department: 'Юридический отдел',
        result: 'success',
    },
];

export const AuditPage: React.FC = () => {
    const [logs] = useState<AuditLogItem[]>(initialAuditLogs);
    
    // Состояния загрузки и ошибки
    const [isLoading] = useState(false);
    const [error] = useState<string | null>(null);

    // Состояния фильтров
    const [userFilter, setUserFilter] = useState('');
    const [actionFilter, setActionFilter] = useState('all');
    const [deptFilter, setDeptFilter] = useState('');
    const [docSearch, setDocSearch] = useState('');
    const [periodFilter, setPeriodFilter] = useState('all');

    // Состояние Drawer для мобильных фильтров
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

    // Подсчет активных дополнительных фильтров (для бейджа на кнопке)
    const activeFiltersCount = [
        userFilter.trim() !== '',
        actionFilter !== 'all',
        deptFilter.trim() !== '',
        periodFilter !== 'all'
    ].filter(Boolean).length;

    const resetFilters = () => {
        setUserFilter('');
        setActionFilter('all');
        setDeptFilter('');
        setPeriodFilter('all');
        setDocSearch('');
    };

    const filteredLogs = logs.filter(log => {
        if (userFilter && !log.user.toLowerCase().includes(userFilter.toLowerCase())) return false;
        if (actionFilter !== 'all' && log.action !== actionFilter) return false;
        if (deptFilter && !log.department.toLowerCase().includes(deptFilter.toLowerCase())) return false;
        if (docSearch && !log.document.toLowerCase().includes(docSearch.toLowerCase())) return false;
        return true;
    });

    if (isLoading) {
        return (
            <div className="page-container" style={{ padding: '16px' }}>
                <div className="page-stack">
                    <div style={{ padding: '48px', textAlign: 'center', color: 'var(--color-fog)' }}>
                        <div className="spinner">Загрузка журнала действий...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-container" style={{ padding: '16px' }}>
                <div className="page-stack">
                    <div style={{ padding: '48px', textAlign: 'center', color: '#e53e3e' }}>
                        <p style={{ fontWeight: 600, fontSize: '16px' }}>Не удалось загрузить данные</p>
                        <p style={{ fontSize: '13px', marginTop: 4 }}>{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container" style={{ padding: '16px' }}>
            <div className="page-stack">
                <div className="page-hero" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="page-heading" style={{ margin: 0 }}>
                        <h1 style={{ fontSize: '24px' }}>Журнал действий</h1>
                        <p style={{ fontSize: '14px' }}>Системный аудит событий, действий пользователей и операций.</p>
                    </div>
                    <span className="badge" style={{ background: '#edf2f7', color: '#4a5568', padding: '6px 12px', fontSize: '12px' }}>
                        🔒 Только для чтения
                    </span>
                </div>

                <div className="content-card" style={{ display: 'grid', gap: 16 }}>
                    {/* --- ПАНЕЛЬ ПОИСКА И ФИЛЬТРОВ --- */}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* Главный поиск (всегда видим) */}
                        <div style={{ position: 'relative', flex: '1 1 250px' }}>
                            <Search size={16} color="var(--color-fog)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                placeholder="Поиск по документу..."
                                value={docSearch}
                                onChange={(e) => setDocSearch(e.target.value)}
                                style={{ paddingLeft: 36, width: '100%', borderRadius: 8, border: '1px solid var(--color-cloud)' }}
                            />
                        </div>

                        {/* Кнопка открытия мобильных фильтров (видна только на мобильных - нужна поддержка CSS) */}
                        <button
                            type="button"
                            className="button button--secondary desktop-table-view" // Скрываем на десктопе, используем инверсию классов или зададим инлайн для мобилок
                            onClick={() => setIsFilterDrawerOpen(true)}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}
                        >
                            <SlidersHorizontal size={16} />
                            <span>Фильтры</span>
                            {activeFiltersCount > 0 && (
                                <span style={{
                                    background: 'var(--color-primary, #0052cc)', color: '#fff', borderRadius: '50%',
                                    width: 18, height: 18, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {activeFiltersCount}
                                </span>
                            )}
                        </button>

                        {/* Десктопные фильтры (скрываются на мобильных) */}
                        <div className="desktop-table-view" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 2 }}>
                            <input
                                type="text"
                                placeholder="Пользователь..."
                                value={userFilter}
                                onChange={(e) => setUserFilter(e.target.value)}
                                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--color-cloud)', fontSize: '13px', flex: 1, minWidth: '130px' }}
                            />
                            
                            <select
                                value={actionFilter}
                                onChange={(e) => setActionFilter(e.target.value)}
                                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--color-cloud)', background: '#fff', fontSize: '13px', flex: 1, minWidth: '130px' }}
                            >
                                <option value="all">Все действия</option>
                                <option value="Создание">Создание</option>
                                <option value="Согласование">Согласование</option>
                                <option value="Возврат">Возврат</option>
                                <option value="Архивирование">Архивирование</option>
                            </select>

                            <input
                                type="text"
                                placeholder="Подразделение..."
                                value={deptFilter}
                                onChange={(e) => setDeptFilter(e.target.value)}
                                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--color-cloud)', fontSize: '13px', flex: 1, minWidth: '130px' }}
                            />

                            <select
                                value={periodFilter}
                                onChange={(e) => setPeriodFilter(e.target.value)}
                                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--color-cloud)', background: '#fff', fontSize: '13px', flex: 1, minWidth: '130px' }}
                            >
                                <option value="all">За всё время</option>
                                <option value="today">Сегодня</option>
                                <option value="week">За неделю</option>
                                <option value="month">За месяц</option>
                            </select>
                        </div>
                    </div>

                    {/* --- 1. ДЕСКТОПНАЯ И ПЛАНШЕТНАЯ ТАБЛИЦА --- */}
                    <div className="desktop-table-view" style={{ width: '100%', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>Дата и время</th>
                                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>Пользователь</th>
                                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>Роль</th>
                                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>Действие</th>
                                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>Объект</th>
                                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>Документ</th>
                                    <th style={{ padding: '12px 8px', textAlign: 'center' }}>Результат</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: 'center', color: 'var(--color-fog)', padding: '48px 0' }}>
                                            Записи в журнале не найдены
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <tr key={log.id} style={{ borderTop: '1px solid var(--color-cloud)' }}>
                                            <td style={{ padding: '12px 8px', fontSize: '13px', color: 'var(--color-fog)', whiteSpace: 'nowrap' }}>
                                                {log.dateTime}
                                            </td>
                                            <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--color-obsidian)', fontSize: '13px' }}>
                                                {log.user}
                                            </td>
                                            <td style={{ padding: '12px 8px', fontSize: '13px', color: 'var(--color-fog)' }}>
                                                {log.role}
                                            </td>
                                            <td style={{ padding: '12px 8px', fontSize: '13px' }}>
                                                <span className="badge" style={{ fontSize: '11px' }}>{log.action}</span>
                                            </td>
                                            <td style={{ padding: '12px 8px', fontSize: '13px', color: 'var(--color-fog)' }}>
                                                {log.object}
                                            </td>
                                            <td style={{ padding: '12px 8px', fontSize: '13px', fontWeight: 500, color: 'var(--color-obsidian)' }}>
                                                {log.document}
                                            </td>
                                            <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                                {log.result === 'success' ? (
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#38a169', fontSize: '12px', fontWeight: 500 }}>
                                                        <CheckCircle2 size={14} /> Успешно
                                                    </span>
                                                ) : (
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#e53e3e', fontSize: '12px', fontWeight: 500 }}>
                                                        <XCircle size={14} /> Ошибка
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* --- 2. МОБИЛЬНЫЙ СПИСОК КАРТОЧЕК --- */}
                    <div className="mobile-cards-view">
                        {filteredLogs.length === 0 ? (
                            <div style={{ textAlign: 'center', color: 'var(--color-fog)', padding: '32px 0', fontSize: 14 }}>
                                Записи в журнале не найдены
                            </div>
                        ) : (
                            filteredLogs.map((log) => (
                                <div key={log.id} style={{
                                    border: '1px solid var(--color-cloud)', borderRadius: '10px',
                                    padding: '14px', background: '#fff', display: 'grid', gap: '10px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-obsidian)', marginBottom: 2 }}>
                                                {log.document}
                                            </div>
                                            <div style={{ fontSize: '13px', color: 'var(--color-fog)' }}>
                                                {log.action} • {log.object}
                                            </div>
                                        </div>
                                        {log.result === 'success' ? (
                                            <span className="badge" style={{ color: '#38a169', background: '#e6fffa', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <CheckCircle2 size={12} /> Успешно
                                            </span>
                                        ) : (
                                            <span className="badge" style={{ color: '#e53e3e', background: '#fff5f5', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <XCircle size={12} /> Ошибка
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div style={{ fontSize: '13px', color: 'var(--color-obsidian)', background: '#f8fafc', padding: '8px', borderRadius: '6px' }}>
                                        <span style={{ fontWeight: 500 }}>{log.user}</span> <span style={{ color: 'var(--color-fog)' }}>({log.role})</span>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--color-fog)', marginTop: '4px' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Shield size={12} /> {log.department}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Calendar size={12} /> {log.dateTime.split(' ')[0]}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                </div>
            </div>

            {/* --- ВЫДВИЖНАЯ ПАНЕЛЬ ФИЛЬТРОВ (DRAWER) --- */}
            <FilterDrawer
                isOpen={isFilterDrawerOpen}
                onClose={() => setIsFilterDrawerOpen(false)}
                onReset={resetFilters}
                title="Фильтры журнала"
            >
                <div style={{ display: 'grid', gap: 16 }}>
                    <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 500 }}>
                        Пользователь
                        <input
                            type="text"
                            placeholder="ФИО..."
                            value={userFilter}
                            onChange={(e) => setUserFilter(e.target.value)}
                            style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--color-cloud)' }}
                        />
                    </label>

                    <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 500 }}>
                        Действие
                        <select
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                            style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--color-cloud)', background: '#fff' }}
                        >
                            <option value="all">Все действия</option>
                            <option value="Создание">Создание</option>
                            <option value="Согласование">Согласование</option>
                            <option value="Возврат">Возврат</option>
                            <option value="Архивирование">Архивирование</option>
                        </select>
                    </label>

                    <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 500 }}>
                        Подразделение
                        <input
                            type="text"
                            placeholder="Название..."
                            value={deptFilter}
                            onChange={(e) => setDeptFilter(e.target.value)}
                            style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--color-cloud)' }}
                        />
                    </label>

                    <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 500 }}>
                        Период
                        <select
                            value={periodFilter}
                            onChange={(e) => setPeriodFilter(e.target.value)}
                            style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--color-cloud)', background: '#fff' }}
                        >
                            <option value="all">За всё время</option>
                            <option value="today">Сегодня</option>
                            <option value="week">За неделю</option>
                            <option value="month">За месяц</option>
                        </select>
                    </label>
                </div>
            </FilterDrawer>
        </div>
    );
};