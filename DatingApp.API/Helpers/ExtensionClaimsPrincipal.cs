using System.Security.Claims;

namespace DatingApp.API.Helpers
{
    public static class ExtensionClaimsPrincipal
    {
        public static int CurrentUserId(this ClaimsPrincipal user) {
            return int.Parse(user.FindFirst(ClaimTypes.NameIdentifier).Value);
        }
    }
}