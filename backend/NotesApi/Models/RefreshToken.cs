namespace NotesApi.Models;

/// <summary>
/// Refresh-токен: долгоживущий одноразовый токен для получения новой пары токенов.
/// </summary>
/// <remarks>
/// Само значение токена в базе не хранится, только его SHA-256 хэш: утечка базы не даёт
/// злоумышленнику готовых токенов. Токен одноразовый: при обновлении сессии он отзывается
/// (<see cref="RevokedAt"/>), а клиенту выдаётся новый.
/// </remarks>
public class RefreshToken
{
    /// <summary>
    /// Идентификатор записи.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Идентификатор пользователя, которому выдан токен.
    /// </summary>
    public int UserId { get; set; }

    /// <summary>
    /// Пользователь, которому выдан токен.
    /// </summary>
    public ApplicationUser User { get; set; } = null!;

    /// <summary>
    /// SHA-256 хэш токена в виде 64 шестнадцатеричных символов.
    /// Уникален.
    /// </summary>
    public string TokenHash { get; set; } = string.Empty;

    /// <summary>
    /// Время выпуска в UTC.
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Время истечения срока действия в UTC.
    /// </summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>
    /// Время отзыва в UTC; <c>null</c>, если токен ещё не отозван.
    /// </summary>
    public DateTime? RevokedAt { get; set; }
}
