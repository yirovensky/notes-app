using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using NotesApi.Models;

namespace NotesApi.Data
{
    /// <summary>
    /// Контекст базы данных приложения (SQL Server).
    /// </summary>
    /// <remarks>
    /// Наследует <c>IdentityDbContext</c>, поэтому кроме собственных таблиц содержит таблицы
    /// ASP.NET Core Identity (<c>AspNetUsers</c>, <c>AspNetRoles</c> и т.д.). Ключи числовые (<c>int</c>).
    /// Схема меняется только через миграции (<c>dotnet ef migrations add</c>).
    /// </remarks>
    public class AppDbContext : IdentityDbContext<ApplicationUser, IdentityRole<int>, int>
    {
        /// <summary>
        /// Создаёт контекст с настройками, заданными при регистрации в DI.
        /// </summary>
        /// <param name="options">Параметры контекста (провайдер, строка подключения).</param>
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        /// <summary>
        /// Заметки всех пользователей. Доступ к ним всегда фильтруется по владельцу.
        /// </summary>
        public DbSet<Note> Notes => Set<Note>();

        /// <summary>
        /// Выданные refresh-токены (в виде хэшей).
        /// </summary>
        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

        /// <summary>
        /// Аватары пользователей.
        /// </summary>
        public DbSet<UserAvatar> UserAvatars => Set<UserAvatar>();

        /// <summary>
        /// Настраивает ограничения и связи таблиц.
        /// </summary>
        /// <param name="modelBuilder">Построитель модели.</param>
        /// <remarks>
        /// Все связи с пользователем каскадные: при удалении пользователя база сама удаляет его
        /// заметки, аватар и refresh-токены.
        /// </remarks>
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ApplicationUser>(e =>
            {
                e.Property(u => u.DisplayName).IsRequired().HasMaxLength(100);
            });

            modelBuilder.Entity<UserAvatar>(e =>
            {
                e.HasKey(a => a.UserId);
                e.Property(a => a.ContentType).IsRequired().HasMaxLength(50);
                e.Property(a => a.Data).IsRequired();

                e.HasOne<ApplicationUser>()
                 .WithOne()
                 .HasForeignKey<UserAvatar>(a => a.UserId)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Note>(e =>
            {
                e.Property(n => n.Title).IsRequired().HasMaxLength(200);
                e.Property(n => n.Content).IsRequired();
                e.Property(n => n.Color).HasMaxLength(20);

                e.HasOne(n => n.Owner)
                 .WithMany(u => u.Notes)
                 .HasForeignKey(n => n.OwnerId)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<RefreshToken>(e =>
            {
                e.Property(t => t.TokenHash).IsRequired().HasMaxLength(64);
                e.HasIndex(t => t.TokenHash).IsUnique();

                e.HasOne(t => t.User)
                 .WithMany()
                 .HasForeignKey(t => t.UserId)
                 .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}