using DbUp;
using DbUp.Engine;
using DbUp.Support;
using PostgresDemo.DbMigrator;
using System.Reflection;

var connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION")
    ?? (args.Length > 0 ? args[0] : null);

if (string.IsNullOrWhiteSpace(connectionString))
{
    Console.Error.WriteLine("Connection string not provided. Set DB_CONNECTION env var or pass as first argument.");
    Environment.Exit(1);
    return;
}

EnsureDatabase.For.PostgresqlDatabase(connectionString);

var upgrader = DeployChanges.To
    .PostgresqlDatabase(connectionString)
    .WithScriptsEmbeddedInAssembly(
        Assembly.GetExecutingAssembly(),
        s => s.Contains(".RunOnce."),
        new SqlScriptOptions { ScriptType = ScriptType.RunOnce })
    .WithScriptsEmbeddedInAssembly(
        Assembly.GetExecutingAssembly(),
        s => s.Contains(".AlwaysRun."),
        new SqlScriptOptions { ScriptType = ScriptType.RunAlways })
    .WithVariable("env", Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT"))
    .WithScriptNameComparer(new RunOnceFirstComparer())
    .WithTransactionPerScript()
    .LogToConsole()
    .Build();

var mode = args.LastOrDefault() ?? "migrate";

if (mode == "generate")
{
    var scripts = upgrader.GetScriptsToExecute();
    var outputPath = Path.Combine(Directory.GetCurrentDirectory(), "pending-migration.sql");

    using var writer = new StreamWriter(outputPath);

    if (scripts.Count == 0)
    {
        writer.WriteLine("-- No pending migrations.");
    }
    else
    {
        foreach (var script in scripts)
        {
            writer.WriteLine($"-- ===== {script.Name} =====");
            writer.WriteLine(script.Contents);
            writer.WriteLine();
        }
    }

    Console.WriteLine($"Wrote {scripts.Count} pending script(s) to {outputPath}");
    return;
}

var result = upgrader.PerformUpgrade();

if (!result.Successful)
{
    Console.Error.WriteLine(result.Error);
    Environment.Exit(-1);
}