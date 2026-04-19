using HabaClothes.Api.Data;
using HabaClothes.Api.DTOs;
using HabaClothes.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HabaClothes.Api.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;

    public ProductsController(AppDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetAll([FromQuery] string? category, [FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var query = _db.Products.AsQueryable();

        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(p => p.Category == category);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(p => p.Name.Contains(search) || p.Description.Contains(search));
        }

        var items = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(items);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Product>> GetById(int id)
    {
        var product = await _db.Products.FindAsync(id);
        return product == null ? NotFound() : Ok(product);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<Product>> Create([FromForm] ProductFormRequest request)
    {
        var imageUrl = await SaveImageAsync(request.Image, request.ImageUrl);
        var product = new Product
        {
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            ImageUrl = imageUrl,
            Category = request.Category,
            Stock = request.Stock,
            Sizes = request.Sizes,
            Colors = request.Colors
        };

        _db.Products.Add(product);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<Product>> Update(int id, [FromForm] ProductFormRequest request)
    {
        var product = await _db.Products.FindAsync(id);
        if (product == null)
        {
            return NotFound();
        }

        var imageUrl = await SaveImageAsync(request.Image, request.ImageUrl);
        product.Name = request.Name;
        product.Description = request.Description;
        product.Price = request.Price;
        if (!string.IsNullOrWhiteSpace(imageUrl))
        {
            product.ImageUrl = imageUrl;
        }
        product.Category = request.Category;
        product.Stock = request.Stock;
        product.Sizes = request.Sizes;
        product.Colors = request.Colors;

        await _db.SaveChangesAsync();

        return Ok(product);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var product = await _db.Products.FindAsync(id);
        if (product == null)
        {
            return NotFound();
        }

        _db.Products.Remove(product);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    private async Task<string> SaveImageAsync(IFormFile? image, string? fallbackUrl)
    {
        if (image == null || image.Length == 0)
        {
            return fallbackUrl?.Trim() ?? string.Empty;
        }

        var uploadsRoot = Path.Combine(_env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot"), "uploads");
        Directory.CreateDirectory(uploadsRoot);

        var extension = Path.GetExtension(image.FileName);
        var fileName = $"{Guid.NewGuid():N}{extension}";
        var filePath = Path.Combine(uploadsRoot, fileName);

        await using var stream = System.IO.File.Create(filePath);
        await image.CopyToAsync(stream);

        return $"/uploads/{fileName}";
    }
}
