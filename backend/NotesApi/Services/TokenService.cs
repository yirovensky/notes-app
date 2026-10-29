using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using NotesApi.Data;
using NotesApi.Models;
using NotesApi.Options;

namespace NotesApi.Services;

/// <summary>
/// Выпуск и учёт токенов: access-токенов (JWT) и refresh-токенов.
/// </summary>
/// <remarks>
/// <para>
/// Access-токен короткоживущий и нигде на сервере не хранится: сервер только проверяет его подпись и срок.
/// </para>
/// <para>
/// Refresh-токен случайный и одноразовый. Клиенту отдаётся «сырое» значение, а в базу пишется только
/// SHA-256 хэш (<see cref="RefreshToken.TokenHash"/>). Так утечка базы не раскрывает рабочих токенов.
/// </para>
/// </remarks>
public class TokenService
{
    private readonly JwtOptions _opt;
    private readonly AppDbContext _db;
    public TokenService(IOptions<JwtOptions> opt, AppDbContext db)
    {
        _opt = opt.Value;
        _db = db;
    }

    /// <summary>
    /// Создаёт подписанный access-токен (JWT, HMAC-SHA256).
    /// </summary>
    /// <param name="user">Пользователь, для которого выпускается токен.</param>
    /// <returns>Строка токена.</returns>
    /// <remarks>
    /// В токене три claim: <c>sub</c> (идентификатор пользователя, по нему сервер находит данные владельца),
    /// <c>email</c> и <c>name</c>. Срок жизни задаётся <see cref="JwtOptions.AccessTokenMinutes"/>.
    /// </remarks>
    public string CreateAccessToken(ApplicationUser user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_opt.Key));

        var descriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email ?? ""),
                new Claim("name", user.DisplayName),
            }),
            Issuer = _opt.Issuer,
            Audience = _opt.Audience,
            Expires = DateTime.UtcNow.AddMinutes(_opt.AccessTokenMinutes),
            SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256),
        };

        return new JsonWebTokenHandler().CreateToken(descriptor);
    }

    /// <summary>
    /// Выпускает новый refresh-токен и сохраняет его хэш в базе.
    /// </summary>
    /// <param name="userId">Идентификатор пользователя.</param>
    /// <returns>«Сырое» значение токена. Это единственный момент, когда оно известно серверу.</returns>
    public async Task<string> CreateRefreshTokenAsync(int userId)
    {
        var raw = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

        _db.RefreshTokens.Add(new RefreshToken
        {
            UserId = userId,
            TokenHash = Hash(raw),
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(_opt.RefreshTokenDays),
        });
        await _db.SaveChangesAsync();

        return raw;
    }

    /// <summary>
    /// Ищет действующий refresh-токен: не отозванный и не просроченный.
    /// </summary>
    /// <param name="raw">«Сырое» значение токена, присланное клиентом.</param>
    /// <returns>Запись токена вместе с пользователем или <c>null</c>, если токен неизвестен, отозван или просрочен.</returns>
    public Task<RefreshToken?> FindActiveRefreshTokenAsync(string raw)
    {
        var hash = Hash(raw);
        return _db.RefreshTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t =>
                t.TokenHash == hash && t.RevokedAt == null && t.ExpiresAt > DateTime.UtcNow);
    }

    /// <summary>
    /// Отзывает один refresh-токен: после этого он перестаёт работать.
    /// </summary>
    /// <param name="token">Токен, найденный через <see cref="FindActiveRefreshTokenAsync"/>.</param>
    public async Task RevokeAsync(RefreshToken token)
    {
        token.RevokedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
    }

    /// <summary>
    /// Отзывает все действующие refresh-токены пользователя, то есть завершает все его сессии.
    /// </summary>
    /// <param name="userId">Идентификатор пользователя.</param>
    /// <returns>Количество отозванных токенов.</returns>
    /// <remarks>Вызывается при смене пароля.</remarks>
    public Task<int> RevokeAllAsync(int userId) =>
        _db.RefreshTokens
            .Where(t => t.UserId == userId && t.RevokedAt == null)
            .ExecuteUpdateAsync(s => s.SetProperty(t => t.RevokedAt, DateTime.UtcNow));

    // SHA-256 в hex: для случайного токена из 64 байт этого достаточно, медленный хэш (как для паролей) не нужен
    private static string Hash(string raw) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(raw)));
}
