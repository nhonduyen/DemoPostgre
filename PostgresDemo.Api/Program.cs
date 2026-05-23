using System.Globalization;
using IdGen;
using Microsoft.EntityFrameworkCore;
using PostgresDemo.Api.Data;
using PostgresDemo.Api.Options;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", builder =>
    {
        builder.WithOrigins("http://localhost:4173", "http://localhost:5173", "https://localhost:4173", "https://localhost:5173")
               .AllowAnyHeader()
               .AllowAnyMethod();
    });
});

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddSingleton(_ =>
{
    var options = builder.Configuration.GetSection("Snowflake").Get<SnowflakeOptions>() ?? new SnowflakeOptions();
    var epoch = DateTime.Parse(options.Epoch, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal).ToUniversalTime();
    var generatorOptions = new IdGeneratorOptions(new IdStructure(45, 2, 16), new DefaultTimeSource(epoch));
    return new IdGenerator(options.WorkerId, generatorOptions);
});

// Register application services
builder.Services.AddScoped<PostgresDemo.Api.Services.IUserService, PostgresDemo.Api.Services.UserService>();
builder.Services.AddScoped<PostgresDemo.Api.Services.IProductService, PostgresDemo.Api.Services.ProductService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();
app.Run();
