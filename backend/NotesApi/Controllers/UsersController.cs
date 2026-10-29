using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NotesApi.Data;
using NotesApi.Dtos;
using NotesApi.Extensions;
using NotesApi.Models;
using NotesApi.Services;

namespace NotesApi.Controllers;

/// <summary>
/// Действия текущего пользователя над своей учётной записью: аватар и удаление аккаунта.
/// </summary>
/// <remarks>
/// Все методы требуют авторизации и работают только с данными владельца токена.
/// </remarks>
[Authorize]
[ApiController]
[Route("api/users/me")]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
public class UsersController : ControllerBase
{
    private const int MaxAvatarBytes = 200_000;
    private readonly AppDbContext _db;
    private readonly UserManager<ApplicationUser> _users;
    private readonly UserMapper _mapper;
    public UsersController(AppDbContext db, UserManager<ApplicationUser> users, UserMapper mapper)
    {
        _db = db;
        _users = users;
        _mapper = mapper;
    }

    // Идентификатор текущего пользователя из токена
    private int UserId => User.GetUserId();

    /// <summary>
    /// Загружает аватар (создаёт новый или заменяет прежний).
    /// </summary>
    /// <param name="file">Изображение PNG, JPEG или WebP до 200 КБ (поле формы <c>file</c>, multipart/form-data).</param>
    /// <returns>Обновлённые данные пользователя; аватар в поле <c>avatarImage</c> как data URL.</returns>
    /// <remarks>
    /// Тип файла определяется по его содержимому (сигнатуре), а не по расширению или заголовку
    /// Content-Type, которые легко подделать. Клиент заранее обрезает картинку до квадрата 256×256.
    /// </remarks>
    /// <response code="200">Аватар сохранён.</response>
    /// <response code="400">Файл пустой, больше 200 КБ или это не PNG, JPEG и не WebP.</response>
    [HttpPut("avatar")]
    [RequestSizeLimit(300_000)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<UserDto>> UploadAvatar(IFormFile file)
    {
        if (file.Length == 0 || file.Length > MaxAvatarBytes)
            return BadRequest(new { message = "Размер изображения должен быть до 200 КБ." });

        using var ms = new MemoryStream();
        await file.CopyToAsync(ms);
        var data = ms.ToArray();

        var contentType = DetectImageType(data);
        if (contentType is null)
            return BadRequest(new { message = "Допустимы только изображения PNG, JPEG и WebP." });

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == UserId);
        if (user is null) return Unauthorized();

        var avatar = await _db.UserAvatars.FirstOrDefaultAsync(a => a.UserId == user.Id);
        if (avatar is null)
        {
            avatar = new UserAvatar { UserId = user.Id };
            _db.UserAvatars.Add(avatar);
        }

        avatar.ContentType = contentType;
        avatar.Data = data;
        avatar.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return await _mapper.ToDtoAsync(user);
    }

    /// <summary>
    /// Удаляет аватар: в интерфейсе снова показываются инициалы.
    /// </summary>
    /// <returns>Обновлённые данные пользователя (<c>avatarImage</c> равен <c>null</c>).</returns>
    /// <response code="200">Аватар удалён (или его и не было).</response>
    [HttpDelete("avatar")]
    public async Task<ActionResult<UserDto>> RemoveAvatar()
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == UserId);
        if (user is null) return Unauthorized();

        await _db.UserAvatars.Where(a => a.UserId == user.Id).ExecuteDeleteAsync();

        return await _mapper.ToDtoAsync(user);
    }

    /// <summary>
    /// Безвозвратно удаляет аккаунт вместе со всеми заметками, аватаром и сессиями.
    /// </summary>
    /// <param name="dto">Текущий пароль для подтверждения.</param>
    /// <remarks>
    /// Связанные данные удаляются каскадно на уровне базы. Это POST, а не DELETE: у DELETE тело запроса
    /// поддерживается не везде (прокси, клиенты). Неверный пароль отдаётся как 400, а не 401, иначе клиент
    /// принял бы это за истёкшую сессию и разлогинил пользователя.
    /// </remarks>
    /// <response code="204">Аккаунт удалён.</response>
    /// <response code="400">Пароль указан неверно.</response>
    [HttpPost("delete")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DeleteAccount(DeleteAccountDto dto)
    {
        var user = await _users.FindByIdAsync(UserId.ToString());
        if (user is null) return Unauthorized();

        if (!await _users.CheckPasswordAsync(user, dto.Password))
            return BadRequest(new { message = "Пароль указан неверно." });

        var result = await _users.DeleteAsync(user);
        if (!result.Succeeded)
            return BadRequest(new { message = string.Join(" ", result.Errors.Select(e => e.Description)) });

        return NoContent();
    }

    // Определяет тип изображения по первым байтам файла (сигнатуре); null, если формат не поддерживается
    private static string? DetectImageType(byte[] d)
    {
        if (d.Length >= 3 && d[0] == 0xFF && d[1] == 0xD8 && d[2] == 0xFF)
            return "image/jpeg";

        if (d.Length >= 8 && d[0] == 0x89 && d[1] == 0x50 && d[2] == 0x4E && d[3] == 0x47
            && d[4] == 0x0D && d[5] == 0x0A && d[6] == 0x1A && d[7] == 0x0A)
            return "image/png";

        if (d.Length >= 12 && d[0] == 'R' && d[1] == 'I' && d[2] == 'F' && d[3] == 'F'
            && d[8] == 'W' && d[9] == 'E' && d[10] == 'B' && d[11] == 'P')
            return "image/webp";

        return null;
    }
}