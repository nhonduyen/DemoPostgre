namespace PostgresDemo.Api.Models;

public sealed class CreateUserRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Username { get; set; }
    public string? Password { get; set; }
}

public sealed class UpdateUserRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Username { get; set; }
    public string? Password { get; set; }
}

public sealed class CreateProductRequest
{
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? Description { get; set; }
}

public sealed class UpdateProductRequest
{
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? Description { get; set; }
}

public sealed class PagedResult<T>
{
    public int Page { get; set; }
    public int PageSize { get; set; }
    public long Total { get; set; }
    public IEnumerable<T> Items { get; set; } = Array.Empty<T>();
}
