namespace PostgresDemo.Api.Options;

public sealed class SnowflakeOptions
{
    public string Epoch { get; set; } = "2026-05-23T00:00:00Z";
    public int WorkerId { get; set; } = 1;
}
