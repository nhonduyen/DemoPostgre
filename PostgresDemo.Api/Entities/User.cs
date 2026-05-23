using System.Text.Json.Serialization;

namespace PostgresDemo.Api.Entities;

public sealed class User
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    [JsonIgnore]
    public string Password { get; set; } = string.Empty;
    [JsonIgnore]
    public string Salt { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public bool Deleted { get; set; }
}
