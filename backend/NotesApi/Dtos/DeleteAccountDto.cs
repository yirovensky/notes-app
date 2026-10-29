using System.ComponentModel.DataAnnotations;

namespace NotesApi.Dtos;

/// <summary>
/// Подтверждение удаления аккаунта.
/// </summary>
public class DeleteAccountDto
{
    /// <summary>
    /// Текущий пароль пользователя.
    /// </summary>
    [Required]
    public string Password { get; set; } = string.Empty;
}
