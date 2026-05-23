using Microsoft.EntityFrameworkCore;
using PostgresDemo.Api.Data;
using PostgresDemo.Api.Entities;
using PostgresDemo.Api.Models;
using System;
using System.Security.Cryptography;

namespace PostgresDemo.Api.Services;

public class UserService : IUserService
{
    private readonly ApplicationDbContext _context;

    public UserService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<UserListDto>> GetAll(int page, int pageSize)
    {
        var actualPage = Math.Max(1, page);
        var actualPageSize = Math.Clamp(pageSize, 1, 100);

        var query = _context.Users
            .OrderBy(u => u.Id)
            .Select(u => new UserListDto
            {
                Id = u.Id,
                Name = u.Name,
                Username = u.Username,
                CreatedAt = u.CreatedAt
            });

        var total = await query.CountAsync();
        var items = await query.Skip((actualPage - 1) * actualPageSize).Take(actualPageSize).ToListAsync();

        return new PagedResult<UserListDto>
        {
            Page = actualPage,
            PageSize = actualPageSize,
            Total = total,
            Items = items
        };
    }

    public async Task<UserDto?> GetById(long id)
    {
        return await _context.Users
            .Where(u => u.Id == id)
            .Select(u => new UserDto
            {
                Id = u.Id,
                Name = u.Name,
                Username = u.Username,
                CreatedAt = u.CreatedAt,
                UpdatedAt = u.UpdatedAt
            })
            .FirstOrDefaultAsync();
    }

    public async Task<UserDto> Create(CreateUserRequest request)
    {
        var username = string.IsNullOrWhiteSpace(request.Username) ? request.Name : request.Username;
        var password = request.Password ?? string.Empty;
        var salt = CreateSalt();

        var user = new User
        {
            Name = request.Name,
            Username = username,
            Salt = salt,
            Password = HashPassword(password, salt)
        };

        _context.Users.Add(user);

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (
            ex.InnerException is not null &&
            (ex.InnerException.Message.Contains("unique", StringComparison.OrdinalIgnoreCase) ||
             ex.InnerException.Message.Contains("duplicate", StringComparison.OrdinalIgnoreCase)))
        {
            throw new InvalidOperationException("Username already exists.", ex);
        }

        return new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Username = user.Username,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }

    public async Task<bool> UsernameExists(string username)
    {
        return await _context.Users.AnyAsync(u => u.Username == username);
    }

    public async Task<bool> Update(long id, UpdateUserRequest request)
    {
        var username = string.IsNullOrWhiteSpace(request.Username) ? null : request.Username;
        var query = _context.Users.Where(u => u.Id == id);

        if (string.IsNullOrEmpty(request.Password))
        {
            var rows = await query.ExecuteUpdateAsync(u => u
                .SetProperty(u => u.Name, _ => request.Name)
                .SetProperty(u => u.UpdatedAt, _ => DateTimeOffset.UtcNow)
                .SetProperty(entity => entity.Username, _ => username)
            );
            return rows > 0;
        }

        var salt = CreateSalt();
        var hashedPassword = HashPassword(request.Password, salt);

        var updatedRows = await query.ExecuteUpdateAsync(u => u
            .SetProperty(u => u.Name, _ => request.Name)
            .SetProperty(u => u.UpdatedAt, _ => DateTimeOffset.UtcNow)
            .SetProperty(entity => entity.Username, _ => username)
            .SetProperty(u => u.Salt, _ => salt)
            .SetProperty(u => u.Password, _ => hashedPassword)
        );

        return updatedRows > 0;
    }

    public async Task<bool> Delete(long id)
    {
        var rows = await _context.Users.Where(u => u.Id == id)
            .ExecuteUpdateAsync(u => u
                .SetProperty(u => u.Deleted, _ => true)
                .SetProperty(u => u.UpdatedAt, _ => DateTimeOffset.UtcNow)
            );
        return rows > 0;
    }

    private static string CreateSalt()
    {
        var saltBytes = new byte[16];
        RandomNumberGenerator.Fill(saltBytes);
        return Convert.ToBase64String(saltBytes);
    }

    private static string HashPassword(string password, string salt)
    {
        var saltBytes = Convert.FromBase64String(salt);
        using var deriveBytes = new Rfc2898DeriveBytes(password, saltBytes, 100_000, HashAlgorithmName.SHA256);
        return Convert.ToBase64String(deriveBytes.GetBytes(32));
    }
}
