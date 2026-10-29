# Заметки

Веб-приложение для личных заметок: регистрация и вход, свои заметки у каждого пользователя, закрепление, цвета, поиск и сортировка, профиль с аватаром, светлая и тёмная темы.

Pet-проект: ASP.NET Core Web API + React + TypeScript.

![Страница авторизации](image.png)
![Страница регистрации](image-1.png)
![Основная страница](image-2.png)
![Настройки профиля](image-4.png)

## Возможности

- Регистрация, вход, выход; сессия переживает перезагрузку страницы
- Заметки видит только их владелец
- Создание, редактирование, удаление заметок; клик по карточке открывает редактирование
- Закрепление заметок (закреплённые всегда сверху) и цветные маркеры
- Поиск по названию и тексту, сортировка (по дате создания, изменения, названию)
- Относительные даты: «5 мин. назад», «вчера, 14:30», «23 октября»
- Профиль: имя, email, смена пароля, загрузка аватара (обрезается до квадрата на клиенте), удаление аккаунта
- Светлая и тёмная темы, адаптивная вёрстка

## Стек

| Слой | Технологии |
|---|---|
| Бэкенд | ASP.NET Core Web API (.NET 10), Entity Framework Core 10, ASP.NET Core Identity, JWT Bearer, Swagger (Swashbuckle) |
| База данных | Microsoft SQL Server (Express) |
| Фронтенд | React 19, TypeScript, Vite, MUI v7, axios, react-router-dom |
| Тесты | xUnit, WebApplicationFactory, SQLite in-memory |

## Как устроена авторизация

- Пароли хранит ASP.NET Core Identity (хэш с солью).
- **Access-токен** (JWT, 15 минут) клиент держит только в памяти.
- **Refresh-токен** (14 дней) лежит в `localStorage`, а в базе хранится только его SHA-256 хэш.
- Refresh-токен **одноразовый**: при каждом обновлении выдаётся новая пара, старый токен отзывается.
- Клиент при ответе 401 один раз обновляет токен и повторяет запрос; параллельные запросы ждут одно обновление.
- Смена пароля отзывает все остальные сессии.
- Все запросы к заметкам фильтруются по владельцу из токена; чужая заметка возвращает 404.

## Запуск

Нужны: .NET SDK 10, Node.js 20+, SQL Server Express (экземпляр `.\SQLEXPRESS`).

### Бэкенд

```bash
cd backend/NotesApi

# секретный ключ для подписи JWT (не короче 32 символов), хранится в User Secrets, а не в репозитории
dotnet user-secrets set "Jwt:Key" "<случайная строка не короче 32 символов>"

# создать базу данных NotesDb и применить миграции
dotnet tool install --global dotnet-ef   # один раз
dotnet ef database update

dotnet run
```

API: `http://localhost:5198`, Swagger UI: `http://localhost:5198/swagger`.
Строка подключения лежит в `appsettings.Development.json` (`Server=.\SQLEXPRESS;Database=NotesDb;Trusted_Connection=True`).

### Фронтенд

```bash
cd frontend
npm install
npm run dev
```

Открыть `http://localhost:5173`. Запросы на `/api` проксируются на бэкенд (см. `vite.config.ts`).

### Тесты

```bash
cd backend/NotesApi.Tests
dotnet test
```

Тесты поднимают приложение целиком и работают с SQLite в памяти, SQL Server для них не нужен.

## API

Все методы, кроме регистрации, входа и обновления токена, требуют заголовок `Authorization: Bearer <access-токен>`.

| Метод | URL | Описание |
|---|---|---|
| POST | `/api/auth/register` | регистрация `{ displayName, email, password }` |
| POST | `/api/auth/login` | вход `{ email, password }` |
| POST | `/api/auth/refresh` | обновить токены `{ refreshToken }` |
| POST | `/api/auth/logout` | выйти (отозвать refresh-токен) |
| PUT | `/api/auth/me` | изменить имя и email |
| POST | `/api/auth/change-password` | сменить пароль |
| PUT | `/api/users/me/avatar` | загрузить аватар (multipart, поле `file`, до 200 КБ) |
| DELETE | `/api/users/me/avatar` | удалить аватар |
| POST | `/api/users/me/delete` | удалить аккаунт `{ password }` |
| GET | `/api/notes?search=&sort=&order=` | список заметок (`sort`: `created`, `updated`, `title`; `order`: `asc`, `desc`) |
| GET | `/api/notes/{id}` | заметка по id |
| POST | `/api/notes` | создать `{ title, content }` |
| PUT | `/api/notes/{id}` | изменить |
| PATCH | `/api/notes/{id}/pin` | закрепить или открепить `{ isPinned }` |
| PATCH | `/api/notes/{id}/color` | задать цвет `{ color }` (`red`, `orange`, `yellow`, `green`, `teal`, `blue`, `purple`, `pink` или `null`) |
| DELETE | `/api/notes/{id}` | удалить |

## Структура

```
backend/
├── NotesApi/            # Web API
│   ├── Controllers/     # Auth, Users, Notes
│   ├── Data/            # AppDbContext
│   ├── Models/          # ApplicationUser, Note, RefreshToken, UserAvatar
│   ├── Dtos/            # входные и выходные модели
│   ├── Services/        # TokenService, UserMapper
│   └── Migrations/
└── NotesApi.Tests/      # интеграционные тесты
frontend/
└── src/
    ├── api.ts           # axios, токены, обновление сессии
    ├── auth/            # контекст и провайдер авторизации
    ├── components/      # карточки, диалоги, профиль
    ├── hooks/           # useNotesData, useNow
    ├── pages/           # вход, регистрация, список заметок
    └── routes/          # защищённые и гостевые маршруты
```

## Что не реализовано

- подтверждение email и восстановление пароля
- ограничение частоты запросов и блокировка после неудачных попыток входа
- очистка просроченных refresh-токенов в базе
- пагинация списка заметок
