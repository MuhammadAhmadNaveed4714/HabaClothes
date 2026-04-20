using WebApp3.Models;

namespace WebApp3.Interface
{
    public interface IProductRepository
    {
        List<Product> GetAll();

        Product? GetById(int id);   // ✅ ADD THIS
    }
}
