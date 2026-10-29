namespace NotesApi.Models
{
    /// <summary>
    /// Заметка. Принадлежит ровно одному пользователю и недоступна остальным.
    /// </summary>
    public class Note
    {
        /// <summary>
        /// Идентификатор заметки.
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Название.
        /// Обязательное, до 200 символов.
        /// </summary>
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// Текст заметки.
        /// Обязательный, без ограничения длины в базе.
        /// </summary>
        public string Content { get; set; } = string.Empty;

        /// <summary>
        /// Время создания в UTC.
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Время последнего изменения текста или названия в UTC; <c>null</c>, если заметку не правили.
        /// Закрепление и смена цвета правкой не считаются и это поле не меняют.
        /// </summary>
        public DateTime? UpdatedAt { get; set; }

        /// <summary>
        /// Закреплена ли заметка.
        /// Закреплённые всегда показываются первыми.
        /// </summary>
        public bool IsPinned { get; set; }

        /// <summary>
        /// Ключ цвета заметки (<c>red</c>, <c>orange</c>, <c>yellow</c>, <c>green</c>, <c>teal</c>,
        /// <c>blue</c>, <c>purple</c>, <c>pink</c>) или <c>null</c>, если цвета нет.
        /// До 20 символов.
        /// </summary>
        public string? Color { get; set; }

        /// <summary>
        /// Идентификатор владельца.
        /// </summary>
        public int OwnerId { get; set; }

        /// <summary>
        /// Владелец заметки.
        /// </summary>
        public ApplicationUser Owner { get; set; } = null!;
    }
}