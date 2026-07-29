import React, { useState } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';

export const NotificationDropdown: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const [notifications, setNotifications] = useState([
        { id: '1', title: 'Документ согласован', message: 'Приказ №45-У утвержден.', time: '14:20', isRead: false, link: '/documents' },
        { id: '2', title: 'Дедлайн приближается', message: 'Срок проверки истекает завтра.', time: '11:05', isRead: false, link: '/documents' },
    ]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const markAsRead = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            {/* Кнопка колокольчика */}
            <button
                type="button"
                className="icon-button"
                onClick={() => setIsOpen(!isOpen)}
                style={{ 
                    position: 'relative', 
                    width: 38, 
                    height: 38, 
                    borderRadius: '50%', 
                    background: '#f7fafc', 
                    border: '1px solid #e2e8f0', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    cursor: 'pointer' 
                }}
            >
                <Bell size={18} color="#1a202c" />
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

            {/* Выпадающий список */}
            {isOpen && (
                <>
                    {/* Прозрачный фон для закрытия при клике вне меню */}
                    <div 
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 98 }} 
                        onClick={() => setIsOpen(false)}
                    />

                    <div style={{
                        position: 'absolute', 
                        right: 0, 
                        top: 'calc(100% + 8px)',
                        width: 320, 
                        background: '#fff',
                        borderRadius: 12, 
                        boxShadow: '0 10px 25px rgba(0,0,0,0.2)', 
                        border: '1px solid #e2e8f0', 
                        zIndex: 99, 
                        overflow: 'hidden'
                    }}>
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
                            <span style={{ fontWeight: 600, fontSize: '14px', color: '#1a202c' }}>Уведомления</span>
                            <a 
                                href="/notifications" 
                                style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'none' }} 
                                onClick={() => setIsOpen(false)}
                            >
                                Все уведомления
                            </a>
                        </div>

                        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                            {notifications.length === 0 ? (
                                <div style={{ padding: 24, textAlign: 'center', color: '#718096', fontSize: '13px' }}>
                                    Нет новых уведомлений
                                </div>
                            ) : (
                                notifications.map(n => (
                                    <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid #edf2f7', background: n.isRead ? '#fff' : '#f8fafc', display: 'grid', gap: 4 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <span style={{ fontWeight: 600, fontSize: '13px', color: '#1a202c' }}>{n.title}</span>
                                            <span style={{ fontSize: '10px', color: '#718096' }}>{n.time}</span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#4a5568' }}>{n.message}</p>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                                            {!n.isRead && (
                                                <button 
                                                    type="button" 
                                                    onClick={(e) => markAsRead(n.id, e)} 
                                                    style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '11px', cursor: 'pointer', padding: 0 }}
                                                >
                                                    Прочитано
                                                </button>
                                            )}
                                            <a 
                                                href={n.link} 
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: '11px', color: '#718096', textDecoration: 'none' }} 
                                                onClick={() => setIsOpen(false)}
                                            >
                                                Открыть <ExternalLink size={10} />
                                            </a>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};