from django.contrib.contenttypes.models import ContentType
from rest_framework import generics
from .serializers import WallPostSerializer, MediaWallPostSerializer
from .models import WallPost, MediaWallPost


class WallPostList(generics.ListAPIView):
    model = WallPost
    serializer_class = WallPostSerializer
    paginate_by = 10

    def get_queryset(self):
        type = self.request.QUERY_PARAMS['type']
        id = self.request.QUERY_PARAMS['id']
        content_type = ContentType.objects.get(model=type)
        objects = self.model.objects
        objects = objects.order_by("-created")
        return objects.filter(content_type=content_type, object_id=id)


class MediaWallPostList(generics.ListCreateAPIView):
    model = MediaWallPost
    serializer_class = MediaWallPostSerializer
    paginate_by = 10

    def get_queryset(self):
        id = self.request.QUERY_PARAMS['id']
        content_type_name = self.request.QUERY_PARAMS['type']
        
        objects = self.model.objects
        objects = objects.order_by("-created")
        return objects.for_type_and_id(type=type, id=id)




class WallPostDetail(generics.RetrieveAPIView):
    model = WallPost
    serializer_class = WallPostSerializer


