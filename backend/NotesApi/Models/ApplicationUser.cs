using Microsoft.AspNetCore.Identity;

namespace NotesApi.Models;

/// <summary>
/// Пользователь приложения.
/// </summary>
/// <remarks>
/// Расширяет стандартного пользователя ASP.NET Core Identity (email, хэш пароля, нормализованные
/// имена и т.д.) отображаемым именем и коллекцией заметок. Идентификатор числовой (<c>int</c>).
/// Email одновременно служит логином, поэтому <c>UserName</c> всегда равен <c>Email</c>.
/// </remarks>
public class ApplicationUser : IdentityUser<int>
{
    /// <summary>
    /// Имя, которое видно в интерфейсе.
    /// Обязательное, до 100 символов.
    /// </summary>
    public string DisplayName { get; set; } = string.Empty;

    /// <summary>
    /// Заметки пользователя.
    /// При удалении пользователя удаляются каскадно.
    /// </summary>
    public List<Note> Notes { get; set; } = new();
}
