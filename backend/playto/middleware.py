import os


class CorsMiddleware:
    """
    Custom CORS middleware that reads allowed origins from the
    CORS_ALLOWED_ORIGINS environment variable (comma-separated).

    Set CORS_ALLOWED_ORIGINS=* to allow all origins (not recommended for production).
    Set CORS_ALLOWED_ORIGINS=https://your-app.vercel.app to restrict to specific origins.

    If CORS_ALLOWED_ORIGINS is not set, it currently defaults to `*`
    (allow all origins) for easier local development.
    """

    def __init__(self, get_response):
        self.get_response = get_response
        raw = os.getenv("CORS_ALLOWED_ORIGINS", "*")
        self.allowed_origins = [o.strip() for o in raw.split(",") if o.strip()]

    def __call__(self, request):
        if request.method == "OPTIONS":
            response = self._build_preflight_response(request)
        else:
            response = self.get_response(request)

        return self._set_cors_headers(request, response)

    def _get_origin(self, request):
        return request.META.get("HTTP_ORIGIN", "")

    def _is_origin_allowed(self, origin):
        if not self.allowed_origins:
            return False
        if "*" in self.allowed_origins:
            return True
        return origin in self.allowed_origins

    def _set_cors_headers(self, request, response):
        origin = self._get_origin(request)
        if not origin or not self._is_origin_allowed(origin):
            return response

        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        response["Access-Control-Allow-Headers"] = (
            request.headers.get("Access-Control-Request-Headers", "Authorization, Content-Type")
        )
        response["Access-Control-Allow-Credentials"] = "true"
        response["Access-Control-Max-Age"] = "86400"
        return response

    def _build_preflight_response(self, request):
        from django.http import HttpResponse

        return HttpResponse(status=204)
