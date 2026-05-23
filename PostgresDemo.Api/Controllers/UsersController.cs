using IdGen;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PostgresDemo.Api.Data;
using PostgresDemo.Api.Entities;
using PostgresDemo.Api.Models;
using PostgresDemo.Api.Services;
using System.Security.Cryptography;

namespace PostgresDemo.Api.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly IUserService _service;

    public UsersController(IUserService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<UserListDto>>> GetAll(int page = 1, int pageSize = 20)
    {
        var result = await _service.GetAll(page, pageSize);
        return Ok(result);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<UserDto>> GetById(long id)
    {
        var dto = await _service.GetById(id);
        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpGet("exists")]
    public async Task<ActionResult> Exists([FromQuery] string username)
    {
        if (string.IsNullOrWhiteSpace(username))
        {
            return BadRequest("Username is required.");
        }

        var exists = await _service.UsernameExists(username.Trim());
        return Ok(new { exists });
    }

    [HttpPost]
    public async Task<ActionResult<UserDto>> Create(CreateUserRequest request)
    {
        var username = string.IsNullOrWhiteSpace(request.Username) ? request.Name : request.Username;
        if (await _service.UsernameExists(username.Trim()))
        {
            return Conflict("Username already exists.");
        }

        try
        {
            var dto = await _service.Create(request);
            return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ex.Message);
        }
    }

    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(long id, UpdateUserRequest request)
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
