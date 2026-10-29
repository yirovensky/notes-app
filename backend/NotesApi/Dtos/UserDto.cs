namespace NotesApi.Dtos;

/// <summary>
/// Данные пользователя, которые отдаются клиенту.
/// </summary>
public class UserDto
{
    /// <summary>
    /// Идентификатор пользователя.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Email (он же логин).
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Отображаемое имя.
    /// </summary>
    public string DisplayName { get; set; } = string.Empty;

    /// <summary>
    /// Загруженный аватар в виде data URL (<c>data:image/png;base64,...</c>), который можно сразу
    /// подставить в <c>src</c> картинки; <c>null</c>, если аватар не загружен.
    /// </summary>
    public string? AvatarImage { get; set; }
}
