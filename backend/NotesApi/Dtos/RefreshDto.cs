using System.ComponentModel.DataAnnotations;

namespace NotesApi.Dtos;

/// <summary>
/// Запрос, содержащий refresh-токен (обновление сессии и выход).
/// </summary>
public class RefreshDto
{
    /// <summary>
    /// Refresh-токен, выданный при входе или предыдущем обновлении.
    /// </summary>
    [Required]
    public string RefreshToken { get; set; } = string.Empty;
}
