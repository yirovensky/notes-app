namespace NotesApi.Dtos;

/// <summary>
/// Запрос на закрепление или открепление заметки.
/// </summary>
public class PinNoteDto
{
    /// <summary>
    /// <c>true</c> закрепить, <c>false</c> открепить.
    /// </summary>
    public bool IsPinned { get; set; }
}
