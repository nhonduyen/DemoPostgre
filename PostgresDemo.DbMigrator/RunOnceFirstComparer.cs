namespace PostgresDemo.DbMigrator
{
    public class RunOnceFirstComparer : IComparer<string>
    {
        public int Compare(string? x, string? y)
        {
            var xIsRunOnce = x?.Contains(".RunOnce.") ?? false;
            var yIsRunOnce = y?.Contains(".RunOnce.") ?? false;

            if (xIsRunOnce && !yIsRunOnce) return -1;
            if (!xIsRunOnce && yIsRunOnce) return 1;

            return string.Compare(x, y, StringComparison.Ordinal);
        }
    }
}
