import React, { useState } from 'react';
import { ShieldAlert, Check, Save, Filter, Search } from 'lucide-react';
import { FilterDrawer } from '@/components/ui/FilterDrawer';

interface RolePermissions {
    id: string;
    name: string;
    code: string;
    permissions: {
        view_docs: boolean;
        create_docs: boolean;
        edit_docs: boolean;
        approve_docs: boolean;
        return_docs: boolean;
        archive_docs: boolean;
        manage_users: boolean;
        manage_departments: boolean;
        manage_categories: boolean;
        view_audit: boolean;
        access_settings: boolean;
    };
}

const PERMISSIONS_LIST = [
    { key: 'view_docs', label: 'Просмотр документов' },
    { key: 'create_docs', label: 'Создание' },
    { key: 'edit_docs', label: 'Редактирование' },
    { key: 'approve_docs', label: 'Согласование' },
    { key: 'return_docs', label: 'Возврат' },
    { key: 'archive_docs', label: 'Архивирование' },
    { key: 'manage_users', label: 'Управление пользователями' },
    { key: 'manage_departments', label: 'Управление подразделениями' },
    { key: 'manage_categories', label: 'Управление категориями' },
    { key: 'view_audit', label: 'Просмотр журнала' },
    { key: 'access_settings', label: 'Доступ к настройкам' },
] as const;

const initialRoles: RolePermissions[] = [
    {
        id: 'admin',
        name: 'Администратор',
        code: 'admin',
        permissions: {
            view_docs: true, create_docs: true, edit_docs: true, approve_docs: true,
            return_docs: true, archive_docs: true, manage_users: true, manage_departments: true,
            manage_categories: true, view_audit: true, access_settings: true,
        }
    },
    {
        id: 'rector',
        name: 'Руководитель',
        code: 'rector',
        permissions: {
            view_docs: true, create_docs: true, edit_docs: true, approve_docs: true,
            return_docs: true, archive_docs: true, manage_users: false, manage_departments: true,
            manage_categories: false, view_audit: true, access_settings: false,
        }
    },
    {
        id: 'employee',
        name: 'Сотрудник',
        code: 'employee',
        permissions: {
            view_docs: true, create_docs: true, edit_docs: true, approve_docs: false,
            return_docs: false, archive_docs: false, manage_users: false, manage_departments: false,
            manage_categories: false, view_audit: false, access_settings: false,
        }
    },
    {
        id: 'chancellery',
        name: 'Канцелярия',
        code: 'chancellery',
        permissions: {
            view_docs: true, create_docs: true, edit_docs: true, approve_docs: true,
            return_docs: true, archive_docs: true, manage_users: false, manage_departments: false,
            manage_categories: true, view_audit: false, access_settings: false,
        }
    },
];

export const RolesPage: React.FC = () => {
    const [roles, setRoles] = useState<RolePermissions[]>(initialRoles);
    const [pendingChange, setPendingChange] = useState<{ roleId: string; permKey: string; nextValue: boolean } | null>(null);
    const [savedMessage, setSavedMessage] = useState(false);

    // Состояния фильтрации и шторки
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    const handleCheckboxChange = (roleId: string, permKey: string, currentValue: boolean) => {
        const nextValue = !currentValue;
        // Предупреждение при изменении прав администратора или критических системных прав
        if (roleId === 'admin' || ['manage_users', 'access_settings'].includes(permKey)) {
            setPendingChange({ roleId, permKey, nextValue });
        } else {
            applyPermissionChange(roleId, permKey, nextValue);
        }
    };

    const applyPermissionChange = (roleId: string, permKey: string, nextValue: boolean) => {
        setRoles(roles.map(r => {
            if (r.id === roleId) {
                return {
                    ...r,
                    permissions: {
                        ...r.permissions,
                        [permKey]: nextValue
                    }
                };
            }
            return r;
        }));
        setPendingChange(null);
    };

    const handleSave = () => {
        setSavedMessage(true);
        setTimeout(() => setSavedMessage(false), 3000);
    };

    const resetFilters = () => {
        setSearchQuery('');
    };

    // Фильтрация списка прав по поисковому запросу
    const filteredPermissions = PERMISSIONS_LIST.filter(perm =>
        perm.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isFilterActive = searchQuery.trim().length > 0;

    // 1. Состояние ЗАГРУЗКИ (Loading)
    if (isLoading) {
        return (
            <div className="page-loading">
                <div className="spinner">Загрузка матрицы прав...</div>
            </div>
        );
    }

    // 2. Состояние ОШИБКИ (Error)
    if (isError) {
        return (
            <div className="page-error">
                <p>Не удалось загрузить роли и права. Попробуйте позже.</p>
            </div>
        );
    }

    // 3. Состояние ПУСТОГО СПИСКА (Empty)
    if (!roles || roles.length === 0) {
        return (
            <div className="page-empty">
                <p>Список ролей пуст. В системе нет настроенных ролей.</p>
            </div>
        );
    }

    // 4. Состояние УСПЕХА / КОНТЕНТА (Success)
    return (
        <div className="page-container">
            <div className="page-stack">
                <div className="page-hero">
                    <div className="page-heading">
                        <h1>Роли и права</h1>
                        <p>Настройка матрицы доступа и разрешений для ролей пользователей в системе.</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            type="button"
                            className={`button ${isFilterActive ? 'button--primary' : 'button--secondary'}`}
                            onClick={() => setIsFilterOpen(true)}
                            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                        >
                            <Filter size={16} />
                            Фильтры {isFilterActive && '(1)'}
                        </button>

                        <button type="button" className="button button--primary" onClick={handleSave}>
                            <Save size={18} /> Сохранить изменения
                        </button>
                    </div>
                </div>

                {savedMessage && (
                    <div style={{ padding: '12px 16px', background: '#e6fffa', border: '1px solid #319795', color: '#234e52', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Check size={18} color="#319795" /> Изменения прав успешно сохранены!
                    </div>
                )}

                <div className="content-card" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
                        <thead>
                            <tr>
                                <th style={{ padding: '12px 8px', textAlign: 'left', minWidth: 240 }}>Право / Функция</th>
                                {roles.map(role => (
                                    <th key={role.id} style={{ padding: '12px 8px', textAlign: 'center', minWidth: 120 }}>
                                        {role.name}
                                        <div style={{ fontSize: '11px', fontWeight: 400, color: 'var(--color-fog)' }}>{role.code}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPermissions.length === 0 ? (
                                <tr>
                                    <td colSpan={roles.length + 1} style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-fog)' }}>
                                        Права с таким названием не найдены
                                    </td>
                                </tr>
                            ) : (
                                filteredPermissions.map((perm) => (
                                    <tr key={perm.key} style={{ borderTop: '1px solid var(--color-cloud)' }}>
                                        <td style={{ padding: '12px 8px', fontWeight: 500, color: 'var(--color-obsidian)' }}>
                                            {perm.label}
                                        </td>
                                        {roles.map(role => {
                                            const isChecked = role.permissions[perm.key as keyof typeof role.permissions];
                                            return (
                                                <td key={role.id} style={{ padding: '12px 8px', textAlign: 'center' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => handleCheckboxChange(role.id, perm.key, isChecked)}
                                                        style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--color-primary, #2563eb)' }}
                                                    />
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Шторка фильтрации FilterDrawer */}
            <FilterDrawer
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
            >
                <div style={{ display: 'grid', gap: 20 }}>
                    <div>
                        <label style={{ fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: 8 }}>
                            Поиск по названию права
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-fog)' }} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Например: Создание..."
                                style={{
                                    width: '100%',
                                    padding: '8px 12px 8px 34px',
                                    borderRadius: 8,
                                    border: '1px solid var(--color-cloud)',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                    </div>

                    {isFilterActive && (
                        <button
                            type="button"
                            className="button button--secondary"
                            onClick={resetFilters}
                        >
                            Сбросить фильтр
                        </button>
                    )}
                </div>
            </FilterDrawer>

            {/* Модальное окно предупреждения о критических правах */}
            {pendingChange && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: '#fff', padding: 24, borderRadius: 12, maxWidth: 450, width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, color: '#dd6b20' }}>
                            <ShieldAlert size={28} />
                            <h3 style={{ margin: 0, fontSize: 18, color: 'var(--color-obsidian)' }}>Внимание: Критические права!</h3>
                        </div>
                        <p style={{ fontSize: 14, color: 'var(--color-fog)', lineHeight: 1.5, marginBottom: 24 }}>
                            Вы собираетесь изменить системные права для роли **Администратор** или изменить критический уровень доступа. Это может повлиять на безопасность приложения. Вы уверены?
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                            <button
                                type="button"
                                className="button button--secondary"
                                onClick={() => setPendingChange(null)}
                            >
                                Отмена
                            </button>
                            <button
                                type="button"
                                className="button button--primary"
                                style={{ background: '#dd6b20', borderColor: '#dd6b20' }}
                                onClick={() => {
                                    if (pendingChange) {
                                        applyPermissionChange(pendingChange.roleId, pendingChange.permKey, pendingChange.nextValue);
                                    }
                                }}
                            >
                                Подтвердить изменение
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};