using PostgresDemo.Api.Models;

namespace PostgresDemo.Api.Services;

public interface IProductService
{
    Task<PagedResult<ProductListDto>> GetAll(int page, int pageSize);
    Task<ProductDto?> GetById(long id);
    Task<ProductDto> Create(CreateProductRequest request);
    Task<ProductDto?> Update(long id, UpdateProductRequest request);
    Task<bool> Delete(long id);
}
