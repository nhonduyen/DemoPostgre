using PostgresDemo.Api.Models;

namespace PostgresDemo.Api.Services;

public interface IUserService
{
    Task<PagedResult<UserListDto>> GetAll(int page, int pageSize);
    Task<UserDto?> GetById(long id);
    Task<UserDto> Create(CreateUserRequest request);
    Task<UserDto?> Update(long id, UpdateUserRequest request);
    Task<bool> Delete(long id);
    Task<bool> UsernameExists(string username);
}
