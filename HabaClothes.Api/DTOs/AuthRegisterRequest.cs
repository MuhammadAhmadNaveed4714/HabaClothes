namespace HabaClothes.Api.DTOs;

public record AuthRegisterRequest(string Email, string Password, string FirstName, string LastName);
