using Newtonsoft.Json;

namespace WebApp3.Helpers
{
    public static class CookieHelper
    {
        public static void SetObjectAsJson(this HttpResponse response, string key, object value)
        {
            var options = new CookieOptions
            {
                Expires = DateTime.UtcNow.AddDays(1),
                HttpOnly = true,
                Secure = false
            };

            var json = JsonConvert.SerializeObject(value);
            response.Cookies.Append(key, json, options);
        }

public static T? GetObjectFromJson<T>(this HttpRequest request, string key)
{
    if (request.Cookies.TryGetValue(key, out string? value))
    {
        if (!string.IsNullOrEmpty(value))
        {
            return JsonConvert.DeserializeObject<T>(value);
        }
    }
    return default;
}

        public static void RemoveCookie(this HttpResponse response, string key)
        {
            response.Cookies.Delete(key);
        }
    }
}