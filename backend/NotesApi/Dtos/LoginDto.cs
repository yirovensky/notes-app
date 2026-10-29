using System.ComponentModel.DataAnnotations;

namespace NotesApi.Dtos;

/// <summary>
/// Данные для входа.
/// </summary>
public class LoginDto
{
    /// <summary>
    /// Email, указанный при регистрации.
    /// </summary>
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Пароль.
    /// </summary>
    [Required]
    public string Password { get; set; } = string.Empty;
}
