namespace NotesApi.Dtos;

/// <summary>
/// Заметка в ответах API.
/// </summary>
public class NoteDto
{
    /// <summary>
    /// Идентификатор заметки.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Название.
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Текст заметки.
    /// </summary>
    public string Content { get; set; } = string.Empty;

    /// <summary>
    /// Время создания (UTC, в JSON без суффикса «Z»).
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Время последней правки (UTC); <c>null</c>, если заметку не правили.
    /// </summary>
    public DateTime? UpdatedAt { get; set; }

    /// <summary>
    /// Закреплена ли заметка.
    /// </summary>
    public bool IsPinned { get; set; }

    /// <summary>
    /// Ключ цвета или <c>null</c>, если цвета нет.
    /// </summary>
    public string? Color { get; set; }
}
