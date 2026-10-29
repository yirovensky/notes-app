using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NotesApi.Data;
using NotesApi.Dtos;
using NotesApi.Extensions;
using NotesApi.Models;

namespace NotesApi.Controllers;

/// <summary>
/// Заметки текущего пользователя: просмотр, создание, изменение, закрепление, цвет, удаление.
/// </summary>
/// <remarks>
/// Все методы требуют авторизации. Каждый запрос ограничен заметками владельца токена
/// (<c>OwnerId</c> берётся из токена, а не из запроса), поэтому чужая заметка для пользователя
/// «не существует» и отвечает 404.
/// </remarks>
[Authorize]
[ApiController]
[Route("api/[controller]")]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
public class NotesController : ControllerBase
{
    private readonly AppDbContext _db;
    public NotesController(AppDbContext db) => _db = db;

    // Идентификатор текущего пользователя из токена
    private int UserId => User.GetUserId();

    /// <summary>
    /// Возвращает заметки пользователя с поиском и сортировкой.
    /// </summary>
    /// <param name="search">Подстрока для поиска по названию и тексту; без учёта регистра. Пусто: без фильтра.</param>
    /// <param name="sort">Поле сортировки: <c>created</c> (по умолчанию), <c>updated</c> или <c>title</c>.</param>
    /// <param name="order">Направление: <c>asc</c> по возрастанию, иначе (по умолчанию) по убыванию.</param>
    /// <returns>Список заметок.</returns>
    /// <remarks>
    /// Закреплённые заметки всегда идут первыми, а выбранная сортировка действует внутри каждой из двух групп.
    /// Сортировка по <c>updated</c> для ни разу не правленных заметок использует дату создания.
    /// </remarks>
    /// <response code="200">Список (возможно, пустой).</response>
    [HttpGet]
    public async Task<ActionResult<List<NoteDto>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? sort,
        [FromQuery] string? order)
    {
        var query = _db.Notes.AsNoTracking().Where(n => n.OwnerId == UserId);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim();
            query = query.Where(n => n.Title.Contains(s) || n.Content.Contains(s));
        }

        var desc = !string.Equals(order, "asc", StringComparison.OrdinalIgnoreCase);
        var ordered = query.OrderByDescending(n => n.IsPinned);

        ordered = (sort?.ToLowerInvariant(), desc) switch
        {
            ("title", false) => ordered.ThenBy(n => n.Title),
            ("title", true) => ordered.ThenByDescending(n => n.Title),
            ("updated", false) => ordered.ThenBy(n => n.UpdatedAt ?? n.CreatedAt),
            ("updated", true) => ordered.ThenByDescending(n => n.UpdatedAt ?? n.CreatedAt),
            (_, false) => ordered.ThenBy(n => n.CreatedAt),
            _ => ordered.ThenByDescending(n => n.CreatedAt),
        };

        var notes = await ordered.ToListAsync();
        return notes.Select(ToDto).ToList();
    }

    /// <summary>
    /// Возвращает одну заметку.
    /// </summary>
    /// <param name="id">Идентификатор заметки.</param>
    /// <returns>Заметка.</returns>
    /// <response code="200">Заметка найдена.</response>
    /// <response code="404">Заметки нет или она принадлежит другому пользователю.</response>
    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<NoteDto>> GetById(int id)
    {
        var note = await _db.Notes
            .AsNoTracking()
            .FirstOrDefaultAsync(n => n.Id == id && n.OwnerId == UserId);

        return note is null ? NotFound() : ToDto(note);
    }

    /// <summary>
    /// Создаёт заметку от имени текущего пользователя.
    /// </summary>
    /// <param name="dto">Название и текст.</param>
    /// <returns>Созданная заметка; адрес новой заметки возвращается в заголовке <c>Location</c>.</returns>
    /// <response code="201">Заметка создана.</response>
    /// <response code="400">Название или текст не прошли проверку.</response>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<NoteDto>> Create(NoteUpsertDto dto)
    {
        var note = new Note
        {
            Title = dto.Title.Trim(),
            Content = dto.Content,
            OwnerId = UserId,
        };

        _db.Notes.Add(note);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = note.Id }, ToDto(note));
    }

    /// <summary>
    /// Изменяет название и текст заметки и выставляет время правки.
    /// </summary>
    /// <param name="id">Идентификатор заметки.</param>
    /// <param name="dto">Новые название и текст.</param>
    /// <response code="204">Заметка изменена.</response>
    /// <response code="400">Название или текст не прошли проверку.</response>
    /// <response code="404">Заметки нет или она принадлежит другому пользователю.</response>
    [HttpPut("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, NoteUpsertDto dto)
    {
        var note = await _db.Notes.FirstOrDefaultAsync(n => n.Id == id && n.OwnerId == UserId);
        if (note is null) return NotFound();

        note.Title = dto.Title.Trim();
        note.Content = dto.Content;
        note.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Закрепляет или открепляет заметку.
    /// </summary>
    /// <param name="id">Идентификатор заметки.</param>
    /// <param name="dto">Нужное состояние закрепления.</param>
    /// <remarks>Закрепление не считается правкой: время изменения заметки не обновляется.</remarks>
    /// <response code="204">Состояние сохранено.</response>
    /// <response code="404">Заметки нет или она принадлежит другому пользователю.</response>
    [HttpPatch("{id:int}/pin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SetPinned(int id, PinNoteDto dto)
    {
        var note = await _db.Notes.FirstOrDefaultAsync(n => n.Id == id && n.OwnerId == UserId);
        if (note is null) return NotFound();

        note.IsPinned = dto.IsPinned;
        await _db.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Задаёт цвет заметки или убирает его.
    /// </summary>
    /// <param name="id">Идентификатор заметки.</param>
    /// <param name="dto">Ключ цвета или <c>null</c>.</param>
    /// <remarks>Смена цвета не считается правкой: время изменения заметки не обновляется.</remarks>
    /// <response code="204">Цвет сохранён.</response>
    /// <response code="400">Недопустимый ключ цвета.</response>
    /// <response code="404">Заметки нет или она принадлежит другому пользователю.</response>
    [HttpPatch("{id:int}/color")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SetColor(int id, SetColorDto dto)
    {
        var note = await _db.Notes.FirstOrDefaultAsync(n => n.Id == id && n.OwnerId == UserId);
        if (note is null) return NotFound();

        note.Color = dto.Color;
        await _db.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Удаляет заметку безвозвратно.
    /// </summary>
    /// <param name="id">Идентификатор заметки.</param>
    /// <response code="204">Заметка удалена.</response>
    /// <response code="404">Заметки нет или она принадлежит другому пользователю.</response>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var note = await _db.Notes.FirstOrDefaultAsync(n => n.Id == id && n.OwnerId == UserId);
        if (note is null) return NotFound();

        _db.Notes.Remove(note);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    // Преобразование заметки в DTO для ответа
    private static NoteDto ToDto(Note n) => new()
    {
        Id = n.Id,
        Title = n.Title,
        Content = n.Content,
        CreatedAt = n.CreatedAt,
        UpdatedAt = n.UpdatedAt,
        IsPinned = n.IsPinned,
        Color = n.Color,
    };
}
