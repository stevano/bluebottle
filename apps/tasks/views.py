from apps.bluebottle_drf2.permissions import IsAuthorOrReadOnly
from apps.bluebottle_drf2.views import RetrieveUpdateDeleteAPIView
from apps.bluebottle_utils.utils import get_client_ip
from apps.projects.permissions import IsProjectOwnerOrReadOnly
from apps.tasks.models import Task, TaskMember, TaskFile
from apps.tasks.permissions import  IsTaskAuthorOrReadOnly
from apps.tasks.serializers import TaskSerializer, TaskMemberSerializer, TaskWallPostSerializer, TaskFileSerializer
from apps.wallposts.models import WallPost
from django.contrib.contenttypes.models import ContentType
from rest_framework import generics
from rest_framework.generics import ListCreateAPIView
from rest_framework.permissions import IsAuthenticatedOrReadOnly


class TaskList(generics.ListCreateAPIView):
    model = Task
    serializer_class = TaskSerializer
    paginate_by = 10
    permission_classes = (IsProjectOwnerOrReadOnly,)

    def get_queryset(self):
        queryset = super(TaskList, self).get_queryset()
        project_slug = self.request.QUERY_PARAMS.get('project', None)
        if project_slug:
            queryset = queryset.filter(project__slug=project_slug)
        return queryset


    def pre_save(self, obj):
        obj.author = self.request.user


class TaskDetail(generics.RetrieveUpdateAPIView):
    model = Task
    permission_classes = (IsAuthorOrReadOnly, )
    serializer_class = TaskSerializer


class TaskWallPostMixin(object):

    def get_queryset(self):
        queryset = super(TaskWallPostMixin, self).get_queryset()
        task_type = ContentType.objects.get_for_model(Task)
        queryset = queryset.filter(content_type=task_type)
        task_id = self.request.QUERY_PARAMS.get('task', None)
        if task_id:
            queryset = queryset.filter(object_id=task_id)
        queryset = queryset.order_by("-created")
        return queryset

    def pre_save(self, obj):
        if not obj.author:
            obj.author = self.request.user
        else:
            obj.editor = self.request.user
        obj.ip_address = get_client_ip(self.request)


class TaskWallPostList(TaskWallPostMixin, ListCreateAPIView):
    model = WallPost
    serializer_class = TaskWallPostSerializer
    paginate_by = 4


class TaskWallPostDetail(TaskWallPostMixin, RetrieveUpdateDeleteAPIView):
    model = WallPost
    serializer_class = TaskWallPostSerializer
    permission_classes = (IsAuthorOrReadOnly,)


class TaskMemberList(generics.ListCreateAPIView):
    model = TaskMember
    serializer_class = TaskMemberSerializer
    paginate_by = 50
    filter_fields = ('task', )
    permission_classes = (IsAuthenticatedOrReadOnly, )

    def pre_save(self, obj):
        # When creating a task member it should always be by the request.user and have status 'applied'
        obj.member = self.request.user
        obj.status = TaskMember.TaskMemberStatuses.applied


class TaskMemberDetail(generics.RetrieveUpdateAPIView):
    model = TaskMember
    serializer_class = TaskMemberSerializer

    permission_classes = (IsTaskAuthorOrReadOnly, )


class TaskFileList(generics.ListCreateAPIView):
    model = TaskFile
    serializer_class = TaskFileSerializer
    paginate_by = 50
    filter_fields = ('task', )
    permission_classes = (IsAuthenticatedOrReadOnly, )

    def pre_save(self, obj):
        # When creating a task file the author should always be by the request.user
        obj.author = self.request.user


class TaskFileDetail(generics.RetrieveUpdateAPIView):
    model = TaskFile
    serializer_class = TaskFileSerializer

    permission_classes = (IsAuthorOrReadOnly, )

