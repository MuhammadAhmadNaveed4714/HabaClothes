
using Microsoft.AspNetCore.Mvc;
using WebApp3.Models;
using WebApp3.Interface;
public class ProductController : Controller
{
    private readonly IProductRepository _repo;

    public ProductController(IProductRepository repo)
    {
        _repo = repo;
    }

    public IActionResult Index()
    {
        var products = _repo.GetAll();
        return View(products);
    }

    // ProductController.cs
    public IActionResult Details(int id)
    {
        var product = _repo.GetAll().FirstOrDefault(p => p.Id == id);

        if (product == null)
            return NotFound();

        return View(product);  // <-- yahan Product pass ho
    }
}