import { User } from '../types/admin';

export const mockUsers: User[] = [
  {
    id: '1',
    fullName: 'Искаков Куттуубай',
    email: 'k.iskakov@salymbekov.kg',
    position: 'Главный разработчик',
    departmentName: 'IT Департамент',
    role: 'admin',
    status: 'active',
    lastActive: 'Сегодня, 14:30',
  },
  {
    id: '2',
    fullName: 'Асанов Алмаз',
    email: 'a.asanov@salymbekov.kg',
    position: 'Декан факультета',
    departmentName: 'Медицинский факультет',
    role: 'manager',
    status: 'active',
    lastActive: 'Вчера, 18:00',
  },
  {
    id: '3',
    fullName: 'Сыдыкова Айгуль',
    email: 'a.sydykova@salymbekov.kg',
    position: 'Специалист',
    departmentName: 'Отдел кадров',
    role: 'employee',
    status: 'blocked',
    lastActive: '20.07.2026',
  },
];