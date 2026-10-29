using System.ComponentModel.DataAnnotations;

namespace NotesApi.Dtos;

/// <summary>
/// Данные для смены пароля.
/// </summary>
public class ChangePasswordDto
{
    /// <summary>
    /// Текущий пароль для подтверждения.
    /// </summary>
    [Required]
    public string CurrentPassword { get; set; } = string.Empty;

    /// <summary>
    /// Новый пароль, 6–100 символов.
    /// </summary>
    [Required, StringLength(100, MinimumLength = 6)]
    public string NewPassword { get; set; } = string.Empty;
}
