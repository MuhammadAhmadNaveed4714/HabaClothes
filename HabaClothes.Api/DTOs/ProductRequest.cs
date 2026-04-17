namespace HabaClothes.Api.DTOs;

public record ProductRequest(
    string Name,
    string Description,
    decimal Price,
    string ImageUrl,
    string Category,
    int Stock,
    string? Sizes,
    string? Colors
);
