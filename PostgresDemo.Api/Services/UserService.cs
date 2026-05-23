using Microsoft.EntityFrameworkCore;
using PostgresDemo.Api.Data;
using PostgresDemo.Api.Entities;
using PostgresDemo.Api.Models;
using System.Security.Cryptography;

namespace PostgresDemo.Api.Services;

public class UserService : IUserService
{
    private readonly ApplicationDbContext _context;

    public UserService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<UserDto>> GetAll(int page, int pageSize)
    {
        var actualPage = Math.Max(1, page);
        var actualPageSize = Math.Clamp(pageSize, 1, 100);

        var query = _context.Users
            .Where(u => !u.Deleted)
            .OrderBy(u => u.Id)
            .Select(u => new UserDto
            {
                Id = u.Id,
                Name = u.Name,
                Username = u.Username,
                CreatedAt = u.CreatedAt,
                UpdatedAt = u.UpdatedAt
            });

        var total = await query.CountAsync();
        var items = await query.Skip((actualPage - 1) * actualPageSize).Take(actualPageSize).ToListAsync();

        return new PagedResult<UserDto>
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
            .Where(u => u.Id == id && !u.Deleted)
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
        await _context.SaveChangesAsync();

        return new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Username = user.Username,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }

    public async Task<bool> Update(long id, UpdateUserRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id && !u.Deleted);
        if (user is null) return false;

        user.Name = request.Name;
        if (!string.IsNullOrWhiteSpace(request.Username)) user.Username = request.Username;

        if (!string.IsNullOrEmpty(request.Password))
        {
            var salt = CreateSalt();
            user.Salt = salt;
            user.Password = HashPassword(request.Password, salt);
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> Delete(long id)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id && !u.Deleted);
        if (user is null) return false;

        user.Deleted = true;
        await _context.SaveChangesAsync();
        return true;
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
