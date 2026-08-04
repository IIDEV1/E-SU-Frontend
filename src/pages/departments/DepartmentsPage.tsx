import React, { useState } from 'react';
import {
    Building2, Plus, Search, Users, Edit3, Trash2,
    ChevronLeft, ChevronRight, ArrowLeft, CheckCircle2, AlertCircle, Loader2, X, Filter
} from 'lucide-react';

// Импорт FilterDrawer из src/components/ui/FilterDrawer
// (Если алиас '@' не настроен, измени путь на относительный, например: '../../components/ui/FilterDrawer')
import { FilterDrawer } from '@/components/ui/FilterDrawer';

interface Department {
    id: string;
    name: string;
    code: string;
    head: string;
    employeeCount: number;
    description: string;
}

const initialDepartments: Department[] = [
    {
        id: '1',
        name: 'IT Департамент',
        code: 'IT-DEP',
        head: 'Алексей Смирнов',
        employeeCount: 12,
        description: 'Разработка, поддержка и администрирование информационных систем университета.',
    },
    {
        id: '2',
        name: 'Медицинский факультет',
        code: 'MED-FAC',
        head: 'Нурбек Касымов',
        employeeCount: 45,
        description: 'Обучение студентов медицинских специальностей и клиническая практика.',
    },
    {
        id: '3',
        name: 'Отдел кадров',
        code: 'HR-DEPT',
        head: 'Ольга Петрова',
        employeeCount: 6,
        description: 'Управление персоналом, кадровый учет и подбор специалистов.',
    },
    {
        id: '4',
        name: 'Канцелярия',
        code: 'CHANC',
        head: 'Марина Иванова',
        employeeCount: 8,
        description: 'Делопроизводство, работа с входящей/исходящей документацией и архивом.',
    },
];

export const DepartmentsPage: React.FC = () => {
    const [currentView, setCurrentView] = useState<'list' | 'create' | 'edit' | 'employees'>('list');
    const [selectedDept, setSelectedDept] = useState<Department | null>(null);

    const [departments, setDepartments] = useState<Department[]>(initialDepartments);
    const [search, setSearch] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    // Состояние открытия шторки фильтров
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Данные формы создания/редактирования
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        head: '',
        description: '',
    });

    // Открытие формы создания
    const handleOpenCreate = () => {
        setFormData({ name: '', code: '', head: '', description: '' });
        setCurrentView('create');
    };

    // Открытие формы редактирования
    const handleOpenEdit = (dept: Department) => {
        setSelectedDept(dept);
        setFormData({
            name: dept.name,
            code: dept.code,
            head: dept.head,
            description: dept.description,
        });
        setCurrentView('edit');
    };

    // Открытие списка сотрудников отдела
    const handleViewEmployees = (dept: Department) => {
        setSelectedDept(dept);
        setCurrentView('employees');
    };

    // Сохранение (Создание / Редактирование)
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.code) return;

        if (currentView === 'create') {
            const newDept: Department = {
                id: String(Date.now()),
                name: formData.name,
                code: formData.code.toUpperCase(),
                head: formData.head || 'Не назначен',
                employeeCount: 0,
                description: formData.description,
            };
            setDepartments([newDept, ...departments]);
        } else if (currentView === 'edit' && selectedDept) {
            setDepartments(departments.map(d => d.id === selectedDept.id ? {
                ...d,
                name: formData.name,
                code: formData.code.toUpperCase(),
                head: formData.head,
                description: formData.description,
            } : d));
        }

        setCurrentView('list');
    };

    // Удаление подразделения
    const handleDelete = (id: string) => {
        if (window.confirm('Вы уверены, что хотите удалить это подразделение?')) {
            setDepartments(departments.filter(d => d.id !== id));
        }
    };

    // Фильтрация
    const filteredDepartments = departments.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.code.toLowerCase().includes(search.toLowerCase()) ||
        d.head.toLowerCase().includes(search.toLowerCase())
    );

    // 1. Состояние ЗАГРУЗКИ (Loading)
    if (isLoading) {
        return (
            <div className="page-loading">
                <div className="spinner">Загрузка данных...</div>
            </div>
        );
    }

    // 2. Состояние ОШИБКИ (Error)
    if (isError) {
        return (
            <div className="page-error">
                <p>Не удалось загрузить данные. Попробуйте позже.</p>
            </div>
        );
    }

    // 3. Состояние ПУСТОГО СПИСКА (Empty)
    if (!departments || departments.length === 0) {
        return (
            <div className="page-empty">
                <p>Список подразделений пуст. Здесь пока ничего нет.</p>
            </div>
        );
    }

    // 4. Состояние УСПЕХА / КОНТЕНТА (Success)

    // --- РЕНДЕР: ПРОСМОТР СОТРУДНИКОВ ПОДРАЗДЕЛЕНИЯ ---
    if (currentView === 'employees' && selectedDept) {
        return (
            <div className="page-container">
                <div className="page-stack" style={{ maxWidth: 900, margin: '0 auto' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                        <button
                            type="button"
                            onClick={() => setCurrentView('list')}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                background: 'transparent', border: 'none', color: 'var(--color-fog)',
                                fontSize: '14px', fontWeight: 500, cursor: 'pointer', padding: 0, width: 'fit-content'
                            }}
                        >
                            <ArrowLeft size={16} /> Назад к списку подразделений
                        </button>
                        <div className="page-heading" style={{ margin: 0, textAlign: 'left' }}>
                            <h1 style={{ fontSize: '28px', marginBottom: '4px', color: 'var(--color-obsidian)' }}>
                                Сотрудники: {selectedDept.name}
                            </h1>
                            <p style={{ color: 'var(--color-fog)', fontSize: '14px' }}>
                                Код отдела: {selectedDept.code} • Руководитель: {selectedDept.head}
                            </p>
                        </div>
                    </div>

                    <div className="content-card">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>ФИО</th>
                                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>Должность</th>
                                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>Email</th>
                                    <th style={{ padding: '12px 8px', textAlign: 'right' }}>Статус</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '12px 8px', fontWeight: 600 }}>Иван Иванов</td>
                                    <td style={{ padding: '12px 8px', color: 'var(--color-fog)' }}>Ведущий разработчик</td>
                                    <td style={{ padding: '12px 8px', color: 'var(--color-fog)' }}>i.ivanov@salymbekov.kg</td>
                                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                                        <span className="badge" style={{ fontSize: '11px' }}>Активен</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '12px 8px', fontWeight: 600 }}>Анна Смирнова</td>
                                    <td style={{ padding: '12px 8px', color: 'var(--color-fog)' }}>QA Инженер</td>
                                    <td style={{ padding: '12px 8px', color: 'var(--color-fog)' }}>a.smirnova@salymbekov.kg</td>
                                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                                        <span className="badge" style={{ fontSize: '11px' }}>Активен</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // --- РЕНДЕР: ФОРМА СОЗДАНИЯ / РЕДАКТИРОВАНИЯ ---
    if (currentView === 'create' || currentView === 'edit') {
        return (
            <div className="page-container">
                <div className="page-stack" style={{ maxWidth: 720, margin: '0 auto' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                        <button
                            type="button"
                            onClick={() => setCurrentView('list')}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                background: 'transparent', border: 'none', color: 'var(--color-fog)',
                                fontSize: '14px', fontWeight: 500, cursor: 'pointer', padding: 0, width: 'fit-content'
                            }}
                        >
                            <ArrowLeft size={16} /> Назад к списку
                        </button>
                        <div className="page-heading" style={{ margin: 0, textAlign: 'left' }}>
                            <h1 style={{ fontSize: '32px', marginBottom: '8px', color: 'var(--color-obsidian)' }}>
                                {currentView === 'create' ? 'Новое подразделение' : 'Редактирование подразделения'}
                            </h1>
                            <p style={{ color: 'var(--color-fog)', fontSize: '15px' }}>
                                Укажите параметры организационной структуры университета.
                            </p>
                        </div>
                    </div>

                    <div className="content-card">
                        <form onSubmit={handleSave} style={{ display: 'grid', gap: 20 }}>
                            <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 500 }}>
                                Название подразделения *
                                <input
                                    type="text"
                                    placeholder="Например: Департамент цифровизации"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </label>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 500 }}>
                                    Код подразделения *
                                    <input
                                        type="text"
                                        placeholder="DIGI-DEP"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        required
                                    />
                                </label>
                                <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 500 }}>
                                    Руководитель
                                    <input
                                        type="text"
                                        placeholder="ФИО руководителя"
                                        value={formData.head}
                                        onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                                    />
                                </label>
                            </div>

                            <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 500 }}>
                                Описание
                                <textarea
                                    rows={3}
                                    placeholder="Краткие функциональные обязанности отдела..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid var(--color-cloud)', fontFamily: 'inherit' }}
                                />
                            </label>

                            <div style={{ justifyContent: 'flex-end', borderTop: '1px solid var(--color-cloud)', paddingTop: 20, display: 'flex', gap: 12 }}>
                                <button type="button" className="button button--secondary" onClick={() => setCurrentView('list')}>
                                    Отмена
                                </button>
                                <button type="submit" className="button button--primary">
                                    {currentView === 'create' ? 'Создать подразделение' : 'Сохранить изменения'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // --- РЕНДЕР: ОСНОВНОЙ СПИСОК (Success State) ---
    return (
        <div className="page-container">
            <div className="page-stack">
                <div className="page-hero">
                    <div className="page-heading">
                        <h1>Подразделения</h1>
                        <p>Управление структурой отделов, факультетов и служб университета.</p>
                    </div>
                    <button type="button" className="button button--primary" onClick={handleOpenCreate}>
                        <Plus size={18} /> Добавить подразделение
                    </button>
                </div>

                <div className="content-card" style={{ display: 'grid', gap: 16 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Search
                                size={16}
                                color="var(--color-fog)"
                                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
                            />
                            <input
                                type="text"
                                placeholder="Поиск по названию, коду или руководителю..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{ paddingLeft: 40, width: '100%' }}
                            />
                        </div>

                        {/* Кнопка вызова FilterDrawer */}
                        <button
                            type="button"
                            className="button button--secondary"
                            onClick={() => setIsFilterOpen(true)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                        >
                            <Filter size={16} /> Фильтры
                        </button>
                    </div>

                    <div style={{ width: '100%', overflow: 'hidden' }}>
                        <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={{ width: '25%', padding: '12px 8px', textAlign: 'left' }}>Название</th>
                                    <th style={{ width: '15%', padding: '12px 8px', textAlign: 'left' }}>Код</th>
                                    <th style={{ width: '22%', padding: '12px 8px', textAlign: 'left' }}>Руководитель</th>
                                    <th style={{ width: '15%', padding: '12px 8px', textAlign: 'left' }}>Сотрудники</th>
                                    <th style={{ width: '23%', padding: '12px 8px', textAlign: 'right' }}>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDepartments.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-fog)', padding: '48px 0' }}>
                                            Подразделения не найдены
                                        </td>
                                    </tr>
                                ) : (
                                    filteredDepartments.map((dept) => (
                                        <tr key={dept.id}>
                                            <td style={{ fontWeight: 600, color: 'var(--color-obsidian)', padding: '12px 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {dept.name}
                                            </td>
                                            <td style={{ color: 'var(--color-fog)', padding: '12px 8px' }}>
                                                <code>{dept.code}</code>
                                            </td>
                                            <td style={{ padding: '12px 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {dept.head}
                                            </td>
                                            <td style={{ padding: '12px 8px' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleViewEmployees(dept)}
                                                    style={{ background: 'transparent', border: 'none', color: 'var(--color-primary, #2563eb)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 500, fontSize: 13, padding: 0 }}
                                                >
                                                    <Users size={14} /> {dept.employeeCount} чел.
                                                </button>
                                            </td>
                                            <td style={{ textAlign: 'right', padding: '12px 8px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                                                    <button
                                                        type="button"
                                                        className="button button--secondary"
                                                        style={{ padding: '4px 8px', fontSize: '11px' }}
                                                        onClick={() => handleOpenEdit(dept)}
                                                    >
                                                        Изм.
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="icon-button"
                                                        title="Удалить"
                                                        onClick={() => handleDelete(dept.id)}
                                                        style={{ width: 28, height: 28, color: '#e53e3e' }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <FilterDrawer
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
            >
                {/* Содержимое шторки фильтров */}
                <div style={{ display: 'grid', gap: 16 }}>
                    <h3>Фильтры</h3>
                    <label>
                        Статус:
                        <select>
                            <option value="all">Все</option>
                            <option value="active">Активные</option>
                        </select>
                    </label>
                    {/* Добавь нужные поля фильтрации */}
                </div>
            </FilterDrawer> 
        </div>
    );
};