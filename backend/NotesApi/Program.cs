using System.Reflection;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using NotesApi.Data;
using NotesApi.Models;
using NotesApi.Options;
using NotesApi.Services;

var builder = WebApplication.CreateBuilder(args);

// База данных
// Строка подключения "DefaultConnection" берётся из appsettings*.json (локально: SQL Server Express).
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Identity
// Используется без cookie-аутентификации: только хранилище пользователей и работа с паролями
// (хэширование, проверка, правила сложности). Вход обеспечивают JWT-токены.
builder.Services
    .AddIdentityCore<ApplicationUser>(options =>
    {
        options.User.RequireUniqueEmail = true;
        options.Password.RequiredLength = 6;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequireUppercase = false;
    })
    .AddEntityFrameworkStores<AppDbContext>();

// JWT
// Секретный ключ не хранится в репозитории: задаётся через User Secrets (разработка)
// или переменную окружения Jwt__Key (сервер, Docker).
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.Section));
var jwt = builder.Configuration.GetSection(JwtOptions.Section).Get<JwtOptions>()
    ?? throw new InvalidOperationException("Нет секции Jwt в конфигурации.");

if (string.IsNullOrWhiteSpace(jwt.Key) || jwt.Key.Length < 32)
    throw new InvalidOperationException(
        "Jwt:Key не задан или короче 32 символов. Выполните: dotnet user-secrets set \"Jwt:Key\" \"...\"");

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwt.Issuer,
            ValidateAudience = true,
            ValidAudience = jwt.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30),
            NameClaimType = "name",
        };
    });

builder.Services.AddAuthorization();

// Собственные сервисы
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<UserMapper>();

// API и Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    // кнопка Authorize в Swagger UI
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
    });
    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", document)] = new List<string>(),
    });

    // XML-комментарии попадают в описание методов в Swagger UI;
    // файл создаётся при сборке (GenerateDocumentationFile в NotesApi.csproj)
    var xmlPath = Path.Combine(AppContext.BaseDirectory, $"{Assembly.GetExecutingAssembly().GetName().Name}.xml");
    if (File.Exists(xmlPath))
        options.IncludeXmlComments(xmlPath, includeControllerXmlComments: true);
});

var app = builder.Build();

// Swagger доступен только при разработке
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// порядок важен: сначала определяем, кто пришёл, затем проверяем права
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();