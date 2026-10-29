using Microsoft.EntityFrameworkCore;
using NotesApi.Data;
using NotesApi.Dtos;
using NotesApi.Models;

namespace NotesApi.Services;

/// <summary>
/// Собирает <see cref="UserDto"/> из пользователя и его аватара.
/// </summary>
/// <remarks>
/// Аватар лежит в отдельной таблице и отдаётся внутри <see cref="UserDto"/> как data URL:
/// так картинку можно сразу подставить в <c>img</c> без отдельного публичного адреса
/// (обычный <c>img</c> не умеет отправлять токен авторизации).
/// </remarks>
public class UserMapper
{
    private readonly AppDbContext _db;
    public UserMapper(AppDbContext db) => _db = db;

    /// <summary>
    /// Преобразует пользователя в DTO, догружая его аватар.
    /// </summary>
    /// <param name="user">Пользователь.</param>
    /// <returns>DTO; <see cref="UserDto.AvatarImage"/> равен <c>null</c>, если аватара нет.</returns>
    public async Task<UserDto> ToDtoAsync(ApplicationUser user)
    {
        var avatar = await _db.UserAvatars
            .AsNoTracking()
            .Where(a => a.UserId == user.Id)
            .Select(a => new { a.ContentType, a.Data })
            .FirstOrDefaultAsync();

        return new UserDto
        {
            Id = user.Id,
            Email = user.Email ?? "",
            DisplayName = user.DisplayName,
            AvatarImage = avatar is null
                ? null
                : $"data:{avatar.ContentType};base64,{Convert.ToBase64String(avatar.Data)}",
        };
    }
}
