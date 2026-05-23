using IdGen;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PostgresDemo.Api.Data;
using PostgresDemo.Api.Entities;
using PostgresDemo.Api.Models;
using PostgresDemo.Api.Services;

namespace PostgresDemo.Api.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _service;

    public ProductsController(IProductService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<ProductDto>>> GetAll(int page = 1, int pageSize = 20)
    {
        var result = await _service.GetAll(page, pageSize);
        return Ok(result);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ProductDto>> GetById(long id)
    {
        var dto = await _service.GetById(id);
        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<ProductDto>> Create(CreateProductRequest request)
    {
        var dto = await _service.Create(request);
        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(long id, UpdateProductRequest request)
    {
        var ok = await _service.Update(id, request);
        return ok ? NoContent() : NotFound();
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id)
    {
        var ok = await _service.Delete(id);
        return ok ? NoContent() : NotFound();
    }
}
