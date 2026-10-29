namespace NotesApi.Models;

/// <summary>
/// Загруженная пользователем картинка аватара.
/// </summary>
/// <remarks>
/// Хранится в отдельной таблице, а не в <see cref="ApplicationUser"/>, чтобы тяжёлые бинарные
/// данные не читались при каждой загрузке пользователя. Один пользователь имеет не более
/// одного аватара, поэтому ключом служит <see cref="UserId"/>.
/// </remarks>
public class UserAvatar
{
    /// <summary>
    /// Идентификатор пользователя; одновременно первичный ключ.
    /// </summary>
    public int UserId { get; set; }

    /// <summary>
    /// MIME-тип изображения: <c>image/jpeg</c>, <c>image/png</c> или <c>image/webp</c>.
    /// </summary>
    public string ContentType { get; set; } = string.Empty;

    /// <summary>
    /// Содержимое файла.
    /// </summary>
    public byte[] Data { get; set; } = [];

    /// <summary>
    /// Время последнего обновления аватара в UTC.
    /// </summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}