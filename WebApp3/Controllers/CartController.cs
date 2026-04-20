using Microsoft.AspNetCore.Mvc;
using WebApp3.Models;
using WebApp3.Helpers;
using WebApp3.Interface;

namespace WebApp3.Controllers
{
    public class CartController : Controller
    {
        private readonly IProductRepository _repo;
        private const string CartCookieKey = "Cart";

        public CartController(IProductRepository repo)
        {
            _repo = repo;
        }

        public IActionResult Cart()
        {
            var cart = Request.GetObjectFromJson<List<CartItem>>(CartCookieKey) ?? new List<CartItem>();
            return View(cart);
        }

        public IActionResult AddToCart(int id)
        {
            var product = _repo.GetAll().FirstOrDefault(x => x.Id == id);
            if (product == null) return NotFound();

            List<CartItem> cart = Request.GetObjectFromJson<List<CartItem>>(CartCookieKey) ?? new List<CartItem>();

            var existingItem = cart.FirstOrDefault(x => x.ProductId == id);

            if (existingItem != null)
            {
                existingItem.Quantity++;
            }
            else
            {
                cart.Add(new CartItem
                {
                    ProductId = product.Id,
                    Name = product.Name,
                    Price = product.Price,
                    ImageUrl = product.FrontImageUrl,
                    Quantity = 1
                });
            }

            Response.SetObjectAsJson(CartCookieKey, cart);
            TempData["Message"] = $"{product.Name} added to cart!";
            return RedirectToAction("Cart");
        }

        public IActionResult Remove(int id)
        {
            var cart = Request.GetObjectFromJson<List<CartItem>>(CartCookieKey) ?? new List<CartItem>();

            var item = cart.FirstOrDefault(x => x.ProductId == id);
            if (item != null)
            {
                cart.Remove(item);
            }

            Response.SetObjectAsJson(CartCookieKey, cart);
            return RedirectToAction("Cart");
        }

        public IActionResult ClearCart()
        {
            Response.RemoveCookie(CartCookieKey);
            TempData["Message"] = "Cart cleared!";
            return RedirectToAction("Cart");
        }
    }
}