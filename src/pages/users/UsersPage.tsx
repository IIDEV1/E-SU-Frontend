import React, { useState, useMemo } from 'react';
import { mockUsers } from '../../mocks/adminMocks';
import { User, Role, UserStatus } from '../../types/admin';
import { Select } from '../../components/ui/Select';
import { FilterDrawer } from '../../components/ui/FilterDrawer';
import {
  Search, UserPlus, CheckCircle2, Ban,
  ChevronLeft, ChevronRight, ArrowLeft,
  SlidersHorizontal
} from 'lucide-react';

interface ExtendedUser extends User {
  phone?: string;
  manager?: string;
}

const roleLabels: Record<Role, string> = {
  admin: 'Администратор',
  manager: 'Руководитель',
  chancellery: 'Канцелярия',
  employee: 'Сотрудник',
};

const ITEMS_PER_PAGE = 10;

export const UsersPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [users, setUsers] = useState<ExtendedUser[]>(mockUsers);
  const [search, setSearch] = useState('');

  // Фильтры
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Мобильный Drawer для фильтров
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);

  // Форма пользователя
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    position: '',
    departmentName: 'IT Департамент',
    manager: '',
    role: 'employee' as Role,
    status: 'active' as UserStatus,
    tempPassword: '',
  });

  // Подсчет активных фильтров для индикатора
  const activeFiltersCount = [
    roleFilter !== 'all',
    departmentFilter !== 'all',
    statusFilter !== 'all'
  ].filter(Boolean).length;

  const resetFilters = () => {
    setRoleFilter('all');
    setDepartmentFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const handleOpenEdit = (user: ExtendedUser) => {
    setSelectedUserId(user.id);
    setFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '+996 ',
      position: user.position || '',
      departmentName: user.departmentName || 'IT Департамент',
      manager: user.manager || '',
      role: user.role || 'employee',
      status: user.status || 'active',
      tempPassword: '',
    });
    setCurrentView('edit');
  };

  const handleOpenCreate = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      position: '',
      departmentName: 'IT Департамент',
      manager: '',
      role: 'employee',
      status: 'active',
      tempPassword: Math.random().toString(36).slice(-8),
    });
    setCurrentView('create');
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) return;

    if (currentView === 'create') {
      const newUser: ExtendedUser = {
        id: String(Date.now()),
        fullName: formData.fullName,
        email: formData.email,
        position: formData.position,
        departmentName: formData.departmentName,
        role: formData.role,
        status: formData.status,
        lastActive: 'Только что',
        phone: formData.phone,
        manager: formData.manager,
      };
      setUsers([newUser, ...users]);
    } else if (currentView === 'edit' && selectedUserId) {
      setUsers(users.map(u => u.id === selectedUserId ? {
        ...u,
        fullName: formData.fullName,
        email: formData.email,
        position: formData.position,
        departmentName: formData.departmentName,
        role: formData.role,
        status: formData.status,
        phone: formData.phone,
        manager: formData.manager,
      } : u));
    }

    setCurrentView('list');
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());

      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesDept = departmentFilter === 'all' || u.departmentName === departmentFilter;
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

      return matchesSearch && matchesRole && matchesDept && matchesStatus;
    });
  }, [users, search, roleFilter, departmentFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  // --- 1. ФОРМА СОЗДАНИЯ / РЕДАКТИРОВАНИЯ ---
  if (currentView === 'create' || currentView === 'edit') {
    return (
      <div className="page-container">
        <div className="page-stack" style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            <button
              type="button"
              onClick={() => setCurrentView('list')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'transparent',
                border: 'none',
                color: 'var(--color-fog)',
                fontSize: '14px',
                cursor: 'pointer',
                padding: 0,
                width: 'fit-content'
              }}
            >
              <ArrowLeft size={16} /> Назад к списку
            </button>

            <div className="page-heading">
              <h1>
                {currentView === 'create' ? 'Создание пользователя' : 'Редактирование пользователя'}
              </h1>
              <p>Заполните данные учетной записи сотрудника.</p>
            </div>
          </div>

          <div className="content-card">
            <form onSubmit={handleSaveForm} className="form-stack">
              <div className="form-group">
                <label className="form-label">ФИО *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Иванов Иван Иванович"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="user@university.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Телефон</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="+996 (555) 00-00-00"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Должность</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Старший преподаватель"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Подразделение</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="IT Департамент"
                    value={formData.departmentName}
                    onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Руководитель</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="ФИО руководителя"
                    value={formData.manager}
                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  />
                </div>
                <Select
                  label="Роль"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                  options={[
                    { value: 'employee', label: 'Сотрудник' },
                    { value: 'manager', label: 'Руководитель' },
                    { value: 'chancellery', label: 'Канцелярия' },
                    { value: 'admin', label: 'Администратор' },
                  ]}
                />
              </div>

              <div className="form-grid-2">
                <Select
                  label="Статус"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}
                  options={[
                    { value: 'active', label: 'Активен' },
                    { value: 'blocked', label: 'Заблокирован' },
                  ]}
                />
                {currentView === 'create' && (
                  <div className="form-group">
                    <label className="form-label">Временный пароль</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.tempPassword}
                      onChange={(e) => setFormData({ ...formData, tempPassword: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <div className="form-actions" style={{ gap: 12 }}>
                <button type="button" className="button button--secondary" style={{ flex: 1 }} onClick={() => setCurrentView('list')}>
                  Отмена
                </button>
                <button type="submit" className="button button--primary" style={{ flex: 1 }}>
                  {currentView === 'create' ? 'Создать' : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // --- 2. ОСНОВНОЙ СПИСОК ПОЛЬЗОВАТЕЛЕЙ ---
  return (
    <div className="page-container">
      <div className="page-stack">
        <div className="page-hero" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="page-heading">
            <h1>Пользователи</h1>
            <p>Управление учетными записями и доступом.</p>
          </div>
          <button type="button" className="button button--primary" onClick={handleOpenCreate}>
            <UserPlus size={18} />
            <span>Добавить</span>
          </button>
        </div>

        <div className="content-card" style={{ display: 'grid', gap: 16 }}>
          {/* Панель поиска и фильтров */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} color="var(--color-fog)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Поиск по ФИО или Email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                style={{ paddingLeft: 36 }}
              />
            </div>

            {/* Мобильная кнопка вызова фильтров */}
            <button
              type="button"
              className="button button--secondary mobile-filter-btn"
              onClick={() => setIsFilterDrawerOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}
            >
              <SlidersHorizontal size={16} />
              <span className="hide-on-mobile">Фильтры</span>
              {activeFiltersCount > 0 && (
                <span style={{
                  background: 'var(--color-primary, #2563eb)',
                  color: '#fff',
                  borderRadius: '50%',
                  width: 18,
                  height: 18,
                  fontSize: 11,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Выпадающие списки для Desktop */}
            <div className="desktop-filters" style={{ display: 'flex', gap: 8 }}>
              <select className="form-select" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}>
                <option value="all">Все роли</option>
                <option value="admin">Администратор</option>
                <option value="manager">Руководитель</option>
                <option value="chancellery">Канцелярия</option>
                <option value="employee">Сотрудник</option>
              </select>

              <select className="form-select" value={departmentFilter} onChange={(e) => { setDepartmentFilter(e.target.value); setCurrentPage(1); }}>
                <option value="all">Все подразделения</option>
                <option value="IT Департамент">IT Департамент</option>
                <option value="Медицинский факультет">Медицинский факультет</option>
                <option value="Отдел кадров">Отдел кадров</option>
              </select>

              <select className="form-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
                <option value="all">Все статусы</option>
                <option value="active">Активные</option>
                <option value="blocked">Заблокированные</option>
              </select>
            </div>
          </div>

          {/* Таблица для ПК */}
          <div className="desktop-table-view">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-cloud)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: 13, color: 'var(--color-fog)' }}>ФИО</th>
                  <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: 13, color: 'var(--color-fog)' }}>Email</th>
                  <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: 13, color: 'var(--color-fog)' }}>Подразделение</th>
                  <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: 13, color: 'var(--color-fog)' }}>Роль</th>
                  <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: 13, color: 'var(--color-fog)' }}>Статус</th>
                  <th style={{ textAlign: 'right', padding: '10px 8px', fontSize: 13, color: 'var(--color-fog)' }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ fontWeight: 600, padding: '12px 8px', fontSize: 14 }}>{user.fullName}</td>
                    <td style={{ color: 'var(--color-fog)', padding: '12px 8px', fontSize: 14 }}>{user.email}</td>
                    <td style={{ padding: '12px 8px', fontSize: 14 }}>{user.departmentName}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: 6, fontSize: 12, background: '#f1f5f9', fontWeight: 500 }}>
                        {roleLabels[user.role]}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      {user.status === 'active' ? (
                        <span style={{ color: '#16a34a', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
                          <CheckCircle2 size={14} /> Активен
                        </span>
                      ) : (
                        <span style={{ color: '#dc2626', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
                          <Ban size={14} /> Заблок.
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 8px' }}>
                      <button type="button" className="button button--secondary" onClick={() => handleOpenEdit(user)} style={{ padding: '6px 12px', fontSize: 12 }}>
                        Изм.
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Карточки для мобильных */}
          <div className="mobile-cards-view">
            {paginatedUsers.map((user) => (
              <div
                key={user.id}
                style={{
                  border: '1px solid var(--color-cloud, #eaecf0)',
                  borderRadius: '10px',
                  padding: '14px',
                  background: '#fff',
                  display: 'grid',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-obsidian)' }}>{user.fullName}</div>
                    <div style={{ fontSize: '13px', color: 'var(--color-fog)' }}>{user.email}</div>
                  </div>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    background: user.status === 'active' ? '#dcfce7' : '#fee2e2',
                    color: user.status === 'active' ? '#15803d' : '#b91c1c'
                  }}>
                    {user.status === 'active' ? 'Активен' : 'Заблок.'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 8, fontSize: '12px', color: 'var(--color-fog)', flexWrap: 'wrap', marginTop: 4 }}>
                  <span>{user.departmentName}</span>
                  <span>•</span>
                  <span style={{ fontWeight: 500, color: 'var(--color-obsidian)' }}>{roleLabels[user.role]}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8, paddingTop: 8, borderTop: '1px dotted var(--color-cloud)' }}>
                  <button
                    type="button"
                    className="button button--secondary"
                    style={{ padding: '6px 12px', fontSize: '12px', width: '100%' }}
                    onClick={() => handleOpenEdit(user)}
                  >
                    Редактировать
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Пагинация */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, paddingTop: 12 }}>
            <span style={{ color: 'var(--color-fog)', fontSize: 13 }}>
              Всего: {filteredUsers.length} пользователей
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                className="button button--secondary"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                style={{ padding: '6px 10px' }}
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                className="button button--secondary"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                style={{ padding: '6px 10px' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Выдвижное меню фильтров для смартфона */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        onReset={resetFilters}
      >
        <div style={{ display: 'grid', gap: 16 }}>
          <Select
            label="Роль"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Все роли' },
              { value: 'admin', label: 'Администратор' },
              { value: 'manager', label: 'Руководитель' },
              { value: 'chancellery', label: 'Канцелярия' },
              { value: 'employee', label: 'Сотрудник' },
            ]}
          />
          <Select
            label="Подразделение"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Все подразделения' },
              { value: 'IT Департамент', label: 'IT Департамент' },
              { value: 'Медицинский факультет', label: 'Медицинский факультет' },
              { value: 'Отдел кадров', label: 'Отдел кадров' },
            ]}
          />
          <Select
            label="Статус"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Все статусы' },
              { value: 'active', label: 'Активные' },
              { value: 'blocked', label: 'Заблокированные' },
            ]}
          />
        </div>
      </FilterDrawer>
    </div>
  );
};