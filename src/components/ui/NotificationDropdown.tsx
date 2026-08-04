import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';

export const NotificationDropdown: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [notifications, setNotifications] = useState([
        { id: '1', title: 'Документ согласован', message: 'Приказ №45-У утвержден.', time: '14:20', isRead: false, link: '/documents' },
        { id: '2', title: 'Дедлайн приближается', message: 'Срок проверки истекает завтра.', time: '11:05', isRead: false, link: '/documents' },
    ]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = (id: string) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
                type="button"
                className="icon-button"
                onClick={() => setIsOpen(!isOpen)}
                style={{ position: 'relative', width: 38, height: 38, borderRadius: '50%', background: 'var(--color-cloud-light, #f7fafc)', border: '1px solid var(--color-cloud)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
                <Bell size={18} color="var(--color-obsidian)" />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: 2, right: 2, background: '#e53e3e', color: '#fff',
                        fontSize: '10px', fontWeight: 700, width: 16, height: 16, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute', right: 0, marginTop: 8, width: 320, background: '#fff',
                    borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid var(--color-cloud)', zIndex: 100, overflow: 'hidden'
                }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-cloud)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, fontSize: '14px' }}>Уведомления</span>
                        <a href="/notifications" style={{ fontSize: '12px', color: 'var(--color-primary, #2563eb)', textDecoration: 'none' }} onClick={() => setIsOpen(false)}>
                            Все уведомления
                        </a>
                    </div>

                    <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-fog)', fontSize: '13px' }}>
                                Нет новых уведомлений
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-cloud)', background: n.isRead ? '#fff' : '#f8fafc', display: 'grid', gap: 4 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-obsidian)' }}>{n.title}</span>
                                        <span style={{ fontSize: '10px', color: 'var(--color-fog)' }}>{n.time}</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-fog)' }}>{n.message}</p>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                                        {!n.isRead && (
                                            <button type="button" onClick={() => markAsRead(n.id)} style={{ background: 'none', border: 'none', color: 'var(--color-primary, #2563eb)', fontSize: '11px', cursor: 'pointer', padding: 0 }}>
                                                Прочитано
                                            </button>
                                        )}
                                        <a href={n.link} style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: '11px', color: 'var(--color-fog)', textDecoration: 'none' }} onClick={() => setIsOpen(false)}>
                                            Открыть <ExternalLink size={10} />
                                        </a>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};