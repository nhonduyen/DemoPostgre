using IdGen;
using Microsoft.EntityFrameworkCore;
using PostgresDemo.Api.Entities;

namespace PostgresDemo.Api.Data;

public class ApplicationDbContext : DbContext
{
    private readonly IdGenerator _idGenerator;

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, IdGenerator idGenerator)
        : base(options)
    {
        _idGenerator = idGenerator;
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("app_user");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id").ValueGeneratedNever();
            entity.Property(e => e.Name).HasColumnName("name").IsRequired().HasMaxLength(255);
            entity.Property(e => e.Username).HasColumnName("username").IsRequired().HasMaxLength(255);
            entity.Property(e => e.Password).HasColumnName("password").IsRequired();
            entity.Property(e => e.Salt).HasColumnName("salt").IsRequired();
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("NOW()").IsRequired();
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("NOW()").IsRequired();
            entity.Property(e => e.Deleted).HasColumnName("deleted").HasDefaultValueSql("FALSE").IsRequired();
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.ToTable("product");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id").ValueGeneratedNever();
            entity.Property(e => e.Name).HasColumnName("name").IsRequired().HasMaxLength(255);
            entity.Property(e => e.Price).HasColumnName("price").HasPrecision(18, 2).IsRequired();
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("NOW()").IsRequired();
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("NOW()").IsRequired();
            entity.Property(e => e.Deleted).HasColumnName("deleted").HasDefaultValueSql("FALSE").IsRequired();
        });
    }

    public override int SaveChanges()
    {
        ApplyAudits();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        ApplyAudits();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void ApplyAudits()
    {
        var utcNow = DateTimeOffset.UtcNow;

        foreach (var entry in ChangeTracker.Entries<User>())
        {
            if (entry.State == EntityState.Added)
            {
                if (entry.Entity.Id == 0)
                {
                    entry.Entity.Id = _idGenerator.CreateId();
                }
                entry.Entity.CreatedAt = utcNow;
                entry.Entity.UpdatedAt = utcNow;
                entry.Entity.Deleted = entry.Entity.Deleted;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = utcNow;
            }
        }

        foreach (var entry in ChangeTracker.Entries<Product>())
        {
            if (entry.State == EntityState.Added)
            {
                if (entry.Entity.Id == 0)
                {
                    entry.Entity.Id = _idGenerator.CreateId();
                }
                entry.Entity.CreatedAt = utcNow;
                entry.Entity.UpdatedAt = utcNow;
                entry.Entity.Deleted = entry.Entity.Deleted;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = utcNow;
            }
        }
    }
}
