import React, { useState } from 'react';
import { 
    Sliders, Building2, Hash, Tags, Mail, FileSpreadsheet, 
    HardDrive, Save, Check 
} from 'lucide-react';

interface GeneralSettings {
    systemName: string;
    timezone: string;
    language: string;
}

interface UniversitySettings {
    name: string;
    rector: string;
    address: string;
    email: string;
}

interface NumberingSettings {
    prefix: string;
    format: string;
    startNumber: string;
}

interface StatusesSettings {
    draft: string;
    review: string;
    approved: string;
    returned: string;
    archive: string;
}

interface EmailConfigSettings {
    smtpServer: string;
    port: string;
    senderEmail: string;
    enableEmails: boolean;
}

interface FileFormatsSettings {
    pdf: boolean;
    docx: boolean;
    xlsx: boolean;
    png: boolean;
    jpg: boolean;
    zip: boolean;
}

type TabId = 'general' | 'university' | 'numbering' | 'statuses' | 'email' | 'formats' | 'max_size';

interface TabItem {
    id: TabId;
    label: string;
    icon: React.ReactNode;
}

export const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabId>('general');
    const [savedMessage, setSavedMessage] = useState(false);

    const [general, setGeneral] = useState<GeneralSettings>({ 
        systemName: 'Электронный документооборот ВУЗа', 
        timezone: 'UTC+6 (Бишкек)', 
        language: 'Русский' 
    });
    
    const [university, setUniversity] = useState<UniversitySettings>({ 
        name: 'Международный Университет', 
        rector: 'Садыков Б. К.', 
        address: 'ул. Манаса 42', 
        email: 'info@university.edu' 
    });
    
    const [numbering, setNumbering] = useState<NumberingSettings>({ 
        prefix: 'PRD', 
        format: '[PREFIX]-[YEAR]-[ID]', 
        startNumber: '101' 
    });
    
    const [statuses, setStatuses] = useState<StatusesSettings>({ 
        draft: 'Черновик', 
        review: 'На согласовании', 
        approved: 'Утвержден', 
        returned: 'Возвращен', 
        archive: 'Архив' 
    });
    
    const [emailConfig, setEmailConfig] = useState<EmailConfigSettings>({ 
        smtpServer: 'smtp.university.edu', 
        port: '587', 
        senderEmail: 'no-reply@university.edu', 
        enableEmails: true 
    });
    
    const [fileFormats, setFileFormats] = useState<FileFormatsSettings>({ 
        pdf: true, 
        docx: true, 
        xlsx: true, 
        png: true, 
        jpg: true, 
        zip: false 
    });
    
    const [maxFileSize, setMaxFileSize] = useState({ maxSizeMb: '25' });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setSavedMessage(true);
        setTimeout(() => setSavedMessage(false), 3000);
    };

    const tabs: TabItem[] = [
        { id: 'general', label: 'Общие настройки', icon: <Sliders size={18} /> },
        { id: 'university', label: 'Университет', icon: <Building2 size={18} /> },
        { id: 'numbering', label: 'Нумерация', icon: <Hash size={18} /> },
        { id: 'statuses', label: 'Статусы', icon: <Tags size={18} /> },
        { id: 'email', label: 'Email', icon: <Mail size={18} /> },
        { id: 'formats', label: 'Форматы', icon: <FileSpreadsheet size={18} /> },
        { id: 'max_size', label: 'Размер файла', icon: <HardDrive size={18} /> },
    ];

    return (
        <div className="page-container">
            <div className="page-stack">
                <div className="page-heading">
                    <h1>Настройки системы</h1>
                    <p>Управление конфигурацией приложения, параметрами документов и уведомлений.</p>
                </div>

                {savedMessage && (
                    <div className="alert alert--success">
                        <Check size={18} color="#319795" /> Настройки успешно сохранены!
                    </div>
                )}

                {/* Адаптивный лейаут: на десктопе 2 колонки, на планшетах/моб 1 колонка */}
                <div className="settings-layout">
                    {/* Боковое/Верхнее меню вкладок */}
                    <div className="content-card settings-sidebar">
                        <div className="settings-tabs">
                            {tabs.map((tab) => {
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        className={`tab-button ${isActive ? 'tab-button--active' : ''}`}
                                        onClick={() => setActiveTab(tab.id)}
                                    >
                                        {tab.icon}
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Содержимое вкладки */}
                    <div className="content-card">
                        <form onSubmit={handleSave} className="form-stack">
                            
                            {/* 1. Общие настройки */}
                            {activeTab === 'general' && (
                                <>
                                    <h3>Общие настройки системы</h3>
                                    <div className="form-grid-2">
                                        <div className="form-group form-group--full">
                                            <label className="form-label">Название системы</label>
                                            <input 
                                                type="text" 
                                                className="form-input"
                                                value={general.systemName} 
                                                onChange={e => setGeneral({ ...general, systemName: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Часовой пояс</label>
                                            <select 
                                                className="form-select"
                                                value={general.timezone} 
                                                onChange={e => setGeneral({ ...general, timezone: e.target.value })}
                                            >
                                                <option value="UTC+6 (Бишкек)">UTC+6 (Бишкек / Алматы)</option>
                                                <option value="UTC+3 (Москва)">UTC+3 (Москва)</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Язык интерфейса</label>
                                            <select 
                                                className="form-select"
                                                value={general.language} 
                                                onChange={e => setGeneral({ ...general, language: e.target.value })}
                                            >
                                                <option value="Русский">Русский</option>
                                                <option value="Кыргызча">Кыргызча</option>
                                                <option value="English">English</option>
                                            </select>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* 2. Данные университета */}
                            {activeTab === 'university' && (
                                <>
                                    <h3>Реквизиты и данные университета</h3>
                                    <div className="form-grid-2">
                                        <div className="form-group form-group--full">
                                            <label className="form-label">Полное наименование вуза</label>
                                            <input 
                                                type="text" 
                                                className="form-input"
                                                value={university.name} 
                                                onChange={e => setUniversity({ ...university, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Руководитель (Ректор)</label>
                                            <input 
                                                type="text" 
                                                className="form-input"
                                                value={university.rector} 
                                                onChange={e => setUniversity({ ...university, rector: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Контактный Email</label>
                                            <input 
                                                type="email" 
                                                className="form-input"
                                                value={university.email} 
                                                onChange={e => setUniversity({ ...university, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group form-group--full">
                                            <label className="form-label">Юридический адрес</label>
                                            <input 
                                                type="text" 
                                                className="form-input"
                                                value={university.address} 
                                                onChange={e => setUniversity({ ...university, address: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* 3. Правила нумерации */}
                            {activeTab === 'numbering' && (
                                <>
                                    <h3>Правила нумерации документов</h3>
                                    <div className="form-grid-2">
                                        <div className="form-group">
                                            <label className="form-label">Префикс по умолчанию</label>
                                            <input 
                                                type="text" 
                                                className="form-input"
                                                value={numbering.prefix} 
                                                onChange={e => setNumbering({ ...numbering, prefix: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Начальный номер</label>
                                            <input 
                                                type="number" 
                                                className="form-input"
                                                value={numbering.startNumber} 
                                                onChange={e => setNumbering({ ...numbering, startNumber: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group form-group--full">
                                            <label className="form-label">Шаблон генерации номера</label>
                                            <input 
                                                type="text" 
                                                className="form-input"
                                                value={numbering.format} 
                                                onChange={e => setNumbering({ ...numbering, format: e.target.value })}
                                            />
                                            <span className="form-hint">Доступные теги: [PREFIX], [YEAR], [ID], [DEPT]</span>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* 4. Статусы документов */}
                            {activeTab === 'statuses' && (
                                <>
                                    <h3>Наименование статусов документов</h3>
                                    <div className="form-grid-2">
                                        {(Object.keys(statuses) as Array<keyof StatusesSettings>).map((key) => (
                                            <div key={key} className="form-group">
                                                <label className="form-label">Системный ключ: {key}</label>
                                                <input 
                                                    type="text" 
                                                    className="form-input"
                                                    value={statuses[key]} 
                                                    onChange={e => setStatuses({ ...statuses, [key]: e.target.value })}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* 5. Email-уведомления */}
                            {activeTab === 'email' && (
                                <>
                                    <h3>Настройка Email-уведомлений</h3>
                                    <div className="form-grid-2">
                                        <div className="form-group form-group--full">
                                            <label className="form-checkbox-label">
                                                <input 
                                                    type="checkbox" 
                                                    checked={emailConfig.enableEmails} 
                                                    onChange={e => setEmailConfig({ ...emailConfig, enableEmails: e.target.checked })}
                                                />
                                                <span>Включить отправку email-уведомлений</span>
                                            </label>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">SMTP Сервер</label>
                                            <input 
                                                type="text" 
                                                className="form-input"
                                                value={emailConfig.smtpServer} 
                                                onChange={e => setEmailConfig({ ...emailConfig, smtpServer: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Порт SMTP</label>
                                            <input 
                                                type="text" 
                                                className="form-input"
                                                value={emailConfig.port} 
                                                onChange={e => setEmailConfig({ ...emailConfig, port: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group form-group--full">
                                            <label className="form-label">Email отправителя</label>
                                            <input 
                                                type="email" 
                                                className="form-input"
                                                value={emailConfig.senderEmail} 
                                                onChange={e => setEmailConfig({ ...emailConfig, senderEmail: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* 6. Допустимые форматы файлов */}
                            {activeTab === 'formats' && (
                                <>
                                    <h3>Допустимые форматы файлов</h3>
                                    <div className="checkbox-grid">
                                        {(Object.keys(fileFormats) as Array<keyof FileFormatsSettings>).map((ext) => (
                                            <label key={ext} className="form-checkbox-label">
                                                <input 
                                                    type="checkbox" 
                                                    checked={fileFormats[ext]} 
                                                    onChange={e => setFileFormats({ ...fileFormats, [ext]: e.target.checked })}
                                                />
                                                <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>.{ext}</span>
                                            </label>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* 7. Максимальный размер файла */}
                            {activeTab === 'max_size' && (
                                <>
                                    <h3>Максимальный размер файла</h3>
                                    <div className="form-grid-2">
                                        <div className="form-group form-group--full">
                                            <label className="form-label">Лимит размера (в Мегабайтах)</label>
                                            <input 
                                                type="number" 
                                                className="form-input"
                                                value={maxFileSize.maxSizeMb} 
                                                onChange={e => setMaxFileSize({ maxSizeMb: e.target.value })}
                                            />
                                            <span className="form-hint">Максимальный объем одного документа для загрузки.</span>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Кнопка сохранения */}
                            <div className="form-actions">
                                <button type="submit" className="button button--primary form-submit-btn">
                                    <Save size={16} /> Сохранить изменения
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};