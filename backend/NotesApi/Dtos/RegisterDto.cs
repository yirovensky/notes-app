using System.ComponentModel.DataAnnotations;

namespace NotesApi.Dtos;

/// <summary>
/// Данные для регистрации нового пользователя.
/// </summary>
public class RegisterDto
{
    /// <summary>
    /// Отображаемое имя, 1–100 символов.
    /// </summary>
    [Required, StringLength(100, MinimumLength = 1)]
    public string DisplayName { get; set; } = string.Empty;

    /// <summary>
    /// Email, он же логин.
    /// Должен быть корректным адресом, до 200 символов.
    /// Уникален в системе.
    /// </summary>
    [Required, EmailAddress, StringLength(200)]
    public string Email { get; set; } = string.Empty;

    /// <summary>Пароль, 6–100 символов.</summary>
    [Required, StringLength(100, MinimumLength = 6)]
    public string Password { get; set; } = string.Empty;
}
