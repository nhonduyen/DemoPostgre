using DbUp;
using DbUp.Engine;
using DbUp.Support;
using System.Reflection;

var connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION") ?? args[0];

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