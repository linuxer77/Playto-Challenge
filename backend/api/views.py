from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.decorators import api_view
from core.models import User
from .serializers import UserSerializer


# @api_view(["GET"])
# def getData(request):
#     User = Item.objects.all()
#     serializer = ItemSerializer(items, many=True)
#     return Response(serializer.data)
#

# @api_view(["POST"])
# def addItem(request):
#     serializer = ItemSerializer(data=request.data)
#     if serializer.is_valid():
#         serializer.save()
#     return Response(serializer.data)
#


# @api_view(["POST"])
# def createUser(request):
#     serializer = UserSerializer(data=request.data)
#     if serializer.is_valid():
#         serializer.create(validated_data=request.data)
