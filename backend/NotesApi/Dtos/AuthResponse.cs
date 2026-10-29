namespace NotesApi.Dtos;

/// <summary>
/// Ответ на вход, регистрацию, обновление сессии и смену пароля.
/// </summary>
public class AuthResponse
{
    /// <summary>
    /// Короткоживущий JWT для заголовка <c>Authorization: Bearer</c>.
    /// </summary>
    public string AccessToken { get; set; } = string.Empty;

    /// <summary>
    /// Одноразовый долгоживущий токен для получения новой пары.
    /// Старый после использования недействителен.
    /// </summary>
    public string RefreshToken { get; set; } = string.Empty;

    /// <summary>
    /// Текущие данные пользователя.
    /// </summary>
    public UserDto User { get; set; } = null!;
}
