CREATE TABLE Products (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100),
    Description NVARCHAR(255),
    Price DECIMAL(18,2),
    ImageUrl NVARCHAR(255)
);