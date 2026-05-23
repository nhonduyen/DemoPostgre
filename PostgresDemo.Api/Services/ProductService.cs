using Microsoft.EntityFrameworkCore;
using PostgresDemo.Api.Data;
using PostgresDemo.Api.Entities;
using PostgresDemo.Api.Models;

namespace PostgresDemo.Api.Services;

public class ProductService : IProductService
{
    private readonly ApplicationDbContext _context;

    public ProductService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<ProductDto>> GetAll(int page, int pageSize)
    {
        var actualPage = Math.Max(1, page);
        var actualPageSize = Math.Clamp(pageSize, 1, 100);

        var query = _context.Products
            .Where(p => !p.Deleted)
            .OrderBy(p => p.Id)
            .Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Price = p.Price,
                Description = p.Description,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt
            });

        var total = await query.CountAsync();
        var items = await query.Skip((actualPage - 1) * actualPageSize).Take(actualPageSize).ToListAsync();

        return new PagedResult<ProductDto>
        {
            Page = actualPage,
            PageSize = actualPageSize,
            Total = total,
            Items = items
        };
    }

    public async Task<ProductDto?> GetById(long id)
    {
        return await _context.Products
            .Where(p => p.Id == id && !p.Deleted)
            .Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Price = p.Price,
                Description = p.Description,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt
            })
            .FirstOrDefaultAsync();
    }

    public async Task<ProductDto> Create(CreateProductRequest request)
    {
        var product = new Product
        {
            Name = request.Name,
            Price = request.Price,
            Description = request.Description
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Price = product.Price,
            Description = product.Description,
            CreatedAt = product.CreatedAt,
            UpdatedAt = product.UpdatedAt
        };
    }

    public async Task<bool> Update(long id, UpdateProductRequest request)
    {
        var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id && !p.Deleted);
        if (product is null) return false;

        product.Name = request.Name;
        product.Price = request.Price;
        product.Description = request.Description;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> Delete(long id)
    {
        var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id && !p.Deleted);
        if (product is null) return false;

        product.Deleted = true;
        await _context.SaveChangesAsync();
        return true;
    }
}
