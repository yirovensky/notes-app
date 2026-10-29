using System.ComponentModel.DataAnnotations;

namespace NotesApi.Dtos;

/// <summary>
/// Запрос на смену цвета заметки.
/// </summary>
public class SetColorDto
{
    /// <summary>
    /// Ключ цвета: <c>red</c>, <c>orange</c>, <c>yellow</c>, <c>green</c>, <c>teal</c>,
    /// <c>blue</c>, <c>purple</c>, <c>pink</c>; <c>null</c> убирает цвет.
    /// Другие значения отклоняются с ошибкой 400.
    /// </summary>
    [AllowedValues("red", "orange", "yellow", "green", "teal", "blue", "purple", "pink", null)]
    public string? Color { get; set; }
}
