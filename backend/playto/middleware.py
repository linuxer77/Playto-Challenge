from django.conf import settings


class ProductionAllowAllCorsMiddleware:

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if settings.DEBUG:
            return response

        request_headers = request.headers.get("Access-Control-Request-Headers")

        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        response["Access-Control-Allow-Headers"] = request_headers or "Authorization, Content-Type"
        response["Access-Control-Max-Age"] = "86400"

        return response