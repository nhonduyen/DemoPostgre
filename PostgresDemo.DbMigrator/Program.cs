using DbUp;
using DbUp.Engine;
using DbUp.Support;
using System.Reflection;

var connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION")
    ?? (args.Length > 0 ? args[0] : null);

if (string.IsNullOrWhiteSpace(connectionString))
{
    Console.Error.WriteLine("Connection string not provided. Set DB_CONNECTION env var or pass as first argument.");
    Environment.Exit(1);
    return; // unreachable, but keeps compiler happy with nullable
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
    .WithTransactionPerScript()
    .LogToConsole()
    .Build();

var result = upgrader.PerformUpgrade();

if (!result.Successful)
{
    Console.Error.WriteLine(result.Error);
    Environment.Exit(-1);
}