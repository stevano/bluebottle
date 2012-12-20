from django.contrib.contenttypes.models import ContentType
from rest_framework import generics
from .serializers import WallPostSerializer
from .models import WallPost


class WallPostList(generics.ListCreateAPIView):
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




class WallPostDetail(generics.RetrieveAPIView):
    model = WallPost
    serializer_class = WallPostSerializer


