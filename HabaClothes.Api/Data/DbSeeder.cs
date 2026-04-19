using HabaClothes.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HabaClothes.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        if (await db.Users.AnyAsync())
        {
            return;
        }

        var hasher = new PasswordHasher<User>();

        var admin = new User
        {
            Email = "admin@local.com",
            FirstName = "Admin",
            LastName = "User",
            Role = "Admin",
        };
        admin.PasswordHash = hasher.HashPassword(admin, "admin123");

        var customer = new User
        {
            Email = "customer@habaclothes.local",
            FirstName = "Customer",
            LastName = "User",
            Role = "Customer",
        };
        customer.PasswordHash = hasher.HashPassword(customer, "Customer123!");

        var products = new List<Product>
        {
            new()
            {
                Name = "Canvas Tote",
                Description = "Durable canvas tote with reinforced straps.",
                Price = 48,
                ImageUrl = "https://encry pted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHHLKk-bKTWg1Mhjsi_xSqLKeNhEZknpRnmA&s",
                Category = "Accessories",
                Stock = 24,
                Sizes = "One Size",
                Colors = "Clay,Sage"
            },
           
        };

        db.Users.AddRange(admin, customer);
        db.Products.AddRange(products);

        await db.SaveChangesAsync();
    }
}
