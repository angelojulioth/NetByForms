using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace APIFormularios.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private int expireMinutos = 10; // expira default 

        public AuthController(IConfiguration configuration)
        {
            _configuration = configuration;
            expireMinutos = _configuration.GetValue<int>("Jwt:Exp");
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginModel model)
        {
            // esto es un placeholder, en una aplicacion real se valida el usuario contra la base de datos
            if (model.Username == "admin" && model.Password == "password")
            {
                var token = GenerateJwtToken(model.Username);
                return Ok(new { token, expira = expireMinutos });
            }

            return Unauthorized();
        }

        [HttpPost("validaToken")]
        public IActionResult ValidateToken([FromBody] TokenValidationModel model)
        {
            var isValid = ValidateToken(model.Token);
            if (isValid)
            {
                return Ok(new { valid = true });
            }
            return Unauthorized(new { valid = false });
        }

        // idealmente se lo separa en otra capa / capa de servicio
        // para el alcance de este proyecto esto basta
        private string GenerateJwtToken(string username)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, username),
                new Claim(ClaimTypes.Role, "Admin")
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(expireMinutos),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // validador de token / ayuda a mantener la validacion del token para simular sesion en cliente
        private bool ValidateToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]);
            try
            {
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = _configuration["Jwt:Issuer"],
                    ValidateAudience = true,
                    ValidAudience = _configuration["Jwt:Audience"],
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                return true;
            }
            catch
            {
                return false;
            }
        }
    }

    // TODO cambiar modelos a otras clases
    public class LoginModel
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }

    public class TokenValidationModel
    {
        public string Token { get; set; }
    }
}
