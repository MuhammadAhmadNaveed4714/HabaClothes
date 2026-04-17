namespace HabaClothes.Api.DTOs;

public record OrderCreateRequest(List<OrderItemRequest> Items);

public record OrderItemRequest(int ProductId, int Quantity, string? Size, string? Color);
