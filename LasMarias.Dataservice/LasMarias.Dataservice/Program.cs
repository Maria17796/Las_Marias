namespace LasMarias.Dataservice
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            string corsPolicyName = "localPolicy";
            // Add services to the container.
            builder.Services.AddCors((options) =>
            {
                options.AddPolicy(name: corsPolicyName, builder =>
                {
                    builder.WithOrigins("http://127.0.0.1:5500", "http://localhost:5500");
                    builder.AllowAnyHeader();
                    builder.AllowAnyMethod();
                    builder.AllowCredentials();
                });
            });
            builder.Services.AddControllers();

            var app = builder.Build();
            app.UseCors(corsPolicyName);
            app.UseAuthentication();
            app.MapControllers();
            app.Run();
        }
    }
}
