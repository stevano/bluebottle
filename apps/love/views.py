from apps.love.permissions import IsCreatorOrReadOnly
from django.contrib.contenttypes.models import ContentType
from rest_framework import generics
from rest_framework import permissions
from rest_framework import  mixins
from .models import LoveDeclaration
from rest_framework.generics import SingleObjectAPIView
from .serializers import LoveListSerializer, LoveDetailSerializer


class LoveList(generics.ListCreateAPIView):
    model = LoveDeclaration
    serializer_class = LoveListSerializer
    paginate_by = 10
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,
                          IsCreatorOrReadOnly)

    def pre_save(self, obj):
        obj.user = self.request.user
#                LoveDeclaration.objects.mark_as_loved(post3, user2)
        loved_type = ContentType.objects.get_for_id(self.kwargs['content_type'])
        loved_instance = loved_type.get_object_for_this_type(slug=self.kwargs['slug'])
        obj.content_object = loved_instance


class LoveDetail(mixins.RetrieveModelMixin,
                 mixins.DestroyModelMixin,
                 SingleObjectAPIView):
    """ Loves can only be retrieved and deleted. """

    model = LoveDeclaration
    serializer_class = LoveDetailSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,
                          IsCreatorOrReadOnly)

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)