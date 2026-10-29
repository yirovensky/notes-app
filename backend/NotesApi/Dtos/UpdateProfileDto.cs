using System.ComponentModel.DataAnnotations;

namespace NotesApi.Dtos;

/// <summary>
/// Новые имя и email пользователя.
/// </summary>
public class UpdateProfileDto
{
    /// <summary>
    /// Новое отображаемое имя, 1–100 символов.
    /// </summary>
    [Required, StringLength(100, MinimumLength = 1)]
    public string DisplayName { get; set; } = string.Empty;

    /// <summary>
    /// Новый email (он же логин), до 200 символов.
    /// Не должен быть занят другим пользователем.
    /// </summary>
    [Required, EmailAddress, StringLength(200)]
    public string Email { get; set; } = string.Empty;
}
