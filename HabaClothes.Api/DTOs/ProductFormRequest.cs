using Microsoft.AspNetCore.Http;

namespace HabaClothes.Api.DTOs;

public class ProductFormRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public string Category { get; set; } = string.Empty;
    public int Stock { get; set; }
    public string? Sizes { get; set; }
    public string? Colors { get; set; }
    public IFormFile? Image { get; set; }
}
