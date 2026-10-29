using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using NotesApi.Dtos;
using NotesApi.Extensions;
using NotesApi.Models;
using NotesApi.Services;

namespace NotesApi.Controllers;

/// <summary>
/// Регистрация, вход, обновление сессии и управление учётной записью (имя, email, пароль).
/// </summary>
/// <remarks>
/// Ошибки, которые клиенту нужно показать пользователю, возвращаются в виде <c>{ "message": "..." }</c>.
/// Методы регистрации, входа, обновления токена и выхода доступны без авторизации.
/// </remarks>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _users;
    private readonly TokenService _tokens;
    private readonly UserMapper _mapper;
    public AuthController(UserManager<ApplicationUser> users, TokenService tokens, UserMapper mapper)
    {
        _users = users;
        _tokens = tokens;
        _mapper = mapper;
    }

    /// <summary>
    /// Регистрирует нового пользователя и сразу входит под ним.
    /// </summary>
    /// <param name="dto">Имя, email и пароль.</param>
    /// <returns>Пара токенов и данные пользователя.</returns>
    /// <response code="200">Пользователь создан, выданы токены.</response>
    /// <response code="400">Данные не прошли проверку или email уже занят.</response>
    [HttpPost("register")]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AuthResponse>> Register(RegisterDto dto)
    {
        var email = dto.Email.Trim();
        var user = new ApplicationUser
        {
            UserName = email, // email одновременно служит логином
            Email = email,
            DisplayName = dto.DisplayName.Trim(),
        };

        var result = await _users.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            return BadRequest(new { message = ToMessage(result) });

        return await IssueAsync(user);
    }

    /// <summary>
    /// Входит по email и паролю.
    /// </summary>
    /// <param name="dto">Email и пароль.</param>
    /// <returns>Пара токенов и данные пользователя.</returns>
    /// <remarks>
    /// Для несуществующего email и для неверного пароля возвращается одинаковый ответ,
    /// чтобы нельзя было выяснить, зарегистрирован ли адрес.
    /// </remarks>
    /// <response code="200">Вход выполнен, выданы токены.</response>
    /// <response code="401">Неверный email или пароль.</response>
    [HttpPost("login")]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponse>> Login(LoginDto dto)
    {
        var user = await _users.FindByEmailAsync(dto.Email.Trim());
        if (user is null || !await _users.CheckPasswordAsync(user, dto.Password))
            return Unauthorized(new { message = "Неверный email или пароль." });

        return await IssueAsync(user);
    }

    /// <summary>
    /// Обновляет сессию: меняет refresh-токен на новую пару токенов.
    /// </summary>
    /// <param name="dto">Действующий refresh-токен.</param>
    /// <returns>Новая пара токенов и данные пользователя.</returns>
    /// <remarks>
    /// Refresh-токен одноразовый: использованный токен отзывается (ротация), и повторно им
    /// воспользоваться нельзя. Клиент должен сохранить новый токен из ответа.
    /// </remarks>
    /// <response code="200">Выдана новая пара токенов.</response>
    /// <response code="401">Токен неизвестен, отозван или просрочен: нужно войти заново.</response>
    [HttpPost("refresh")]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponse>> Refresh(RefreshDto dto)
    {
        var token = await _tokens.FindActiveRefreshTokenAsync(dto.RefreshToken);
        if (token is null)
            return Unauthorized(new { message = "Сессия истекла. Войдите снова." });

        await _tokens.RevokeAsync(token); // ротация: старый refresh-токен больше не работает
        return await IssueAsync(token.User);
    }

    /// <summary>
    /// Завершает текущую сессию: отзывает переданный refresh-токен.
    /// </summary>
    /// <param name="dto">Refresh-токен текущей сессии.</param>
    /// <response code="204">Готово. Ответ одинаков и для неизвестного токена.</response>
    [HttpPost("logout")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Logout(RefreshDto dto)
    {
        var token = await _tokens.FindActiveRefreshTokenAsync(dto.RefreshToken);
        if (token is not null) await _tokens.RevokeAsync(token);
        return NoContent();
    }

    /// <summary>
    /// Изменяет имя и email текущего пользователя.
    /// </summary>
    /// <param name="dto">Новые имя и email.</param>
    /// <returns>Обновлённые данные пользователя.</returns>
    /// <remarks>Email меняется вместе с логином (<c>UserName</c>), поэтому входить нужно уже по новому адресу.</remarks>
    /// <response code="200">Данные сохранены.</response>
    /// <response code="400">Данные не прошли проверку или email занят другим пользователем.</response>
    /// <response code="401">Нет действующего access-токена.</response>
    [Authorize]
    [HttpPut("me")]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<UserDto>> UpdateProfile(UpdateProfileDto dto)
    {
        var user = await FindCurrentAsync();
        if (user is null) return Unauthorized();

        user.DisplayName = dto.DisplayName.Trim();

        var email = dto.Email.Trim();
        if (!string.Equals(user.Email, email, StringComparison.OrdinalIgnoreCase))
        {
            var emailResult = await _users.SetEmailAsync(user, email);
            if (!emailResult.Succeeded)
                return BadRequest(new { message = ToMessage(emailResult) });

            var nameResult = await _users.SetUserNameAsync(user, email);
            if (!nameResult.Succeeded)
                return BadRequest(new { message = ToMessage(nameResult) });
        }

        var result = await _users.UpdateAsync(user);
        if (!result.Succeeded)
            return BadRequest(new { message = ToMessage(result) });

        return await _mapper.ToDtoAsync(user);
    }

    /// <summary>
    /// Меняет пароль текущего пользователя.
    /// </summary>
    /// <param name="dto">Текущий и новый пароль.</param>
    /// <returns>Новая пара токенов для текущей сессии.</returns>
    /// <remarks>
    /// Все выданные ранее refresh-токены отзываются, то есть остальные устройства разлогиниваются
    /// (их access-токены действуют до истечения срока, не более 15 минут). Текущая сессия продолжается
    /// на новой паре токенов из ответа.
    /// </remarks>
    /// <response code="200">Пароль изменён.</response>
    /// <response code="400">Текущий пароль неверен или новый слишком простой.</response>
    /// <response code="401">Нет действующего access-токена.</response>
    [Authorize]
    [HttpPost("change-password")]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponse>> ChangePassword(ChangePasswordDto dto)
    {
        var user = await FindCurrentAsync();
        if (user is null) return Unauthorized();

        var result = await _users.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
        if (!result.Succeeded)
            return BadRequest(new { message = ToMessage(result) });

        await _tokens.RevokeAllAsync(user.Id);
        return await IssueAsync(user);
    }

    // Пользователь текущего запроса по идентификатору из токена
    private Task<ApplicationUser?> FindCurrentAsync() =>
        _users.FindByIdAsync(User.GetUserId().ToString());

    // Ответ с новой парой токенов и данными пользователя
    private async Task<AuthResponse> IssueAsync(ApplicationUser user) => new()
    {
        AccessToken = _tokens.CreateAccessToken(user),
        RefreshToken = await _tokens.CreateRefreshTokenAsync(user.Id),
        User = await _mapper.ToDtoAsync(user),
    };

    // Русские сообщения вместо английских от Identity
    private static string ToMessage(IdentityResult result)
    {
        var codes = result.Errors.Select(e => e.Code).ToHashSet();
        if (codes.Contains("DuplicateEmail") || codes.Contains("DuplicateUserName"))
            return "Этот email уже занят.";
        if (codes.Contains("PasswordMismatch"))
            return "Текущий пароль указан неверно.";
        return string.Join(" ", result.Errors.Select(e => e.Description));
    }
}
