using System.Security.Claims;
using Microsoft.IdentityModel.JsonWebTokens;

namespace NotesApi.Extensions;

/// <summary>
/// Расширения для текущего пользователя запроса.
/// </summary>
public static class ClaimsPrincipalExtensions
{
    /// <summary>
    /// Возвращает идентификатор пользователя из claim <c>sub</c> access-токена.
    /// </summary>
    /// <param name="user">Пользователь текущего запроса (<c>ControllerBase.User</c>).</param>
    /// <returns>Числовой идентификатор пользователя.</returns>
    /// <exception cref="InvalidOperationException">В токене нет claim <c>sub</c>.</exception>
    /// <remarks>
    /// Работает, потому что в настройках JWT отключено переименование входящих claims
    /// (<c>MapInboundClaims = false</c>) и <c>sub</c> остаётся под своим именем.
    /// Для действий под <c>[Authorize]</c> идентификатор всегда есть. Именно по нему
    /// контроллеры отбирают данные владельца, а не по значениям из тела запроса.
    /// </remarks>
    public static int GetUserId(this ClaimsPrincipal user)
    {
        var value = user.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? throw new InvalidOperationException("В токене нет идентификатора пользователя.");
        return int.Parse(value);
    }
}