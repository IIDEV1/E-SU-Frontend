import React, { useState } from 'react';
import { 
    Bell, Check, CheckCheck, Filter, Send, CheckCircle2, 
    RotateCcw, Clock, AlertTriangle, UserPlus, MessageSquare, ExternalLink 
} from 'lucide-react';
import { FilterDrawer } from '@/components/ui/FilterDrawer';

interface NotificationItem {
    id: string;
    type: 'sent' | 'approved' | 'returned' | 'deadline' | 'overdue' | 'assigned' | 'comment';
    title: string;
    message: string;
    date: string;
    isRead: boolean;
    documentId: string;
}

const initialNotifications: NotificationItem[] = [
    {
        id: '1',
        type: 'approved',
        title: 'Документ согласован',
        message: 'Приказ №45-У успешно прошел все этапы согласования.',
        date: 'Сегодня, 14:20',
        isRead: false,
        documentId: 'doc-101',
    },
    {
        id: '2',
        type: 'deadline',
        title: 'Приближается дедлайн',
        message: 'Срок рассмотрения служебной записки истекает завтра.',
        date: 'Сегодня, 11:05',
        isRead: false,
        documentId: 'doc-102',
    },
    {
        id: '3',
        type: 'comment',
        title: 'Добавлен комментарий',
        message: 'Юрист оставил замечание к проекту договора подряда.',
        date: 'Вчера, 16:45',
        isRead: true,
        documentId: 'doc-103',
    },
    {
        id: '4',
        type: 'returned',
        title: 'Документ возвращён',
        message: 'Бухгалтерия вернула финансовый отчет на доработку.',
        date: '25 июля, 09:12',
        isRead: true,
        documentId: 'doc-104',
    },
    {
        id: '5',
        type: 'assigned',
        title: 'Назначен ответственный',
        message: 'Вы назначены проверяющим по документу №89.',
        date: '24 июля, 13:30',
        isRead: true,
        documentId: 'doc-105',
    },
];

const typeLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    sent: { label: 'Отправлен', icon: <Send size={16} />, color: '#3182ce' },
    approved: { label: 'Согласован', icon: <CheckCircle2 size={16} />, color: '#38a169' },
    returned: { label: 'Возвращён', icon: <RotateCcw size={16} />, color: '#e53e3e' },
    deadline: { label: 'Дедлайн', icon: <Clock size={16} />, color: '#dd6b20' },
    overdue: { label: 'Просрочен', icon: <AlertTriangle size={16} />, color: '#e53e3e' },
    assigned: { label: 'Назначен', icon: <UserPlus size={16} />, color: '#805ad5' },
    comment: { label: 'Комментарий', icon: <MessageSquare size={16} />, color: '#319795' },
};

export const NotificationsPage: React.FC = () => {
    const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
    const [selectedFilter, setSelectedFilter] = useState<string>('all');
    const [readFilter, setReadFilter] = useState<'all' | 'unread'>('all');

    // Состояние открытия шторки фильтров
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    const handleMarkAsRead = (id: string) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    const handleMarkAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    };

    const resetFilters = () => {
        setSelectedFilter('all');
        setReadFilter('all');
    };

    const filteredNotifications = notifications.filter(n => {
        if (selectedFilter !== 'all' && n.type !== selectedFilter) return false;
        if (readFilter === 'unread' && n.isRead) return false;
        return true;
    });

    const activeFiltersCount = (selectedFilter !== 'all' ? 1 : 0) + (readFilter !== 'all' ? 1 : 0);

    // 1. Состояние ЗАГРУЗКИ (Loading)
    if (isLoading) {
        return (
            <div className="page-loading">
                <div className="spinner">Загрузка уведомлений...</div>
            </div>
        );
    }

    // 2. Состояние ОШИБКИ (Error)
    if (isError) {
        return (
            <div className="page-error">
                <p>Не удалось загрузить уведомления. Попробуйте позже.</p>
            </div>
        );
    }

    // 3. Состояние ПУСТОГО СПИСКА (Empty)
    if (!notifications || notifications.length === 0) {
        return (
            <div className="page-empty">
                <p>У вас нет уведомлений. Здесь пока пусто!</p>
            </div>
        );
    }

    // 4. Состояние УСПЕХА / КОНТЕНТА (Success)
    return (
        <div className="page-container">
            <div className="page-stack">
                <div className="page-hero">
                    <div className="page-heading">
                        <h1>Уведомления</h1>
                        <p>История системных оповещений, статусы документов и задачи.</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button 
                            type="button" 
                            className="button button--secondary" 
                            onClick={handleMarkAllAsRead}
                            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                        >
                            <CheckCheck size={16} /> Прочитать все
                        </button>
                    </div>
                </div>

                <div className="content-card" style={{ display: 'grid', gap: 16 }}>
                    {/* Панель управления и кнопка открытия шторки */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-cloud)', paddingBottom: 16 }}>
                        <div style={{ fontSize: '14px', color: 'var(--color-fog)' }}>
                            Показано: <strong>{filteredNotifications.length}</strong> из {notifications.length}
                        </div>

                        <button
                            type="button"
                            className={`button ${activeFiltersCount > 0 ? 'button--primary' : 'button--secondary'}`}
                            onClick={() => setIsFilterOpen(true)}
                            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                        >
                            <Filter size={16} />
                            Фильтры {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                        </button>
                    </div>

                    {/* Список уведомлений */}
                    <div style={{ display: 'grid', gap: 8 }}>
                        {filteredNotifications.length === 0 ? (
                            <div style={{ textAlign: 'center', color: 'var(--color-fog)', padding: '48px 0' }}>
                                Нет уведомлений для отображения по выбранным фильтрам
                            </div>
                        ) : (
                            filteredNotifications.map((item) => {
                                const config = typeLabels[item.type] || { label: item.type, icon: <Bell size={16} />, color: '#666' };
                                return (
                                    <div
                                        key={item.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            justifyContent: 'space-between',
                                            padding: '16px',
                                            borderRadius: 10,
                                            background: item.isRead ? '#fcfcfc' : '#f0f4f8',
                                            border: '1px solid var(--color-cloud)',
                                            gap: 16,
                                            transition: 'background 0.2s',
                                        }}
                                    >
                                        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                                            <div style={{ 
                                                width: 36, height: 36, borderRadius: '50%', background: `${config.color}15`, 
                                                color: config.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
                                            }}>
                                                {config.icon}
                                            </div>
                                            <div style={{ display: 'grid', gap: 4 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-obsidian)' }}>
                                                        {item.title}
                                                    </span>
                                                    <span className="badge" style={{ fontSize: '10px', background: `${config.color}20`, color: config.color }}>
                                                        {config.label}
                                                    </span>
                                                </div>
                                                <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-fog)' }}>
                                                    {item.message}
                                                </p>
                                                <span style={{ fontSize: '11px', color: 'var(--color-fog)', opacity: 0.8 }}>
                                                    {item.date}
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                            {!item.isRead && (
                                                <button
                                                    type="button"
                                                    className="button button--secondary"
                                                    style={{ padding: '4px 10px', fontSize: '11px' }}
                                                    onClick={() => handleMarkAsRead(item.id)}
                                                    title="Отметить прочитанным"
                                                >
                                                    <Check size={14} /> Прочитано
                                                </button>
                                            )}
                                            <a
                                                href={`/documents/${item.documentId}`}
                                                className="icon-button"
                                                title="Перейти к документу"
                                                style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: '1px solid var(--color-cloud)', background: '#fff', color: 'var(--color-obsidian)' }}
                                            >
                                                <ExternalLink size={14} />
                                            </a>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Шторка фильтрации FilterDrawer с переданными children */}
            <FilterDrawer
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
            >
                <div style={{ display: 'grid', gap: 20 }}>
                    {/* Фильтр по статусу прочтения */}
                    <div>
                        <label style={{ fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: 8 }}>
                            Статус прочтения
                        </label>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button
                                type="button"
                                className={`button ${readFilter === 'all' ? 'button--primary' : 'button--secondary'}`}
                                style={{ flex: 1, padding: '8px', fontSize: '13px' }}
                                onClick={() => setReadFilter('all')}
                            >
                                Все ({notifications.length})
                            </button>
                            <button
                                type="button"
                                className={`button ${readFilter === 'unread' ? 'button--primary' : 'button--secondary'}`}
                                style={{ flex: 1, padding: '8px', fontSize: '13px' }}
                                onClick={() => setReadFilter('unread')}
                            >
                                Непрочитанные ({notifications.filter(n => !n.isRead).length})
                            </button>
                        </div>
                    </div>

                    {/* Фильтр по типу события */}
                    <div>
                        <label style={{ fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: 8 }}>
                            Тип события
                        </label>
                        <select
                            value={selectedFilter}
                            onChange={(e) => setSelectedFilter(e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--color-cloud)', background: '#fff', fontSize: '14px' }}
                        >
                            <option value="all">Все типы событий</option>
                            <option value="approved">Согласованные</option>
                            <option value="returned">Возвращённые</option>
                            <option value="deadline">Дедлайны</option>
                            <option value="comment">Комментарии</option>
                            <option value="assigned">Назначения</option>
                        </select>
                    </div>

                    {/* Кнопка сброса */}
                    {activeFiltersCount > 0 && (
                        <button
                            type="button"
                            className="button button--secondary"
                            onClick={resetFilters}
                            style={{ marginTop: 8 }}
                        >
                            Сбросить фильтры
                        </button>
                    )}
                </div>
            </FilterDrawer>
        </div>
    );
};