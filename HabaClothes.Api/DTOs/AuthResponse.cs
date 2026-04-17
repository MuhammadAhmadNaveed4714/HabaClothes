using HabaClothes.Api.Models;

namespace HabaClothes.Api.DTOs;

public record AuthResponse(string Token, User User);
