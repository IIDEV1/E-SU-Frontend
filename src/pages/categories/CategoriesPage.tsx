import React, { useState } from 'react';
import {
    FileText, Plus, Search, Clock, CheckCircle2,
    XCircle, AlertCircle, Eye, ArrowLeft, GitMerge, User,
    Calendar, Send, FileDown, SlidersHorizontal
} from 'lucide-react';
import { FilterDrawer } from '../../components/ui/FilterDrawer';

// --- Types & Initial Data ---

export interface DocumentItem {
    id: string;
    title: string;
    regNumber: string;
    categoryCode: string;
    categoryName: string;
    author: string;
    department: string;
    createdAt: string;
    status: 'draft' | 'on_approval' | 'approved' | 'rejected' | 'archived';
    currentStep: string;
    totalSteps: number;
    completedSteps: number;
}

const initialDocuments: DocumentItem[] = [
    {
        id: '1',
        title: 'Приказ об утверждении учебных планов на 2026/2027 г.',
        regNumber: 'ПOД-2026-042',
        categoryCode: 'POD',
        categoryName: 'Приказы по основной деятельности',
        author: 'Иванов А. В.',
        department: 'Учебный отдел',
        createdAt: '2026-07-25',
        status: 'on_approval',
        currentStep: 'Проректор по учебной работе',
        completedSteps: 2,
        totalSteps: 4,
    },
    {
        id: '2',
        title: 'Смета расходов на закупку лабораторного оборудования',
        regNumber: 'ФИН-2026-118',
        categoryCode: 'FIN',
        categoryName: 'Финансовые отчеты и сметы',
        author: 'Петрова Е. С.',
        department: 'Бухгалтерия',
        createdAt: '2026-07-22',
        status: 'approved',
        currentStep: 'Завершено (Утвержден)',
        completedSteps: 3,
        totalSteps: 3,
    },
    {
        id: '3',
        title: 'Заявка на проведение студенческой научной конференции',
        regNumber: 'SZ-2026-089',
        categoryCode: 'SZ',
        categoryName: 'Служебные записки',
        author: 'Смирнов К. Д.',
        department: 'Деканат ФИТ',
        createdAt: '2026-07-20',
        status: 'rejected',
        currentStep: 'Отклонено (Юридический отдел)',
        completedSteps: 1,
        totalSteps: 2,
    },
    {
        id: '4',
        title: 'Положение о проведении летней производственной практики',
        regNumber: 'ПOД-2026-039',
        categoryCode: 'POD',
        categoryName: 'Приказы по основной деятельности',
        author: 'Алексеева М. Н.',
        department: 'Ректорат',
        createdAt: '2026-07-15',
        status: 'draft',
        currentStep: 'Черновик',
        completedSteps: 0,
        totalSteps: 4,
    }
];

// --- Subcomponents ---

const StatusBadge: React.FC<{ status: DocumentItem['status'] }> = ({ status }) => {
    switch (status) {
        case 'approved':
            return (
                <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-800 text-xs font-medium px-2 py-1 rounded-full">
                    <CheckCircle2 size={13} className="text-teal-600" /> Утвержден
                </span>
            );
        case 'on_approval':
            return (
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                    <Clock size={13} className="text-blue-600" /> На согласовании
                </span>
            );
        case 'rejected':
            return (
                <span className="inline-flex items-center gap-1 bg-red-50 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                    <XCircle size={13} className="text-red-600" /> Отклонен
                </span>
            );
        case 'draft':
            return (
                <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-full border border-gray-200">
                    <AlertCircle size={13} /> Черновик
                </span>
            );
        default:
            return null;
    }
};

// --- Main Component ---

export default function CategoriesPage() {
    const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
    const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
    const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);

    // Filters & Mobile Drawer state
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

    // Form state
    const [newDocData, setNewDocData] = useState({
        title: '',
        categoryCode: 'POD',
        categoryName: 'Приказы по основной деятельности',
        description: '',
        department: 'Ректорат',
    });

    const handleCreateDocument = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDocData.title) return;

        const created: DocumentItem = {
            id: String(Date.now()),
            title: newDocData.title,
            regNumber: `${newDocData.categoryCode}-2026-${Math.floor(100 + Math.random() * 900)}`,
            categoryCode: newDocData.categoryCode,
            categoryName: newDocData.categoryName,
            author: 'Текущий пользователь',
            department: newDocData.department,
            createdAt: new Date().toISOString().split('T')[0],
            status: 'on_approval',
            currentStep: 'Составитель -> Юрист',
            completedSteps: 1,
            totalSteps: 4,
        };

        setDocuments([created, ...documents]);
        setView('list');
    };

    const handleResetFilters = () => {
        setStatusFilter('all');
        setCategoryFilter('all');
        setSearch('');
    };

    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase()) ||
                            doc.regNumber.toLowerCase().includes(search.toLowerCase()) ||
                            doc.author.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
        const matchesCategory = categoryFilter === 'all' || doc.categoryCode === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
    });

    // --- Render Views ---

    if (view === 'create') {
        return (
            <div className="page-container p-4 sm:p-6 max-w-3xl mx-auto">
                <div className="flex flex-col gap-4 mb-6">
                    <button
                        type="button"
                        onClick={() => setView('list')}
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 font-medium text-sm transition-colors w-fit"
                    >
                        <ArrowLeft size={16} /> Назад к реестру
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">Создание нового документа</h1>
                        <p className="text-gray-500 text-sm">
                            Заполните карточку документа для запуска автоматически настроенного маршрута согласования.
                        </p>
                    </div>
                </div>

                <div className="content-card bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
                    <form onSubmit={handleCreateDocument} className="grid gap-5">
                        <label className="grid gap-1.5 text-sm font-medium text-gray-700">
                            Название документа *
                            <input
                                type="text"
                                placeholder="Например: Приказ о зачислении студентов..."
                                value={newDocData.title}
                                onChange={(e) => setNewDocData({ ...newDocData, title: e.target.value })}
                                required
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </label>

                        <div className="form-grid-2">
                            <label className="grid gap-1.5 text-sm font-medium text-gray-700">
                                Категория документа
                                <select
                                    value={newDocData.categoryCode}
                                    onChange={(e) => {
                                        const code = e.target.value;
                                        const nameMap: Record<string, string> = {
                                            POD: 'Приказы по основной деятельности',
                                            FIN: 'Финансовые отчеты и сметы',
                                            SZ: 'Служебные записки'
                                        };
                                        setNewDocData({
                                            ...newDocData,
                                            categoryCode: code,
                                            categoryName: nameMap[code] || code
                                        });
                                    }}
                                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="POD">Приказы по осн. деятельности (POD)</option>
                                    <option value="FIN">Финансовые отчеты и сметы (FIN)</option>
                                    <option value="SZ">Служебные записки (SZ)</option>
                                </select>
                            </label>

                            <label className="grid gap-1.5 text-sm font-medium text-gray-700">
                                Подразделение-инициатор
                                <input
                                    type="text"
                                    value={newDocData.department}
                                    onChange={(e) => setNewDocData({ ...newDocData, department: e.target.value })}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </label>
                        </div>

                        <label className="grid gap-1.5 text-sm font-medium text-gray-700">
                            Краткое содержание / Аннотация
                            <textarea
                                rows={3}
                                placeholder="Укажите ключевые тезисы или примечания к документу..."
                                value={newDocData.description}
                                onChange={(e) => setNewDocData({ ...newDocData, description: e.target.value })}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                            />
                        </label>

                        <div className="p-4 bg-slate-50 rounded-lg border border-dashed border-gray-300">
                            <div className="text-sm font-semibold text-gray-900 mb-2">
                                Прикрепить файл документа (PDF, DOCX)
                            </div>
                            <input type="file" className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer w-full" />
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-5 border-t border-gray-100">
                            <button 
                                type="button" 
                                onClick={() => setView('list')}
                                className="w-full sm:w-auto px-4 py-2 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                Отмена
                            </button>
                            <button 
                                type="submit" 
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                            >
                                <Send size={16} /> Направить на согласование
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    if (view === 'detail' && selectedDoc) {
        return (
            <div className="page-container p-4 sm:p-6 max-w-4xl mx-auto">
                <button
                    type="button"
                    onClick={() => setView('list')}
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 font-medium text-sm transition-colors mb-6 w-fit"
                >
                    <ArrowLeft size={16} /> Назад к списку
                </button>

                <div className="content-card bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 grid gap-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-gray-100">
                        <div>
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <code className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs">{selectedDoc.regNumber}</code>
                                <StatusBadge status={selectedDoc.status} />
                            </div>
                            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">{selectedDoc.title}</h1>
                        </div>
                        <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors whitespace-nowrap">
                            <FileDown size={16} /> Скачать PDF
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg">
                        <div>
                            <div className="text-xs text-gray-500 mb-1">Категория</div>
                            <div className="font-medium text-sm">{selectedDoc.categoryName}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 mb-1">Автор</div>
                            <div className="font-medium text-sm">{selectedDoc.author}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 mb-1">Подразделение</div>
                            <div className="font-medium text-sm">{selectedDoc.department}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 mb-1">Дата создания</div>
                            <div className="font-medium text-sm">{selectedDoc.createdAt}</div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                            <GitMerge size={18} className="text-gray-500" /> Статус и прогресс согласования
                        </h3>
                        <div className="grid gap-3">
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Пройдено этапов: {selectedDoc.completedSteps} из {selectedDoc.totalSteps}</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-300 ${selectedDoc.status === 'rejected' ? 'bg-red-500' : 'bg-blue-600'}`}
                                    style={{ width: `${(selectedDoc.completedSteps / selectedDoc.totalSteps) * 100}%` }} 
                                />
                            </div>
                            <div className="text-sm font-medium mt-1 text-gray-600">
                                Текущая позиция: <span className="text-gray-900">{selectedDoc.currentStep}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container p-4 sm:p-6">
            <div className="page-stack max-w-6xl mx-auto grid gap-6">
                <div className="page-hero flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Реестр документов</h1>
                        <p className="text-gray-500 text-sm mt-1">Централизованный журнал всех нормативных, финансовых и операционных документов.</p>
                    </div>
                    <button 
                        type="button" 
                        onClick={() => setView('create')}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors whitespace-nowrap w-full md:w-auto"
                    >
                        <Plus size={18} /> Создать документ
                    </button>
                </div>

                <div className="content-card bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100 grid gap-5">
                    <div className="flex gap-3 items-center">
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Поиск по названию, номеру или автору..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="hidden md:flex gap-3 items-center">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Все статусы</option>
                                <option value="on_approval">На согласовании</option>
                                <option value="approved">Утвержденные</option>
                                <option value="rejected">Отклоненные</option>
                                <option value="draft">Черновики</option>
                            </select>

                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Все категории</option>
                                <option value="POD">Приказы по осн. деятельности</option>
                                <option value="FIN">Финансовые отчеты</option>
                                <option value="SZ">Служебные записки</option>
                            </select>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsFilterDrawerOpen(true)}
                            className="md:hidden inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <SlidersHorizontal size={16} />
                            <span>Фильтры</span>
                        </button>
                    </div>

                    <div className="desktop-table-view w-full overflow-x-auto rounded-lg border border-gray-100">
                        <table className="w-full min-w-[950px] text-left border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Рег. № / Наименование</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Категория</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Автор / Подразделение</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Статус</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Текущий этап</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Действия</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredDocuments.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center text-gray-500 py-12">
                                            Документы не найдены
                                        </td>
                                    </tr>
                                ) : (
                                    filteredDocuments.map((doc) => (
                                        <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-3 px-4 max-w-[280px]">
                                                <div className="text-xs text-gray-500 font-mono font-semibold mb-0.5">
                                                    {doc.regNumber}
                                                </div>
                                                <div className="font-semibold text-gray-900 text-sm truncate">
                                                    {doc.title}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="inline-flex bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                                                    {doc.categoryCode}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm">
                                                <div className="font-medium text-gray-900">{doc.author}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">{doc.department}</div>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <StatusBadge status={doc.status} />
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-500">
                                                <div className="flex items-center gap-1.5">
                                                    <GitMerge size={14} className="text-gray-400" /> {doc.currentStep}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedDoc(doc);
                                                        setView('detail');
                                                    }}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                                                >
                                                    <Eye size={14} /> Карточка
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mobile-cards-view">
                        {filteredDocuments.length === 0 ? (
                            <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg">
                                Документы не найдены
                            </div>
                        ) : (
                            filteredDocuments.map((doc) => (
                                <div key={doc.id} className="p-4 rounded-lg border border-gray-200 bg-white shadow-sm flex flex-col gap-3">
                                    <div className="flex justify-between items-start gap-2">
                                        <span className="text-xs font-mono font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                            {doc.regNumber}
                                        </span>
                                        <StatusBadge status={doc.status} />
                                    </div>

                                    <h3 className="font-semibold text-gray-900 text-sm leading-snug">
                                        {doc.title}
                                    </h3>

                                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 bg-slate-50 p-2.5 rounded">
                                        <div>
                                            <span className="text-gray-400 block">Категория</span>
                                            <span className="font-medium text-gray-800">{doc.categoryCode}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 block">Автор</span>
                                            <span className="font-medium text-gray-800">{doc.author}</span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-gray-400 block">Текущий этап</span>
                                            <span className="font-medium text-gray-800 flex items-center gap-1 mt-0.5">
                                                <GitMerge size={12} className="text-gray-400" />
                                                {doc.currentStep}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedDoc(doc);
                                            setView('detail');
                                        }}
                                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <Eye size={14} /> Открыть карточку
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <FilterDrawer
                isOpen={isFilterDrawerOpen}
                onClose={() => setIsFilterDrawerOpen(false)}
                title="Фильтры документов"
                onReset={handleResetFilters}
            >
                <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Статус документа</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">Все статусы</option>
                        <option value="on_approval">На согласовании</option>
                        <option value="approved">Утвержденные</option>
                        <option value="rejected">Отклоненные</option>
                        <option value="draft">Черновики</option>
                    </select>
                </div>

                <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Категория</label>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">Все категории</option>
                        <option value="POD">Приказы по осн. деятельности</option>
                        <option value="FIN">Финансовые отчеты</option>
                        <option value="SZ">Служебные записки</option>
                    </select>
                </div>
            </FilterDrawer>
        </div>
    );
}