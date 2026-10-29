using System.ComponentModel.DataAnnotations;

namespace NotesApi.Dtos;

/// <summary>
/// Данные для создания и изменения заметки.
/// </summary>
/// <remarks>
/// Цвет и закрепление здесь не передаются: они меняются отдельными запросами.
/// </remarks>
public class NoteUpsertDto
{
    /// <summary>
    /// Название, обязательное, до 200 символов.
    /// </summary>
    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Текст заметки, обязательный, до 100 000 символов.
    /// </summary>
    [Required, MaxLength(100_000)]
    public string Content { get; set; } = string.Empty;
}
