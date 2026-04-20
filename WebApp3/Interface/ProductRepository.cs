using Microsoft.Data.SqlClient;
using WebApp3.Interface;
using WebApp3.Models;


public class ProductRepository : IProductRepository
{
    private readonly string _connectionString;

    public ProductRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")!;
    }

    public List<Product> GetAll()
    {
        List<Product> products = new List<Product>();

        using (SqlConnection con = new SqlConnection(_connectionString))
        {
            string query = "SELECT * FROM Products";
            SqlCommand cmd = new SqlCommand(query, con);

            con.Open();
            SqlDataReader reader = cmd.ExecuteReader();

            while (reader.Read())
            {
                Product p = new Product
                {
                    Id = (int)reader["Id"],
                    Name = reader["Name"].ToString(),
                    Description = reader["Description"].ToString(),
                    Price = (decimal)reader["Price"],
                     FrontImageUrl = reader["FrontImageUrl"].ToString(), // ✅ FIX
                    BackImageUrl = reader["BackImageUrl"].ToString()    // ✅ FIX
                };

                products.Add(p);
            }
        }

        return products;
    }
    public Product? GetById(int id)
    {
        Product? product = null;

        using (SqlConnection con = new SqlConnection(_connectionString))
        {
            string query = "SELECT * FROM Products WHERE Id = @Id";
            SqlCommand cmd = new SqlCommand(query, con);
            cmd.Parameters.AddWithValue("@Id", id);

            con.Open();
            SqlDataReader reader = cmd.ExecuteReader();

            if (reader.Read())
            {
                product = new Product
                {
                    Id = (int)reader["Id"],
                    Name = reader["Name"].ToString(),
                    Description = reader["Description"].ToString(),
                    Price = (decimal)reader["Price"],
                    FrontImageUrl = reader["FrontImageUrl"].ToString(), // ✅ FIX
                    BackImageUrl = reader["BackImageUrl"].ToString()    // ✅ FIX
                };
            }
        }

        return product;
    }
}
