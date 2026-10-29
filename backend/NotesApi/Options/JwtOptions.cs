namespace NotesApi.Options;

/// <summary>
/// Настройки JWT. Читаются из секции <c>Jwt</c> конфигурации.
/// </summary>
/// <remarks>
/// Issuer, Audience и сроки лежат в <c>appsettings.Development.json</c>. Ключ подписи
/// (<see cref="Key"/>) в файлы конфигурации и репозиторий попадать не должен: его задают через
/// User Secrets (<c>dotnet user-secrets set "Jwt:Key" "..."</c>) или переменную окружения <c>Jwt__Key</c>.
/// </remarks>
public class JwtOptions
{
    /// <summary>
    /// Имя секции конфигурации.
    /// </summary>
    public const string Section = "Jwt";

    /// <summary>
    /// Издатель токена.
    /// Проверяется при валидации.
    /// </summary>
    public string Issuer { get; set; } = string.Empty;

    /// <summary>
    /// Адресат токена.
    /// Проверяется при валидации.
    /// </summary>
    public string Audience { get; set; } = string.Empty;

    /// <summary>
    /// Секретный ключ для подписи (HMAC-SHA256).
    /// Не короче 32 символов.
    /// </summary>
    public string Key { get; set; } = string.Empty;

    /// <summary>
    /// Срок жизни access-токена в минутах.
    /// По умолчанию 15.
    /// </summary>
    public int AccessTokenMinutes { get; set; } = 15;

    /// <summary>
    /// Срок жизни refresh-токена в днях.
    /// По умолчанию 14.
    /// </summary>
    public int RefreshTokenDays { get; set; } = 14;
}
