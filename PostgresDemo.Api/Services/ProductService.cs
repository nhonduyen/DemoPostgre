using IdGen;
using Microsoft.EntityFrameworkCore;
using PostgresDemo.Api.Data;
using PostgresDemo.Api.Entities;
using PostgresDemo.Api.Models;

namespace PostgresDemo.Api.Services;

public class ProductService : IProductService
{
    private readonly ApplicationDbContext _context;
    private readonly IdGenerator _idGenerator;

    public ProductService(ApplicationDbContext context, IdGenerator idGenerator)
    {
        _context = context;
        _idGenerator = idGenerator;
    }

    public async Task<PagedResult<ProductListDto>> GetAll(int page, int pageSize)
    {
        var actualPage = Math.Max(1, page);
        var actualPageSize = Math.Clamp(pageSize, 1, 100);

        var query = _context.Products
            .OrderBy(p => p.Id)
            .Select(p => new ProductListDto
            {
                Id = p.Id,
                Name = p.Name,
                Price = p.Price,
                Description = p.Description
            });

        var total = await query.CountAsync();
        var items = await query.Skip((actualPage - 1) * actualPageSize).Take(actualPageSize).ToListAsync();

        return new PagedResult<ProductListDto>
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
            .Where(p => p.Id == id)
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

    public async Task<IReadOnlyList<ProductDto>> CreateBulk(IEnumerable<CreateProductRequest> requests)
    {
        var products = requests.Select(request => new Product
        {
            Id = _idGenerator.CreateId(),
            Name = request.Name,
            Price = request.Price,
            Description = request.Description
        }).ToList();

        _context.Products.AddRange(products);
        await _context.SaveChangesAsync();

        return products.Select(product => new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Price = product.Price,
            Description = product.Description,
            CreatedAt = product.CreatedAt,
            UpdatedAt = product.UpdatedAt
        }).ToList();
    }

    public async Task<ProductDto?> Update(long id, UpdateProductRequest request)
    {
        var rows = await _context.Products.Where(p => p.Id == id)
            .ExecuteUpdateAsync(p => p
                .SetProperty(p => p.Name, _ => request.Name)
                .SetProperty(p => p.Price, _ => request.Price)
                .SetProperty(p => p.Description, _ => request.Description)
                .SetProperty(p => p.UpdatedAt, _ => DateTimeOffset.UtcNow)
            );
        
        if (rows == 0)
        {
            return null;
        }

        return await GetById(id);
    }

    public async Task<bool> Delete(long id)
    {
        var rows = await _context.Products.Where(p => p.Id == id)
            .ExecuteUpdateAsync(p => p
                .SetProperty(p => p.Deleted, _ => true)
                .SetProperty(p => p.UpdatedAt, _ => DateTimeOffset.UtcNow)
            );
        return rows > 0;
    }
}
