using HabaClothes.Api.Data;
using HabaClothes.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HabaClothes.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("users")]
    public async Task<ActionResult<IEnumerable<User>>> GetUsers()
    {
        var users = await _db.Users.OrderBy(u => u.Email).ToListAsync();
        return Ok(users);
    }

    [HttpPost("users/{id:int}/promote")]
    public async Task<ActionResult<User>> Promote(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound();
        }

        user.Role = "Admin";
        await _db.SaveChangesAsync();

        return Ok(user);
    }
}
